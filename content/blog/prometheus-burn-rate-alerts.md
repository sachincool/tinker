---
title: "Alert on the error budget, not the CPU graph"
seoTitle: "Prometheus burn-rate alerts: page on the SLO, not CPU"
date: "2026-08-21"
tags: ["monitoring", "prometheus", "observability", "sre", "devops"]
excerpt: "Threshold alerts page you for causes that may not matter. Multi-window burn-rate alerts page you once, for the symptom, when the error budget is genuinely at risk."
featured: false
faqs:
  - question: "What is an error budget burn rate?"
    answer: "Burn rate is how fast you are consuming the error budget compared to the rate that would exactly exhaust it over the SLO window. A burn rate of 1 means you finish the 30-day window with the budget spent to the last request. A burn rate of 14.4 means you would spend the whole month's budget in about 50 hours, and 2% of it in a single hour."
  - question: "Why use two time windows in a burn-rate alert?"
    answer: "The long window decides whether the incident is big enough to page for. The short window decides whether it is still happening. Without the short window, a five-minute outage keeps a one-hour alert firing for nearly an hour after recovery. Convention is to make the short window one twelfth of the long one, so 5m with 1h and 30m with 6h."
  - question: "What burn rates should I alert on?"
    answer: "The Google SRE Workbook's multi-window setup uses three: 14.4 over a 1h/5m window pair for 2% of the budget in an hour, 6 over 6h/30m for 5% in six hours, and 1 over 3d/6h for 10% in three days. The first two page. The third opens a ticket, because a slow burn does not need anyone woken up."
  - question: "Should I still alert on CPU and memory?"
    answer: "Keep them as dashboards and as ticket-level alerts, not as pages. High CPU that never reaches a user is not an incident, and low CPU during a total outage will not page anyone. Cause-based alerts are useful for diagnosis once you are already looking; symptom-based alerts are what should wake someone up."
  - question: "How do I alert when a metric disappears entirely?"
    answer: "A burn-rate expression compares errors to total requests, so it evaluates to nothing when the scrape target is gone and the alert silently stops firing. Add a separate absent_over_time alert on the total-requests series. This is the failure mode that makes people distrust SLO alerting, and it is two lines of config away."
---

The alert I have silenced the most times in my life is `HighCPUOnNode`. It fires, someone opens the dashboard, CPU is at 85%, nothing is wrong, and the alert gets acknowledged and forgotten. Six months of that and the whole channel is furniture.

The problem is not the threshold. It is that CPU is a cause, and nobody is paid to care about causes at 3am. What matters is whether the service is failing its users fast enough to matter. Burn-rate alerting measures exactly that: how quickly you are spending the error budget the SLO gives you, with a short second window so the page stops when the incident does.

## the budget, in one line of PromQL

An SLO of 99.9% availability over 30 days gives you a 0.1% error budget. That is the entire quantity being managed. Every alert below is a statement about the rate at which it is being spent.

The ratio itself is the thing you want precomputed, because you will query it over several windows and Prometheus should not recompute it per alert evaluation:

```yaml
groups:
  - name: slo-api
    interval: 30s
    rules:
      - record: job:slo_errors_per_request:ratio_rate5m
        expr: |
          sum(rate(http_requests_total{job="api",code=~"5.."}[5m]))
            /
          sum(rate(http_requests_total{job="api"}[5m]))
      - record: job:slo_errors_per_request:ratio_rate1h
        expr: |
          sum(rate(http_requests_total{job="api",code=~"5.."}[1h]))
            /
          sum(rate(http_requests_total{job="api"}[1h]))
```

Repeat for `30m`, `6h`, `6h`, and `3d`. It is repetitive and it is worth it: the alert rules that follow are then one comparison each, and the windows are stated in one place where you can audit them.

Note the numerator. `code=~"5.."` counts server errors. It does not count 4xx, because a client sending malformed requests is not the service failing, and the fastest way to make an SLO meaningless is to let someone else's bad client drain your budget.

## burn rate is just the ratio divided by the budget

If your budget is 0.1% and you are currently serving 1.44% errors, you are burning at 14.4 times the sustainable rate. That is the whole calculation.

The useful thing about that number is what it implies about time. Burn rate 1 exhausts the budget exactly at the end of the 30-day window. Burn rate 14.4 exhausts it in roughly 50 hours, which means it eats 2% of the month's budget in a single hour. That is the threshold worth waking someone for.

| Budget spent | Over | Burn rate | Long / short window | Response |
|---|---|---|---|---|
| 2% | 1 hour | 14.4 | 1h / 5m | page |
| 5% | 6 hours | 6 | 6h / 30m | page |
| 10% | 3 days | 1 | 3d / 6h | ticket |

Those three rows are the multi-window setup from the Google SRE Workbook's alerting chapter, and they are a better starting point than anything you will derive from scratch. The first row catches a hard outage in minutes. The second catches the partial degradation that a 1-hour window would take too long to notice. The third catches a slow leak that nobody should be woken for.

## the short window is what makes it usable

The single-window version of this alert has a well-known failure: it keeps firing long after the problem is gone. A total outage lasting five minutes pushes the 1-hour error ratio above the threshold, and it stays above for close to an hour afterwards while the bad five minutes ages out of the window. The pager goes off, you fix it in four minutes, and it keeps going off.

The fix is to require both windows to be over the threshold at once:

