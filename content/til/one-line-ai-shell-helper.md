---
title: "A single zsh function for one-line AI answers — that knows when to pre-type the command"
date: "2026-05-20"
tags: ["zsh", "shell", "ai", "cli", "productivity"]
excerpt: "Asking a chat UI for a one-line command is too much friction. A 15-line zsh function and a `print -z` trick fix it, with one oh-my-zsh footgun along the way."
---

I kept opening a chat tab just to ask "what's the kubectl command for decoding a secret" or "convert 42 GiB to bytes". The context switch was costing more than the answer was worth.

Wrapping an AI CLI into a single shell function fixed it. The interesting part is `print -z`, plus one heuristic that needs more care than it looks.

## the function

```zsh
# p: one-shot AI query — `p whats 2 + 2`, `p kubectl secret decode grafana`
# Smart dispatch: if the answer looks like a runnable command, pre-type it into
# the next prompt (print -z). Otherwise print to stdout. Math/facts get printed,
# commands get queued for you to review and press Enter.
p() {
  emulate -L zsh
  setopt NO_GLOB
  if [ $# -eq 0 ]; then
    echo "usage: p <question or task>" >&2
    return 1
  fi
  local out
  out=$(pi -p --no-session --append-system-prompt 'Answer in ONE line. No preamble, no explanation, no markdown, no code fences. For shell/kubectl/git/etc requests output only the command. For factual or math questions output only the answer.' "$*" \
        | tr -d '\000-\037' \
        | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  if [ -z "$out" ]; then
    return 1
  fi
  local first="${out%% *}"
  if [[ "$first" == [a-zA-Z_]* ]] && whence -p "$first" >/dev/null 2>&1; then
    print -z -- "$out"
  else
    print -r -- "$out"
  fi
}
alias p='noglob p'
```

`pi` is just whatever AI CLI you have — swap in `claude -p`, `llm`, `gh copilot suggest`, `ollama run`. The pattern doesn't care about the backend.

## what it feels like

```
$ p whats 2 + 2
4

$ p capital of mongolia
Ulaanbaatar

$ p regex for matching an email
[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}

$ p kubectl secret decode grafana
# next prompt now shows, cursor at the end:
$ kubectl get secret grafana -o go-template='{{range $k,$v := .data}}{{$k}}: {{$v | base64decode}}{{"\n"}}{{end}}'█

$ p find all log files modified today
# next prompt:
$ find . -type f -name "*.log" -mtime -1█
```

Same two-letter command for both. Answers go to stdout, commands go to the prompt buffer where you can edit them before pressing Enter.

## the key idea: `print -z` for runnable output

`print -z` is the trick that makes this design work. It pushes text onto the zsh line editor — i.e. into your next prompt, pre-typed and ready. Compared to every alternative:

| Strategy | Speed | Safety | Friction |
|----------|-------|--------|----------|
| `eval "$(...)"` | fastest | **bad** — auto-runs model output | none |
| Pipe to `pbcopy` | medium | safe | switch focus, paste |
| Print to stdout | medium | safe | select + copy + paste |
| **`print -z`** | **fastest** | **safe** — you press Enter | **none** |

The mental model: `print -z` is what `Ctrl-R` history search does when you accept a result. Native zsh. You always see and approve the command before it runs.

## the heuristic: when is the answer a command?

The smart dispatch decides between `print -z` (pre-type) and `print -r` (stdout) by looking at the first word of the answer:

```zsh
if [[ "$first" == [a-zA-Z_]* ]] && whence -p "$first" >/dev/null 2>&1; then
  print -z -- "$out"
else
  print -r -- "$out"
fi
```

Two checks, both load-bearing:

1. **First char is a letter or underscore.** Excludes digits (`4`), symbols (`[`, `/`, `(`), and anything else that obviously isn't a command name.
2. **`whence -p` resolves it to a PATH executable.** Not just "this name exists in the shell" — *specifically* a real binary on disk.

Why `whence -p` and not `command -v`? Read on.

## the footgun: oh-my-zsh numeric aliases

My first attempt used `command -v "$first"` as the heuristic. It looked right. It failed in a way that took a minute to spot.

