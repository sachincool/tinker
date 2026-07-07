---
title: "The git commands I actually run every day"
date: "2026-05-20"
tags: ["git", "shell", "zsh", "productivity", "devops"]
excerpt: "Ten years of git, distilled to the daily eight, an fzf branch picker, and the weekly pruning ritual."
featured: true
---

![A newspaper-style poster titled The Daily Eight, listing the eight git aliases I run most: gst, glola, gd/gds, gcam, gpsup, gco/gcb, gpf, gfa, each paired with its expansion in mono caps.](/images/daily-git-commands/hero.png)

*Fig. 1 · the eight aliases that survive every refactor, every job, every laptop.*

I've been using git for a decade and most of what I type still fits on a single hand. The 200-page Pro Git book is wonderful and almost none of it survives contact with a real Tuesday. What survives is a small, boring set of commands that get rerun constantly.

This post is that list, ordered by how often my fingers actually type them. Aliases are from the oh-my-zsh `git` plugin (enabled in most zsh configs that exist); the full command sits next to the alias so it's portable.

## the daily eight

These are the ones I'd type in my sleep. If you're not using all eight already, picking them up pays back inside a week.

### gst
*git status*

```bash
gst
```

I run this between every other command. It's the cheapest sanity check git has. Branch, ahead/behind, staged, unstaged, untracked. Two seconds. If you only learn one alias, learn this one.

### glola
*git log --oneline --graph --decorate --all*

```bash
glola | head -30
```

The one true log. Graph of every branch (local + remote), one line per commit, colored refs. Pipe through `head` because most of the time you only care about the last 20-30 commits.

### gd / gds
*git diff / git diff --staged*

```bash
gd          # what's changed but not staged
gds         # what's staged and about to be committed
```

