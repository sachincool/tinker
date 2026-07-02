---
title: "Two tenants, one GPU, and no wall between them"
date: "2026-07-25"
tags: ["gpu", "kubernetes", "multi-tenancy", "security", "mig"]
excerpt: "A Kubernetes namespace isolates the API, not the silicon. Under time-slicing two teams share a physical GPU with no memory wall. Quotas, isolation, and locking the endpoint."
featured: false
series: "GPUs in production"
seriesPart: 8
---

Run `nvidia-smi` inside a pod in one namespace, then inside a pod in another, on a cluster using GPU time-slicing. Look at the GPU UUID and the PCI bus ID.

![A dark terminal screenshot showing two kubectl exec commands. The first, in namespace team-a, runs nvidia-smi and shows an NVIDIA H100 80GB on PCI bus 00000000:17:00.0 with GPU UUID GPU-4a8f2c1e-7b93-4d21-a0e5-9c1f2b3d4e5f, using 1024MiB, one vllm process. The second, in namespace team-b, runs nvidia-smi and shows the same H100 on the same bus 00000000:17:00.0 with the identical GPU UUID, using 896MiB, its own vllm process. A comment at the bottom reads: different namespaces, same die, no DRAM partition between them.](/images/gpu-deployments-part-8-multi-tenancy-security/same-gpu-two-namespaces.png)

*Fig. 1 · two pods, two namespaces, and the exact same GPU UUID on the exact same PCI bus. Each thinks it has the whole 80GB card. Neither can see the other. That invisibility is the danger, not the comfort.*

This is the last part. Seven parts built the fleet, wired it, scaled it, watched it, routed to it, and kept it alive through deploys. This one is about the moment more than one team shares it, which is where the assumptions that held for a single tenant quietly stop being true. The load-bearing one, the thing most teams get wrong: a Kubernetes namespace is not a wall on the GPU.

## the isolation you don't have

A namespace is an API-scoping and RBAC boundary. It has nothing to do with the hardware. The device plugin advertises `nvidia.com/gpu` resources and the scheduler places pods onto them regardless of which namespace asked, so "one GPU, four replicas" under time-slicing means the scheduler can land a pod from `team-a` and a pod from `team-b` on the same physical die with no memory partition between them. What isolation you actually get depends entirely on the sharing mechanism, and it's worth stating exactly:

![A comparison matrix titled 'what actually isolates two tenants on a GPU', four rows by three columns. Rows: whole GPU (exclusive), MIG (hardware partition), MPS (multi-process service), time-slicing. Columns: memory isolation, fault isolation, compute QoS. Whole GPU: yes, yes, full device. MIG: yes (dedicated DRAM partition, hardware-enforced), yes (fault contained to the instance), guaranteed per slice. MPS: no (software soft caps only), weak (shared MPS server failure domain), soft percent cap. Time-slicing: none, none, none (equal time-share only). A note reads: only MIG or a whole GPU gives a hardware memory wall; MPS and time-slicing are software conventions, not walls.](/images/gpu-deployments-part-8-multi-tenancy-security/isolation-matrix.png)

*Fig. 2 · the only two rows with a real memory wall are "whole GPU" and "MIG." MPS caps are software. Time-slicing has nothing. If your mental model was "different namespace, different memory," this is the row that corrects it.*

The config that creates this situation is ordinary and common. This is a device-plugin time-slicing setup, the kind people turn on to raise utilization:

```yaml
sharing:
  timeSlicing:
    resources:
    - name: nvidia.com/gpu
      replicas: 4          # one physical GPU -> four schedulable "GPUs", zero isolation
```

MPS swaps that block for per-client soft caps (`CUDA_MPS_PINNED_DEVICE_MEM_LIMIT`, a compute percentage), which are enforced by the driver, not by hardware, and share a failure domain. This isn't only a noisy-neighbor concern. Security researchers have shown covert and side channels through the GPU's shared uncore engines, readable with unprivileged NVML calls, that bypass both MPS and MIG partitioning, and GPU DRAM that isn't zeroed on context teardown has leaked data across tenants under time-slicing. The one-line defensive setting: turn on `renameByDefault: true` so a shared GPU advertises as `nvidia.com/gpu.shared`, and a tenant can't request a "shared" GPU thinking it's a private one.

> **Key Insight:** A Kubernetes namespace isolates the API and RBAC, never GPU memory. Under time-slicing or MPS, two tenants can sit on the same physical die with no hardware wall between their VRAM. If tenants don't trust each other, only MIG or a whole-GPU allocation is safe. This is the correction most GPU-cluster security models are missing.

## MIG when tenants can't trust each other

MIG is the answer when the boundary has to be real. It carves the physical card into hardware partitions, each with its own DRAM slice, L2, and SMs, so one instance cannot read another's memory regardless of driver or kernel bugs. Expose it through the GPU Operator in `mixed` strategy, which advertises each profile as its own resource:

```bash
kubectl patch clusterpolicies.nvidia.com/cluster-policy --type='json' \
  -p='[{"op":"replace","path":"/spec/mig/strategy","value":"mixed"}]'
```

The node then advertises MIG profiles as first-class schedulable resources, and a tenant requests a hardware-isolated slice by name:

```yaml
resources:
  limits:
    nvidia.com/mig-1g.10gb: 1     # one hardware-isolated 10GB partition
```

The tradeoff is the one from part 1: partitions are fixed at configure time, reconfiguring drains the node's GPU pods, and a workload can't burst past its slice. That rigidity is the price of a real wall. For untrusted multi-tenancy it's a price worth paying; for a single trusted team it's usually not.

