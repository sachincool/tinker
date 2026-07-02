---
title: "What a green GPU dashboard hides"
date: "2026-07-11"
tags: ["gpu", "observability", "vllm", "prometheus", "inference"]
excerpt: "The GPU dashboard says 92% busy and users are waiting eight seconds for the first token. Monitoring an LLM server means watching the queue, not the silicon."
featured: false
series: "GPUs in production"
seriesPart: 4
---

The GPU dashboard was a wall of green. Every card pinned at 90-something percent utilization, power near TDP, temperatures fine, no XID errors. By every signal from part 1 of this series, the box was healthy and working hard. Meanwhile the on-call channel had three messages from product asking why the chatbot took eight seconds to say its first word. The hardware was busy. The users were furious. Both were true.

That is the trap of monitoring GPU inference with GPU metrics. A card at 92% utilization tells you a kernel is running. It tells you nothing about whether requests are piling up in a queue, whether the KV cache is full and requests are being evicted, or whether the first token is landing in 200 milliseconds or eight seconds. This is part 4 of the series. Parts 1 through 3 built the thing: the stack under a pod, the wires in a box, the network between boxes. This part is about seeing what it's doing once real traffic hits it, and the short version is that the numbers users feel live in the serving engine, not on the GPU.

## the four numbers users actually feel

Before any dashboard, get the vocabulary straight, because LLM latency is not one number. A request has a shape, and four measurements describe it.

**TTFT**, time to first token, is how long the user stares at a blinking cursor before anything appears. It's dominated by prefill (processing the whole prompt) plus however long the request sat in a queue before the server picked it up. This is the number product complains about.

