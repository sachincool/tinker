---
title: "How I Took Down 30% of Production with One TLS Fingerprinting Rule"
date: "2025-10-14"
tags: ["sre", "tls", "networking", "monitoring", "production-incidents"]
excerpt: "Deployed a TLS fingerprinting rule that seemed reasonable. Blocked every Chrome 119 user on Windows. The incident report was not fun to write."
featured: true
---

# How I Took Down 30% of Production with One TLS Fingerprinting Rule

Last month I broke production. Blocked 30% of legitimate traffic because I misunderstood how TLS fingerprinting actually works.

Here's the incident, what I got wrong, and what SREs actually need to know about JA4 fingerprinting.

## The JA3 Problem That Hit Our Monitoring

We'd been using JA3 fingerprinting to track traffic patterns since 2021. Not for blocking, just visibility. Which clients were hitting our APIs, how to correlate requests, that kind of thing.

Late 2023, our dashboards started showing chaos. Chrome traffic was generating thousands of unique fingerprints. Same browser version, different fingerprint every request. Our metrics were useless.

Then in early 2024, all our Go-based internal services health checks started showing up as "unknown clients" in our traffic analysis. Turns out Go's HTTP client randomizes cipher suite ordering. JA3 saw that as thousands of different clients. It was just our Kubernetes health checks.

Our traffic classification was completely broken.

## Why JA4 Exists

JA3 hashes the TLS ClientHello fields in order. Change the order, change the hash. Chrome randomizes extension ordering. Go randomizes cipher suites. JA3 falls apart.

JA4 sorts everything before hashing. That Go health check that generated 10,000 different JA3 fingerprints? One consistent JA4: `t13d190900_9dc949149365_08c8ecc63e89`

The format is readable too:

```
t13d1516h2_8daaf6152771_02713d6af862
│  │││││    │              │
│  ││││└─── ALPN (h2)      └─ Extension hash
│  │││└──── Extension count (16)
│  ││└───── Cipher count (15)
│  │└────── SNI present (1 = yes, 0 = no)
│  └─────── TLS version (13 = TLS 1.3)
└────────── Protocol (t = TCP, q = QUIC)
```

This fixed our monitoring. Could actually track client types again. Go clients showed up as Go. Chrome showed up as Chrome consistently.

Then I got clever.

## The Mistake That Cost Us $50K

We noticed some fingerprints showing up in suspicious traffic patterns. High request rates, weird timing. Looked like abuse.

I wrote a rule: "If fingerprint = X, rate limit aggressively."

Deployed to production at 2pm on a Tuesday.

By 2:30pm, support was getting complaints. By 3pm, order volume had dropped 30%. By 4pm, I was in the incident channel explaining what went wrong.

**The problem: JA4 fingerprints identify TLS stacks, not individual clients.**

All Chrome 119 browsers on Windows have the same fingerprint. All of them. Every user running that browser/OS combo generates the same JA4.

The suspicious traffic I saw? One bad actor using Chrome 119. My rule caught them, and also every legitimate Chrome 119 user on Windows.

That was 30% of our traffic.

## What JA4 Actually Tells You

JA4 fingerprints map to:
- Browser + version + OS
- HTTP client library + version + OS
- Any TLS stack implementation

Not to:
- Individual users
- Individual devices
- Individual IP addresses

This seems obvious now, but in the moment, tracking "suspicious fingerprint X" felt like tracking a specific attacker. It wasn't. It was tracking everyone using Chrome 119 on Windows.

## How We Fixed Our Monitoring

After the incident, here's how we actually use JA4:

```python
# For traffic classification and monitoring only
def classify_client(fingerprint):
    """Map JA4 fingerprints to known client types for metrics"""

    # Known patterns from our infrastructure
    patterns = {
        't13d190900_9dc949149365_08c8ecc63e89': 'go-http-client-1.21',
        't13d1516h2_8daaf6152771_02713d6af862': 'chrome-120-macos',
        't13d1415h2_5c6f8a9b3d4e_3f7a8b9c2d1e': 'curl-8.4',
        # ... etc
    }

    return patterns.get(fingerprint, 'unknown')

# Aggregate metrics by client type
def record_request_metrics(request):
    client_type = classify_client(request.ja4_fingerprint)

    metrics.increment('requests.by_client_type', tags={
        'client': client_type,
        'endpoint': request.path,
        'status': request.status_code
    })
```

Now we can see in Grafana:
- "go-http-client suddenly went from 100k req/day to 1M" (scaling issue)
- "chrome-119-macos dropped to zero" (browser update pushed)
- "unknown fingerprint at 10k req/sec" (investigate this)

It's a classification dimension, not an identity.

## The a_b_c Format Actually Matters

JA4 uses `a_b_c` format for a reason. The sections are:
- `a`: protocol, TLS version, SNI, counts, ALPN
- `b`: cipher hash
- `c`: extension hash

Why split it? Because you can match on parts.

