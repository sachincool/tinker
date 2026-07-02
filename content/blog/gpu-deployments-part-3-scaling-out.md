---
title: "Scaling GPUs past one box"
date: "2026-07-09"
tags: ["gpu", "distributed-training", "infiniband", "kubernetes", "infrastructure"]
excerpt: "Past one node the network becomes the machine. InfiniBand vs RoCE, gang scheduling, FSDP and Megatron, and why a 16k-GPU cluster fails every three hours."
featured: false
series: "GPUs in production"
seriesPart: 3
---

When Meta trained Llama 3 405B on 16,384 H100s, the cluster hit 419 unexpected interruptions over 54 days. That's one failure every three hours or so, for 54 days straight, and about 78% of them were hardware. GPUs and their HBM3 memory accounted for roughly half. They also watched the datacenter's power draw swing by tens of megawatts as thousands of GPUs idled and resumed in sync, which is a sentence that should make any infrastructure engineer sit up.

This is the part of the series where the GPU stops being the interesting component. Part 1 was the stack under one pod, part 2 was one box and the wires inside it. Once you cross the node boundary, the network becomes the machine, failures become continuous rather than exceptional, and the scheduler decides whether your very expensive cluster does useful work or deadlocks against itself. Everything here is about the stuff between the boxes.

## the network is the machine

Synchronous training does an all-reduce of the entire gradient (every parameter, billions of them) every single step. That collective is a hard barrier: the slowest link gates every GPU in the job. Add nodes and your compute scales, but the all-reduce volume grows and so does the chance that one link is slow or dead. This is why, past one node, communication rather than FLOPs sets your scaling efficiency, and why the network gear costs as much attention as the GPUs.

![A network topology diagram titled 'rail-optimized fabric'. It shows four GPU nodes at the bottom, each with eight GPUs and eight NICs. The NICs are grouped into rails: NIC-0 of every node connects up to the same leaf switch, NIC-1 of every node to the next leaf switch, and so on across eight leaf switches. The leaf switches connect up to a row of spine switches forming a non-blocking fat-tree. An annotation notes 'GPU_i on any node reaches GPU_i on any other node in one switch hop'.](/images/gpu-deployments-part-3-scaling-out/rail-optimized-fabric.png)

*Fig. 1 · a rail-optimized fat-tree. Each GPU gets its own NIC ("rail"), and rail N of every node lands on the same leaf switch, so the GPUs that talk most take the shortest path.*

The fabric itself is a two-horse race. InfiniBand is the incumbent for dedicated training superclusters: the generation ladder runs EDR 100Gb, HDR 200Gb, NDR 400Gb (Quantum-2 switches, ConnectX-7 NICs), and now XDR 800Gb (Quantum-X800, ConnectX-8). Most DGX SuperPODs and the big named clusters run it. RoCE v2, RDMA over Ethernet, is winning share on cost and on letting existing Ethernet teams reuse what they know. The catch with RoCE is that it needs a carefully tuned lossless fabric (Priority Flow Control plus ECN marking) or you get congestion storms, and getting that right at scale is its own discipline.

Meta is the proof that Ethernet can do it. They built two 24,576-GPU H100 clusters, one on RoCE and one on Quantum-2 InfiniBand, and trained Llama 3 405B on the RoCE one with no network bottleneck, after co-designing the topology, the PFC/ECN thresholds, and an all-reduce-aware load balancer. That's the honest framing: RoCE works at scale, but Meta spent real engineering to make it work. Two more pieces earn their keep on either fabric. GPUDirect RDMA lets the NIC DMA straight into GPU memory, skipping a bounce through host RAM, and without it every hop stages through system memory. SHARP does the reduction inside the switch ASIC, so gradients get summed in the network instead of shuttled between every node, which on the newest Blackwell fabrics is a large multiplier on effective all-reduce bandwidth.

## NCCL across the wire

The same NCCL from part 2 handles inter-node collectives, and the failure mode here is specific and common: NCCL silently falls back to TCP sockets when it can't find or use the RDMA path, and the job "works" while running an order of magnitude too slow. The env vars that prevent that are worth pinning in your launcher.

