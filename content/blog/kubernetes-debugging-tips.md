---
title: "5 Kubernetes Debugging Tricks That Saved My Production"
date: "2024-12-15"
tags: ["kubernetes", "devops", "debugging", "production"]
excerpt: "Hard-learned lessons from debugging Kubernetes issues at 3 AM. These tricks will save you hours of frustration."
featured: true
---

# 5 Kubernetes Debugging Tricks That Saved My Production

After countless nights debugging Kubernetes clusters, I've collected some battle-tested tricks that have saved my sanity (and my production environments) more times than I can count.

## 1. The CrashLoopBackOff Detective Work

When a pod is in CrashLoopBackOff, don't just check the current logs. Check the previous container's logs:

```bash
kubectl logs <pod-name> --previous
```

This shows you what happened before the crash. Game-changer.

## 2. Ephemeral Debug Containers

Instead of rebuilding your image with debug tools, use ephemeral containers (K8s 1.23+):

```bash
kubectl debug -it <pod-name> --image=nicolaka/netshoot
```

Now you have all the networking tools you need without modifying your image.

## 3. The "Why Won't You Schedule?" Mystery

Pod not scheduling? Don't guess. Ask Kubernetes directly:

```bash
kubectl get events --field-selector involvedObject.name=<pod-name>
```

The events will tell you exactly why the scheduler is giving up.

## 4. Network Policy Debugging

Testing network policies is painful. Use this quick test:

```bash
kubectl run test-pod --rm -it --image=nicolaka/netshoot -- /bin/bash
```

Then test connectivity from inside the cluster. Way better than production trial-and-error.

## 5. The Resource Detective

Finding which pod is eating all your memory?

```bash
kubectl top pods --all-namespaces --sort-by=memory
```

Sort by CPU or memory. Find the culprit. Fix it. Sleep peacefully.

## Bonus: The Ultimate Debug Command

My personal favorite - the Swiss Army knife of debugging:

```bash
kubectl describe pod <pod-name> | less
```

It's simple, but the amount of information here is incredible. Read it carefully.

## Conclusion

These tricks have saved me countless hours of debugging. Next time you're staring at CrashLoopBackOff at 3 AM, remember: Kubernetes is trying to tell you what's wrong. You just need to know how to listen.

Got any other favorite debugging tricks? Let me know!