## quotas that don't waste the cluster

Isolation stops one tenant from reading another's memory. Quotas stop one tenant from eating the whole cluster. The blunt version is a `ResourceQuota` capping GPU requests per namespace (extended resources are quotable only via `requests.`):

```yaml
apiVersion: v1
kind: ResourceQuota
metadata: { name: team-a-gpu-quota, namespace: team-a }
spec:
  hard:
    requests.nvidia.com/gpu: "8"
```

That's static, though, and it strands GPUs whenever a team is idle. Kueue fixes that by admitting jobs against quota and letting teams in a shared cohort borrow each other's idle GPUs while guaranteeing each its floor back on demand. A `ClusterQueue` holds the quota; the `cohortName` is what enables borrowing:

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata: { name: team-a-cq }
spec:
  cohortName: "gpu-pool"                 # teams in one cohort lend/borrow idle GPUs
  resourceGroups:
  - coveredResources: ["nvidia.com/gpu"]
    flavors:
    - name: h100-flavor
      resources:
      - name: nvidia.com/gpu
        nominalQuota: 8                  # guaranteed floor
        borrowingLimit: 4                # cap on what it can borrow from the cohort
```

One version trap worth checking before you copy that: current Kueue serves `v1beta2`, where cohorts are a named field (and can be their own CRD with fair-share weights). Plenty of clusters still run `v1beta1`, where the field is a plain `spec.cohort` string and the standalone Cohort doesn't exist. `kubectl get crd clusterqueues.kueue.x-k8s.io -o jsonpath='{.spec.versions[*].name}'` tells you which you have. NVIDIA's KAI scheduler (the open-sourced core of Run:ai) models the same idea as a hierarchical `Queue` with a `quota` (the deserved floor) and an `overQuotaWeight` (your proportional claim on idle GPUs above it), plus time-based fair-share so a team that under-used earlier gets favored later.

## the endpoint nobody locked

The most common GPU-cluster security hole isn't exotic. It's a vLLM pod with a Service and no authentication, reachable from anywhere on the cluster or, worse, the internet: free inference, prompt exfiltration, model theft. Lock it at three layers. Default-deny ingress so only the gateway can reach the model server:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: team-a }
spec:
  podSelector: {}
  policyTypes: ["Ingress"]
```

Then an authenticated, TLS-terminating gateway in front (Gateway API `HTTPRoute` with auth attached upstream), and a least-privilege ServiceAccount so a compromised inference pod can't read the rest of the cluster's secrets:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata: { name: vllm-sa, namespace: team-a }
automountServiceAccountToken: false     # the model server never calls the API server
```

Which connects to the last quiet failure: secrets. Gated models return a 403 at download time when the pod has no valid Hugging Face token, and that surfaces as exactly the CrashLoopBackOff from part 7, except this time it really is the app. Mount the token from a Secret (or an external manager), never bake it into the image, and pin the model by digest so you don't silently load a tampered checkpoint:

```yaml
env:
- name: HF_TOKEN
  valueFrom:
    secretKeyRef: { name: hf-token, key: token }
```

Prefer `.safetensors` over pickle formats (loading a pickle can execute arbitrary code), pin the model revision to a commit, and verify its checksum. The supply chain for a 140GB weight file deserves the same suspicion as any other dependency, which is the whole thesis of the lazy-security series if you want the longer version.

## the frontier: confidential computing

One emerging piece, worth knowing exists even if you're not deploying it yet. Confidential computing extends a CPU trusted execution environment to the GPU, so even the cloud operator hosting your node can't read the weights or activations in VRAM. H100 CC-mode is GA: the driver, running inside a confidential VM, encrypts everything crossing the PCIe bus, and CUDA apps run unmodified once trust is established. Blackwell extends it with NVLink encryption for multi-GPU confidential domains. Independent benchmarks put the overhead under 5% for typical LLM inference (it's the CPU-to-GPU I/O encryption that costs, so small-batch workloads pay a bit more). On Kubernetes it lands through Kata Containers and Confidential Containers, and it's still maturing operationally. For regulated or sensitive-IP inference, it's the direction; for most workloads today, it's a section to file away.

## who's paying for the idle GPUs

The last shared-cluster problem is money, and it's the biggest one, because cluster GPU utilization commonly sits at 30 to 40%. The gap between GPUs bought and GPUs doing work is enormous, and the fix is making teams see their own idle GPU-hours. Enforce a `team` label on every GPU pod (a policy engine like Kyverno rejects pods without one), export per-GPU metrics with DCGM, and attribute GPU-hours per team:

```yaml
validate:
  message: "GPU pods must carry a 'team' label for chargeback."
  pattern:
    metadata:
      labels: { team: "?*" }
```

With the label enforced, DCGM's per-pod metrics roll up into GPU-hours per team, and tagging inference requests with an `X-Team` header at the gateway takes it down to token-level attribution. Showback doesn't reclaim a single GPU by itself. It just makes the waste visible to the people who can, which turns out to be most of the battle.

That's eight parts, and it's time to say the thing the whole series was circling. A GPU deployment is a dozen layers under one pod, a small network in one box, a large one between boxes, a set of graphs that tell you the truth, an autoscaler that turns it off, a router that doubles it for free, a set of probes that keep it breathing, and a tenancy model that decides who it hurts when it breaks. The silicon was the easy part. Everything that makes it hard lives in the layers around it, and every one of those layers is a place you can be the person who saw it coming, or the one explaining it in the incident review. That was the job the entire time. The GPUs were never the point.