`NCCL_IB_HCA` names which RDMA NICs to use, and getting it wrong means NCCL picks one NIC and loses your rail parallelism. `NCCL_SOCKET_IFNAME` has to point at the real data-plane interface, not `eth0` or `lo`, a classic container and Kubernetes trap. `NCCL_CROSS_NIC=0` on a rail-optimized fabric keeps a ring on the same rail instead of hopping across them. `NCCL_IB_GID_INDEX` is the RoCE gotcha: the wrong GID index gives you no traffic or a silent slow path. On a fresh cluster the first all-reduce is routinely two to ten times slower than optimal until the env vars, the GID index, the PFC/ECN config, and the topology file are all correct. The bring-up ritual is always `nccl-tests`: run `all_reduce_perf`, measure the achieved bus bandwidth, compare it against what 400 or 800 Gb should give you, and don't trust the cluster until the number is close.

## who schedules the gang

Here's the failure that surprises people coming from web infrastructure. Vanilla Kubernetes schedules pods independently, one at a time, with no concept of a job that needs all its pods at once. Give it a 4-node training job and it will happily place 3 pods and leave the 4th Pending forever, holding three nodes of GPUs idle. Run two such jobs and they can each grab most of what the other needs and starve each other indefinitely. Distributed training is all-or-nothing, and a scheduler that doesn't know that will deadlock your cluster. The first time it happens you assume you're out of GPUs. You're not. They're all sitting idle, reserved by pods that will never get their partners.

![A two-panel diagram titled 'why training needs gang scheduling'. Left panel, labeled 'vanilla Kubernetes': a four-pod job where three pods are Running on GPU nodes and one pod is stuck Pending, with the three running pods marked as holding GPUs idle while waiting, and a red 'deadlock' label. Right panel, labeled 'gang scheduling': the same four-pod job where all four pods are admitted together as one unit or none at all, marked 'all-or-nothing placement, no partial allocation'.](/images/gpu-deployments-part-3-scaling-out/gang-scheduling.png)

*Fig. 2 · gang scheduling in one picture. The left side is how a cluster quietly wedges itself; the right side is the fix, and the reason every GPU scheduler below exists.*

The fix is gang scheduling: admit all N pods together or none, so partial allocations can't happen. The tools that provide it each have an honest drawback:

- **Slurm** is the HPC default and has gang scheduling and topology awareness built in, plus new block scheduling for aligning jobs to NVL72 racks. Its weakness is that containers and multitenancy are bolted on (Pyxis plus Enroot), and it's a poor fit for long-running inference services. That gap is why Slurm-on-Kubernetes projects like SchedMD's Slinky and CoreWeave's SUNK exist.
- **Kubernetes vanilla** has no gang scheduling and no topology awareness by default. You add a batch scheduler on top; you don't run training on the default scheduler.
- **Volcano** is the de facto CNCF choice: gang scheduling via PodGroups, queues, fair-share. It runs as a second scheduler that bypasses the default, which complicates coexistence with normally-scheduled workloads, and gang scheduling itself costs maybe 10–15% utilization because resources sit idle waiting for the full gang.
- **Kueue** is the Kubernetes-native answer for queueing and quota, and it cooperates with the default scheduler instead of replacing it. The tradeoff is that it does admission and quota, not fine-grained placement, so you still need scheduler plugins underneath for the actual gang and topology binding.
- **Run:ai** is the commercial option, now NVIDIA-owned, with fractional GPU and pooling. NVIDIA open-sourced the core as KAI Scheduler (Apache 2.0, now CNCF Sandbox), so a free path exists, but the full enterprise feature set stays paid and KAI is young as a standalone project.
- **YuniKorn** brings strong hierarchical-queue multitenancy from the Spark world, at the cost of being another full scheduler replacement with a smaller AI-specific ecosystem than Volcano.

The cross-cutting truth is that gang scheduling trades utilization for progress. Holding GPUs idle while you wait for the full gang is the price of not deadlocking, and it's a price worth paying.

## splitting the model

When a model outgrows one GPU, there are three axes to split it on, and real training combines them. Data parallelism replicates the whole model on each GPU and all-reduces gradients; it's the simplest and only works when the model plus its optimizer states fit on one card. Tensor parallelism splits individual matrix multiplies across GPUs and is communication-heavy, so you keep it inside a node on NVLink (TP=8 is the common ceiling). Pipeline parallelism cuts the layers into stages across nodes and passes activations point-to-point, which is cheap enough to cross the network.

