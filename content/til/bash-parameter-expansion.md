---
title: "Bash Parameter Expansion: String Manipulation Without External Commands"
date: "2024-12-17"
tags: ["bash", "shell", "linux", "scripting"]
type: "til"
---

# TIL: Bash Parameter Expansion: String Manipulation Without External Commands

Learned that Bash has built-in string manipulation that's way faster than calling `sed`, `awk`, or `cut`.

## The Old Way (Slow)

```bash
filename="document.pdf"
name=$(echo "$filename" | sed 's/\.[^.]*$//')  # document
ext=$(echo "$filename" | sed 's/^.*\.//')      # pdf
```

Each `echo | sed` spawns a new process. Slow in loops.

## The New Way (Fast)

```bash
filename="document.pdf"
name="${filename%.*}"    # document
ext="${filename##*.}"    # pdf
```

No external processes. Pure Bash.

## Common Patterns

### Remove File Extension

```bash
file="archive.tar.gz"
echo "${file%.*}"       # archive.tar
echo "${file%%.*}"      # archive (remove all extensions)
```

`%` = remove from end (shortest match)
`%%` = remove from end (longest match)

### Get File Extension

```bash
file="archive.tar.gz"
echo "${file#*.}"       # tar.gz
echo "${file##*.}"      # gz (last extension only)
```

`#` = remove from start (shortest match)
`##` = remove from start (longest match)

### String Replacement

```bash
path="/home/user/documents/file.txt"

# Replace first occurrence
echo "${path/user/admin}"        # /home/admin/documents/file.txt

# Replace all occurrences
echo "${path//o/0}"              # /h0me/user/d0cuments/file.txt

# Replace at start
echo "${path/#\/home/\/root}"    # /root/user/documents/file.txt

# Replace at end
echo "${path/%.txt/.md}"         # /home/user/documents/file.md
```

### Default Values

```bash
# Use default if variable is unset or empty
echo "${VAR:-default}"

# Assign default if unset
echo "${VAR:=default}"

# Error if unset
echo "${VAR:?Variable is required}"

# Use alternate value if set
echo "${VAR:+value_if_set}"
```

### Substring Extraction

```bash
text="Hello World"
echo "${text:0:5}"       # Hello (from pos 0, length 5)
echo "${text:6}"         # World (from pos 6 to end)
echo "${text: -5}"       # World (last 5 chars, note the space!)
echo "${text::-6}"       # Hello (remove last 6 chars)
```

### String Length

```bash
text="Hello World"
echo "${#text}"          # 11
```

### Case Conversion

```bash
text="Hello World"
echo "${text^^}"         # HELLO WORLD (all uppercase)
echo "${text,,}"         # hello world (all lowercase)
echo "${text^}"          # Hello World (first char uppercase)
echo "${text,}"          # hello World (first char lowercase)
```

## Real-World Example

Before (slow with multiple processes):

```bash
#!/bin/bash
for file in *.log; do
    name=$(basename "$file" .log)
    date=$(echo "$name" | cut -d'-' -f1)
    gzip "$file"
    mv "${file}.gz" "archive-${date}.gz"
done
```

After (fast, pure Bash):

```bash
#!/bin/bash
for file in *.log; do
    name="${file%.log}"      # Remove .log
    date="${name%%-*}"       # Get everything before first -
    gzip "$file"
    mv "${file}.gz" "archive-${date}.gz"
done
```

## Cheat Sheet

| Pattern | Effect | Example |
|---------|--------|---------|
| `${var%pattern}` | Remove shortest match from end | `${file%.txt}` |
| `${var%%pattern}` | Remove longest match from end | `${file%%.*}` |
| `${var#pattern}` | Remove shortest match from start | `${file#*/}` |
| `${var##pattern}` | Remove longest match from start | `${file##*/}` |
| `${var/old/new}` | Replace first occurrence | `${text/foo/bar}` |
| `${var//old/new}` | Replace all occurrences | `${text//foo/bar}` |
| `${var:offset:length}` | Substring | `${text:0:5}` |
| `${#var}` | Length | `${#text}` |
| `${var^^}` | Uppercase | `${text^^}` |
| `${var,,}` | Lowercase | `${text,,}` |

## Why This Matters

In a script processing 10,000 files:
- **With external commands**: ~5 minutes
- **With parameter expansion**: ~10 seconds

That's a 30x speedup!

## One Gotcha

Be careful with spaces in substring extraction:

```bash
text="Hello"
echo "${text: -3}"    # llo (CORRECT - note the space)
echo "${text:-3}"     # Hello (WRONG - default value syntax!)
```

This simple trick has made my shell scripts so much faster. No more unnecessary `sed`/`awk`/`cut` calls!

