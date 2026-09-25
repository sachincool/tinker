---
title: "Why your Docker build caches locally and never in CI"
seoTitle: "Docker build cache: why it works locally, not in CI"
date: "2026-09-02"
tags: ["docker", "ci-cd", "devops", "containers", "optimization"]
excerpt: "A CI runner starts with an empty layer store, so every build is a first build. Cache mounts, instruction order, and an exported cache fix it in about ten lines."
featured: false
faqs:
  - question: "Why does Docker build cache work locally but not in GitHub Actions?"
    answer: "Because the cache lives in the local layer store, and a CI runner is a fresh machine with an empty one. Nothing is wrong with your Dockerfile. You need to export the cache somewhere that outlives the runner and import it on the next run, which is what BuildKit's --cache-to and --cache-from do."
  - question: "What invalidates a Docker layer cache?"
    answer: "For COPY and ADD, a change to the contents or metadata of any file being copied. For RUN, a change to the command string itself, or to any earlier layer. Cache invalidation cascades: once one instruction misses, every instruction after it rebuilds regardless of whether its own inputs changed. That is why instruction order matters more than instruction count."
  - question: "What does RUN --mount=type=cache do?"
    answer: "It mounts a persistent directory into that single RUN step without the contents becoming part of the layer. It is how you keep a package manager's download cache (npm, pip, apt, Go modules) across builds. The layer stays small because the cache directory is never committed, and the install is fast because the packages are already on disk."
  - question: "Does .dockerignore affect the build cache?"
    answer: "Yes, strongly. Files excluded by .dockerignore never enter the build context, so they cannot contribute to the hash that COPY uses. Without a .dockerignore, a COPY . . step hashes .git and node_modules, which change on every commit and every local install, so that layer and everything after it misses the cache on every single build."
  - question: "What is the difference between cache mode=min and mode=max?"
    answer: "mode=min exports only the layers of the final image. mode=max also exports the intermediate layers from every stage of a multi-stage build. With min, the expensive build stage in a multi-stage Dockerfile is never cached, which is usually the stage you most wanted to cache. Use max unless the cache storage cost is a real problem."
---

The build is quick on your laptop and slow in CI, and the Dockerfile is identical. This is not a mystery about Docker. The layer cache lives in the local layer store, and a CI runner is a clean machine with an empty one. Every CI build is a first build.

Fixing it is two separate jobs. Make the cache work at all, which is about instruction order and what enters the build context, and then make the cache survive the runner, which is about exporting it somewhere that outlives the job. The first job also speeds up your laptop. The second only matters in CI.

## what actually invalidates a layer

BuildKit keys each instruction on its inputs. For `RUN`, the input is the command string plus the state of everything before it. For `COPY` and `ADD`, the input is the contents and metadata of the files being copied.

The part that catches people is that invalidation cascades. Once one instruction misses, every instruction after it rebuilds, whether or not its own inputs changed. So a Dockerfile that copies the whole source tree before installing dependencies rebuilds the dependency install on every commit, forever:

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY . .                  # any source change invalidates here
RUN npm ci                # ...so this always reruns
CMD ["node", "server.js"]
```

The fix is old and still the highest-value change in most Dockerfiles. Copy only the files the install reads, install, then copy the rest:

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                # only reruns when the lockfile changes
COPY . .
CMD ["node", "server.js"]
```

Same instructions, different order, and the install stops rerunning for a one-line change in a route handler. The rule generalises to every ecosystem: `go.mod` and `go.sum` before the source, `requirements.txt` before the package, `Cargo.toml` and a dummy `main.rs` before the crate.

## the .dockerignore that decides whether any of this works

`COPY . .` hashes the build context. If the context contains `.git`, the hash changes on every commit, including commits that touch nothing the image needs. If it contains a local `node_modules`, the hash changes whenever you install anything on your laptop, and the image you build is not the image CI builds.

```text
.git
node_modules
.next
dist
coverage
*.log
.env*
Dockerfile
.dockerignore
```

Two things this buys beyond cache hits. The context stops being uploaded to the daemon, which on a repo with a large `.git` is most of the wall-clock time before the build even starts. And `.env*` stops being copied into a layer where anyone with the image can read it, which is a different post's problem but a real one.

You can see the size of what you are sending in the first line of build output:

```text
$ docker build .
[+] Building 0.4s (8/8) FINISHED
 => [internal] load build definition from Dockerfile          0.0s
 => [internal] load .dockerignore                             0.0s
 => => transferring context: 2.31kB                           0.0s
```

`transferring context: 2.31kB` is a healthy number. If it says 340MB, the `.dockerignore` is missing or wrong. There is a shorter version of this specific trap in [Docker build cache: the .dockerignore gotcha](/til/docker-build-cache-trick).

