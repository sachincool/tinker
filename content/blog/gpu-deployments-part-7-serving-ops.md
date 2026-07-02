---
title: "Your model isn't crashing, your probe is"
date: "2026-07-23"
tags: ["gpu", "kubernetes", "vllm", "kserve", "reliability"]
excerpt: "A model server that takes five minutes to load and a liveness probe that gives it ten seconds is a crash loop waiting to happen. Probes, drains, and safe rollouts."
featured: false
series: "GPUs in production"
seriesPart: 7
---

The pods were in `CrashLoopBackOff` and the logs said nothing. vLLM started, printed its usual banner, began loading weights, and then died. Restarted, loaded again, died again. It looked exactly like a broken build, so the first hour went into the model, the image, the CUDA version, everything except the actual culprit, which was a fourteen-line probe config nobody had looked at.

This is part 7. The first six parts built the fleet, wired it, scaled it, watched it, and routed to it. This part is about keeping a model server alive through the three things that routinely kill it: a health probe that fires too early, a node drain that cuts a request in half, and a model-version rollout that drops traffic on the floor. None of it is glamorous. All of it is what stands between you and a 3am page.

## your model isn't crashing, your probe is

Here's the tell, and once you've seen it once you never miss it again:

![A dark terminal screenshot. First command: kubectl get pods -l app=vllm-llama3-70b shows two pods with STATUS CrashLoopBackOff and RESTARTS 4. Second command: kubectl describe pod shows Last State Terminated, Reason Error, Exit Code 137, and an Events section with a Warning 'Liveness probe failed: Get http://10.0.3.14:8000/health: connect: connection refused' followed by 'Container vllm failed liveness probe, will be restarted'.](/images/gpu-deployments-part-7-serving-ops/probe-crashloop.png)

*Fig. 1 · the diagnosis is in two lines: exit code 137 (killed by the kubelet, not a segfault) and "Liveness probe failed ... connection refused" during load. The model was fine. The probe shot it.*

vLLM binds its HTTP port almost immediately, but `/health` on `:8000` only returns 200 once the weights are loaded and the engine is warm. For a 70B on a cold pull that's several minutes. A default liveness probe with a small `initialDelaySeconds` starts checking during that window, gets a connection refused, decides the container is dead, and the kubelet kills it. It never finishes loading, so it never passes, so it loops forever. The exit code is 137 (128 + SIGKILL) which is the kubelet's fingerprint, not an application crash.

The fix is a `startupProbe`. It holds the liveness and readiness probes off entirely until it succeeds, and its `failureThreshold × periodSeconds` is your total load budget:

```yaml
startupProbe:
  httpGet: { path: /health, port: 8000 }
  periodSeconds: 10
  failureThreshold: 60      # 60 × 10s = 600s (10 min) to finish loading
livenessProbe:
  httpGet: { path: /health, port: 8000 }
  periodSeconds: 10
  failureThreshold: 3       # after startup, catch a real hang in 30s
```

The reason this beats just cranking `initialDelaySeconds: 600` on the liveness probe is that once the startup probe passes, liveness reverts to its tight interval and still catches a genuine deadlock in thirty seconds. A giant liveness delay would blind you to real hangs for ten minutes after every restart. With the startup probe in place, the pods ride through the load and come up clean:

```text
$ kubectl get pods -l app=vllm-llama3-70b
NAME                               READY   STATUS    RESTARTS   AGE
vllm-llama3-70b-7f4b9c6d8f-9m2tq   1/1     Running   0          8m03s
vllm-llama3-70b-7f4b9c6d8f-c8xvn   1/1     Running   0          8m03s
```

> **Key Insight:** A model that takes minutes to load needs a startupProbe, not a bigger liveness delay. Without one, the probe that's supposed to detect a dead server is the thing killing a healthy one, and the crash loop looks exactly like an application bug. This is the single most common self-inflicted LLM serving outage.

## draining without dropping a stream

The next one bites on every deploy and every node scale-down. When Kubernetes deletes a pod, it sends `SIGTERM` and removes the pod from the service endpoints at the same instant. vLLM handles `SIGTERM` correctly (it stops accepting new requests and finishes the in-flight ones), but if the load balancer is still routing to it during that beat, new requests land on a server that's shutting down. And if the grace period is too short, the kubelet `SIGKILL`s the process mid-generation, dropping a half-finished response the client has to retry from scratch.

Two fields fix it. A `preStop` hook that sleeps long enough for the endpoint removal to propagate before `SIGTERM` reaches vLLM, and a `terminationGracePeriodSeconds` set above your longest in-flight generation:

```yaml
terminationGracePeriodSeconds: 210   # preStop(15s) + longest decode(~180s) + margin
lifecycle:
  preStop:
    exec:
      command: ["sh", "-c", "sleep 15"]
```

The sequence is worth internalizing, because the parallelism is the point: the endpoint removal and the `preStop` sleep happen at the same time, so by the time `SIGTERM` actually reaches vLLM, the load balancer has already stopped sending it traffic.

