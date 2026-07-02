---
title: "Scaling GPU inference to zero and back"
date: "2026-07-16"
tags: ["gpu", "autoscaling", "kubernetes", "scale-to-zero", "inference"]
excerpt: "Idle GPUs at six dollars an hour are a bonfire. Scaling to zero saves the money, but the first user back waits minutes unless you kill the cold start."
featured: false
series: "GPUs in production"
seriesPart: 5
---

The finance dashboard is what started it. A staging cluster running two H100 nodes around the clock, mostly to serve a demo that got maybe forty requests a day, all of them during business hours. The nodes sat idle from 7pm to 9am and every weekend, billing the whole time. Somebody added scale-to-zero over a Friday. Monday morning the first person to open the demo waited six minutes for a response, assumed it was broken, and filed a bug. The bill went down and the product got worse, which is scale-to-zero working exactly as designed and nobody being happy about it.

This is the last part of the series. Parts 1 through 4 covered building GPU infrastructure and seeing what it's doing. This part is about the thing that actually shows up on the invoice: a GPU you're paying for while it does nothing. Scaling GPU inference elastically, all the way to zero when there's no traffic, is the biggest lever on the bill. It's also genuinely hard, because unlike a stateless web pod that starts in a second, a GPU replica has to drag a hundred gigabytes of model weights onto the card before it can serve a single token. The whole post is about that gap.

## the cold-start tax

Scaling a web service to zero is free because starting a new pod is nearly instant. Scaling an LLM to zero is expensive because starting a replica is not. Add up what has to happen before the first token, on a cold node:

- **Node provisioning.** The cluster asks the cloud for a GPU node, waits for it to boot and join. One to five minutes, and that assumes the GPU is even available to hand you (more on that at the end).
- **Image pull.** A CUDA plus vLLM container image is commonly 5 to 15 GB. On a fresh node with a cold cache, pulling and unpacking it is minutes, not seconds.
- **Model load.** Llama-3-70B in BF16 is about 140 GB of weights, usually sitting in object storage. Reading that over the network and moving it onto the GPU is the big one, and done naively it's several minutes.
- **Warmup.** CUDA graph capture, `torch.compile`, and a few dummy forward passes to populate caches. Tens of seconds before the first real request is fast.

Stack those up and a naive 70B cold start runs six to nine minutes, more if those 140 GB of weights come cold over a slow path. That's the tax. Everything else in this post is a way to stop paying it, so that scale-to-zero saves the money without the six-minute Monday.

One cruel interaction hides in here: a naive Kubernetes health probe treats that multi-minute load as a failure. A liveness probe with default timing restarts the pod mid-load, and now you have a crash loop that looks like a vLLM bug but is really a probe firing too early. Set the liveness `initialDelaySeconds` above your worst-case load time, keep it longer than the readiness delay, and add a `preStop` sleep so in-flight requests drain before the pod goes down. It's the single most common self-inflicted serving outage, and it costs nothing to avoid once you've seen it once.

![A horizontal stacked-bar diagram titled 'the cold-start tax: what the first user waits for'. A single bar is divided into four segments sized by time: node provisioning (1–5 min), image pull (2–4 min for a 5–15GB image), model weight load (several minutes for ~140GB), and warmup (tens of seconds). The total is labeled 'naive cold start: 5+ minutes'. Below, a second much shorter bar labeled 'after the fixes in this post' shows the same stages compressed, annotated with 'lazy image pull + model streaming + warm nodes → tens of seconds'.](/images/gpu-deployments-part-5-scale-to-zero/cold-start-budget.png)

*Fig. 1 · where the minutes go on a cold start. Each stage has a fix; the trick is that you have to attack all of them, because the slowest one sets the wait.*

## scale on the queue, not the GPU

Before scaling to zero, get scaling to *anything* right, and the first mistake is scaling on GPU utilization. It's the obvious metric and it's the wrong one, for the reason part 4 laid out: a GPU can sit at 95% while the queue is empty, or at 40% while requests pile up. Scaling on GPU-util adds replicas late and removes them at the wrong time.

Scale on the serving signal instead. The metric that actually tracks unmet demand is the queue: `vllm:num_requests_waiting`, or KV-cache utilization as a leading indicator. You'll still find plenty of setups scaling on GPU-util or cache percentage, and those aren't wrong so much as indirect; the point is to scale on demand rather than on how busy the chip happens to look, with tail latency as the guardrail. In practice that means KEDA (the Kubernetes event-driven autoscaler) with a Prometheus trigger reading that metric, or an HPA wired to the same value through the Prometheus adapter. For traffic that's genuinely request-driven and spiky, KEDA's HTTP add-on can scale on in-flight request count directly. The shape is the same: pick the metric that means "users are waiting," set the threshold at the per-replica capacity you measured with the load test in part 4, and let it add replicas before the queue becomes TTFT.

