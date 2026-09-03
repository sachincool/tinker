---
title: "CrashLoopBackOff: five causes and how to tell them apart"
seoTitle: "CrashLoopBackOff: five causes, told apart in 60 seconds"
date: "2026-08-12"
tags: ["kubernetes", "debugging", "devops", "containers", "sre"]
excerpt: "CrashLoopBackOff is a symptom with five common causes. The exit code and the last event narrow it to one in under a minute, before you open the application logs."
featured: false
faqs:
  - question: "What does CrashLoopBackOff actually mean in Kubernetes?"
    answer: "It means the container has exited and the kubelet is waiting before restarting it again. The back-off is exponential: 10s, 20s, 40s, and so on, capped at 5 minutes, and it resets after the container has run successfully for 10 minutes. CrashLoopBackOff is the waiting state, not the failure itself. The failure is whatever made the container exit, which is recorded separately as the last termination reason and exit code."
  - question: "What does exit code 137 mean?"
    answer: "137 is 128 + 9, meaning the process was killed with SIGKILL. Something outside the container ended it. The two usual candidates are the kernel OOM killer, in which case the pod's last state reason is OOMKilled, and the kubelet enforcing a failed liveness probe, in which case there is a 'Liveness probe failed' event just before the kill. Check the reason field before assuming it was memory."
  - question: "How do I see the logs of a container that already crashed?"
    answer: "Use kubectl logs with the --previous flag: kubectl logs <pod> -c <container> --previous. Plain kubectl logs reads the current container instance, which in a crash loop has usually just started and printed nothing yet. The previous instance holds the output from the run that actually failed."
  - question: "Why does my pod crash loop with no logs at all?"
    answer: "An empty log almost always means the process never started. The container image entrypoint was wrong, a required file was not mounted, or the binary is missing from the image. Check kubectl describe pod for the last state reason: exit code 127 is command not found, 126 is found but not executable, and a StartError or CreateContainerError means the kubelet could not launch the process at all."
  - question: "Can a liveness probe cause CrashLoopBackOff?"
    answer: "Yes, and it is the most commonly misdiagnosed cause. If the probe starts checking before a slow-starting process is ready to answer, the kubelet kills the container, it restarts, and it never gets far enough to pass. The fix is a startupProbe that holds liveness off until the process is up, not a larger initialDelaySeconds on liveness itself."
---

A pod in `CrashLoopBackOff` tells you almost nothing. It is the waiting state, not the failure: the container exited, and the kubelet is sitting out a back-off before trying again. The failure happened one restart ago and is recorded somewhere else.

Two commands narrow it to one of five causes before you open the application logs. `kubectl describe pod` gives you the last termination reason and exit code, and `kubectl logs --previous` gives you what the dead instance printed. Everything below is a way of reading those two outputs.

## the two commands, in order

Start with describe, because the exit code does most of the classification work:

```bash
kubectl describe pod api-7f4b9c6d8f-9m2tq
```

The part worth reading is not the top. It is the `Last State` block and the events at the bottom:

```text
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
      Started:      Tue, 12 Aug 2026 09:14:22 +0530
      Finished:     Tue, 12 Aug 2026 09:14:51 +0530
    Restart Count:  6
```

`Reason` and `Exit Code` are the diagnosis. `Started` and `Finished` are the second most useful pair in the block, because the gap between them separates "died instantly" from "ran for a while and then died", and those are different bugs.

Then read what the dead instance said:

```bash
kubectl logs api-7f4b9c6d8f-9m2tq --previous
```

Without `--previous` you get the current instance, which in a crash loop has usually just started and printed nothing. This is the single most common reason people conclude a crashing pod has no logs.

## exit code 1 or 2: the application decided to quit

An exit code of 1 with output in the previous log is the easy case. The process started, hit something it did not like, and exited on purpose. Missing environment variable, a config file it could not parse, a database it could not reach on startup.

```text
$ kubectl logs api-7f4b9c6d8f-9m2tq --previous
2026-08-12T09:14:22Z FATAL config: DATABASE_URL is required
```

The reason this one is worth naming separately is that it is the only cause where the application log is the answer. For the other four, the log is either empty or misleading, and you need the pod's own state instead.

If the variable is supposed to come from a Secret or ConfigMap, check that it actually arrived rather than trusting the manifest:

```bash
kubectl get pod api-7f4b9c6d8f-9m2tq -o jsonpath='{.spec.containers[0].env}' | jq
```

There is more on pulling exactly the field you want out of an object in [kubectl JSONPath: extract exactly what you need](/til/kubectl-jsonpath-queries).

## exit code 137 with OOMKilled: the memory limit

137 is 128 + 9, so the process took a SIGKILL. If `Reason` says `OOMKilled`, the kernel's OOM killer did it because the container exceeded its memory limit.

The tell that separates a genuine limit problem from a memory leak is the gap between `Started` and `Finished`. Killed within seconds every time means the limit is below what the process needs at startup, usually a JVM heap or a model load. Killed after ten minutes, then twenty, then five, means it is leaking or the workload is spiky.

```bash
kubectl get pod api-7f4b9c6d8f-9m2tq -o jsonpath='{.spec.containers[0].resources}'
```

```text
{"limits":{"memory":"256Mi"},"requests":{"cpu":"100m","memory":"128Mi"}}
```

Raising the limit is the fix for the first case and a delay for the second. What matters more than the number is that `requests` and `limits` are both set: a container with a limit and no request gets scheduled onto a node that cannot actually give it that memory, and you meet the OOM killer under load rather than at startup.

