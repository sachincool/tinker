---
title: "Docker Volume Debugging: Finding Where Your Data Actually Lives"
date: "2024-12-14"
tags: ["docker", "debugging", "containers", "devops"]
type: "til"
---

# TIL: Docker Volume Debugging: Finding Where Your Data Actually Lives

Spent 2 hours debugging why data wasn't persisting. Turns out, understanding Docker volumes is crucial.

## The Problem

I had a container with a volume mount, but couldn't figure out where the data was actually stored on the host:

```bash
docker run -v mydata:/data myapp
```

Where is `mydata`? What's inside it?

## The Solution

### Find Volume Location

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

The `Mountpoint` tells you exactly where the data lives!

### View Volume Contents (The Trick)

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

## Better: Named Volume Inspection

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

## Debugging Bind Mounts

For bind mounts (host path to container):

```bash
docker run -v /host/path:/container/path myapp
```

To see what the container actually sees:

```bash
docker exec -it container_name ls -la /container/path
```

## Common Volume Issues

### Issue 1: Volume Not Mounting

```bash
# Check if volume exists
docker volume ls | grep mydata

# Create it if missing
docker volume create mydata
```

### Issue 2: Wrong Permissions

```bash
# Check ownership in volume
docker run --rm -v mydata:/data alpine ls -ln /data

# Fix permissions (if needed)
docker run --rm -v mydata:/data alpine chown -R 1000:1000 /data
```

### Issue 3: Dangling Volumes

```bash
# List dangling volumes (not used by any container)
docker volume ls -f dangling=true

# Remove them
docker volume prune

# Be careful! This deletes data!
```

### Issue 4: Volume vs Bind Mount Confusion

```bash
# Named volume (managed by Docker)
-v mydata:/data

# Bind mount (you manage the host path)
-v /host/path:/data
-v $(pwd):/data

# Anonymous volume (Docker creates and manages)
-v /data
```

## Pro Tips

### 1. Backup a Volume

```bash
# Backup volume to tar file
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mydata-backup.tar.gz -C /data .
```

### 2. Restore a Volume

```bash
# Restore from backup
docker run --rm \
  -v mydata:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mydata-backup.tar.gz -C /data
```

### 3. Copy Volume to Another

```bash
# Copy all data from vol1 to vol2
docker run --rm \
  -v vol1:/source:ro \
  -v vol2:/dest \
  alpine sh -c "cp -av /source/. /dest/"
```

### 4. Clone a Volume

```bash
# Create new volume as copy of existing
docker volume create vol2
docker run --rm \
  -v vol1:/source:ro \
  -v vol2:/dest \
  alpine cp -av /source/. /dest/
```

## Real-World Example

I was debugging a database that wasn't persisting data:

```bash
# Check if volume exists
docker volume inspect postgres_data
# Error: No such volume

# Ah! The docker-compose.yml had a typo
# It said: postgress_data (3 s's)
# Should be: postgres_data (2 s's)

# Found all volumes
docker volume ls
# Found: postgress_data (the typo!)

# Renamed it
docker volume create postgres_data
docker run --rm \
  -v postgress_data:/source \
  -v postgres_data:/dest \
  alpine cp -av /source/. /dest/

# Removed the typo volume
docker volume rm postgress_data
```

## Useful One-Liners

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

## The Gotcha I Learned

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

This one trick would have saved me those 2 hours. Now you know!