## actually reaching zero

Scaling to zero is a special case of scaling, with one extra problem: when you're at zero replicas, there's nothing running to receive the request that's supposed to wake you up. Something has to catch that first request and hold it while a replica spins up.

KEDA does this with an activation threshold: below it, the deployment sits at zero; the first event scales it to one. Knative Serving builds the pattern in more deliberately, with an **activator** component that buffers incoming requests while a cold replica starts, then releases them once it's ready, so the request is slow but not dropped. KServe (which runs on Knative) exposes this as a simple `minReplicas: 0` on an InferenceService, and it's the most common way teams get GPU model servers to zero on Kubernetes.

![A lifecycle state diagram titled 'scale-to-zero, and the request that pays for it'. Four states in a loop: 'ZERO: no replicas, no cost' at rest; an incoming request triggers an arrow to 'ACTIVATING: activator buffers the request, autoscaler asks for a GPU node'; then 'COLD START: pull image, load weights, warm up' (annotated 'the first user waits here'); then 'SERVING: replica ready, requests flow'; and after an idle timeout an arrow back to 'ZERO'. The buffered first request is shown held at the activator through the cold-start state.](/images/gpu-deployments-part-5-scale-to-zero/scale-to-zero-lifecycle.png)

*Fig. 2 · the lifecycle, and the unlucky first request. Everything after this figure is about shrinking the cold-start box so that request waits seconds, not minutes.*

The honest catch is that reaching zero and the cold-start tax are the same coin. Zero replicas is where the savings are, and it's also where every request pays the full six minutes. Everything below is about making that first request cost seconds instead, because a scale-to-zero setup with a six-minute cold start is a cost win and a product loss, and you rarely get to keep both.

There's also a breakeven worth running before you build any of this. Scale-to-zero wins when utilization is low and spiky; it loses somewhere around half-time, where a dedicated node is both cheaper than paying serverless rates by the second and free of cold starts entirely. If a GPU is busy more than half the day, don't scale it to zero. Right-size it and leave it on.

## killing the image pull

The container image is the first fixable minute. Two families of fix.

The first is to stop pulling the whole thing before you start. **SOCI** (Seekable OCI), lazy-loading via a containerd snapshotter, lets a container start running against an index of the image and fetch the actual bytes on demand, so the model server boots while the layers it doesn't need yet are still downloading. `estargz` (the containerd stargz snapshotter) and Nydus do the same lazy-pull trick with different formats; GKE's Image Streaming is the managed version, and it cut a 5.4 GB Triton image's start from 191 seconds to 30. There's also a variant for the case where you *will* read the whole image anyway (AI images touch most of their bytes immediately): SOCI's parallel-pull mode just parallelizes the download and unpack instead of lazy-loading, and AWS measured roughly 60% off a 10 GB image.

The second is to not pull over the network at all. Pre-bake the image into the node's disk image so it's local before the pod schedules. Run an in-cluster pull-through cache or a peer-to-peer image mirror (Spegel and friends) so the second node to need an image gets it from a neighbor instead of the registry. Pre-pull hot images with a DaemonSet so they're warm before traffic arrives. None of these is clever; all of them beat pulling 15 GB cold from a registry when a hundred replicas try it at once.

## killing the model load

The bigger minute is the model weights, and this is where the newer tooling has moved fast. Loading 140 GB of safetensors off a disk or object store the default way is serial and slow. The fixes stream instead.

**NVIDIA's Run:ai Model Streamer** reads weights from object storage in many parallel streams straight onto the GPU, overlapping download with load, and vLLM supports it directly (`--load-format runai_streamer`). NVIDIA's own benchmark took an 8B model's S3 load from 28 seconds at four streams to under five at thirty-two. CoreWeave's **tensorizer** (`--load-format tensorizer`) serializes the model into a format that streams from S3 or local disk with near-zero deserialization overhead. Both turn a multi-minute load into tens of seconds. Underneath, `safetensors` already supports memory-mapped zero-copy loading, which helps when the file is local.

