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

Treat `.dockerignore` like `.gitignore`. Be aggressive about what you exclude.