We had an issue where some service was rotating through different ciphers on every request. Looked like thousands of different clients in our metrics. The full fingerprint kept changing.

But `a` and `c` stayed constant. Started grouping by `ac` instead:

```python
def normalize_fingerprint(fp):
    """Group by protocol+extensions, ignore cipher variations"""
    parts = fp.split('_')
    return f"{parts[0]}_{parts[2]}"  # a_c

# Now cipher rotation doesn't fragment our metrics
normalized = normalize_fingerprint('t13d190900_5d65cb28da5c_02713d6af862')
# Returns: 't13d190900_02713d6af862'
```

Fixed our cardinality explosion problem.

## Weird Edge Cases We Hit

**Case 1: Corporate Proxies**

Some enterprises terminate TLS at their proxy. All internal traffic from that company shows the same fingerprint. One fingerprint, thousands of users.

Can't use it for any kind of per-client logic. Had to maintain a list of known corporate proxy fingerprints and handle them differently.

**Case 2: Windows XP Clients**

Yes, in 2024. Ancient TLS 1.0 fingerprint we'd never seen before. Took two weeks to figure out it was legitimate users in a developing country on old machines.

Almost blocked them as "suspicious" before we investigated.

**Case 3: Go Library Version Drift**

Our microservices were on different Go versions. Go 1.20 and Go 1.21 have different TLS fingerprints. This broke our service mesh traffic analysis until we grouped them properly.

## Performance Characteristics

Parse time: 0.3 microseconds per fingerprint. Not milliseconds. Microseconds.

We process 50M requests/day. Total JA4 overhead: ~15ms per day.

The implementation is Rust with zero heap allocations. Stack-allocated, no GC. I benchmarked it myself when evaluating whether to deploy it.

For infrastructure at scale, this matters. Adding 0.3μs per request is essentially free. Adding 1ms per request is a P0 incident.

## How to Actually Use This in Production

**For traffic visibility**: yes. It's great for understanding client distribution, detecting anomalies, tracking deployments.

**For rate limiting**: only if you're very careful. Rate limit by fingerprint + IP + endpoint + time window. Never fingerprint alone.

**For blocking**: don't. Seriously. You'll block legitimate traffic. Use it as one signal among many if you must, but never the only signal.

**For capacity planning**: yes. Track which client types generate what load. When Chrome updates, you'll see the shift.

**For debugging**: yes. "Why is this service getting weird traffic?" Check the fingerprints. Might be a misconfigured client.

## The Logging Strategy

We log fingerprints with every request now. Adds about 45 bytes per log line.

```json
{
  "timestamp": "2025-10-14T15:23:45Z",
  "endpoint": "/api/v1/users",
  "status": 200,
  "duration_ms": 45,
  "ja4": "t13d1516h2_8daaf6152771_02713d6af862",
  "ja4_client": "chrome-120-macos"
}
```

Costs us about 2GB/day extra in log storage. Worth every penny. We've debugged three production issues with this data in the last month.

## When Corporate Proxies Break Everything

If you're behind enterprise proxies that terminate TLS, JA4 is useless for per-client anything. You'll see the proxy's fingerprint for thousands of users.

We maintain a separate config for known proxy environments:

```yaml
# corporate-proxy-exceptions.yaml
proxy_fingerprints:
  - fingerprint: "t13d1819h2_abc123def456_789ghi012jkl"
    company: "BigCorp Inc"
    note: "TLS termination at corporate proxy"
    disable_per_client_logic: true
```

Not elegant, but it's reality.

## What's Coming That Will Break This

ECH (Encrypted ClientHello) in TLS 1.3 will encrypt the ClientHello. No more passive fingerprinting. When that rolls out, we'll need a different approach.

Keep an eye on your TLS 1.3 ECH adoption metrics. When it hits 20%+, time to rethink your monitoring strategy.

## The Incident Postmortem Takeaways

1. **Test in staging with production traffic patterns**. I tested with synthetic traffic. Missed that real users would match the "bad" fingerprint.

2. **Canary your rules**. Start with 1% of traffic. Watch for anomalies. Slowly increase.

3. **Alert on drops in known-good fingerprints**. If "chrome-119-windows" traffic drops 90%, something's wrong.

4. **Have a fast rollback**. We killed the rule with a feature flag. Still took 30 minutes to fully recover.

5. **Fingerprints are dimensions, not identities**. Use them for grouping and classification, not for targeting individuals.

## Should SREs Care About JA4?

Yes, but not for the reasons you might think.

It's not about security. It's about observability. Understanding your traffic composition, detecting anomalies, debugging production issues.

Adding JA4 fingerprints to your logs and metrics gives you another dimension to slice your data. When something weird happens, you can answer "what client type is doing this?" faster.

Just don't rate limit or block based on it alone. That way lies incidents and awkward conversations with your VP of Engineering.

My incident report was 12 pages. Learn from my mistakes.
