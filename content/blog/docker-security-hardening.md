---
title: "Docker Security: Stop Running Everything as Root"
date: "2024-12-10"
tags: ["docker", "security", "containers", "devops", "best-practices"]
excerpt: "Your containers are probably insecure. Here's how I learned to harden Docker containers the hard way, and the security mistakes that almost cost us."
featured: false
---

# Docker Security: Stop Running Everything as Root

Last year, a security audit revealed that 90% of our containers were running as root. We were one exploit away from a very bad day. Here's what we fixed.

## The Wake-Up Call

Our security team ran a scan. The report was... not great:

```
Critical Issues: 47
High Severity: 129
Running as root: 156 containers
Unpatched CVEs: 300+
```

Yeah. Time to fix this.

## Problem #1: Running as Root

### The Bad Way (What We Had)

```dockerfile
FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

Everything runs as root (UID 0). If someone compromises this container, they have root privileges.

### The Good Way

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

Now the app runs as user `nodejs` (non-root). Attackers can't escalate to root even if they compromise the app.

## Problem #2: Bloated Images with Vulnerabilities

### Before: 1.2GB with 300+ CVEs

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

Every package is a potential vulnerability.

### After: 150MB with <10 CVEs

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

**Results:**

- Image size: -88%
- Vulnerabilities: -97%
- Build time: -60%

## Problem #3: Secrets in Images

### Never Do This

```dockerfile
FROM node:20

# DON'T DO THIS!
ENV DB_PASSWORD=supersecret123
ENV API_KEY=abc123xyz

COPY . .
CMD ["node", "server.js"]
```

These secrets are baked into the image layers. Anyone with access can extract them:

```bash
docker history myapp:latest
docker save myapp:latest | tar -xO | grep -a "API_KEY"
```

### Do This Instead

Use build secrets (Docker BuildKit):

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

At runtime, use environment variables or secret management:

```bash
docker run -e DB_PASSWORD="$(cat /path/to/secret)" myapp
```

Better yet: Use Docker secrets (Swarm) or Kubernetes secrets.

## Problem #4: Unnecessary Capabilities

By default, Docker containers have too many capabilities.

### Principle of Least Privilege

```bash
# Drop all capabilities, add only what's needed
docker run --rm \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --security-opt=no-new-privileges:true \
  myapp
```

In Docker Compose:

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

## Problem #5: Writable Root Filesystem

### Make Filesystem Read-Only

```bash
docker run --rm \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  myapp
```

In Docker Compose:

```yaml
services:
  webapp:
    image: myapp
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=100m
      - /var/run:rw,noexec,nosuid,size=10m
```

Now attackers can't write malicious files to disk.

## Problem #6: Outdated Base Images

### Auto-Update Base Images

Use Dependabot or Renovate:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Scan Images Regularly

```bash
# Using Trivy
trivy image myapp:latest

# Using Snyk
snyk container test myapp:latest

# Using Docker Scout
docker scout cves myapp:latest
```

Set up CI to fail builds with critical vulnerabilities:

```yaml
# .github/workflows/security.yml
- name: Scan image
  run: |
    trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest
```

## Problem #7: Exposed Docker Socket

### Never Mount Docker Socket

```yaml
# NEVER DO THIS
services:
  webapp:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # DON'T!
```

Mounting the Docker socket gives the container complete control over the host. It's effectively root access.

If you need Docker-in-Docker, use alternatives:

- Docker-outside-of-Docker (DooD) with proper access controls
- Kaniko for building images
- Podman for rootless containers

## Problem #8: Unbounded Resource Usage

### Limit Resources

```bash
docker run --rm \
  --memory="512m" \
  --memory-swap="512m" \
  --cpus="0.5" \
  --pids-limit=100 \
  myapp
```

In Docker Compose:

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

Prevents resource exhaustion attacks.

## The Complete Hardened Dockerfile

Putting it all together:

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

## Production Docker Compose

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

## Security Checklist

Before deploying to production:

- [ ] Container runs as non-root user
- [ ] Using minimal base image (Alpine, distroless)
- [ ] No secrets in Dockerfile or image layers
- [ ] Filesystem is read-only where possible
- [ ] Resource limits configured
- [ ] Capabilities dropped (use --cap-drop=ALL)
- [ ] No new privileges allowed
- [ ] Regular vulnerability scanning
- [ ] Base images updated regularly
- [ ] Health checks implemented
- [ ] Network segmentation configured
- [ ] Docker socket NOT mounted
- [ ] Proper logging configured

## Tools to Help

### Image Scanning

- **Trivy**: Fast, accurate, easy to use
- **Snyk**: Great UI, integrates with CI/CD
- **Clair**: Self-hosted option
- **Docker Scout**: Built into Docker

### Runtime Security

- **Falco**: Runtime threat detection
- **Aqua Security**: Enterprise solution
- **Sysdig**: Container monitoring + security

### Policy Enforcement

- **Open Policy Agent (OPA)**: Policy as code
- **Gatekeeper**: OPA for Kubernetes
- **Kyverno**: Kubernetes-native policies

## Common Excuses and Rebuttals

**"It works fine as root"**

- Until it doesn't. One RCE and you're owned.

**"Security is slow"**

- Slower than a data breach? I doubt it.

**"This is too complex"**

- It's a few extra lines. Your users' data is worth it.

**"We're behind a firewall"**

- Defense in depth. Assume breach.

## The Results

After implementing these changes:

- Vulnerabilities: Down 94%
- Image sizes: Down 70%
- Root containers: 0 (down from 156)
- Compliance score: 95% (up from 23%)
- Security incidents: 0 in last 6 months

## Final Thoughts

Container security isn't optional. It's not hard, it just requires discipline.

Start small:

1. Run as non-root
2. Use minimal images
3. Scan regularly

The rest follows naturally.

**Remember**: The best time to secure your containers was yesterday. The second best time is now.

What security practices have you implemented? Any war stories? Share below!

