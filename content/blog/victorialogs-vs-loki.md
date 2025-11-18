---
title: "VictoriaLogs vs Loki: Real-World Benchmarking Results"
date: "2025-11-19"
tags: ["kubernetes", "logging", "observability", "victorialogs", "loki", "monitoring", "performance", "benchmarking"]
excerpt: "After benchmarking VictoriaLogs and Loki on 500GB of logs over 7 days, we discovered VictoriaLogs delivers 94% lower query latencies, 40% smaller storage footprint, and uses less than 50% of the CPU and RAM. Here's the complete performance breakdown."
featured: true
---

Testing on a 500 GB / 7-day dataset revealed VictoriaLogs delivered **94% reduction in query latencies, 40% storage compression, and under 50% CPU/RAM** versus Loki.

## Background

At Truefoundry, we support multi-tenant ML workloads requiring fast ad-hoc search, high ingestion rates, live log tailing, and minimal operational overhead on 4 vCPU / 16 GB RAM nodes. As our scale grew, Loki began showing >30s search latencies and high I/O amplification, prompting us to evaluate alternatives.

## System Overviews

### Loki

Grafana Labs' log aggregation system uses compressed chunks with label-based indexing and LogQL queries. Its strengths include seamless Grafana integration and a mature ecosystem. However, limitations include expensive full-scan regex searches and Go garbage collection overhead at scale.

### VictoriaLogs

VictoriaMetrics' columnar LSM-style log database features per-field indices, SIMD-accelerated search, and SQL-like LogSQL syntax. It offers single-binary deployment with minimal memory footprint and efficient storage compression.

## Benchmark Setup

Our testing methodology included:

- **Workload:** 65 MB/s continuous ingestion via flog generator → Vector → destination
- **Dataset:** ~500 GB over 7 days across 20 namespaces and 40 applications
- **Load Testing:** Locust framework with 10 virtual users generating 43 RPS sustained
- **Hardware:** 4 vCPU, 8 GiB RAM instances
- **Configuration:** Block-cache disabled for cold-read simulation

## Query Performance Results

We tested four common query patterns to evaluate real-world performance:

| Query Type | Loki | VictoriaLogs | Improvement |
|---|---|---|---|
| Stats (24h count) | 2.5s | 1.5s | 40% faster |
| Needle-in-Haystack (500 GB) | 12s | ~900ms | 12× faster |
| Pattern ":3000" (7d) | 2.2s | 2.2s | Same |
| Non-existent (500 GB) | Timeout | 2.2s | VL completed |

> **Key Insight:** VictoriaLogs' per-token index eliminates brute-force line filtering, while Loki must resort to full scans beyond label filters.

### Sample Queries

**Stats Query - Counting logs over 24 hours:**

LogQL (Loki):

```logql
sum(count_over_time({app="servicefoundry-server"}[24h]))
```

LogSQL (VictoriaLogs):

```logsql
{app="servicefoundry-server"} | stats count()
```

**Needle in Haystack - Finding specific log entries:**

LogQL (Loki):

```logql
{namespace="truefoundry", app!="grafana"} |= "[UNIQUE-STATIC-LOG] ID=abc123 XYZ"
```

LogSQL (VictoriaLogs):

```logsql
{namespace="truefoundry", app!="grafana"} "[UNIQUE-STATIC-LOG] ID=abc123 XYZ"
```

## Ingestion Performance

We stress-tested both systems with 120 flog replicas to measure peak ingestion capacity:

| Metric | Loki | VictoriaLogs | Delta |
|---|---|---|---|
| Peak Ingestion | 20 MB/s | 66 MB/s | 3× higher |
| vCPU Usage | 4 (throttled) | 2 peak | 50% reduction |
| Memory Usage | ~4 GB | ~1.3 GB | 3× lower |

![Graph showing Loki CPU usage at 4 vCPUs and memory consumption at 4GB during peak ingestion load with 120 flog replicas](/images/victorialogs-loki-cpu-memory-loki.png)

![Performance graph demonstrating Loki resource throttling and CPU saturation during high ingestion rates](/images/victorialogs-loki-throttling-loki.png)

![VictoriaLogs performance metrics showing 2 peak vCPU usage and 1.3GB memory consumption during the same ingestion load](/images/victorialogs-loki-performance-victoria.png)

## Resource Footprint (7-day retention)

Over the 7-day testing period, we observed significant differences in resource consumption:

| Metric | Loki | VictoriaLogs | Improvement |
|---|---|---|---|
| Storage | 501 GB | 318 GB | 37% smaller |
| Memory (steady-state) | 6–7 GB | 0.6–2 GB | ~70% reduction |
| CPU Peak | 4 vCPU | 1.1 vCPU | 73% lower |

![Resource utilization chart for Loki over 7-day retention period showing 501GB storage, 6-7GB steady-state memory, and 4 vCPU peak usage](/images/victorialogs-loki-footprint-loki.png)

![Resource utilization chart for VictoriaLogs over 7-day retention period showing 318GB storage (37% smaller), 0.6-2GB memory (70% reduction), and 1.1 vCPU peak (73% lower)](/images/victorialogs-loki-footprint-victoria.png)

> **Cost Impact:** The freed ~2 GB RAM per node enables denser workload scheduling and significant infrastructure cost savings.

## Load Testing Results

Using Locust with 10 concurrent users simulating production traffic, VictoriaLogs demonstrated superior performance:

- **RPS Handled:** VictoriaLogs processed 36% higher requests per second
- **p99 Latency:** 3.6× faster than Loki under load
- **Tail Latency:** Consistently lower across all percentiles

![Load test results for VictoriaLogs showing 36% higher RPS handling capacity and 3.6x faster p99 latency with 10 concurrent users at 43 RPS sustained load](/images/victorialogs-loki-loadtest-victoria.png)

![Load test results for Loki displaying slower response times and lower throughput under the same production traffic simulation conditions](/images/victorialogs-loki-loadtest-loki.png)

## Key Technical Insights

### Why VictoriaLogs Outperforms

1. **Full-text indexing:** Per-token indices eliminate expensive line-by-line filtering
2. **Storage efficiency:** Columnar LSM layout reduces disk footprint and I/O seeks
3. **Memory optimization:** Lower overhead enables more efficient resource utilization
4. **SIMD acceleration:** Hardware-optimized search operations provide significant speedups

### When to Choose Each System

**Choose VictoriaLogs if:**
- Text search and grep-like queries are primary use cases
- You need fast ad-hoc exploration of logs
- Resource efficiency is critical
- You want minimal operational overhead

**Choose Loki if:**
- Label-based queries dominate your workload
- Deep Grafana ecosystem integration is essential
- You have existing Loki infrastructure and workflows

## Conclusion

For text-search-heavy workloads, VictoriaLogs provides **order-of-magnitude faster queries** and **material cost savings**. The zero-tuning required approach makes it particularly attractive for teams wanting reliable log search without operational complexity.

Our benchmarking revealed:
- **94% lower query latencies** for full-text searches
- **40% storage compression** over 7-day retention
- **50% reduction in CPU/RAM consumption**
- **3× higher peak ingestion capacity**

Loki remains an excellent choice for label-first queries with tight Grafana integration, but for our use case—fast text search across large log volumes—VictoriaLogs emerged as the clear winner.

## Resources

- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [VictoriaLogs Documentation](https://docs.victoriametrics.com/victorialogs/)
- [Vector Documentation](https://vector.dev/)
- [Grafana Alloy](https://grafana.com/docs/alloy/latest/)

