---
title: "kubectl neat - Remove Kubernetes YAML Clutter"
date: "2024-12-10"
tags: ["kubernetes", "kubectl", "productivity"]
type: "til"
---

# TIL: kubectl neat - Remove Kubernetes YAML Clutter

Today I discovered `kubectl neat` - a plugin that removes all the clutter from Kubernetes YAML output.

## The Problem

When you run `kubectl get pod my-pod -o yaml`, you get tons of noise:

```yaml
metadata:
  creationTimestamp: "2024-01-01T00:00:00Z"
  managedFields:
    - apiVersion: v1
      fieldsType: FieldsV1
      fieldsV1:
        # 200 lines of garbage
```

## The Solution

Install kubectl-neat:

```bash
kubectl krew install neat
```

Now run:

```bash
kubectl get pod my-pod -o yaml | kubectl neat
```

Clean, readable YAML with just the stuff you care about!

## Bonus

Make it even easier:

```bash
alias kgn='kubectl get -o yaml | kubectl neat'
```

Now `kgn pod my-pod` gives you clean output instantly.

Game changer for copying/pasting Kubernetes configs!

