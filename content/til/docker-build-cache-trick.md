---
title: "Docker Build Cache: The .dockerignore Gotcha"
date: "2024-12-05"
tags: ["docker", "devops", "optimization"]
type: "til"
---

# TIL: Docker Build Cache: The .dockerignore Gotcha

Spent 2 hours debugging why my Docker builds were slow despite using multi-stage builds and proper layer ordering.

## The Issue

Every single build was invalidating the cache at the `COPY . .` step, even when I hadn't changed any code.

## The Culprit

My editor was creating `.swp` files and updating file timestamps. Docker saw these changes and invalidated the cache.

## The Fix

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

**Pro tip:** Treat `.dockerignore` like `.gitignore` - be aggressive about what you exclude!

