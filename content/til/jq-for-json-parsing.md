---
title: "jq Magic: Parse JSON Like a Pro"
date: "2024-12-08"
tags: ["jq", "json", "linux", "command-line", "productivity"]
type: "til"
---

# TIL: jq Magic: Parse JSON Like a Pro

`jq` is like `sed` for JSON. Once you learn it, you'll wonder how you ever lived without it.

## Installation

```bash
# Mac
brew install jq

# Ubuntu/Debian
apt-get install jq

# CentOS/RHEL
yum install jq
```

## Basic Usage

### Pretty Print JSON

```bash
# Ugly JSON from API
curl https://api.example.com/data | jq '.'
```

Output is now colored and formatted!

### Extract a Field

```bash
echo '{"name": "John", "age": 30}' | jq '.name'
# "John"

# Remove quotes
echo '{"name": "John", "age": 30}' | jq -r '.name'
# John
```

`-r` = raw output (no quotes)

## Array Operations

### Get First Element

```bash
echo '[1, 2, 3, 4, 5]' | jq '.[0]'
# 1
```

### Get Last Element

```bash
echo '[1, 2, 3, 4, 5]' | jq '.[-1]'
# 5
```

### Get Array Length

```bash
echo '[1, 2, 3, 4, 5]' | jq 'length'
# 5
```

### Extract Field from All Array Items

```bash
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq '.[].name'
# "Alice"
# "Bob"

# Or use map
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq 'map(.name)'
# ["Alice", "Bob"]
```

## Real-World Examples

### 1. Parse Docker Images

```bash
docker images --format='{{json .}}' | jq -r '.Repository + ":" + .Tag + "\t" + .Size'
```

### 2. Get All Pod Names in Kubernetes

```bash
kubectl get pods -o json | jq -r '.items[].metadata.name'
```

### 3. Extract Specific AWS EC2 Info

```bash
aws ec2 describe-instances | jq -r '.Reservations[].Instances[] | "\(.InstanceId)\t\(.State.Name)\t\(.PrivateIpAddress)"'
```

### 4. Parse Package.json Dependencies

```bash
cat package.json | jq -r '.dependencies | keys[]'
```

### 5. Get GitHub API Data

```bash
curl -s https://api.github.com/users/torvalds | jq '{name, bio, public_repos, followers}'
```

## Filtering

### Filter Array Items

```bash
# Get users older than 25
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq '.[] | select(.age > 25)'
```

### Multiple Conditions

```bash
# AND condition
jq '.[] | select(.age > 25 and .name == "Bob")'

# OR condition
jq '.[] | select(.age > 25 or .name == "Alice")'
```

### Check if Field Exists

```bash
jq '.[] | select(.email != null)'
```

## Transforming Data

### Create New Object

```bash
echo '{"first": "John", "last": "Doe", "age": 30}' | jq '{fullname: (.first + " " + .last), age}'
# {
#   "fullname": "John Doe",
#   "age": 30
# }
```

### Rename Fields

```bash
echo '{"old_name": "value"}' | jq '{new_name: .old_name}'
```

### Add Field

```bash
echo '{"name": "John"}' | jq '. + {age: 30}'
# {
#   "name": "John",
#   "age": 30
# }
```

## Sorting

```bash
# Sort array of objects by field
echo '[{"name": "Bob", "age": 30}, {"name": "Alice", "age": 25}]' | jq 'sort_by(.age)'

# Reverse sort
jq 'sort_by(.age) | reverse'
```

## Grouping

```bash
# Group by field
echo '[{"type": "A", "value": 1}, {"type": "B", "value": 2}, {"type": "A", "value": 3}]' | jq 'group_by(.type)'
```

## Useful One-Liners

### Count Items by Type

```bash
jq 'group_by(.type) | map({type: .[0].type, count: length})'
```

### Sum Values

```bash
echo '[{"value": 10}, {"value": 20}, {"value": 30}]' | jq '[.[].value] | add'
# 60
```

### Get Unique Values

```bash
echo '[1, 2, 2, 3, 3, 3]' | jq 'unique'
# [1, 2, 3]
```

### Find Min/Max

```bash
echo '[10, 5, 20, 15]' | jq 'min'
# 5

echo '[10, 5, 20, 15]' | jq 'max'
# 20
```

## Advanced: CSV Output

```bash
# Convert JSON to CSV
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq -r '.[] | [.name, .age] | @csv'
# "Alice",25
# "Bob",30
```

## Advanced: Nested Data

```bash
# Deep extraction
echo '{"user": {"profile": {"name": "John"}}}' | jq '.user.profile.name'
# "John"

# Safe navigation (don't error if missing)
echo '{"user": {}}' | jq '.user.profile.name // "N/A"'
# "N/A"
```

## Practical Scripts

### Check All Service Status

```bash
#!/bin/bash
curl -s http://api/services | jq -r '.[] | 
  if .status == "up" then
    "\(.name): ✓"
  else
    "\(.name): ✗ (DOWN)"
  end'
```

### Parse AWS Cost Report

```bash
#!/bin/bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost | \
  jq -r '.ResultsByTime[] | .TimePeriod.Start + "\t$" + .Total.BlendedCost.Amount'
```

### Monitor Log Errors

```bash
#!/bin/bash
kubectl logs -f pod-name | jq -r 'select(.level == "error") | "\(.timestamp): \(.message)"'
```

## Debug jq Expressions

Use `jq` playground: https://jqplay.org/

Or test step by step:

```bash
# Start simple
echo '{"a": {"b": {"c": 1}}}' | jq '.'

# Add one level
echo '{"a": {"b": {"c": 1}}}' | jq '.a'

# Add another
echo '{"a": {"b": {"c": 1}}}' | jq '.a.b'

# Final
echo '{"a": {"b": {"c": 1}}}' | jq '.a.b.c'
```

## Common Patterns I Use

### 1. Pretty Print and Save

```bash
curl -s api.example.com/data | jq '.' > formatted.json
```

### 2. Extract and Process

```bash
curl -s api | jq -r '.items[] | select(.active) | .id' | while read id; do
  echo "Processing $id"
  # do something with $id
done
```

### 3. Combine Multiple JSON Files

```bash
jq -s '.' file1.json file2.json file3.json > combined.json
```

### 4. Update JSON File In-Place

```bash
# Add a field
jq '.version = "2.0"' package.json > temp.json && mv temp.json package.json

# Or use sponge (from moreutils)
jq '.version = "2.0"' package.json | sponge package.json
```

## The Gotcha

Remember to use `-r` for raw output when you want to use the result in bash:

```bash
# Wrong (includes quotes)
NAME=$(echo '{"name": "John"}' | jq '.name')
echo $NAME
# "John"

# Right (no quotes)
NAME=$(echo '{"name": "John"}' | jq -r '.name')
echo $NAME
# John
```

`jq` has completely changed how I interact with APIs and JSON data. No more manual parsing or Python scripts for simple tasks!

## Cheat Sheet

```bash
jq '.'                      # Pretty print
jq -r '.field'             # Raw output (no quotes)
jq '.field'                # Get field
jq '.[0]'                  # First array element
jq '.[]'                   # All array elements
jq 'length'                # Length
jq 'keys'                  # Object keys
jq '.[] | select(.x > 5)'  # Filter
jq 'map(.field)'           # Map
jq 'sort_by(.field)'       # Sort
jq 'group_by(.field)'      # Group
jq 'add'                   # Sum array
jq 'unique'                # Unique values
jq -s '.'                  # Slurp (combine files)
```

Go forth and parse JSON like a wizard! 🧙‍♂️

