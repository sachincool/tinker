---
title: "The cheapest speedup is your load balancer"
date: "2026-07-18"
tags: ["gpu", "inference", "routing", "vllm", "kubernetes"]
excerpt: "Same GPUs, same model, same replica count. Swap round-robin for prefix-cache-aware routing and the fleet gets 2.3x faster. The router was throwing the cache away."
featured: false
series: "GPUs in production"
seriesPart: 6
---

A team I know had a slow chatbot and did the obvious thing: added replicas. TTFT barely moved. They added more. Still slow, and now the bill was worse. Every GPU showed healthy utilization, the queue metrics from part 4 were climbing, and adding capacity wasn't buying the speedup capacity is supposed to buy. Then someone swapped the Kubernetes Service in front of the pods for a prefix-cache-aware router, changed nothing else, and the same eight GPUs got more than twice as fast. The problem was never the GPUs or the count. It was the load balancer, quietly throwing away the most expensive thing the servers had built.

This is part 6. Parts 1 through 5 built the fleet, watched it, and scaled it. This part is about the layer in front of the fleet: how requests get assigned to replicas, and why the default answer (round-robin, the same load balancing you'd use for a stateless web app) is the wrong one for LLM inference. It's the highest ratio of payoff to effort in the whole series, because the win comes from a routing decision, not from hardware you have to buy.

## the load balancer that throws away your cache

Here's the thing a normal load balancer doesn't know: LLM replicas are not stateless. Each vLLM replica keeps its own KV cache (from part 2, the running memory of tokens it has already processed), and it also keeps a **prefix cache**: if two requests share the same opening tokens (a long system prompt, a RAG document, the history of a chat), the second one can reuse the first one's cached computation and skip prefill entirely. Prefill is the compute-bound, expensive half of a request. A prefix cache hit makes it nearly free.

But each replica has its *own* prefix cache. A round-robin load balancer scatters requests across replicas blind to what each one holds. So a request that shares a 2,000-token prefix with something served thirty seconds ago lands on a different replica that never saw it, re-runs the entire prefill from scratch, and fills its KV cache doing redundant work. Multiply that across a prefix-heavy workload and the fleet spends most of its compute re-prefilling prompts it already processed, on a different pod. The caches sit there full of answers to questions that keep getting routed elsewhere.

![A two-panel diagram contrasting request routing. Left panel titled 'round-robin': four vLLM replicas, incoming requests that share a common prefix drawn as colored tokens, arrows scattering them evenly across all four replicas; each replica shows a mostly-full KV cache and a low prefix-cache-hit badge (~11%), with a note 'every replica re-runs prefill for prefixes its neighbors already cached'. Right panel titled 'prefix-cache-aware': the same requests and four replicas, but arrows route each request to the replica that already holds its prefix; caches show headroom and a high hit badge (~93%), with a note 'a cache hit skips prefill entirely'.](/images/gpu-deployments-part-6-inference-routing/routing-contrast.png)

*Fig. 1 · the same four replicas, two routers. Round-robin scatters shared prefixes and re-computes them; prefix-aware routing sends each request to the replica that already has the answer half-built.*

## the numbers, from one honest benchmark

This isn't a theoretical gain, and the cleanest measurement of it is a benchmark Andy Golubev ran on EKS in June 2026. The setup was deliberately boring: Qwen2.5-7B on vLLM, eight `g5.xlarge` nodes with one A10G each, one decode replica per node. Two runs, identical in every way except the front door. First run: a plain Kubernetes Service doing round-robin. Second run: an llm-d prefix-cache-aware router. Same model, same eight GPUs, same eight replicas. The workload was `vllm bench serve` replaying 9,000 prompts that shared a pool of 150 long (2,048-token) prefixes, which is exactly the RAG-and-chat shape real traffic takes.

The gap was not subtle.

![A before-and-after stat panel titled 'same 8 GPUs, only the router changed' comparing round-robin to prefix-cache-aware routing across five metrics. Output throughput: 2,742 to 6,423 tokens per second (2.34x). Wall clock for the run: 840 to 359 seconds. Mean TTFT: 19.0 seconds to 0.86 seconds (about 22x). Prefix cache hit rate: 11 percent to 93 percent. Requests waiting in queue: about 180 to 0. KV cache utilization: pinned near 99 percent down to 64 to 71 percent, showing headroom instead of thrash.](/images/gpu-deployments-part-6-inference-routing/routing-benchmark.png)

*Fig. 2 · the Golubev EKS numbers. The one that matters most is the last one: round-robin ran the cache pinned at 99% and thrashing; the smart router left it headroom, because it stopped generating redundant work.*

Read the cache-hit line again: 11% to 93%. Round-robin was reusing almost nothing; the aware router reused almost everything. Mean TTFT dropped from a genuinely broken 19 seconds to under a second. And the fleet stopped queueing (waiting requests went from ~180 to zero) not because it got more capacity, but because it stopped wasting the capacity it had. Google reports the same shape from GKE's managed version: TTFT improvements up to 96% at peak load on prefix-heavy workloads. The lesson is uncomfortable and freeing at once. Before you buy a ninth GPU, check whether your router is making the eight you have re-do each other's work.

## routing to the replica that already knows

The mechanism is simpler than it sounds. vLLM emits events about what its prefix cache holds. A cache-aware router consumes those events and keeps a live picture of which replica has which prefixes cached. When a request arrives, instead of picking the next replica in rotation, the router picks the one most likely to already hold the request's prefix, so the cache hit actually happens.

That decision point has a name in the Kubernetes world: the **Endpoint Picker**, or EPP. It doesn't just look at prefix locality. A good EPP scores every candidate replica on several signals at once and sends the request to the best total score:

- **prefix-cache locality**: does this replica already hold the request's opening tokens? Longer match, higher score.
- **load**: what's this replica's KV-cache utilization and queue depth right now? A replica that's already saturated scores lower even if it has the prefix, so you don't stampede one hot pod.
- **LoRA affinity**: if you serve multiple fine-tuned adapters, is the right adapter already loaded here? Loading one is not free, so prefer the replica that has it.

The router balances those against each other, and it can queue or shed when everything is overloaded. This is the difference between "which pod is next" and "which pod will serve this request fastest given what it already has warm." Same request, same pods, a decision made with information the round-robin balancer never had.

## the standard nobody had two years ago

The reason this is worth a whole chapter now, and wasn't in 2024, is that it stopped being a bespoke hack and became a Kubernetes standard. The **Gateway API Inference Extension** is a SIG-Networking project that adds LLM-aware routing on top of the ordinary Gateway API. It introduces an `InferencePool`, which is a group of pods that share the same accelerator, base model, and model server (the LLM-shaped version of a Service), and it wires an Endpoint Picker into the request path through Envoy's external-processing (`ext-proc`) protocol, so the proxy calls out to the EPP for a decision on every request.

![An architecture diagram titled 'the inference gateway request path'. A request enters from the left into an Envoy-based Gateway (L7 proxy handling TLS and connection management). The gateway makes an ext-proc call out to the Endpoint Picker (EPP), which reads live signals from the replica pool (prefix-cache state, KV-cache utilization, queue depth, loaded LoRA adapters), scores each replica, and returns the chosen endpoint. The gateway then forwards the request to the selected replica inside an InferencePool of four vLLM pods. A note reads 'InferencePool is the LLM-aware Service; the EPP is the brain'.](/images/gpu-deployments-part-6-inference-routing/inference-gateway-arch.png)

*Fig. 3 · the request path. The gateway is a normal Envoy proxy; the intelligence lives in the Endpoint Picker it consults per request, over the same ext-proc hook Envoy already uses for auth and rate limiting.*

The project has reached GA, with `InferencePool` graduating to a stable v1 API. (One honest caveat: the exact GA milestone landed over early-to-mid 2026, so pin the version you're deploying rather than trusting a blog's date, this one included.) Google productized it as **GKE Inference Gateway**, which is GA and is literally powered by the llm-d router underneath. So the "advanced" thing here is also increasingly the default, k8s-native thing, which is exactly the production framing this series cares about.

## the whole stack, named

"llm-d" gets thrown around as if it were a server. It isn't; it's an assembly, and it's clearer to name the pieces:

- **vLLM** is the model server. It owns the per-replica KV and prefix cache and emits the cache events the router needs.
- **KServe** is the serving control plane, exposing an `LLMInferenceService` custom resource so you describe the model and its serving config as a normal Kubernetes object.
- **The inference gateway** is Envoy plus the Gateway API Inference Extension: the data plane plus the LLM-aware routing above.
- **The router itself** is that L7 proxy plus the Endpoint Picker, making the per-request decision from cache, load, and LoRA signals.
- **Disaggregated prefill/decode** from part 3 is an optional add-on here, with the KV cache handed between pools over a connector.

If you're not ready to adopt the full gateway, the vLLM project's own **production-stack** helm chart is a lighter on-ramp: it deploys a router service in front of your vLLM pods that already does model-aware and prefix-aware routing, plus KV-cache offload through LMCache. Same idea, smaller commitment. Either way, the thing you're installing is a router that knows what a KV cache is.

## watching the router

Part 4 said the metrics that matter live in the serving engine. Add one more surface: the router. The signals that tell you whether the routing layer is earning its keep are the ones that moved in that benchmark. Prefix cache hit rate is the headline. A round-robin fleet sits low (that 11%); a well-routed prefix-heavy fleet should sit high (the 93%). If you turned on cache-aware routing and the hit rate didn't climb, either your workload doesn't actually share prefixes or the router isn't seeing the cache events.

> **Key Insight:** Prefix cache hit rate is the one dashboard number that proves the router is working. Watch it alongside per-replica KV utilization and waiting-request count. If hit rate is high and evenly spread, routing is doing its job. If one replica is pinned while others idle, your scorer is over-weighting cache locality and stampeding a hot pod. If hit rate is flat near zero, your traffic isn't prefix-heavy and this whole chapter buys you little.

That last line is the honest boundary. Cache-aware routing is close to free money for workloads with real prefix reuse: RAG over a shared corpus, long system prompts, multi-turn chat, agents replaying context. For traffic where every prompt is unique and short, there's no cache to reuse and the fancy router mostly just adds a hop. The KV-connector interfaces underneath are also still moving, so expect some churn if you build on the bleeding edge. Know which workload you have before you reach for this, the same way you'd check the topology in part 2 before promising a throughput number.

The router is the front door. What sits behind it, the probes that decide when a replica is ready, the way you roll a new model version out without dropping a request, the tenants all fighting over the same pool of GPUs, is where a production inference platform actually gets hard. That's where the series goes next.