> **Key Insight:** Exit code 137 does not always mean out of memory. It means SIGKILL. The kubelet sends the same signal when a liveness probe fails. Read the Reason field next to the exit code, not the exit code alone.

## exit code 137 with no OOMKilled: the probe shot it

Same signal, different killer. If the last state reason is `Error` rather than `OOMKilled`, and there is a probe failure in the events just before the kill, then the liveness probe ended a container that was working.

```text
Events:
  Type     Reason     Age                From     Message
  ----     ------     ----               ----     -------
  Warning  Unhealthy  2m (x9 over 8m)    kubelet  Liveness probe failed: Get "http://10.0.3.14:8080/health": dial tcp 10.0.3.14:8080: connect: connection refused
  Normal   Killing    2m (x3 over 8m)    kubelet  Container api failed liveness probe, will be restarted
```

`connection refused` during startup means the probe arrived before the process was listening. The container gets killed, restarts, and never survives long enough to answer, so the loop is self-sustaining. The fix is a `startupProbe`, which suspends liveness and readiness entirely until it passes:

```yaml
startupProbe:
  httpGet: { path: /health, port: 8080 }
  periodSeconds: 5
  failureThreshold: 30      # 30 x 5s = 150s of startup budget
livenessProbe:
  httpGet: { path: /health, port: 8080 }
  periodSeconds: 10
  failureThreshold: 3       # after startup, a real hang is caught in 30s
```

Raising `initialDelaySeconds` on the liveness probe instead looks like the same fix and is not. It blinds you to genuine deadlocks for the whole delay, on every restart, forever. The startup probe buys the same time and then hands liveness back its tight interval. [Your model isn't crashing, your probe is](/blog/gpu-deployments-part-7-serving-ops) walks through the version of this that eats an afternoon, where the process is a model server and the startup budget is ten minutes rather than two.

## exit code 127, 126, or a StartError: the process never ran

An empty `--previous` log with a non-zero exit is a different class of problem. Nothing ran, so nothing logged.

- `127` is command not found. The entrypoint or the `command:` in the manifest points at a path that is not in the image.
- `126` is found but not executable. Usually a script without the execute bit, or a shell script with a CRLF line ending so the kernel looks for an interpreter named `/bin/sh\r`.
- `StartError` or `CreateContainerError` in `Reason` means the kubelet could not launch the process at all, and the events say why.

The events are more specific than the exit code here, so read them:

```text
  Warning  Failed  30s (x4 over 90s)  kubelet  Error: failed to create containerd task: failed to create shim task: OCI runtime create failed: exec: "/app/server": stat /app/server: no such file or directory
```

That is a build problem wearing a runtime costume. The image does not contain the binary the manifest asks for. Checking the image directly beats re-reading the Dockerfile:

```bash
docker run --rm --entrypoint ls ghcr.io/example/api:2.4.1 -la /app
```

A related trap is a volume mounted over the directory holding the binary, which produces the same error from a perfectly good image. [Docker volume debugging: finding where your data actually lives](/til/docker-volume-inspect-trick) covers pinning down what is actually at a mount point.

## exit code 0: it finished, and Kubernetes disagreed

The strange one. Exit code 0 means the process completed successfully, and the pod is still crash-looping, because a Deployment's pods carry `restartPolicy: Always` and Kubernetes restarts a successful exit exactly as eagerly as a failed one.

This is nearly always a workload in the wrong object. A migration script, a backfill, a report generator: something that is supposed to run once and stop. It belongs in a Job, where `restartPolicy: OnFailure` or `Never` is available and completion is a terminal state rather than an invitation:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: ghcr.io/example/api:2.4.1
          command: ["/app/migrate"]
```

The other version of exit code 0 is a long-running server whose main process backgrounds itself and lets PID 1 return. The container is doing exactly what you told it to. It is just that what you told it was "start the thing and exit".

## the sixty-second triage

Everything above collapses into one pass over the pod's state. Get the reason and exit code for every container in one shot rather than reading a screen of describe output:

```bash
kubectl get pod api-7f4b9c6d8f-9m2tq \
  -o jsonpath='{range .status.containerStatuses[*]}{.name}{"\t"}{.lastState.terminated.reason}{"\t"}{.lastState.terminated.exitCode}{"\n"}{end}'
```

```text
api	OOMKilled	137
```

Then branch on what comes back:

1. Exit code 1 or 2, log has output. Read the log. It is an application error.
2. Exit code 137, reason `OOMKilled`. Memory limit. Check the gap between `Started` and `Finished` to tell a too-small limit from a leak.
3. Exit code 137, reason `Error`, probe failure in the events. The liveness probe killed a healthy container. Add a `startupProbe`.
4. Exit code 126, 127, or a `StartError`. The process never launched. Read the events, then inspect the image.
5. Exit code 0. Wrong workload type. This wants to be a Job.

The reason to run this before opening the application logs is that three of the five causes leave no application logs at all, and one of them leaves logs that look fine right up to the moment something external kills the process. The pod's own state is the more honest witness.

If none of the five fit, the next thing to check is whether the container is being killed before it is scheduled at all, which is a different failure that presents as `Pending` rather than `CrashLoopBackOff`. That one, along with the networking failures that dress up as application bugs, is in [five Kubernetes debugging tricks that saved my production](/blog/kubernetes-debugging-tips). The rest of the Kubernetes writing here is collected under [the Kubernetes tag](/tags/kubernetes), and the wider set of symptom-versus-cause posts under [debugging](/tags/debugging).

The habit worth keeping is smaller than any of this. Before reading a single line of application output, run describe and write down two things: the exit code and the reason. Most crash loops stop being mysterious right there.