When I ran `p whats 2 + 2`, the answer was `4`, but nothing appeared in my terminal. The function exited cleanly with status 0. No error.

What had happened: oh-my-zsh's `dirhistory` plugin (loaded by default in many configs) aliases `1` through `9` to `cd -1` ... `cd -9` for jumping around the directory stack. So `command -v 4` returned true. `4` was a recognized alias, and the function tried to `print -z 4` into my prompt buffer.

In a real interactive shell, that would have stuffed `4` into my prompt invisibly (it'd appear when I hit Enter). In my non-interactive test (`zsh -ic '...'`) it disappeared into the void because there's no line editor to render the stuffed buffer.

The fix has two parts:

- **`[[ "$first" == [a-zA-Z_]* ]]`** alone would have caught it — `4` doesn't start with a letter.
- **`whence -p`** instead of `command -v` makes it doubly safe. `whence -p` only matches binaries in PATH, ignoring aliases, functions, and builtins. Aliases like `4 → cd -4` are filtered out.

Either check alone would have caught the bug. Having both means the next time I add a feature here, I don't have to remember which one was load-bearing.

## defensive details that earn their keep

Three small things prevent subtle bugs:

### `noglob` on the alias

```zsh
alias p='noglob p'
```

Without this, `p list all *.log files` would have zsh expand `*.log` against the current directory *before* the function ever sees it. With `noglob`, the glob characters pass through literally. Same trick git uses for its arguments.

### `emulate -L zsh` + `setopt NO_GLOB`

```zsh
emulate -L zsh
setopt NO_GLOB
```

`emulate -L zsh` resets shell options to defaults, scoped to this function only (the `-L` means local — they restore on return). `NO_GLOB` is belt-and-suspenders for callers that bypass the alias (`command p ...`, `\p ...`, or scripts that don't see your aliases).

### output sanitization

```zsh
tr -d '\000-\037' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
```

`tr -d '\000-\037'` strips all C0 control characters — that includes ANSI escape sequences (ESC = `\033`), stray nulls, and any invisible cruft the model might emit. Critical for `print -z` because control characters in the payload corrupt the line editor's display.

`sed` then trims leading and trailing whitespace, which the model usually adds even when told not to.

## why `"$*"` and not `"$@"`

`"$*"` joins all positional args into one string with spaces between them. `"$@"` would pass them as separate args, which most AI CLIs would concatenate anyway — but some treat the first positional as the prompt and the rest as files (the `@file.txt` convention is common). Joining explicitly avoids that ambiguity.

If your CLI supports `--` to end option parsing, prefer:

```zsh
your-ai-cli -p ... -- "$*"
```

`pi` doesn't accept `--`, hence the bare `"$*"`.

## the system-prompt nudge actually matters

Without `--append-system-prompt`, even with `-p`, the default coding-assistant prompt wraps shell commands in code fences and adds a one-sentence intro. That breaks `print -z` (code fences are not commands) and clutters the terminal.

The phrasing that worked best:

> Answer in ONE line. No preamble, no explanation, no markdown, no code fences. For shell/kubectl/git/etc requests output only the command. For factual or math questions output only the answer.

"No markdown, no code fences" is doing most of the work. Without it you get backtick-wrapped output that `print -z` would happily push into your prompt as `` `kubectl get pods` `` — which is not a runnable command.

## why this beats the chat UI for short questions

| Action | Chat UI | `p` |
|--------|---------|-----|
| Switch context | yes | no |
| Round-trip latency | ~3-5s + UI | ~1-2s |
| Output format | markdown, prose | bare answer or pre-typed command |
| Get command into shell | select + copy + paste | already in your prompt |
| Session pollution | yes | no (`--no-session`) |
| Glob-expansion footgun | n/a | guarded (`noglob`) |

For anything longer than a paragraph the chat UI is still better. For "what's the syntax for X" or "the command for Y", the terminal is the right place to put the answer.

## the one substitution that fixed it

`command -v` → `whence -p`. One swap. The rest of the function (the `noglob`, the `emulate -L zsh`, the control-char strip) was already doing its job. The bug was trusting that "this name resolves in the shell" meant "this name is a binary on disk." It doesn't, and on any zsh with oh-my-zsh loaded it especially doesn't.
