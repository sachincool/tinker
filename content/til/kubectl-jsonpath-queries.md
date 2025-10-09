---
title: "kubectl JSONPath: Extract Exactly What You Need"
date: "2024-12-12"
tags: ["kubernetes", "kubectl", "jsonpath", "devops"]
type: "til"
---

# TIL: kubectl JSONPath: Extract Exactly What You Need

Stop piping kubectl output to `grep`, `awk`, and `sed`. JSONPath can get you exactly what you need in one command.

## The Basic Pattern

```bash
kubectl get <resource> -o jsonpath='{<jsonpath-expression>}'
```

## Simple Examples

### Get Pod IPs

Instead of:
```bash
kubectl get pods -o wide | awk '{print $6}'
```

Do:
```bash
kubectl get pods -o jsonpath='{.items[*].status.podIP}'
```

### Get Pod Names Only

```bash
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
```

### Get Pod Name + IP

```bash
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}'
```

Output:
```
nginx-abc123    10.244.1.5
redis-xyz789    10.244.1.6
```

## Real-World Use Cases

### 1. Find All Container Images

```bash
kubectl get pods -o jsonpath='{.items[*].spec.containers[*].image}' | tr ' ' '\n' | sort -u
```

### 2. Get Pods Not Running

```bash
kubectl get pods -o jsonpath='{range .items[?(@.status.phase!="Running")]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'
```

### 3. Find Pods Using Most Memory

```bash
kubectl top pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.usage.memory}{"\n"}{end}' | sort -k2 -h
```

### 4. Get All Node Capacities

```bash
kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.capacity.cpu}{" CPU\t"}{.status.capacity.memory}{" RAM\n"}{end}'
```

### 5. Find Secrets in a Namespace

```bash
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.volumes[?(@.secret)].secret.secretName}{"\n"}{end}'
```

### 6. Get All Services and Their Type

```bash
kubectl get svc -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.type}{"\n"}{end}'
```

## JSONPath Syntax Cheat Sheet

| Pattern | Description | Example |
|---------|-------------|---------|
| `.items[*]` | All items | Get all pods |
| `.items[0]` | First item | Get first pod |
| `.items[0:3]` | First 3 items | Get first 3 pods |
| `.items[-1]` | Last item | Get last pod |
| `.items[?(@.field=="value")]` | Filter | Pods where phase=Running |
| `{range .items[*]}...{end}` | Loop | Iterate over items |
| `{"\n"}` | Newline | Format output |
| `{"\t"}` | Tab | Format output |

## Advanced Filtering

### Pods with Specific Label

```bash
kubectl get pods -l app=nginx -o jsonpath='{.items[*].metadata.name}'
```

### Pods in Running State

```bash
kubectl get pods -o jsonpath='{.items[?(@.status.phase=="Running")].metadata.name}'
```

### Containers in Waiting State

```bash
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[?(@.state.waiting)].name}{"\n"}{end}'
```

### Pods with Restart Count > 0

```bash
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}' | awk '$2 > 0'
```

## Useful Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Get pod IPs
alias kip='kubectl get pods -o jsonpath='\''{range .items[*]}{.metadata.name}{"\t"}{.status.podIP}{"\n"}{end}'\'''

# Get images
alias kimages='kubectl get pods -o jsonpath='\''{.items[*].spec.containers[*].image}'\'' | tr " " "\n" | sort -u'

# Get pod with most restarts
alias krestart='kubectl get pods -o jsonpath='\''{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}'\'' | sort -k2 -n -r | head -1'

# Get not ready pods
alias knotready='kubectl get pods -o jsonpath='\''{range .items[?(@.status.phase!="Running")]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'\'''
```

## Custom Columns (Even Better)

Sometimes custom columns are cleaner than JSONPath:

```bash
# Pod name, phase, and IP
kubectl get pods -o custom-columns=NAME:.metadata.name,PHASE:.status.phase,IP:.status.podIP

# Node name, CPU, and memory
kubectl get nodes -o custom-columns=NAME:.metadata.name,CPU:.status.capacity.cpu,MEMORY:.status.capacity.memory

# Services and their ClusterIP
kubectl get svc -o custom-columns=NAME:.metadata.name,TYPE:.spec.type,CLUSTER-IP:.spec.clusterIP
```

## Common Patterns I Use Daily

### 1. Quick Debug: Get All Pod Info

```bash
kubectl get pod nginx-abc123 -o jsonpath='{range .spec.containers[*]}Name: {.name}{"\n"}Image: {.image}{"\n"}Ports: {.ports[*].containerPort}{"\n\n"}{end}'
```

### 2. Get All Environment Variables

```bash
kubectl get pod nginx-abc123 -o jsonpath='{range .spec.containers[*].env[*]}{.name}={.value}{"\n"}{end}'
```

### 3. Find Pods on a Specific Node

```bash
kubectl get pods --all-namespaces -o jsonpath='{range .items[?(@.spec.nodeName=="node-1")]}{.metadata.name}{"\t"}{.metadata.namespace}{"\n"}{end}'
```

### 4. Get ConfigMaps Used by Pods

```bash
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.volumes[?(@.configMap)].configMap.name}{"\n"}{end}'
```

### 5. Network Policies Applied to Pods

```bash
kubectl get netpol -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.podSelector.matchLabels}{"\n"}{end}'
```

## The Power Move

Combine JSONPath with watch for live updates:

```bash
watch -n 2 'kubectl get pods -o jsonpath='\''{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'\'''
```

## Debugging JSONPath

If your JSONPath isn't working, test it step by step:

```bash
# Get full JSON first
kubectl get pod nginx-abc123 -o json | jq '.'

# Then build your JSONPath incrementally
kubectl get pod nginx-abc123 -o jsonpath='{.metadata}'
kubectl get pod nginx-abc123 -o jsonpath='{.metadata.name}'
kubectl get pod nginx-abc123 -o jsonpath='{.status}'
kubectl get pod nginx-abc123 -o jsonpath='{.status.phase}'
```

## The Gotcha

JSONPath in kubectl has some quirks:

1. **Filters must use `@`**: `.items[?(@.field=="value")]` not `.items[?(.field=="value")]`
2. **Arrays need `[*]`**: `.items[*]` not `.items[]`
3. **Quotes matter**: Use single quotes outside, double inside: `'{.items[?(@.name=="value")]}'`

This has eliminated so much `grep | awk | sed` pipeline complexity from my daily kubectl commands. One-liner power!

