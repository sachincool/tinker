---
title: "Docker Security: Stop Running Everything as Root"
date: "2024-12-10"
tags: ["docker", "security", "containers", "devops", "best-practices"]
excerpt: "Your containers are probably insecure. Here's how I learned to harden Docker containers the hard way, and the security mistakes that almost cost us."
featured: false
---

# Docker Security: Stop Running Everything as Root

The audit came back with 47 critical issues, 129 highs, 156 containers running as root, and 300-plus unpatched CVEs. We had been shipping the same Node Dockerfile for two years. It was the one from the official `node` image's README, with our app dropped on top. Nobody had ever questioned it. The auditor wrote one line in the summary: *one RCE in any of these and you own the cluster.*

![Side-by-side comparison of a Docker container running as root with permissive defaults versus a hardened container with a non-root user, dropped capabilities, a read-only filesystem, a seccomp profile, and a distroless base image.](/images/docker-security-hardening/hero.png)

*Fig. 1 — same app code, two trust postures; the audit numbers do most of the arguing.*

## the report

Here's what landed in my inbox on a Tuesday morning, paraphrased into the format the scanner emits:

```
Critical Issues: 47
High Severity: 129
Running as root: 156 containers
Unpatched CVEs: 300+
```

The 156 number was the one that hurt. We didn't have 156 services. We had about thirty. The rest were sidecars, jobs, debug images, one-off tools that someone had built three years ago and never thought about again. Each one ran as UID 0 because the base image did, and nobody had bothered to override it.

## running as root, by accident

This is the Dockerfile we had. Maybe yours too.

```dockerfile
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

The `node` image runs as root by default. There's a `node` user already created inside it, but you have to opt in with `USER node`. Almost nobody does. Six years of Stack Overflow answers, including the accepted ones, omit it. The fix is one line, and the version that creates a fresh user is a habit worth keeping for images that don't ship one.

```dockerfile
FROM node:20-slim

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

WORKDIR /app

# Install dependencies as root
COPY package*.json ./
RUN npm ci --production

# Copy application files
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

EXPOSE 3000
CMD ["node", "server.js"]
```

The thing the `--chown` flag buys you is that the running process can't `chmod` its own binaries. An attacker who pops the app can read what it can read and write to what it can write to, but can't go and rewrite `server.js` to add a backdoor. That's a real piece of mitigation that costs you nothing.

## images that arrived with everything

Our prod image was 1.2 GB. The base was `ubuntu:latest`, then a kitchen-sink `apt-get install` of `curl`, `wget`, `git`, `build-essential`, Python, Node, and npm. The build engineer who wrote it had reasons for each one at some point. None of those reasons were still true in production.

```dockerfile
FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    nodejs \
    npm
    
# ... rest of the Dockerfile
```

Every binary in there is a CVE waiting to be reported. The replacement is the same app on `node:20-alpine`, with `dumb-init` for signal handling and nothing else.

```dockerfile
FROM node:20-alpine

# Only install what you need
RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm ci --production --ignore-scripts

COPY . .

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

The image dropped to 150 MB. Vulnerability count fell by 97% the morning we shipped it, mostly because we stopped shipping `git` and a C compiler in production. Build time is 60% shorter. None of that required clever engineering. We deleted things.

## secrets baked into layers

The first time I saw this in our codebase I assumed it was a stub:

```dockerfile
FROM node:20

# DON'T DO THIS!
ENV DB_PASSWORD=supersecret123
ENV API_KEY=abc123xyz

COPY . .
CMD ["node", "server.js"]
```

It wasn't. It had been deployed for eight months. The defense everyone offers is "the registry is private". The problem is that `ENV` lives in the image layer history forever, and `docker history` and `docker save` will hand it to anyone who pulls the image once.

```bash
docker history myapp:latest
docker save myapp:latest | tar -xO | grep -a "API_KEY"
```

BuildKit secrets fix the build-time half. The secret mounts during the `RUN` step and never lands in a layer.

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Use build-time secrets
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --production

COPY . .
CMD ["node", "server.js"]
```

Build with:

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t myapp .
```

For runtime secrets, the right answer depends on where you're running. On a single host:

```bash
docker run -e DB_PASSWORD="$(cat /path/to/secret)" myapp
```

On Swarm or Kubernetes, use the platform's secret store. Anything else is a layer of `chmod 600` and hope.

## capabilities you didn't ask for

A vanilla container gets fourteen Linux capabilities by default — including `CAP_NET_RAW`, which lets the process craft raw packets. Most apps need `NET_BIND_SERVICE` and nothing else. Drop the lot, add back what you actually use.

```bash
# Drop all capabilities, add only what's needed
docker run --rm \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --security-opt=no-new-privileges:true \
  myapp
```

The Compose form, which is what most teams actually deploy:

```yaml
services:
  webapp:
    image: myapp
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true
```

`no-new-privileges:true` is the sleeper line. It blocks setuid binaries from elevating during a process exec, closing the residual escalation path that capability drops leave open if a setuid binary is still inside the image.