![A diagram titled '3D parallelism: how a frontier model maps to a cluster' showing a grid of GPU nodes. Tensor parallelism is shown splitting a single layer across the eight GPUs within one node, connected by NVLink and labeled 'TP=8, stays inside the node'. Pipeline parallelism is shown splitting the model's layers into stages across several nodes, labeled 'PP across nodes, cheap point-to-point'. Data parallelism is shown replicating the whole arrangement across groups of nodes with an all-reduce between replicas, labeled 'DP / FSDP on top'.](/images/gpu-deployments-part-3-scaling-out/3d-parallelism.png)

*Fig. 3 · the standard frontier recipe: tensor-parallel inside the NVLink domain, pipeline-parallel across nodes, data-parallel on top. Match each split to the bandwidth it can afford.*

For the common case of "my model doesn't fit but I want to stay in native PyTorch," FSDP2 shards the parameters, gradients, and optimizer states across GPUs and reconstructs each layer on the fly via all-gather, prefetching the next shard to overlap communication with compute. DeepSpeed's ZeRO does the same idea in stages: stage 1 shards optimizer states, stage 2 adds gradients, stage 3 adds parameters and is functionally equivalent to FSDP. For frontier scale and maximum MFU you reach for Megatron-Core and combine tensor, pipeline, and sequence parallelism into the 3D (now 4D, with expert parallelism for MoE) recipe: TP=8 inside the node, pipeline across nodes, data parallelism on top.

Checkpointing is the reliability workhorse and used to be the tax that made frequent saves unaffordable. Async distributed checkpointing fixed that by writing state in a background thread that overlaps the next iterations; TorchTitan reports 5–15x lower checkpoint overhead than synchronous saves. That matters directly because of the failure rate: at one interruption every three hours, you want to checkpoint on the order of tens of minutes, and torchrun's elastic mode restarts the job from the last snapshot when a node dies. The newer torchft goes further, recovering a failed replica from a healthy peer without restarting the whole job.

## when the model won't fit one node

Serving crosses the node boundary for the same reason training does: the model, or its KV cache, exceeds one node's total HBM. DeepSeek-V3 at 671B, Llama 405B, the big mixture-of-experts (MoE) models. You split them with tensor and pipeline parallelism across nodes, and for MoE you add wide expert parallelism, spreading experts across many nodes so each GPU holds few experts but sees a large batch per expert.

The pattern that's become standard is disaggregated prefill and decode. Prefill (processing the prompt) is compute-bound; decode (generating tokens one at a time) is memory-bandwidth-bound. Running them in one pool means prefill work stalls decode latency. Splitting them into separate worker pools lets you scale each for its own bottleneck and transfer the KV cache between them over RDMA. It isn't a free win, though. Moving the KV cache between pools costs bandwidth, so disaggregation pays off when prefill interference is genuinely the bottleneck (long prompts, high concurrency) and can be net-negative when it isn't. DeepSeek runs it because at their scale it clearly is; a chatbot with short prompts might not need it at all.

![A diagram titled 'disaggregated prefill and decode' showing an inference request flowing left to right. The request first hits a pool of prefill workers, labeled 'compute-bound: process the whole prompt', drawn as a small cluster of GPUs. The resulting KV cache is transferred over RDMA to a separate, larger pool of decode workers, labeled 'memory-bandwidth-bound: generate tokens one at a time'. An annotation notes 'scale each pool independently; prefill no longer stalls decode', with a footnote citing DeepSeek-V3's production split of a 32-GPU prefill unit feeding a 320-GPU decode pool.](/images/gpu-deployments-part-3-scaling-out/disaggregated-prefill-decode.png)

*Fig. 4 · prefill and decode want different hardware ratios, so modern stacks run them as separate pools and ship the KV cache between them. DeepSeek-V3 runs a 32-GPU prefill unit in front of a 320-GPU decode pool.*

DeepSeek's own deployment runs a 32-GPU prefill unit (4 nodes, expert-parallel across 32) feeding a much larger decode pool, and an LMSYS reproduction on 96 H100s hit 52,000 input and 22,000 output tokens per second per node. On Kubernetes the primitive that expresses "this is one model replica made of many pods" is LeaderWorkerSet: one leader, N workers, scheduled and scaled as a unit, which is exactly what gang scheduling and topology-aware placement need to bite on. NVIDIA Dynamo and llm-d sit on top: Dynamo for distributed serving with a KV-cache-aware router, and llm-d for KV-cache-aware routing on the Gateway API Inference Extension. That routing layer turns out to be one of the biggest free wins in the whole stack, which is why it gets its own part 6.

## everything fails at scale

Reliability stops being a checkbox and becomes the main event. The Llama 3 numbers from the top of this post are the reference point, and ByteDance's MegaScale run on 12,288 GPUs tells the same story: 55.2% MFU and more than a hundred failure-recovery events over a few weeks. The failure you can't see coming is silent data corruption, where a GPU computes a wrong number without erroring. It doesn't crash or log anything. It just hands back the wrong answer, and your loss curve grows a mysterious kink a few hours later. Meta caught six such events in 54 days; Google reports SDC-related disruptions roughly every one to two weeks. A single corrupted gradient contaminates the global update across every worker, and it's now a first-class reliability topic with its own whitepapers.

> **Key Insight:** At cluster scale, hardware failure is the normal state, not an exception you engineer away. A 16k-GPU run loses a GPU every few hours. You can't stop that, so the whole game is checkpointing often enough and keeping enough hot spares that a dead node costs you minutes instead of the whole run.

The straggler is the SDC's cousin: a GPU or link that's degraded but not dead, quietly throttling a synchronous job because collectives move at the speed of the slowest member. Detecting it at scale is genuinely hard, so systems run periodic self-check diagnostics that pause the job, measure NVLink and compute per node, diagnose, and resume from checkpoint. Imbue open-sourced their bare-metal playbook for a 4,088-H100 cluster: check VBIOS and baseboard firmware, the Mellanox OFED stack, PCIe link speed and width, then run matmuls to measure actual NVLink bandwidth, cordon anything that fails, and swap in a hot spare automatically. That last part is the operating model at scale. You don't fix nodes in the critical path; you drain them and pull from a spare pool, because the cluster is always partially broken and the job has to keep moving.

![A donut chart infographic titled 'Llama 3 405B: what interrupted 54 days of training' showing the breakdown of 419 unexpected interruptions. Segments: GPU faults 30.1 percent, HBM3 memory 17.2 percent, network switch and cable 8.4 percent, GPU SRAM 4.5 percent, GPU processor 4.1 percent, and other or software causes making up the remainder. A center label reads '419 interruptions, ~1 every 3 hours, ~78% hardware'.](/images/gpu-deployments-part-3-scaling-out/llama3-failure-breakdown.png)

*Fig. 5 · the failure breakdown from Meta's Llama 3 405B run. GPUs and their memory are roughly half; the rest is the long tail an at-scale operator plans around, not against.*

## paying for it

The economics are why all of the above matters. At $2–6 per GPU-hour, a 16,000-GPU cluster idling during a recovery burns thousands of dollars a minute, and gang scheduling means one bad node can idle the whole job. That's the real argument for the reliability engineering: not uptime for its own sake, but goodput, the useful training throughput net of failures and restarts.

![A horizontal bar chart infographic titled 'GPU cost per hour, on-demand ballpark (2026)' comparing neocloud versus hyperscaler pricing for three GPUs. H100 SXM: neocloud about 2.5 to 3.5 dollars, AWS about 6.88 dollars. H200: neocloud about 3.8 to 4 dollars, Azure about 10 to 13 dollars. B200: neocloud about 5 to 6 dollars, AWS about 14.24 dollars. A note reads 'reserved commits cut 16 to 40 percent; spot is 30 to 70 percent cheaper but nearly unusable for gang-scheduled training'.](/images/gpu-deployments-part-3-scaling-out/gpu-cost-comparison.png)

*Fig. 6 · the on-demand spread between neoclouds and hyperscalers is wide, and it moves monthly. Big training runs almost never pay on-demand; they live on reserved capacity or capacity blocks.*

The pricing spread is wide and moves every month. Neoclouds like Lambda, CoreWeave, and Nebius run an H100 around $2.5–3.5 per hour; AWS lists closer to $6.88. B200s are $5–6 on neoclouds and north of $14 on AWS. Reserved commitments of one to twelve months cut 16–40% off on-demand, and that's where most large training capacity actually lives. Spot is 30–70% cheaper and nearly unusable for gang-scheduled training, because losing any one node preempts the whole synchronous job and reacquiring N contiguous, topology-aligned nodes on spot is a fantasy. That gap is why capacity blocks exist: AWS EC2 Capacity Blocks and GCP's Dynamic Workload Scheduler let you reserve co-located GPUs for a fixed window, booked weeks ahead, because on-demand can't guarantee the topology and reserved is too long a commit for one run. AWS raised those block prices about 15% in early 2026, which tells you which way demand is going.

That's the whole arc of building this stuff. A GPU deployment is not a GPU. It's a dozen layers under one pod, a small network inside one box, and a large one between boxes, and the interesting failures always live in the wiring rather than the silicon. Meta's cluster lost a GPU every three hours and still trained a frontier model, because the whole apparatus around the GPUs (the fabric, the scheduler, the checkpointing, the spare pool) was built to keep moving while parts of it were on fire. That's how you build it. The next part is how you watch it once real traffic arrives, which turns out to be a different problem than watching the GPUs.