**ITL**, inter-token latency, is the gap between consecutive tokens once generation starts. (Some tools report TPOT, time per output token, the averaged version of the same thing; benchmarks like GuideLLM show both side by side, so don't treat them as interchangeable in a report.) It's what makes text feel like it's streaming smoothly or stuttering out. Decode is memory-bandwidth-bound, so ITL degrades as you pack more concurrent requests onto a GPU.

**End-to-end latency** is the whole request, first byte to last. For a long generation it's mostly `output_tokens × ITL`, which means it's as much about how much the model says as how fast it says it.

**Throughput** is output tokens per second across all requests, and it moves in the opposite direction from latency. Batch more requests together and throughput climbs while per-request latency gets worse. There's no single "fast" setting. There's a frontier, and where you sit on it is a product decision (a chatbot wants low TTFT, a batch summarization job wants raw throughput) rather than a tuning default.

The number that captures both at once is **goodput**: the requests per second you can serve while still meeting your latency SLO. A server can post gorgeous raw throughput while quietly blowing p99 TTFT for half its users, so goodput (throughput, filtered by "did it meet the SLO") is the only throughput figure worth quoting.

![A timeline diagram of a single inference request showing where each latency metric is measured. A horizontal track runs left to right: the request arrives and sits in a queue (labeled 'queue time'), then prefill runs (labeled 'prefill'), then the first token emerges (a marker labeled 'TTFT ends here: queue + prefill'), then a series of output tokens stream out with the gaps between them labeled 'ITL / TPOT', and the far right marks 'end-to-end latency'. Below, a note reads 'TTFT is what the user waits for; ITL is how smooth the stream feels'.](/images/gpu-deployments-part-4-observability/request-latency-anatomy.png)

*Fig. 1 · one request, four measurements. Queue time hides inside TTFT, which is why a busy GPU and a slow first token go together.*

## what vLLM actually tells you

vLLM exposes a Prometheus `/metrics` endpoint, and once you've read it a few times the health of the server is obvious at a glance. The metrics that matter split into two groups: what the queue is doing, and what the KV cache is doing.

The queue first. `vllm:num_requests_running` is how many requests are being served right now; `vllm:num_requests_waiting` is how many are stuck in line because the server can't fit them yet. A healthy server has a running count near its batch capacity and a waiting count near zero. When `num_requests_waiting` starts climbing and staying up, that eight-second TTFT has arrived, and no GPU metric will show it. `vllm:request_queue_time_seconds` measures the wait directly.

Then the KV cache (the model's running memory of the tokens it has already processed, which grows with every active request and every token generated). `vllm:kv_cache_usage_perc` is the fraction of KV cache in use. This is the one to stare at, because when it approaches 100% vLLM has to start **preempting**: evicting a half-finished request to free memory, then recomputing it from scratch later. `vllm:num_preemptions_total` counts that happening. A rising preemption rate means the server is thrashing, doing the same work twice, and every latency number is about to get worse.

![A side-by-side comparison of two vLLM server states drawn as metric panels. Left panel labeled 'healthy': running requests near batch capacity, waiting requests at zero, KV-cache usage around 60 percent, preemptions flat at zero, p99 TTFT well under the SLO line. Right panel labeled 'drowning': running requests flat at capacity while waiting requests climb, KV-cache usage pinned near 100 percent, preemptions rising, p99 TTFT crossing above the SLO line. A note reads 'the GPU looks equally busy in both; only the serving metrics tell them apart'.](/images/gpu-deployments-part-4-observability/healthy-vs-drowning.png)

*Fig. 2 · the same server, healthy and drowning. GPU utilization is high in both; the queue, the cache, and the preemption counter are what separate a busy server from a failing one.*

The rest fill in the picture. `vllm:time_to_first_token_seconds` and `vllm:inter_token_latency_seconds` are histograms, so you alert on the p95 or p99, not the average (the average hides the user who waited twelve seconds). `vllm:prompt_tokens_total` and `vllm:generation_tokens_total` give you real throughput, computed with `rate()` (vLLM removed its old pre-averaged throughput gauges, so you do the division yourself). And `vllm:prefix_cache_hits_total` over `vllm:prefix_cache_queries_total` tells you how much prompt reuse you're getting, which matters enormously for the RAG and multi-turn workloads from part 2. It's also the number a smart router watches to decide which replica to send a request to, which is the whole subject of part 6.

One warning that will save you an afternoon: these names drift between releases. The V1 engine renamed the KV-cache gauge (it used to be `gpu_cache_usage_perc`) and swapped the per-output-token metric to `inter_token_latency_seconds`. Diff the live `/metrics` output of your exact build before you copy anyone's PromQL, this post included.

> **Key Insight:** GPU utilization tells you the chip is busy; it never tells you users are waiting. The metric that predicts an angry inbox is vllm:num_requests_waiting climbing, usually because vllm:kv_cache_usage_perc hit its ceiling and the server started evicting half-finished requests. Watch the queue and the cache, not GPU-util.

## the same story in SGLang and Triton

The engine changes, the questions don't. SGLang exposes its own Prometheus metrics behind `--enable-metrics`: `sglang:num_running_reqs` and `sglang:num_queue_reqs` are the running-and-waiting pair, `sglang:token_usage` is the KV-cache fraction, and `sglang:cache_hit_rate` reports how often its RadixAttention prefix cache paid off. (One gotcha of exactly the kind above: SGLang flipped the metric prefix from `sglang:` to `sglang_` in v0.5.4, and the bundled Grafana dashboard hasn't caught up, so a fresh install can read "No Data" until you fix the prefix.) If you built on SGLang for its prefix-sharing (the reason to pick it in part 2), that last one is how you confirm the bet is paying.

Triton with the TensorRT-LLM backend reports through Triton's metrics endpoint instead: request and queue durations, inflight-batcher stats, per-model success and failure counts. Different names, same three questions every time: how long are requests waiting, is the cache saturated, is the tail latency inside the SLO.

The lesson worth internalizing is that these are all the same dashboard with different labels. Queue depth, cache utilization, tail TTFT, tail ITL. Learn to read one engine and you can read all of them.

## compute-bound, memory-bound, or queue-bound

The reason to keep the GPU metrics from part 1 next to the serving metrics is that together they diagnose *why* the server is slow, which is the only thing that tells you what to do about it. Three shapes cover most incidents.

If TTFT is high and `num_requests_waiting` is high but `gpu_cache_usage_perc` is low, you're **queue-bound**: requests are backing up faster than you can start them, and the fix is more replicas (which is part 5). If ITL is degrading and `DCGM_FI_PROF_DRAM_ACTIVE` is pinned while tensor activity isn't, you're **memory-bound** on decode, and the fix is a smaller batch, quantization, or better KV-cache management. If tensor cores are saturated during prefill and DRAM isn't, you're **compute-bound**, which for inference usually means very long prompts and points at chunked prefill or a prompt-length limit.

![A three-way decision diagram titled 'why is the server slow?'. A central question branches on the combination of serving and GPU metrics into three outcomes. Branch one: high queue (num_requests_waiting up) plus low KV-cache usage routes to 'queue-bound: add replicas'. Branch two: degrading inter-token latency plus DRAM_ACTIVE pinned but low tensor activity routes to 'memory-bound on decode: smaller batch, quantize'. Branch three: tensor cores saturated during prefill routes to 'compute-bound: chunked prefill, cap prompt length'. Each branch pairs a serving metric with a DCGM metric.](/images/gpu-deployments-part-4-observability/bottleneck-diagnosis.png)

*Fig. 3 · the serving metric tells you something is wrong; the GPU metric next to it tells you which kind of wrong. You need both panels on the same screen.*

Neither set of metrics is enough alone. GPU metrics without serving metrics miss the queue entirely. Serving metrics without GPU metrics can't tell a memory-bound stall from a compute-bound one. The dashboard that works has both, side by side, on one screen.

## what to alert on

Most teams over-alert on the GPU and under-alert on the experience. The page that matters fires on the user's SLO, not the hardware's vitals. A working starter set:

- **TTFT p99 over budget** for N minutes. This is the customer-facing SLO. Everything else is a leading indicator of this.
- **`num_requests_waiting` sustained above zero.** A brief spike is fine; a standing queue means you're under-provisioned and the next thing to break is TTFT.
- **Preemption rate climbing.** `num_preemptions_total` moving means the KV cache is saturated and the server is recomputing evicted work. It's the early warning before latency falls off a cliff.
- **Error rate.** Request failures and, specifically, CUDA out-of-memory events, which on an inference server usually mean a batch or context-length setting is too aggressive.
- **The part-1 hardware alerts still stand.** XID errors, thermal throttle, ECC. A dying GPU shows up as latency variance long before it shows up as an error, so keep those wired.

Tail latency is the whole game here. Alerting on average TTFT is how you find out about an outage from the customer instead of the pager, because the average stays calm while your p99 is on fire.

## tracing a single slow request

Aggregate metrics tell you the fleet is unhealthy. They don't tell you why *this* request took nine seconds. For that you want per-request tracing, and the ecosystem has standardized on OpenTelemetry's GenAI semantic conventions: spans carry `gen_ai.*` attributes (the model, input and output token counts, the request parameters) so a single request's journey through the gateway, the queue, prefill, and decode is one connected trace. When a specific user reports a slow response, a trace tells you whether it sat in a queue, hit a cache miss, or just asked for a 4,000-token essay. The metrics say the kitchen is slow; the trace shows you which order got lost.

## proving it before prod

You don't want to discover your latency frontier during a launch. Load-test the serving endpoint before it sees real traffic, with a tool that speaks LLM rather than plain HTTP. vLLM ships `vllm bench serve` (the old `benchmark_serving.py`), which replays a request distribution, reports TTFT, ITL, and throughput percentiles, and computes goodput directly if you hand it SLO thresholds. GuideLLM (now a Red Hat project) does the same with a `sweep` mode that finds your safe operating range on its own; NVIDIA's genai-perf covers the Triton side, though NVIDIA is steering new work to its successor AIPerf; and the Kubernetes serving working group's inference-perf standardizes the numbers across engines so you can compare vLLM to SGLang honestly. Whatever you pick, the output you care about is the same: the curve of tail latency against offered load, and the load at which p99 TTFT crosses your SLO. That crossover is the goodput ceiling, the real per-replica capacity, and it's the input to everything in part 5.

Because that's the thing this post sets up. Once you can see the queue building and the cache saturating, the obvious next question is: why am I staring at these graphs manually at 2am instead of having the queue depth add a replica by itself, and drop it again when the traffic goes home. That's scaling, and scaling GPUs that cost six dollars an hour is its own kind of problem.
