---
title: "JA4's Split Format Saved Our Metrics Cardinality"
date: "2025-10-14"
tags: ["sre", "monitoring", "tls", "observability"]
type: "til"
---

# TIL: JA4's Split Format Saved Our Metrics Cardinality

We had a service that rotated TLS ciphers on every connection. Our client classification metrics exploded to 50k unique fingerprints. Prometheus cardinality alert fired.

## The Problem

JA3 gives you one hash. When ciphers rotate, you get a new hash:

```
Request 1: 5c4fba4a0f93c6f2a3e52e9c8d4a7b21
Request 2: 3d8a9f2c4e6b1a7c5f9e3d8b2a6c4e1f
Request 3: 7f2e4a8c3b9d1f6e5a2c8d4b7e9f3a1c
```

Each one looks like a different client in your metrics. Cardinality explosion.

## JA4's Solution

JA4 splits the fingerprint into three parts:

```
t13d190900_5d65cb28da5c_02713d6af862
│          │              │
a          b              c

a = protocol + TLS version + counts + ALPN
b = cipher hash (changes on rotation)
c = extension hash
```

When the service rotates ciphers, only `b` changes. `a` and `c` stay constant.

## The Fix

Instead of grouping by full fingerprint, group by `ac`:

```python
def normalize_fingerprint(fp):
    parts = fp.split('_')
    return f"{parts[0]}_{parts[2]}"  # ignore cipher part

# Before: 50k unique fingerprints
# After: 47 unique fingerprints
```

Cardinality back to normal. Metrics useful again.

## When This Matters

If you track client types in metrics and see unexplained cardinality spikes, check if they're rotating ciphers. The `a_b_c` format lets you ignore the changing parts.

Saved us from having to increase our Prometheus retention limits.
