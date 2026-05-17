---
title: "VictoriaLogs vs Loki: Real-World Benchmarking Results"
date: "2025-11-19"
tags: ["kubernetes", "logging", "observability", "victorialogs", "loki", "monitoring", "performance", "benchmarking"]
excerpt: "After benchmarking VictoriaLogs and Loki on 500 GB of logs over 7 days, we found VictoriaLogs delivered 94% lower query latencies, 37% smaller storage, and ran on under half the CPU and RAM. Here's the breakdown."
featured: true
---

On 500 GB of logs over 7 days, on the same hardware: **94% lower query latencies, 37% smaller storage, and under half the CPU and RAM**. The single number that surprised us most was the 12× drop in needle-in-a-haystack search times.

![Horizontal bar comparison of VictoriaLogs vs Loki on 500 GB over 7 days: needle search 0.9 s vs 12 s, storage 63% vs 100%, sustained CPU 2 vCPU vs 4 vCPU, memory 1.3 GB vs 6.5 GB](/images/victorialogs-vs-loki/hero.png)

*Fig. 1 — same hardware, same dataset, four bars short enough to read on the way to a meeting.*

## The setup

At Truefoundry we run multi-tenant ML workloads, which means fast ad-hoc search, high ingestion, live log tailing, and minimal ops on 4 vCPU / 16 GB nodes. Loki was our default, but past the 1M-active-series mark it started showing 30s+ search latencies and high I/O amplification. So we benchmarked it head-to-head against VictoriaLogs and let the numbers decide.

The contestants in one line:

- **Loki:** Grafana Labs' log store. Compressed chunks, label-based indexing, LogQL. Brilliant Grafana integration; expensive regex scans and Go GC overhead at scale.
- **VictoriaLogs:** VictoriaMetrics' columnar LSM log database. Per-field indices, SIMD search, LogsQL. Single binary, low memory footprint, efficient compression.

Methodology in five bullets:

- **Workload:** 65 MB/s sustained ingestion via flog → Vector → destination
- **Dataset:** ~500 GB over 7 days across 20 namespaces and 40 apps
- **Load test:** Locust, 10 virtual users, 43 RPS sustained
- **Hardware:** 4 vCPU / 8 GiB RAM instances
- **Tuning:** Block-cache disabled to simulate cold reads

## The headline figure

Before the methodology debate, here's what the seven days produced.

<iframe src="/images/victorialogs-vs-loki/footprint-widget.html" title="VictoriaLogs vs Loki resource footprint: 500 GB over 7 days" height="900" data-caption="Fig. 2 — Resource economics on identical hardware and workload."></iframe>

The memory line is the one that most directly translates into infrastructure cost. At steady state, VictoriaLogs sat around 1.3 GB while Loki held 6–7 GB. Freeing ~5 GB per node is the difference between bin-packing four tenants on a box and seven.

## Query performance

Four query patterns, run against the same 500 GB / 7-day index:

| Query Type | Loki | VictoriaLogs | Improvement |
|---|---|---|---|
| Stats (24h count) | 2.5s | 1.5s | 40% faster |
| Needle-in-Haystack (500 GB) | 12s | ~900ms | **12× faster** |
| Pattern `:3000` (7d) | 2.2s | 2.2s | Same |
| Non-existent (500 GB) | Timeout | 2.2s | VL completed |

> **Key Insight:** VictoriaLogs' per-token index turns brute-force line scans into index lookups. Loki, once the label filter is exhausted, has nothing left but a full scan.

The two queries that made the case, side by side:

**Stats: counting logs over 24 hours**

LogQL (Loki):

```logql
sum(count_over_time({app="servicefoundry-server"}[24h]))
```

LogsQL (VictoriaLogs):

```logsql
{app="servicefoundry-server"} | stats count()
```

**Needle in haystack: finding a single entry across 500 GB**

LogQL:

```logql
{namespace="truefoundry", app!="grafana"} |= "[UNIQUE-STATIC-LOG] ID=abc123 XYZ"
```

LogsQL:

```logsql
{namespace="truefoundry", app!="grafana"} "[UNIQUE-STATIC-LOG] ID=abc123 XYZ"
```

The non-existent query is the quiet one. Loki times out trying to prove a negative across 500 GB; VictoriaLogs returns "none" in 2.2 seconds. In production that's the difference between an alert that fires and a dashboard that loads.

## Ingestion under pressure

We pushed both with 120 flog replicas to find the ceiling.

| Metric | Loki | VictoriaLogs | Delta |
|---|---|---|---|
| Peak ingestion | 20 MB/s | 66 MB/s | **3× higher** |
| vCPU (sustained) | 4 (throttled) | 2 peak | 50% lower |
| Memory | ~4 GB | ~1.3 GB | 3× lower |

![Loki CPU saturation graph at 4 vCPUs and memory consumption at 4GB during peak ingestion load with 120 flog replicas](/images/victorialogs-vs-loki/victorialogs-loki-cpu-memory-loki.png)

![VictoriaLogs performance graph showing 2 peak vCPU usage and 1.3GB memory consumption during the same ingestion load](/images/victorialogs-vs-loki/victorialogs-loki-performance-victoria.png)

Loki hit the CPU wall first and never recovered. VictoriaLogs absorbed the same firehose with cycles to spare.

## Load test under traffic

Locust, 10 concurrent users, simulating real read traffic:

- **RPS handled:** VictoriaLogs processed **36% higher** requests per second
- **p99 latency:** **3.6× faster** than Loki under load
- **Tail latency:** consistently lower at every percentile we measured

![Load test results for VictoriaLogs showing 36% higher RPS and 3.6x faster p99 latency with 10 concurrent users at 43 RPS](/images/victorialogs-vs-loki/victorialogs-loki-loadtest-victoria.png)

![Load test results for Loki showing slower response times and lower throughput under the same simulated traffic](/images/victorialogs-vs-loki/victorialogs-loki-loadtest-loki.png)

## Why the gap is this big

Four design choices doing most of the work:

1. **Full-text indexing.** Per-token indices skip line-by-line filtering entirely.
2. **Columnar LSM layout.** Reads touch only the columns the query asks for; fewer disk seeks.
3. **Memory discipline.** Lower steady-state overhead means more headroom for everything else.
4. **SIMD search.** Vectorised inner loops on commodity CPUs add up over billions of lines.

## When to pick which

**Choose VictoriaLogs if:**

- Text search and grep-style queries are the primary workload
- Ad-hoc exploration across large windows matters
- Resource efficiency and bin-packing density matter
- You want fewer knobs to tune in production

**Choose Loki if:**

- Label-based queries dominate; full-text is rare
- Deep Grafana ecosystem integration is non-negotiable
- You already operate Loki at scale and the migration cost outweighs the wins

For us, on this workload, the resource economics decided it. The freed memory per node became real infrastructure savings within a quarter. 12 seconds turned into 900 milliseconds with no tuning, and that's the number I keep quoting six months later.

## Resources

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [VictoriaLogs Documentation](https://docs.victoriametrics.com/victorialogs/)
- [Vector Documentation](https://vector.dev/)
- [Grafana Alloy](https://grafana.com/docs/alloy/latest/)