## cache mounts, for the work that repeats

Instruction ordering stops the install rerunning when nothing changed. It does nothing for the case where the lockfile genuinely did change and you would still rather not download every package again.

That is what cache mounts are for. `RUN --mount=type=cache` mounts a persistent directory into one step, and the directory never becomes part of the layer:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
CMD ["node", "server.js"]
```

The `# syntax=` line on the first line is required. Without it, the Dockerfile is parsed by the built-in frontend, which does not understand `--mount`, and you get a syntax error that reads like the flag does not exist.

The same shape for the other ecosystems:

```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
RUN --mount=type=cache,target=/go/pkg/mod go build ./...
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends curl
```

The apt one needs `sharing=locked` because two concurrent builds writing to the same apt cache will corrupt it. `locked` serialises them. The default, `shared`, is right for package managers that handle concurrent readers themselves, which npm, pip, and the Go module cache all do.

Cache mounts also fix the pattern where people delete the cache to keep the layer small, which is a real cost you no longer have to pay:

```dockerfile
# no longer necessary: the cache never entered the layer
RUN apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

## making the cache outlive the runner

Everything above still produces a cold build in CI, because none of it survives the machine. BuildKit can export the cache to a registry or to the CI provider's own cache store, and import it at the start of the next run.

For GitHub Actions, the provider-native backend is the least work:

```yaml
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v6
  with:
    push: true
    tags: ghcr.io/example/api:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

`mode=max` is the part people leave off and then wonder why a multi-stage build is still slow. The default, `min`, exports only the layers that end up in the final image. In a multi-stage Dockerfile the expensive stage is the builder, and none of it is in the final image, so `min` caches precisely the cheap half.

The GitHub Actions cache is capped at 10 GB per repository and evicts least-recently-used entries, so a repo with several images can quietly evict its own cache between runs. If that happens, or if you build outside GitHub, export to the registry instead:

```yaml
    cache-from: type=registry,ref=ghcr.io/example/api:buildcache
    cache-to: type=registry,ref=ghcr.io/example/api:buildcache,mode=max
```

That writes the cache as a separate tag next to the image. It costs registry storage and it does not evict on you.

## proving it worked

The reason to check rather than assume is that a cache configuration can be entirely valid and still miss everything, and the build output looks the same either way unless you ask for it.

```bash
docker buildx build --progress=plain --cache-from type=registry,ref=ghcr.io/example/api:buildcache .
```

`--progress=plain` prints every step with its status instead of collapsing them:

```text
#8 [3/5] RUN --mount=type=cache,target=/root/.npm npm ci
#8 CACHED

#9 [4/5] COPY . .
#9 DONE 0.2s
```

`CACHED` on the install step and `DONE` on the copy is the correct shape: the dependency layer was reused, the source layer was rebuilt. If the install step says `DONE 47.3s` on a run where the lockfile did not change, something above it invalidated, and the step immediately before it is where to look.

> **Key Insight:** Cache invalidation cascades forward and never backward. When a step misses unexpectedly, the bug is always in a step above it, never in the step that reported the miss. Read the build output from the top down and stop at the first thing that rebuilt.

## the one that will still catch you

`ARG` values participate in the cache from the point they are used. A build argument that changes every run, and CI is full of them, invalidates everything downstream of its first reference:

```dockerfile
ARG GIT_SHA
RUN echo "$GIT_SHA" > /app/version     # invalidates on every commit
COPY package.json package-lock.json ./
RUN npm ci                             # ...and so does this
```

Move it as late as possible. The version stamp belongs after the expensive work, not before it:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG GIT_SHA
RUN echo "$GIT_SHA" > /app/version     # invalidates only itself
```

The same applies to any `ENV` set from a build argument, and to `LABEL` values containing a timestamp, which is a popular way to make a Dockerfile uncacheable while believing you are adding metadata.

Check what you actually have with `docker buildx du`, which shows what the cache is holding and how much of it is reclaimable. If the number never grows between CI runs, the export is not working and no amount of Dockerfile tuning will help.

More on the container side of things under [Docker](/tags/docker) and [containers](/tags/containers), the pipeline side under [ci-cd](/tags/ci-cd). If your builds are fast and your images are still running as root, [Docker security: stop running everything as root](/blog/docker-security-hardening) is the other half of the same file. And if the reason you are reading this is that the CI bill went up rather than the builds got slow, [AWS cost optimization](/blog/aws-cost-optimization-tricks) covers where that money usually actually goes.

Start with the `.dockerignore`. It takes two minutes, it is the one change that helps locally and in CI at the same time, and a repo without one almost always has a `COPY . .` that has not hit the cache in months.
