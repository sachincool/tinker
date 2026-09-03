---
title: "kubectl neat: remove Kubernetes YAML clutter"
date: "2024-12-10"
tags: ["kubernetes", "kubectl", "productivity"]
excerpt: "kubectl get -o yaml dumps 200 lines of generated noise. kubectl neat strips it down to what you actually wrote. Two commands, no more copy-paste cleanup."
---

Today I discovered `kubectl neat` - a plugin that removes all the clutter from Kubernetes YAML output.

## the problem

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

## the solution

Install kubectl-neat:

```bash
kubectl krew install neat
```

Now run:

```bash
kubectl get pod my-pod -o yaml | kubectl neat
```

Clean, readable YAML with just the stuff you care about.

## bonus

Make it even easier:

```bash
alias kgn='kubectl get -o yaml | kubectl neat'
```

Now `kgn pod my-pod` gives you clean output instantly.

Saves the copy-paste-and-strip routine every time I pull a Kubernetes config.

The reason this matters beyond tidiness: when you are reading a pod's status to work out why it is crash-looping, forty lines of `managedFields` between you and `lastState.terminated.exitCode` is forty lines of noise. See [CrashLoopBackOff: five causes and how to tell them apart](/blog/kubernetes-crashloopbackoff-triage) for what to do with the field once you can see it, and [kubectl JSONPath](/til/kubectl-jsonpath-queries) for pulling it out without `neat` at all.

