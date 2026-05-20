---
title: "A 7-line shell function for one-liner AI answers"
date: "2026-05-20"
tags: ["zsh", "shell", "ai", "cli", "productivity"]
excerpt: "Opening a chat UI to ask 'what's the kubectl command to decode a secret' is too much friction. A tiny zsh wrapper around an AI CLI gives you one-line answers in your terminal."
---

I kept opening a chat tab just to ask "what's the kubectl command for decoding a secret" or "convert 42 GiB to bytes". The context switch was costing more than the answer was worth.

Wrapped my AI CLI (`pi` here, but the same shape works for `claude -p`, `llm`, `gh copilot`, etc.) into a `p` function that always returns a single line.

## the function

```zsh
# p: one-shot AI query — `p whats 2 + 2`, `p kubectl secret decode grafana`
p() {
  if [ $# -eq 0 ]; then
    echo "usage: p <question or task>" >&2
    return 1
  fi
  pi -p --no-session --append-system-prompt 'Answer in ONE line. No preamble, no explanation, no markdown, no code fences. For shell/kubectl/git/etc requests output only the command. For factual or math questions output only the answer.' "$*"
}
```

Three flags carry all the weight:

- `-p` — non-interactive, print and exit
- `--no-session` — don't persist to session history, every call is ephemeral
- `--append-system-prompt` — force one-line, no markdown, no preamble

## what it feels like

```
$ p whats 2 + 2
4

$ p kubectl secret decode grafana
kubectl get secret grafana -o go-template='{{range $k,$v := .data}}{{$k}}: {{$v | base64decode}}{{"\n"}}{{end}}'

$ p convert 42 GiB to bytes
45097156608

$ p git undo last commit but keep changes
git reset --soft HEAD~1

$ p regex for matching an email
[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}
```

No chat window, no scrolling, no "Certainly! Here's the command you asked for:" preamble. Just the answer.

## why `"$*"` and not `"$@"`

`"$*"` joins all positional args into one string with spaces between them. `"$@"` would pass them as separate args, which most AI CLIs would then concatenate anyway — but some treat the first positional as the prompt and the rest as files. Joining explicitly avoids that ambiguity.

If your CLI of choice supports `--` to end option parsing, prefer:

```zsh
your-ai-cli -p ... -- "$*"
```

`pi` doesn't, hence the bare `"$*"`.

## the system-prompt nudge actually matters

Without `--append-system-prompt`, even with `-p`, the default coding-assistant prompt loves to wrap shell commands in code fences and add a one-sentence intro. That breaks copy-paste and clutters the terminal.

The phrasing that worked best in testing:

> Answer in ONE line. No preamble, no explanation, no markdown, no code fences. For shell/kubectl/git/etc requests output only the command. For factual or math questions output only the answer.

The "No markdown, no code fences" line is doing most of the work. Without it you get backtick-wrapped output that won't pipe.

## variations worth knowing

Pipe directly into `pbcopy` for instant copy:

```zsh
pc() { p "$@" | tee /dev/tty | pbcopy }
```

Now `pc git squash last 3 commits` prints the command and copies it.

Pipe straight into `eval` if you trust it (don't):

```zsh
pe() { eval "$(p "$@")" }
```

I have `pc` but not `pe`. Auto-executing model output is a bad habit even when it's almost always right.

## why this beats the chat UI for short questions

| Action | Chat UI | `p` |
|--------|---------|-----|
| Switch context | yes | no |
| Round-trip latency | ~3-5s + UI | ~1-2s |
| Output format | markdown, prose | bare line |
| Copy command | select + copy | already in scrollback |
| Session pollution | yes | no (`--no-session`) |

For anything longer than a paragraph the chat UI is still better. For "what's the syntax for X", terminal wins every time.

## the meta-lesson

The friction between "I have a question" and "I have an answer" is mostly UI, not model latency. A 7-line shell function removed almost all of it.
