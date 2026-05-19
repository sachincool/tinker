---
title: "jq: the command-line JSON parser that earns its keep"
date: "2024-12-08"
tags: ["jq", "json", "linux", "command-line", "productivity"]
excerpt: "jq is sed for JSON. The patterns I use weekly — filtering, transforming, grouping — and the one-liner that replaced every Python parsing script I had."
---

`jq` is like `sed` for JSON. After a week of using it I stopped reaching for Python one-liners and never looked back.

## installation

```bash
# Mac
brew install jq

# Ubuntu/Debian
apt-get install jq

# CentOS/RHEL
yum install jq
```

## basic usage

### pretty print JSON

```bash
# Ugly JSON from API
curl https://api.example.com/data | jq '.'
```

Output is now colored and formatted.

### extract a field

```bash
echo '{"name": "John", "age": 30}' | jq '.name'
# "John"

# Remove quotes
echo '{"name": "John", "age": 30}' | jq -r '.name'
# John
```

`-r` = raw output (no quotes)

## array operations

### get first element

```bash
echo '[1, 2, 3, 4, 5]' | jq '.[0]'
# 1
```

### get last element

```bash
echo '[1, 2, 3, 4, 5]' | jq '.[-1]'
# 5
```

### get array length

```bash
echo '[1, 2, 3, 4, 5]' | jq 'length'
# 5
```

### extract field from all array items

```bash
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq '.[].name'
# "Alice"
# "Bob"

# Or use map
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq 'map(.name)'
# ["Alice", "Bob"]
```

## real-world examples

### 1. parse docker images

```bash
docker images --format='{{json .}}' | jq -r '.Repository + ":" + .Tag + "\t" + .Size'
```

### 2. get all pod names in kubernetes

```bash
kubectl get pods -o json | jq -r '.items[].metadata.name'
```

### 3. extract specific AWS EC2 info

```bash
aws ec2 describe-instances | jq -r '.Reservations[].Instances[] | "\(.InstanceId)\t\(.State.Name)\t\(.PrivateIpAddress)"'
```

### 4. parse package.json dependencies

```bash
cat package.json | jq -r '.dependencies | keys[]'
```

### 5. get GitHub API data

```bash
curl -s https://api.github.com/users/torvalds | jq '{name, bio, public_repos, followers}'
```

## filtering

### filter array items

```bash
# Get users older than 25
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq '.[] | select(.age > 25)'
```

### multiple conditions

```bash
# AND condition
jq '.[] | select(.age > 25 and .name == "Bob")'

# OR condition
jq '.[] | select(.age > 25 or .name == "Alice")'
```

### check if field exists

```bash
jq '.[] | select(.email != null)'
```

## transforming data

### create new object

```bash
echo '{"first": "John", "last": "Doe", "age": 30}' | jq '{fullname: (.first + " " + .last), age}'
# {
#   "fullname": "John Doe",
#   "age": 30
# }
```

### rename fields

```bash
echo '{"old_name": "value"}' | jq '{new_name: .old_name}'
```

### add field

```bash
echo '{"name": "John"}' | jq '. + {age: 30}'
# {
#   "name": "John",
#   "age": 30
# }
```

## sorting

```bash
# Sort array of objects by field
echo '[{"name": "Bob", "age": 30}, {"name": "Alice", "age": 25}]' | jq 'sort_by(.age)'

# Reverse sort
jq 'sort_by(.age) | reverse'
```

## grouping

```bash
# Group by field
echo '[{"type": "A", "value": 1}, {"type": "B", "value": 2}, {"type": "A", "value": 3}]' | jq 'group_by(.type)'
```

## useful one-liners

### count items by type

```bash
jq 'group_by(.type) | map({type: .[0].type, count: length})'
```

### sum values

```bash
echo '[{"value": 10}, {"value": 20}, {"value": 30}]' | jq '[.[].value] | add'
# 60
```

### get unique values

```bash
echo '[1, 2, 2, 3, 3, 3]' | jq 'unique'
# [1, 2, 3]
```

### find min/max

```bash
echo '[10, 5, 20, 15]' | jq 'min'
# 5

echo '[10, 5, 20, 15]' | jq 'max'
# 20
```

## advanced — CSV output

```bash
# Convert JSON to CSV
echo '[{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}]' | jq -r '.[] | [.name, .age] | @csv'
# "Alice",25
# "Bob",30
```

## advanced — nested data

```bash
# Deep extraction
echo '{"user": {"profile": {"name": "John"}}}' | jq '.user.profile.name'
# "John"

# Safe navigation (don't error if missing)
echo '{"user": {}}' | jq '.user.profile.name // "N/A"'
# "N/A"
```

## practical scripts

### check all service status

```bash
#!/bin/bash
curl -s http://api/services | jq -r '.[] | 
  if .status == "up" then
    "\(.name): pass"
  else
    "\(.name): fail (DOWN)"
  end'
```

### parse AWS cost report

```bash
#!/bin/bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost | \
  jq -r '.ResultsByTime[] | .TimePeriod.Start + "\t$" + .Total.BlendedCost.Amount'
```

### monitor log errors

```bash
#!/bin/bash
kubectl logs -f pod-name | jq -r 'select(.level == "error") | "\(.timestamp): \(.message)"'
```

## debug jq expressions

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

## common patterns I use

### 1. pretty print and save

```bash
curl -s api.example.com/data | jq '.' > formatted.json
```

### 2. extract and process

```bash
curl -s api | jq -r '.items[] | select(.active) | .id' | while read id; do
  echo "Processing $id"
  # do something with $id
done
```

### 3. combine multiple JSON files

```bash
jq -s '.' file1.json file2.json file3.json > combined.json
```

### 4. update JSON file in-place

```bash
# Add a field
jq '.version = "2.0"' package.json > temp.json && mv temp.json package.json

# Or use sponge (from moreutils)
jq '.version = "2.0"' package.json | sponge package.json
```

## the gotcha

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

## cheat sheet

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