![A horizontal timeline titled 'what happens when a vLLM pod is deleted', showing the shutdown sequence left to right. t=0: pod marked Terminating, which forks into two parallel tracks: top track 'removed from EndpointSlice, load balancer stops routing new requests', bottom track 'preStop hook runs: sleep 15s'. Both converge at t=15s: 'SIGTERM sent to vLLM, which stops new admissions and finishes in-flight requests'. Then 'in-flight decode drains'. Finally at t=210s a marker 'SIGKILL if grace period elapses' shown in red as the backstop. A note reads 'endpoint removal and preStop run in parallel, so traffic stops before the process does'.](/images/gpu-deployments-part-7-serving-ops/graceful-drain.png)

*Fig. 2 · the drain, in order. The whole job of `preStop` is to buy time for the load balancer to stop routing before vLLM stops answering.*

## surviving a node drain

Parts 3 and 5 leaned on Karpenter to consolidate and remove idle GPU nodes. That same consolidation, unguarded, will happily evict every replica of a service at once and take it to zero. The guard is a `PodDisruptionBudget`, and for a small pool of expensive GPU replicas you want `maxUnavailable: 1` so at most one goes down for any voluntary disruption:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: vllm-llama3-70b-pdb
spec:
  maxUnavailable: 1
  selector:
    matchLabels: { app: vllm-llama3-70b }
```

Karpenter drains through the Eviction API, which respects PDBs, so this is enough to keep the service serving through a consolidation. For a pod that's mid-critical-work and must not be interrupted at all, there's a stronger lever, the `karpenter.sh/do-not-disrupt` annotation, which excludes its node from consolidation entirely:

```yaml
metadata:
  annotations:
    karpenter.sh/do-not-disrupt: "true"
```

Use it deliberately, though. Leave it on permanently and you've told Karpenter it can never reclaim that node, which is how you end up back in part 5's problem of expensive GPUs that never scale down. The PDB is the always-on floor; the annotation is for pods you're actively protecting.

## one replica, many pods

When a model is too big for one node (the 405B from part 3, tensor-parallel across eight GPUs and pipeline-parallel across two nodes), a single replica *is* a group of pods, and a normal Deployment can't express that. LeaderWorkerSet can. It treats a leader plus N-1 workers as one unit: `replicas` is the number of these groups, `size` is the pods per group, and `RecreateGroupOnPodRestart` means if any pod in the group dies the whole group restarts, which is correct, because a tensor-parallel replica missing one member is dead weight:

```yaml
apiVersion: leaderworkerset.x-k8s.io/v1
kind: LeaderWorkerSet
metadata:
  name: vllm
spec:
  replicas: 2                    # two independent model replicas
  leaderWorkerTemplate:
    size: 2                      # 2 pods each: one leader + one worker
    restartPolicy: RecreateGroupOnPodRestart
```

The leader starts the Ray head and vLLM's OpenAI server with `--tensor-parallel-size × --pipeline-parallel-size` equal to the total GPUs across the group; the workers join the Ray cluster via the injected `LWS_LEADER_ADDRESS`. The catch from part 2 still applies with force: the group has to land on NVLink-connected GPUs or the cross-node collective crawls, so pair LWS with gang scheduling and topology-aware placement (Kueue's TAS, or the KAI scheduler). Rolling updates are first-class through `rolloutStrategy` with `maxUnavailable` and `maxSurge`, so you can roll a multi-node replica without taking the whole service down.

## rolling out a new model without an outage

The last way to drop traffic is deploying a new model version badly. KServe makes the careful version cheap: set `canaryTrafficPercent` on an `InferenceService` and point `storageUri` at the new weights, and it splits traffic between the current good revision (which it tracks automatically) and the new one.

```yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: llama3-chat
spec:
  predictor:
    canaryTrafficPercent: 10       # 10% to the new revision, 90% stays on last-good
    model:
      storageUri: "s3://models/llama3-chat/v2"
```

You watch the split live, and the metrics from part 4 (TTFT, error rate, and any quality signal) decide whether it graduates:

```text
$ kubectl get isvc llama3-chat
NAME          URL                       READY   PREV   LATEST   LATESTREADYREVISION
llama3-chat   http://llama3-chat...     True    90     10       llama3-chat-predictor-00002
```

Promotion is deleting the `canaryTrafficPercent` field and re-applying: all traffic shifts to the new revision and the old one scales to zero. Blue-green is the same mechanism flipped straight to 100; shadow is mirroring live traffic to the candidate without returning its responses, so you can compare outputs with zero user risk. Two things to know before you rely on it. First, this traffic-splitting is a serverless (Knative) mode feature; in raw deployment mode you split with Gateway API route weights instead. Second, version the weights, the serving config, and the prompt template together as one revision, or your canary metrics are comparing two things that differ in ways you didn't track. (And don't reach for ModelMesh for multi-model serving; the project is archived.)

That's the service staying up through loads, drains, and deploys. The last thing between you and a calm on-call isn't the software at all, it's other people: the tenants sharing your cluster, the ones who can reach your endpoint, and a GPU-memory boundary that turns out to be nowhere near where you think it is. That's the final part, and it's the one most likely to end up in an incident review.
