---
title: "Two zsh functions for one-line AI answers: `p` to read, `d` to run"
date: "2026-05-20"
tags: ["zsh", "shell", "ai", "cli", "productivity"]
excerpt: "Opening a chat UI to ask 'what's the kubectl command to decode a secret' is too much friction. Two tiny zsh wrappers — one prints the answer, one pre-types the command into your next prompt — kill the context switch entirely."
---

I kept opening a chat tab just to ask "what's the kubectl command for decoding a secret" or "convert 42 GiB to bytes". The context switch was costing more than the answer was worth.

The first attempt was a single function — `p` — that wrapped my AI CLI and printed a one-liner to stdout. That was good for facts and math but awkward for commands you actually wanted to run (select, copy, paste, hope you didn't grab the trailing newline).

The second iteration split it into two functions with two different output strategies. That split is the whole point of this post.

## the two functions

```zsh
# p: one-shot AI answer printed to terminal (read it)
# Use for: math, facts, explanations, "what's the syntax for X"
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

# d: AI suggests a shell command, pre-typed into your next prompt (review + Enter)
# Use for: "find all log files modified today", "git undo last commit"
d() {
  emulate -L zsh
  setopt NO_GLOB
  local query="$*"
  local prompt="You are a command line expert. The user wants to run a command but they don't know how. Here is what they asked: ${query}. Return ONLY the exact shell command needed. No explanation, no markdown, no code blocks — just the raw command."
  local cmd
  cmd=$(droid exec -m glm-4.6 -r off --output-format text --disabled-tools execute-cli -- "$prompt" \
    | tr -d '\000-\037' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  print -z -- "$cmd"
}
alias d='noglob d'
```

`pi` and `droid` are just whatever AI CLIs you have installed — swap in `claude -p`, `llm`, `gh copilot suggest`, `ollama run`. The pattern doesn't care.

## the key idea: `print -z` for runnable commands

`print -z` is the trick that makes `d` better than every alternative. It pushes text onto the zsh line editor buffer — i.e. into your next prompt, pre-typed and ready.

```
$ d find all log files modified today
# next prompt now shows, with your cursor at the end:
$ find . -type f -name "*.log" -mtime -1█
# you eyeball it, edit if needed, hit Enter
```

Compare to the other options:

| Strategy | Speed | Safety | Friction |
|----------|-------|--------|----------|
| `eval "$(...)"` | fastest | **bad** — auto-runs model output | none |
| Pipe to `pbcopy` | medium | safe | switch focus, paste |
| Print to stdout | medium | safe | select + copy + paste |
| **`print -z`** | **fastest** | **safe** — you review before Enter | **none** |

The mental model: `print -z` is what `Ctrl-R` history search does when you select a result. Native zsh. Zero risk of auto-execution because *you* press Enter, not the script.

## the key idea: `p` and `d` are for different jobs

| | `p` | `d` |
|---|---|---|
| Output goes to | stdout (terminal) | next prompt buffer |
| You then | read it | edit / press Enter to run |
| Best for | "what" / "why" / "how much" | "do" |
| Example | `p convert 42 GiB to bytes` → `45097156608` | `d find files larger than 100MB` → `find . -size +100M` |

Keeping both is the right call. Different muscle memory for different intents. `p` when you'd otherwise open a chat tab; `d` when you'd otherwise reach for `man` or stackoverflow.

## defensive measures that earn their keep

Three small things prevent annoying edge cases:

### `noglob` on the alias

```zsh
alias p='noglob p'
alias d='noglob d'
```

Without this, `d list all *.log files` would have zsh expand `*.log` against the current directory *before* the function ever sees it. With `noglob`, the glob characters pass through literally. Same trick git uses for things like `git log` arguments.

### `emulate -L zsh` + `setopt NO_GLOB` inside the function

```zsh
emulate -L zsh
setopt NO_GLOB
```

`emulate -L zsh` resets shell options to defaults, scoped to this function only (the `-L` means local). `NO_GLOB` is belt-and-suspenders in case someone invokes the function bypassing the alias (e.g. `command d ...`, `\d ...`, or calling it from a script). Both are cheap; both have saved me.

### output sanitization

```zsh
tr -d '\000-\037' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
```

`tr -d '\000-\037'` strips all C0 control characters — that includes ANSI escape sequences (ESC = `\033`), stray nulls, and any invisible cruft the model might emit. For `d` specifically, this matters because `print -z` with control characters in the payload corrupts the line editor.

`sed` then trims leading and trailing whitespace, which models love to add.

## what it feels like in practice

```
# p — answer questions, read the result
$ p whats 2 + 2
4

$ p capital of mongolia
Ulaanbaatar

$ p regex for matching an email
[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

$ p kubectl secret decode grafana
kubectl get secret grafana -o go-template='{{range $k,$v := .data}}{{$k}}: {{$v | base64decode}}{{"\n"}}{{end}}'

# d — get a command pre-typed, hit Enter
$ d delete all docker containers exited more than a week ago
# next prompt:
$ docker container prune --filter "until=168h"█

$ d show disk usage by directory, sorted, human-readable
# next prompt:
$ du -sh ./*/ 2>/dev/null | sort -h█
```

I use both within the same minute — `p` to understand, `d` to execute.

## why `"$*"` and not `"$@"`

`"$*"` joins all positional args into one string with spaces between them. `"$@"` passes them as separate args, which most AI CLIs would concatenate anyway — but some treat the first positional as the prompt and the rest as files (`@file.txt` syntax is common). Joining explicitly avoids that ambiguity.

If your CLI of choice supports `--` to end option parsing, prefer:

```zsh
your-ai-cli -p ... -- "$*"
```

`pi` doesn't accept `--`, hence the bare `"$*"`.

## the system-prompt nudge actually matters

Without `--append-system-prompt`, even with `-p`, the default coding-assistant prompt loves to wrap shell commands in code fences and add a one-sentence intro. That breaks copy-paste and clutters the terminal.

The phrasing that worked best in testing:

> Answer in ONE line. No preamble, no explanation, no markdown, no code fences. For shell/kubectl/git/etc requests output only the command. For factual or math questions output only the answer.

"No markdown, no code fences" is doing most of the work. Without it you get backtick-wrapped output that won't pipe.

## why this beats the chat UI for short questions

| Action | Chat UI | `p` / `d` |
|--------|---------|-----------|
| Switch context | yes | no |
| Round-trip latency | ~3-5s + UI | ~1-2s |
| Output format | markdown, prose | bare line |
| Get command into shell | select + copy + paste | already there (`d`) or in scrollback (`p`) |
| Session pollution | yes | no (`--no-session`) |
| Glob-expansion footgun | n/a | guarded (`noglob`) |

For anything longer than a paragraph the chat UI is still better. For "what's the syntax for X" or "the command for Y", terminal wins every time.

## the meta-lesson

The friction between "I have a question" and "I have an answer" — or "I have an intent" and "I have the command running" — is almost entirely UI, not model latency.

Two short shell functions removed it. The interesting part isn't the AI; it's `print -z`.