And local is the other half. Cache the weights on the node's NVMe (an instance-store disk) so a restart reads from local flash instead of re-downloading. Or mount a shared, fast filesystem so every replica reads the same warm copy, but mind the access mode: a `ReadWriteOnce` PVC serves one replica and then silently blocks the second pod from mounting, so anything that scales past a single replica needs `ReadWriteMany` (EFS, FSx for Lustre, NFS, CephFS). That RWO-to-RWX switch is a classic thing to discover the first time an autoscale event never becomes a second pod. Some teams ship the model as its own OCI artifact and let the image machinery above handle it (KServe's modelcar pattern). The principle is the same one from part 2: the bandwidth between the weights and the GPU is the bottleneck, so shorten that path.

The frontier technique skips loading altogether. GPU memory snapshots (Modal and Cerebrium both ship this, built on the CUDA checkpoint/restore API in recent driver branches) checkpoint a fully warmed replica, weights on the card and CUDA graphs already captured, then restore that image straight onto a GPU. Because it bypasses weight load, `torch.compile`, and graph capture in one move, it's the only approach that also kills the warmup tax. Modal reports a vLLM Qwen model dropping from 45 seconds to 5, and Cerebrium measured cold starts down 71 to 88 percent. The catch is portability: a snapshot is pinned to a specific GPU model and driver branch, so it's a per-SKU artifact, not a universal one.

> **Key Insight:** Scale-to-zero is a tradeoff, not a free win. Every second of cold start is latency the first user eats; every minute of warm idle is money you burn. You buy down the cold start with lazy image pulls, model streaming, and a warm node pool, then set a minimum replica floor high enough that your p99 cold start stays inside the SLO. "Zero when truly idle, one when it might not be" beats a dogmatic zero.

![A diagram mapping each cold-start stage to the fixes that attack it, three columns. Column one 'image pull (minutes)': SOCI / stargz / Nydus lazy pull, pre-bake into the node image, P2P mirror (Spegel), slim the image. Column two 'model load (minutes)': Run:ai Model Streamer, tensorizer, local NVMe or shared PVC cache. Column three 'warmup (tens of seconds)': GPU memory snapshots, limited CUDA graph sizes. A banner across the bottom reads 'you have to attack all three: the slowest unfixed stage sets the wait'.](/images/gpu-deployments-part-5-scale-to-zero/cold-start-fixes.png)

*Fig. 3 · the fix menu, one column per stage. Snapshots are the only trick in the third column, which is why they're the frontier: everything else leaves the warmup tax standing.*

## turning off idle nodes

Scaling pods to zero doesn't save anything if the expensive GPU node they were on keeps running. The node has to go too. This is the autoscaler's job below the pod level: Karpenter consolidates workloads and removes nodes that are empty or underutilized (`consolidateAfter`, disruption budgets so it doesn't yank capacity mid-request), and the older cluster-autoscaler scales node groups down on the same principle. A GPU node that's been empty for a few minutes is thirty to a hundred-plus dollars a day; letting it linger is the single most common way GPU bills quietly balloon.

For predictable traffic, the laziest win is scheduled scaling. If the demo only serves business hours, a cron trigger that scales the floor to zero at 7pm and back to one at 9am captures most of the savings with none of the cold-start risk during the day. And to hide cold starts when you do scale up, keep a warm node in reserve with low-priority placeholder pods (over-provisioning): real work evicts the placeholders instantly and lands on a node that already has the image, so the pod cold start doesn't also pay the node cold start.

## spot, and the capacity trap

Two closing realities that scale-to-zero runs into. Spot instances make idle capacity cheap, and for inference they can work (unlike the gang-scheduled training from part 3, a single inference replica dying is survivable). But a spot GPU can be reclaimed with about two minutes' notice, so you need a node-termination handler that drains in-flight requests and a plan for where the replacement comes from.

Which is the trap: scaling up assumes there's a GPU to scale up *onto*. In 2026, popular GPUs are not always available on demand, and a scale-to-zero service that can't reacquire an H100 at 9am Monday is worse than one that never scaled down. The mitigations are the capacity blocks and reservations from part 3, an on-demand fallback when spot is dry, and a warm floor for anything with a real SLO. Scale-to-zero is a cost strategy, not a capacity strategy, and confusing the two is how you save money right up until the morning you can't get your GPUs back.

That's the cost side handled. The fleet scales with demand and turns itself off when it's idle, and the first user back doesn't wait five minutes for the privilege. But there's one lever left, and it's the strangest one, because it costs nothing to pull. Everything so far has quietly assumed that a request, once it arrives, lands on some replica and gets served. Part 6 is about that word "some." It turns out that which replica you pick, out of a pool that all look identical from the outside, can make the exact same hardware more than twice as fast. The load balancer, of all the unglamorous things, is where the last big win hides.
