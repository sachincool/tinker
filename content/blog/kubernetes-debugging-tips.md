---
title: "Five Kubernetes debugging tricks that saved my production"
date: "2024-12-15"
tags: ["kubernetes", "devops", "debugging", "production"]
excerpt: "Five Kubernetes debugging tricks from real 3 AM pages: kubectl logs --previous, ephemeral debug containers, scheduler events, and fixes that saved production."
featured: true
---

The first time I got paged for a `CrashLoopBackOff` it was 03:47, the pod was on its 14th restart, and `kubectl logs` was returning a perfectly clean six-line startup banner with no error in sight. I sat staring at that output for about twenty minutes before someone on Slack asked, casually, whether I'd tried `--previous`. Reader, I had not. Once you've made that mistake once, you stop making it. The five flags below are what I now reach for before anything else, in roughly the order I reach for them.

![Decision tree mapping five Kubernetes pod symptoms to the kubectl command that diagnoses each, drawn for a 3 a.m. on-call brain.](/images/kubernetes-debugging-tips/hero.png)

*Fig. 1 · the chart I wish someone had taped to the wall before my first on-call shift.*

## the crashloopbackoff that lies to you

The pod has restarted 14 times. You run `kubectl logs` and you get the logs of the *current* container, which is the one that hasn't crashed yet because it just started. The interesting bytes (the panic, the missing env var, the OOM at byte 1) are in the previous container's stdout, and they're a single flag away.

```bash
kubectl logs <pod-name> --previous
```

Add `-c <container>` if it's a multi-container pod, because the default container is rarely the one that died. I have wasted hours on this exact omission.

## ephemeral debug containers

There used to be a ritual: edit the Dockerfile, add `curl` and `dig` and `tcpdump`, push, wait for CI, redeploy, exec in, debug, then forget to take any of it back out and ship a 900 MB image to prod. As of 1.25 (beta-default since 1.23) you don't have to. `kubectl debug` attaches an ephemeral container to a running pod with whatever image you want (sharing the network namespace, and the PID namespace when you pass `--target` or the pod has `shareProcessNamespace: true`) without touching the original container.

```bash
kubectl debug -it <pod-name> --image=nicolaka/netshoot
```

`netshoot` is the standard kit: `dig`, `curl`, `tcpdump`, `iperf`, `mtr`, the works. The container vanishes when you detach. Your prod image stays the size it was supposed to be.

## ask the scheduler, don't guess

A pod stuck in `Pending` is the scheduler telling you, very politely, that none of your nodes will have it. You can stare at node taints all day or you can read the events for the pod itself, which spell out the reason in English.

```bash
kubectl get events --field-selector involvedObject.name=<pod-name>
```

`0/12 nodes are available: 8 Insufficient memory, 4 node(s) had untolerated taint`. That's the answer. The scheduler is the most articulate component in the cluster as long as you ask it directly.

## a throwaway pod for network policy work

Network policies are the part of Kubernetes that fail silently. The packet just doesn't arrive, and there's no log line that says *I dropped your SYN because of policy `default-deny-egress` in namespace `payments`*. The cheapest way to figure out what's reachable from where is to land a pod in the namespace you care about and try.

```bash
kubectl run test-pod --rm -it --image=nicolaka/netshoot -- /bin/bash
```

`--rm` cleans up when you exit, which matters because otherwise you will accumulate seven `test-pod-2` pods in `default` and one of them will eventually become the reason a node fills up. From inside, `curl` and `nc` your way through the policy until something connects.

## sort the noisy neighbours

When the cluster feels slow and nobody knows why, the answer is usually one workload in one namespace eating more than its share. `kubectl top` with a sort flag is the single fastest way to find them.

```bash
kubectl top pods --all-namespaces --sort-by=memory
```

Swap `memory` for `cpu` depending on what's burning. Requires `metrics-server` to be installed, which it almost always is, and which is worth installing the day you bring up a cluster if it isn't.

## the one I forget I have

`describe` is so obvious nobody writes about it, and so dense that nobody reads its full output. It includes the events, the resource limits, the volume mounts, the readiness probe definition, the last termination reason, and the QoS class: all the things you were about to run five separate commands to find.

```bash
kubectl describe pod <pod-name> | less
```

Pipe to `less` because the output is longer than your terminal and the events at the bottom are usually where the answer is. Read from the bottom up if you're in a hurry.

---

The pattern across all five is the same. Kubernetes is unusually good at telling you what went wrong, in plain prose, in a place you have to know to look. The flag is always `--previous`. The answer is always in `events`. The container is always the wrong one by default. Memorise the five commands above and most pages stop being mysteries and start being typing exercises.

Most pages resolve with these five. The ones that don't — a control plane quietly falling over, a CNI dropping packets under load, a cluster that's "healthy" by every dashboard except the one metric users actually feel — are usually why teams bring in outside help. That's the kind of Kubernetes debugging I take on as [independent infrastructure consulting](https://k8s.org.in).

Next time the alert fires at 03:47, the first thing you type is `kubectl logs <pod> --previous -c <container>`. The second thing is `kubectl describe pod <pod> | less`. If the answer isn't in those two outputs, you actually have a problem.
