---
title: "The git commands I actually run every day"
date: "2026-05-20"
tags: ["git", "shell", "zsh", "productivity", "devops"]
excerpt: "Ten years of git, distilled. The daily eight, the weekly five, the archeology pack, and two AI shell helpers as a bonus."
featured: true
---

![A newspaper-style poster titled The Daily Eight, listing the eight git aliases I run most: gst, glola, gd/gds, gcam, gpsup, gco/gcb, gpf, gfa, each paired with its expansion in mono caps.](/images/daily-git-commands/hero.png)

*Fig. 1. The eight aliases that survive every refactor, every job, every laptop.*

I've been using git for a decade and most of what I type still fits on a single hand. The 200-page Pro Git book is wonderful and almost none of it survives contact with a real Tuesday. What survives is a small, boring set of commands that get rerun constantly, plus a handful of less-boring ones I reach for once a week and would mourn if they disappeared.

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

The one true log. Graph of every branch (local + remote), one line per commit, colored refs. Pipe through `head` because most of the time you only care about the last 20-30 commits. I have this bound to muscle memory more thoroughly than my own phone number.

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

Refresh every remote, prune deleted remote branches. Run before you start anything that depends on knowing the current state of the world. The `--prune` half is what makes the next section work.

## the weekly five

The commands that aren't in your fingers yet but should be.

### `git switch` and `git restore` (the new commands)

```bash
git switch main
git switch -c new-feature           # create + switch
git restore --staged file.txt       # unstage
git restore --source=abc123 file.go # restore single file from any commit
```

`switch` and `restore` split the four jobs `checkout` used to do. Safer because they can't accidentally do the wrong one. The one I reach for most is `restore --source=<sha> <path>`. Translation: "grab this single file from three commits ago without touching anything else."

### interactive rebase with autosquash

```bash
git commit --fixup=abc123       # fixup commit targeting abc123
git commit --fixup=abc123       # another one, still targeting
# ... keep working ...
git rebase -i --autosquash main # all fixups slot into place automatically
```

This is the single biggest workflow win I've found in ten years of git. While reviewing your own PR you find a bug four commits back. Don't fix it on top. `git commit --fixup=<sha>` creates a commit *targeting* the offender. Keep working. When you're done: `git rebase -i --autosquash main` reorders and squashes everything for you. PR history stays clean. No `// fix bug in earlier commit` commits.

Install `git-absorb` (`brew install git-absorb`) and it picks the target sha for you by looking at which lines you changed. The flow becomes:

```bash
# edit files to fix the bugs
git absorb --and-rebase
# done.
```

The first time it works on a six-commit branch you'll wonder why it isn't built into git.

### `git reflog`, the universal undo

```bash
git reflog
git reset --hard HEAD@{5}
```

Every change to `HEAD` is logged for 90 days. Bad rebase? `reflog`. Deleted branch? `reflog`. `reset --hard` to the wrong commit? `reflog`. There is almost nothing in git you can't undo if you know about it. I've never met anyone who used it as much as they should.

### `git worktree`

```bash
git worktree add ../proj-hotfix hotfix/prod-down
git worktree list
git worktree remove ../proj-hotfix
```

Need to fix a prod bug while halfway through a feature? Don't stash. `worktree add` gives you a second checkout in a sibling directory, sharing the same `.git`. Same repo, two working trees, both editable, no stash gymnastics. I use it constantly for "let me review your PR" without leaving my own branch.

### branches sorted by recency

```bash
git config --global alias.recent \
  "for-each-ref --sort=-committerdate refs/heads/ \
   --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) \
             %(color:green)(%(committerdate:relative))%(color:reset) %(contents:subject)'"

git recent | head -10
```

`git branch` lists alphabetically, which is useless. `git recent` lists by last-commit-date, which is exactly what you want when you're trying to remember the name of "that branch from Tuesday."

## the cleanup ritual

Run this weekly. If you've ever scrolled through 80 stale branches looking for the one you actually want, you already know why.

### the easy half: real merges

```bash
gfa
git branch --merged main | grep -v '\*\|main\|master' | xargs -n1 git branch -d
```

Deletes every local branch whose tip commit is already in `main`. Works only if your team uses merge commits. Most don't.

### the hard half: squash-merges

