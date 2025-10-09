---
title: "Git Interactive Rebase: Clean Up Your Commit History"
date: "2024-12-19"
tags: ["git", "version-control", "productivity", "devops"]
type: "til"
---

# TIL: Git Interactive Rebase: Clean Up Your Commit History

Discovered `git rebase -i` today and it's a game-changer for cleaning up messy commit history before PR reviews.

## The Problem

My commit history looked like this:

```
fix typo
WIP
fix typo again
actually fixed it
remove console.log
```

Not exactly professional for a PR review.

## The Solution

Interactive rebase lets you edit, squash, and reorder commits:

```bash
# Rebase last 5 commits
git rebase -i HEAD~5

# Or rebase everything since branching from main
git rebase -i main
```

This opens your editor with:

```
pick 1a2b3c4 fix typo
pick 5d6e7f8 WIP
pick 9g0h1i2 fix typo again
pick 3j4k5l6 actually fixed it
pick 7m8n9o0 remove console.log

# Commands:
# p, pick = use commit
# r, reword = use commit, but edit message
# e, edit = use commit, but stop for amending
# s, squash = meld into previous commit
# f, fixup = like squash, but discard commit message
# d, drop = remove commit
```

## My Workflow

Change it to:

```
pick 1a2b3c4 fix typo
fixup 5d6e7f8 WIP
fixup 9g0h1i2 fix typo again
fixup 3j4k5l6 actually fixed it
fixup 7m8n9o0 remove console.log
```

Result: One clean commit!

## Pro Tips

**Reword commit messages:**
```
pick 1a2b3c4 fix typo
reword 5d6e7f8 add user authentication
```

**Reorder commits:**
```
pick 3j4k5l6 add tests
pick 1a2b3c4 add feature
```

**Split a commit:**
```
edit 1a2b3c4 huge commit with multiple changes
```

Then:
```bash
git reset HEAD^
git add file1.js
git commit -m "feat: add feature A"
git add file2.js
git commit -m "feat: add feature B"
git rebase --continue
```

## Warning

**Never rebase commits that have been pushed to a shared branch!** You'll rewrite history and cause conflicts for your team.

Safe:
```bash
# Your feature branch, not pushed yet
git rebase -i main
```

Dangerous:
```bash
# Main branch that others use
git checkout main
git rebase -i HEAD~5  # DON'T DO THIS!
```

## Useful Aliases

Add to your `~/.gitconfig`:

```ini
[alias]
    # Interactive rebase with the given number of latest commits
    rb = "!f() { git rebase -i HEAD~$1; }; f"
    
    # Rebase on main
    rbm = "!git fetch origin main && git rebase -i origin/main"
```

Now you can do:
```bash
git rb 5        # Rebase last 5 commits
git rbm         # Rebase on main
```

This has saved me so much embarrassment in code reviews!