`gds` before every commit. If you set [delta](https://github.com/dandavison/delta) as your pager (`brew install git-delta`, then `pager = delta` in `~/.gitconfig`), the output stops being painful to read.

### gcam
*git commit -a -m*

```bash
gcam "fix: trailing slash in webhook URL"
```

Quick one-line commits for small fixes. For anything bigger I drop the `-m` and let `$EDITOR` open so I can write a proper message with a body.

### gpsup
*git push --set-upstream origin \<current-branch\>*

```bash
gpsup
```

First push of a new branch. The full command is annoying to type, so `gpsup` figures out the current branch name itself. After the first push, plain `gp` (just `git push`) works because upstream is set.

### gco / gcb
*git checkout / git checkout -b*

```bash
gco main             # switch to main
gco -                # switch to previous branch
gcb feature/login    # create + switch to new branch
```

`gco -` is the one to notice. Like `cd -` for branches. When you're bouncing between two branches all day, it's a single keystroke each way instead of typing the name.

### gpf
*git push --force-with-lease*

```bash
gpf
```

After rebasing or amending. **Always use `--force-with-lease`, never `--force`.** The lease version refuses to push if someone else has pushed to your branch since your last fetch, saving you from silently overwriting a teammate's work. There is no good reason to ever type `--force` in 2026.

### gfa
*git fetch --all --prune*

```bash
gfa
```

Refresh every remote, prune deleted remote branches. Run before you start anything that depends on knowing the current state of the world. The `--prune` half is what makes the cleanup ritual below work.

## checkout recent branches

`git branch` lists alphabetically, which is useless. What you actually want is "that branch from Tuesday," which means sorting by last commit:

```bash
git config --global alias.recent \
  "for-each-ref --sort=-committerdate refs/heads/ \
   --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) \
             %(color:green)(%(committerdate:relative))%(color:reset) %(contents:subject)'"

git recent | head -10
```

That covers looking. For switching, pipe the same list into fzf and you never type a branch name again:

```zsh
# fco: fuzzy-checkout a recent branch
fco() {
  local branch
  branch=$(git for-each-ref --sort=-committerdate refs/heads/ \
             --format='%(refname:short)' \
           | fzf --height 40% --reverse \
                 --preview 'git log --oneline --decorate --color=always -15 {}')
  [ -n "$branch" ] && git checkout "$branch"
}
```

Branches arrive sorted by recency, so the one you want is almost always in the top three. Type two letters of its name, Enter, done. The preview pane shows the branch's recent commits so you can confirm it's the right Tuesday. `gco -` still wins for bouncing between exactly two branches; `fco` wins for everything else. (`brew install fzf` if you don't have it. You want it for `Ctrl-R` history search anyway.)

## the cleanup ritual

Run this weekly. If you've ever scrolled through 80 stale branches looking for the one you actually want, you already know why.

The easy half deletes every local branch whose tip is already in `main`:

```bash
gfa
git branch --merged main | grep -v '\*\|main\|master' | xargs -n1 git branch -d
```

Works only if your team uses merge commits. Most don't. GitHub's "Squash and merge" creates a brand-new commit on `main` with a different SHA, so `git branch --merged` never catches your local branch. Its commits aren't in main's history at all.

The workaround: after `gfa`, any branch whose tracked remote was deleted shows as `[gone]`. Those are *usually* your merged-and-deleted PRs.

Usually, not always. `[gone]` only means the remote tracking branch is gone. Nearly always that's a squash-merged PR whose branch GitHub auto-deleted. But it can also be a branch you pushed, someone deleted server-side, and you never merged. So don't force-delete every `[gone]` branch with `git branch -D`. I once watched one show `[gone]` while it still held 26 unmerged commits; a force-delete there loses them for good.

So check each `[gone]` branch for patch-equivalence against the base *before* deleting. Squash-merges get caught, genuinely unmerged work gets kept. This lives in my `~/.gitconfig` as `git gone`:

```bash
# ~/.gitconfig, under [alias]  →  run as: git gone
gone = "!f() { \
    git fetch --all --prune; \
    base=$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null); base=${base:-origin/main}; \
    for b in $(git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads \
               | awk '$2==\"[gone]\"{print $1}'); do \
      if [ -z \"$(git cherry \"$base\" \"$b\" | grep '^+')\" ]; then git branch -D \"$b\"; \
      else echo \"kept $b (commits not in $base)\"; fi; \
    done; }; f"
```

One command does the whole ritual: the `git fetch --all --prune` prunes the dead remote refs, then the loop deletes the merged local branches in the same pass. No separate `gfa` first.

`git cherry` compares by patch-id, not SHA. A squash-merged branch shows every commit as `-` (an equivalent already exists in the base) and gets deleted; a branch with real unpushed work shows `+` lines and stays. The `-D` is only reached after patch-equivalence is proven, so it never eats unmerged work.

Or install [`git-trim`](https://github.com/foriequal0/git-trim) (`brew install git-trim`), which does the same classification and more. It catches squash-merges even when the tracking ref isn't `[gone]`, and skips diverged branches by default.

```bash
git trim                # dry-run
git trim --confirm      # actually delete
```

This is the closest thing to "did my PR ship?" you can ask git directly.

## the weekly four

Not in your fingers yet, but should be.

### `git switch` and `git restore`

```bash
git switch -c new-feature           # create + switch
git restore --staged file.txt       # unstage
git restore --source=abc123 file.go # restore single file from any commit
```

`switch` and `restore` split the four jobs `checkout` used to do. The one I reach for most is `restore --source=<sha> <path>`. Translation: "grab this single file from three commits ago without touching anything else."

### interactive rebase with autosquash

```bash
git commit --fixup=abc123       # fixup commit targeting abc123
# ... keep working ...
git rebase -i --autosquash main # all fixups slot into place automatically
```

The single biggest workflow win I've found in ten years of git. While reviewing your own PR you find a bug four commits back. Don't fix it on top. `--fixup=<sha>` creates a commit targeting the offender, and the autosquash rebase squashes everything into place when you're done. Install [git-absorb](https://github.com/tummychow/git-absorb) (`brew install git-absorb`) and it even picks the target SHA for you: edit the files, run `git absorb --and-rebase`, done.

### `git reflog`, the universal undo

```bash
git reflog
git reset --hard HEAD@{5}
```

Every change to `HEAD` is logged for 90 days. Bad rebase? `reflog`. Deleted branch? `reflog`. There is almost nothing in git you can't undo if you know about it.

### `git worktree`

```bash
git worktree add ../proj-hotfix hotfix/prod-down
git worktree remove ../proj-hotfix
```

Need to fix a prod bug while halfway through a feature? Don't stash. `worktree add` gives you a second checkout in a sibling directory, sharing the same `.git`. I use it constantly for "let me review your PR" without leaving my own branch.

## set it once

Five config lines and a daemon. Enable, forget.

```bash
git config --global rerere.enabled true          # remember conflict resolutions, replay them
git config --global push.default current         # `git push` pushes current branch to same name
git config --global push.autoSetupRemote true    # first push sets upstream automatically
git config --global diff.algorithm histogram     # cleaner diffs than the default myers
git config --global merge.conflictStyle zdiff3   # conflict markers include the common ancestor
git maintenance start                            # background gc/prefetch on a schedule
```

`autoSetupRemote` retires `gpsup` entirely. `zdiff3` shows the original code both sides diverged from; once you've used it, plain `<<<<<<<` markers feel like flying blind.

## when something is broken

Not daily, but when the question is "when did this start," nothing else answers it:

```bash
git log -S "functionName"          # pickaxe: commits where this string was added or removed
git blame -w -C -C -C file.go      # blame the logic's actual author, not the formatter
git log -p --follow file.go        # full file history, including across renames
git range-diff @{u} @              # what a rebase actually changed; run before force-pushing
```

`-S` searches the content of the diff, not commit messages. Different thing entirely from `--grep`. And plain `blame` gives credit to whoever last ran Prettier; `-w -C -C -C` follows the code across whitespace changes, moves, and file boundaries to the person who wrote the logic.

## the four tools worth installing today

- **[fzf](https://github.com/junegunn/fzf)** (`brew install fzf`). Powers the `fco` branch picker above, plus fuzzy `Ctrl-R` history.
- **[git-absorb](https://github.com/tummychow/git-absorb)** (`brew install git-absorb`). Auto-fixup commits without picking SHAs.
- **[delta](https://github.com/dandavison/delta)** (`brew install git-delta`). Diff and blame output that doesn't hurt to look at.
- **[lazygit](https://github.com/jesseduffield/lazygit)** (`brew install lazygit`). TUI for the operations that are tedious on CLI: partial commits, stash management, conflict resolution.

This post used to end with two AI shell helpers for the stuff git can't tell you; those now live in [their own TIL](/til/one-line-ai-shell-helper).

## ten years in, the surprise

After a decade, the command I run most isn't `commit`. It isn't `push`. It's `gst`, hundreds of times a day, between every other operation. The most-used git command in my shell is the one that does nothing.
