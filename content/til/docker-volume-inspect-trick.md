---
title: "Docker volume debugging: finding where your data actually lives"
date: "2024-12-14"
tags: ["docker", "debugging", "containers", "devops"]
excerpt: "Volume mounts that look right but won't persist data. The five-command inspection sequence that always tells me which mount is actually being read."
---

Spent 2 hours debugging why data wasn't persisting. Turns out, understanding Docker volumes is the actual job.

## the problem

I had a container with a volume mount, but couldn't figure out where the data was actually stored on the host:

```bash
docker run -v mydata:/data myapp
```

Where is `mydata`? What's inside it?

## the solution

### find volume location

```bash
# List all volumes
docker volume ls

# Inspect a specific volume
docker volume inspect mydata
```

Output:
```json
[
    {
        "CreatedAt": "2024-12-14T10:30:00Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/mydata/_data",
        "Name": "mydata",
        "Options": {},
        "Scope": "local"
    }
]
```

The `Mountpoint` tells you exactly where the data lives.

### view volume contents (the trick)

You can't just `cd` to that path (permission denied). Instead, use a temporary container:

```bash
docker run --rm -v mydata:/data alpine ls -la /data
```

Or for interactive browsing:

```bash
docker run --rm -it -v mydata:/data alpine sh
cd /data
ls -la
```

## a better named-volume workflow

Create a simple alias:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias dvol='docker run --rm -it -v'
```

Usage:
```bash
# Browse any volume interactively
dvol mydata:/data alpine sh

# Quick listing
dvol mydata:/data alpine ls -la /data

# Check file contents
dvol mydata:/data alpine cat /data/config.json

# Copy file out of volume
docker run --rm -v mydata:/data -v $(pwd):/backup alpine cp /data/important.txt /backup/
```

## debugging bind mounts

For bind mounts (host path to container):

```bash
docker run -v /host/path:/container/path myapp
```

To see what the container actually sees:

```bash
docker exec -it container_name ls -la /container/path
```

## common volume issues

### volume not mounting

```bash
# Check if volume exists
docker volume ls | grep mydata

# Create it if missing
docker volume create mydata
```

### wrong permissions

```bash
# Check ownership in volume
docker run --rm -v mydata:/data alpine ls -ln /data

# Fix permissions (if needed)
docker run --rm -v mydata:/data alpine chown -R 1000:1000 /data
```

### dangling volumes

```bash
# List dangling volumes (not used by any container)
docker volume ls -f dangling=true

# Remove them
docker volume prune

# this deletes data — make sure nothing important is dangling
```

### volume vs bind mount confusion

```bash
# Named volume (managed by Docker)
-v mydata:/data

# Bind mount (you manage the host path)
-v /host/path:/data
-v $(pwd):/data

# Anonymous volume (Docker creates and manages)
-v /data
```

## patterns

### 1. backup a volume

```bash
# Backup volume to tar file
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mydata-backup.tar.gz -C /data .
```

### 2. restore a volume

```bash
# Restore from backup
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mydata-backup.tar.gz -C /data
```

### 3. copy volume to another

```bash
# Copy all data from vol1 to vol2
docker run --rm \
  -v vol1:/source:ro \
  -v vol2:/dest \
  alpine sh -c "cp -av /source/. /dest/"
```

### 4. clone a volume

```bash
# Create new volume as copy of existing
docker volume create vol2
docker run --rm \
  -v vol1:/source:ro \
  -v vol2:/dest \
  alpine cp -av /source/. /dest/
```

## real-world example

I was debugging a database that wasn't persisting data:

```bash
# Check if volume exists
docker volume inspect postgres_data
# Error: No such volume

# the docker-compose.yml had a typo
# it said: postgress_data (3 s's)
# should be: postgres_data (2 s's)

# found all volumes
docker volume ls
# found: postgress_data (the typo)

# Renamed it
docker volume create postgres_data
docker run --rm \
  -v postgress_data:/source \
  -v postgres_data:/dest \
  alpine cp -av /source/. /dest/

# Removed the typo volume
docker volume rm postgress_data
```

## useful one-liners

```bash
# Find which containers use a volume
docker ps -a --filter volume=mydata

# Remove all stopped containers' volumes
docker container prune -f && docker volume prune -f

# List volumes with size (requires Docker 20.10+)
docker system df -v

# Find volumes larger than 1GB
docker system df -v | awk '$4 > 1000'
```

## the gotcha I learned

Docker Compose creates volumes with prefixes:

```yaml
# docker-compose.yml
volumes:
  mydata:
```

Creates volume named: `projectname_mydata`

To use a specific name:

```yaml
volumes:
  mydata:
    name: mydata
```
