---
title: "Docker build cache: the .dockerignore gotcha"
date: "2024-12-05"
tags: ["docker", "devops", "optimization"]
excerpt: "Docker builds slow despite a clean layer order? Your .dockerignore is probably letting files bust the cache on every commit. The two-line fix."
---

Spent 2 hours debugging why my Docker builds were slow despite using multi-stage builds and proper layer ordering.

## the issue

Every single build was invalidating the cache at the `COPY . .` step, even when I hadn't changed any code.

## the culprit

My editor was creating `.swp` files and updating file timestamps. Docker saw these changes and invalidated the cache.

## the fix

Add a proper `.dockerignore`:

```
.git
.gitignore
README.md
.env*
node_modules
npm-debug.log
.next
.vscode
*.swp
*.swo
.DS_Store
```

Build time went from 5 minutes to 30 seconds.

## how to tell it worked

The first lines of build output say how much context was sent to the daemon, and that number is the whole diagnosis:

```text
 => [internal] load .dockerignore                             0.0s
 => => transferring context: 2.31kB                           0.0s
```

Kilobytes is healthy. Hundreds of megabytes means the file is missing, or the pattern you wrote does not match what you think it matches. `.dockerignore` uses Go's `filepath.Match` rules, not `.gitignore` rules, and the difference bites in one specific place: `**/` for recursive matching is supported, but a bare directory name like `node_modules` only matches at the root. Nested copies need `**/node_modules`.

Treat `.dockerignore` like `.gitignore`. Be aggressive about what you exclude.

The longer version of this, including why the same Dockerfile caches on your laptop and rebuilds everything on a CI runner, is in [why your Docker build caches locally and never in CI](/blog/docker-build-cache-buildkit). More under [Docker](/tags/docker) and [containers](/tags/containers).