```yaml
- alert: ErrorBudgetBurnFast
  expr: |
    (
      job:slo_errors_per_request:ratio_rate1h{job="api"} > (14.4 * 0.001)
      and
      job:slo_errors_per_request:ratio_rate5m{job="api"} > (14.4 * 0.001)
    )
  labels:
    severity: page
  annotations:
    summary: "api is burning error budget 14.4x (2% of the month in an hour)"

- alert: ErrorBudgetBurnSlow
  expr: |
    (
      job:slo_errors_per_request:ratio_rate6h{job="api"} > (6 * 0.001)
      and
      job:slo_errors_per_request:ratio_rate30m{job="api"} > (6 * 0.001)
    )
  labels:
    severity: page
  annotations:
    summary: "api is burning error budget 6x (5% of the month in six hours)"
```

The long window says the incident is big enough to page for. The short window says it is still going. Convention is short = long / 12, which is where 5m/1h and 30m/6h come from.

This also lets you drop the `for:` clause, which is the other thing people reach for and should not. `for:` requires the expression to be continuously true for its whole duration, and a single evaluation where the value dips below the threshold resets the timer. During a flapping incident, `for: 10m` can fail to fire for an hour. The short window gives you the same "is this still real" check without the reset behaviour.

> **Key Insight:** A single-window burn-rate alert will keep paging for up to an hour after the incident is over, because the bad minutes are still inside the window. The short second window is not a refinement. It is the thing that makes the alert trustworthy enough to leave enabled.

## the alert that fires when nothing fires

Every ratio-based alert has the same hole. If the scrape target disappears, `http_requests_total` stops producing samples, the division produces no series, and the alert quietly evaluates to nothing. Total outage, silent pager.

Two lines close it:

```yaml
- alert: ApiMetricsAbsent
  expr: absent_over_time(http_requests_total{job="api"}[10m])
  labels:
    severity: page
  annotations:
    summary: "no request metrics from api for 10 minutes"
```

`absent_over_time` returns 1 when the selector has matched nothing for the whole range, which covers both a dead target and a metric that got renamed in a refactor. Use `absent_over_time` rather than `absent`, because `absent` fires on a single missed scrape and will page you for a rolling deploy.

Verify it before you trust it, by asking Prometheus what the expression returns right now:

```bash
curl -sG http://localhost:9090/api/v1/query \
  --data-urlencode 'query=absent_over_time(http_requests_total{job="api"}[10m])' | jq '.data.result'
```

```text
[]
```

Empty is correct while the target is healthy. If you get a result with `"value": [..., "1"]` and the service is up, your label selector does not match the series you think it does, which is worth finding out now rather than during an incident.

## what happens to the cause-based alerts

They stay. They just stop paging.

CPU, memory, disk, queue depth, replica count: all of it remains useful, and all of it is what you look at ten seconds after the page arrives. The change is the routing. A symptom alert wakes someone. A cause alert opens a ticket or sits on a dashboard until a human is already looking.

There is a good reason to keep a small number of cause-based pages, and it is prediction rather than diagnosis. Disk filling at a rate that hits 100% in four hours is worth a page, because by the time it becomes a symptom the recovery is much more expensive:

```yaml
- alert: DiskWillFill
  expr: predict_linear(node_filesystem_avail_bytes{mountpoint="/"}[6h], 4 * 3600) < 0
  for: 30m
  labels:
    severity: page
```

That is the exception, and `for: 30m` is appropriate here precisely because `predict_linear` is noisy and you do want it to settle.

The rest of the cause alerts drop to ticket severity, and Alertmanager stops sending three pages for one incident:

```yaml
inhibit_rules:
  - source_matchers: [severity = "page"]
    target_matchers: [severity = "ticket"]
    equal: [job]
```

## the failure mode this creates

Being honest about the trade: SLO-based alerting moves the argument from "is this threshold right" to "is this SLO right", and the second argument is harder and more political. A 99.9% target that nobody agreed to is a number you will end up negotiating during an incident, which is the worst possible time.

It also means a slow, permanent degradation that stays under burn rate 1 never pages at all. That is intentional, and it will still feel wrong the first time a latency regression rides along for three weeks underneath the alerting threshold. The answer is the third row of the table, the ticket-level alert at burn rate 1, and actually reading the tickets.

The other honest caveat: this only measures what the SLI counts. An availability SLI built on 5xx will not notice a service returning 200 with an empty body, which is a real outage that looks perfect on the graph. [How I took down 30% of production with one TLS fingerprinting rule](/blog/ja4-fingerprinting-network-security) is the version of that where the requests never reach the application to be counted at all.

## where to start

If you have one service and no SLO, the smallest useful version is one SLI, one target, two page alerts and one absent alert. That is roughly forty lines of YAML and it will replace most of a threshold-alert file.

The stack this sits on, including the recording-rule layout and the Grafana side, is in [Prometheus and Grafana: from zero to production monitoring](/blog/prometheus-grafana-monitoring-guide). The equivalent question for LLM serving, where GPU utilisation is the `HighCPUOnNode` of that world and queue time is the metric that actually predicts a bad experience, is in [what a green GPU dashboard hides](/blog/gpu-deployments-part-4-observability). If the cost of keeping all these series is the thing standing in your way, [VictoriaLogs vs Loki](/blog/victorialogs-vs-loki) benchmarks the logs half of the same problem. More of both under [monitoring](/tags/monitoring) and [observability](/tags/observability).

Delete `HighCPUOnNode` on the way out. If it has never once been the reason someone found an incident, it was never an alert. It was a metric with a pager attached.