## a writable root for no reason

Most apps write to `/tmp`, maybe a logging volume, and nothing else. Their root filesystem can be read-only and the app will never notice. Attackers will.

```bash
docker run --rm \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  myapp
```

In Compose:

```yaml
services:
  webapp:
    image: myapp
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=100m
      - /var/run:rw,noexec,nosuid,size=10m
```

The first time you ship this you'll discover one library that writes a cache file to `/var/cache` at startup. Add a tmpfs for it and move on. After that the surprises stop.

## base images that age

The `:latest` tag pins nothing. The pin you actually want is a digest, but a version-with-distro tag (`node:20.10.0-alpine3.19`) is the working compromise. Then automate the bump.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

And scan the image. It doesn't matter much which scanner you pick (the lists overlap heavily), but pick one and run it on every build.

```bash
# Using Trivy
trivy image myapp:latest

# Using Snyk
snyk container test myapp:latest

# Using Docker Scout
docker scout cves myapp:latest
```

Wire it into CI as a hard gate on critical and high:

```yaml
# .github/workflows/security.yml
- name: Scan image
  run: |
    trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest
```

Yes, you'll have weeks where the gate fires on a CVE you can't fix because there's no patched base image yet. That's a feature. It tells you which deploys are knowingly carrying risk.

## the docker socket

If a container has `/var/run/docker.sock` mounted, it can start a sibling container with `--privileged --pid=host -v /:/host` and own the host. There is no way to make this safe.

```yaml
# NEVER DO THIS
services:
  webapp:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # DON'T!
```

It still shows up in build agents, log shippers, and "monitoring" sidecars from vendors who should know better. If you genuinely need to build images from inside a container, Kaniko does that without the socket. If you need to inspect other containers, the orchestrator's API is the supported path.

## resource limits as a security control

Resource limits feel like a performance concern, but the most common DoS we saw on our cluster was a container OOM-killing its node by allocating until the kernel reaper showed up. Limits don't prevent that, they contain it.

```bash
docker run --rm \
  --memory="512m" \
  --memory-swap="512m" \
  --cpus="0.5" \
  --pids-limit=100 \
  myapp
```

The Compose version:

```yaml
services:
  webapp:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    pids_limit: 100
```

`--pids-limit` is the underrated one. A fork bomb in your container will still take the container down, but it won't take its neighbors with it.

## the hardened dockerfile, end to end

Putting it all together. This is roughly what every Node service in our prod cluster now looks like:

```dockerfile
# syntax=docker/dockerfile:1

# Use specific version, not 'latest'
FROM node:20.10.0-alpine3.19 AS builder

# Install build dependencies
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies with audit
RUN npm ci --production --ignore-scripts && \
    npm audit --audit-level=moderate

# Production stage
FROM node:20.10.0-alpine3.19

# Install only runtime dependencies
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Remove unnecessary files
RUN rm -rf .git .gitignore .dockerignore README.md tests/

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run application
CMD ["node", "server.js"]

# Metadata
LABEL org.opencontainers.image.source="https://github.com/myorg/myapp" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="My Company"
```

And the matching Compose, with the runtime hardening that the Dockerfile can't express:

```yaml
version: '3.8'

services:
  webapp:
    image: myapp:1.0.0
    container_name: webapp
    
    # Security options
    user: "1001:1001"
    read_only: true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true
      - seccomp:./seccomp.json
    
    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    pids_limit: 200
    
    # Writable tmpfs for temp files
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=100m
    
    # Network isolation
    networks:
      - internal
    
    # Health check
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    
    # Logging
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    
    # Restart policy
    restart: unless-stopped

networks:
  internal:
    driver: bridge
    internal: true
```

## the tools I actually used

For image scanning we landed on Trivy in CI and Docker Scout for local checks. Snyk has a nicer UI but the per-developer license adds up; Clair is what you reach for when nothing can leave the network. For runtime, Falco watches for the syscall patterns nobody should ever see in production (a shell spawned inside a webserver container is the canonical one). Open Policy Agent and its Kubernetes-native cousins, Gatekeeper and Kyverno, are where you encode the rules from this post so the next person can't push a Dockerfile that violates them. The policy engine is the part that makes the work stick.

## the receipts

Six months after the audit, the same scanner came back with vulnerabilities down 94%, image sizes down 70%, root containers at zero (from 156), and a compliance score of 95% (from 23%). Zero security incidents that we know about, which is the only honest way to phrase that number.

The change none of those metrics capture is the cultural one. The CI gate caught seven Dockerfiles in the next quarter that would have shipped a `USER root` or a mounted Docker socket. Each of them was added by someone who'd read this exact post in our wiki and still missed something. The point of the gate isn't that engineers are careless. It's that the wrong defaults will outlast any number of training sessions.

The auditor who wrote *one RCE and you own the cluster* came back the next year. The line in this year's summary read *no findings rated critical*. I keep both of them in the same Slack channel. They're more useful together.