GitHub's "Squash and merge" creates a brand-new commit on `main` with a different SHA. `git branch --merged` won't catch your local branch because its commits literally aren't in main's history.

The workaround: after `gfa`, any branch whose tracked remote was deleted shows as `[gone]`. Those are your merged-and-deleted PRs.

```zsh
# git-gone: delete local branches whose remote tracking branch is gone
git-gone() {
  git fetch --prune
  local gone
  gone=$(git for-each-ref --format '%(refname:short) %(upstream:track)' refs/heads \
         | awk '$2 == "[gone]" {print $1}')
  if [ -z "$gone" ]; then
    echo "No gone branches"
    return
  fi
  echo "$gone"
  echo -n "Delete these? [y/N] "
  read -r confirm
  [[ "$confirm" == "y" ]] && echo "$gone" | xargs -r git branch -D
}
```

Or install [`git-trim`](https://github.com/foriequal0/git-trim) (`brew install git-trim`), which is smarter. It also detects patch-equivalent commits, so it catches squash-merges even when the upstream tracking ref isn't `[gone]`.

```bash
git trim                # dry-run
git trim --confirm      # actually delete
```

This is the closest thing to "did my PR ship?" you can ask git directly.

## the archeology pack

For when something is broken and the question is "when did this start."

### pickaxe, finding when a string appeared

```bash
git log -S "functionName"       # commits where this string was added or removed
git log -G "regex"              # same but with regex
```

`git log --grep` searches commit *messages*. `-S` searches the *content of the diff*. Different thing entirely. When you need to find "who introduced this line" but the answer isn't simple `blame` because the line has moved, pickaxe is the answer.

### `git blame -w -C -C -C`

```bash
git blame -w -C -C -C path/to/file.go
```

Plain `blame` is misleading. It gives credit to whoever last touched the line, which is often whoever ran a formatter. The flags:

- `-w` ignore whitespace changes
- `-C -C -C` follow code copied or moved across files, with three levels of aggressiveness

The result: the *actual* author of the logic, not the person who reformatted it. I've used these flags to chase down a bug that touched code that had moved across three files in two refactors. Plain `blame` would have pointed at a Prettier commit.

### `git log -p --follow <file>`

```bash
git log -p --follow path/to/renamed-file.go
```

Full history of a single file, *including across renames*. Default `git log` loses the trail at the rename boundary. `--follow` does not.

### `git range-diff`

```bash
git range-diff main feature-old feature-new
git range-diff @{u} @
```

After rewriting history with rebase, this shows what *actually* changed between two ranges of commits, not just file diffs. The `@{u}..@` form compares your local branch to its upstream. Run it before every force-push and you'll see exactly what you're about to overwrite. The last reviewer I worked with on a big rebase asked me to paste the `range-diff` into the PR comments instead of re-reviewing the whole thing.

## the "stop pasting from Stack Overflow" pack

Enable these once and forget about them.

### turn on rerere

```bash
git config --global rerere.enabled true
```

That's it. Git now remembers how you resolved a conflict and replays the resolution automatically the next time the same conflict appears. Saves real time on long-running rebases.

### default to safer push

```bash
git config --global push.default current
git config --global push.autoSetupRemote true
```

`current` makes `git push` push the current branch to a remote of the same name. `autoSetupRemote` means `git push` on a new branch sets upstream automatically. No more `gpsup` for the first push.

### better diff and merge UX

```bash
git config --global diff.algorithm histogram
git config --global merge.conflictStyle zdiff3
```

`histogram` produces cleaner diffs for most refactors than the default `myers`. `zdiff3` shows the common ancestor in conflict markers, i.e. the original code both sides diverged from. Once you've used it, plain `<<<<<<<` markers feel like flying blind.

### maintenance, on a schedule

```bash
git maintenance start
```

Sets up a background cron-equivalent that runs `gc`, `prefetch`, and `loose-objects` on a schedule. Repos stay fast without manual `git gc` runs.

## the three tools worth installing today

- **[git-absorb](https://github.com/tummychow/git-absorb)** (`brew install git-absorb`). Auto-fixup commits without picking SHAs.
- **[delta](https://github.com/dandavison/delta)** (`brew install git-delta`). Diff and blame output that doesn't hurt to look at.
- **[lazygit](https://github.com/jesseduffield/lazygit)** (`brew install lazygit`). TUI for the operations that are tedious on CLI: partial commits, interactive add, stash management, conflict resolution.

I don't reach for `lazygit` daily, but the day I do, usually a five-way merge conflict, it pays for itself immediately.

## bonus: two AI shell helpers for the stuff git can't tell you

Git can tell you what changed. It can't tell you the syntax for the `find` command you needed two minutes ago. Two short zsh functions wrap an AI CLI so the answer lands in the terminal instead of in a chat tab. `p` prints to stdout (for reading), `d` pre-types a command into your next prompt (for running).

```zsh
# p: one-shot AI answer printed to terminal (math, facts, regex, syntax)
p() {
  emulate -L zsh
  setopt NO_GLOB
  if [ $# -eq 0 ]; then
    echo "usage: p <question or task>" >&2
    return 1
  fi
  pi -p --no-session --append-system-prompt 'Answer in ONE line. No preamble, no explanation, no markdown, no code fences. For shell/kubectl/git/etc requests output only the command. For factual or math questions output only the answer.' "$*" \
    | tr -d '\000-\037' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}
alias p='noglob p'

# d: AI suggests a shell command, pre-typed into next prompt (review + Enter)
d() {
  emulate -L zsh
  setopt NO_GLOB
  local query="$*"
  local prompt="You are a command line expert. The user wants to run a command but they don't know how. Here is what they asked: ${query}. Return ONLY the exact shell command needed. No explanation, no markdown, no code blocks. Just the raw command."
  local cmd
  cmd=$(droid exec -m glm-4.6 -r off --output-format text --disabled-tools execute-cli -- "$prompt" \
        | tr -d '\000-\037' \
        | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  print -z -- "$cmd"
}
alias d='noglob d'
```

Swap `pi` and `droid` for whatever AI CLI you have: `claude -p`, `llm`, `gh copilot suggest`, `ollama run`. The pattern is what matters, not the backend.

### why split into two functions

Different jobs:

| | `p` (read) | `d` (run) |
|---|------------|-----------|
| Output goes to | stdout | next prompt buffer |
| You then... | read it | edit / press Enter |
| Best for | "what's the regex for X" | "find files larger than 100MB" |

### the trick: `print -z` is what makes `d` safe

`print -z` pushes text onto the zsh line editor, i.e. into your next prompt, pre-typed and ready. Compared to the alternatives:

| Strategy | Speed | Safety | Friction |
|----------|-------|--------|----------|
| `eval "$(...)"` | fastest | **bad**, auto-runs model output | none |
| Pipe to `pbcopy` | medium | safe | switch focus, paste |
| Print to stdout | medium | safe | select + copy + paste |
| **`print -z`** | **fastest** | **safe**, you press Enter | **none** |

Same trick `Ctrl-R` history search uses. Native zsh. You always see and approve the command before it runs.

### what it feels like

```
$ p git rebase abort
git rebase --abort

$ p whats the syntax for git log since a date
git log --since="2 weeks ago"

$ d find all .log files modified in the last hour
# next prompt now shows, cursor at the end:
$ find . -type f -name "*.log" -mmin -60█

$ d remove all local branches whose remote is gone
# next prompt:
$ git fetch --prune && git for-each-ref --format '%(refname:short) %(upstream:track)' refs/heads | awk '$2 == "[gone]" {print $1}' | xargs git branch -D█
```

A two-letter command, and the answer is already on the line where you wanted it.

### the three defensive details

```zsh
emulate -L zsh; setopt NO_GLOB         # function-local zsh defaults, no globbing
alias p='noglob p'                      # `p list *.log files` won't glob-expand `*.log`
tr -d '\000-\037' | sed 's/[trim]//'    # strip control chars (incl. ANSI), trim whitespace
```

`noglob` is the one most people miss. Without it, `d` `list all *.log files` would have zsh expand `*.log` against the current directory *before* the function ever sees it. With `noglob`, the glob characters pass through literally.

A single-function variant of this, with a heuristic that picks stdout vs pre-typed automatically, lives in [this TIL](/til/one-line-ai-shell-helper).

## ten years in, the surprise

After a decade, the command I run most isn't `commit`. It isn't `push`. It's `gst`, hundreds of times a day, between every other operation. The most-used git command in my shell is the one that does nothing.
