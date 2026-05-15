---
title: "How to bypass corporate MDM and AI gateways on Claude Code"
date: "2026-06-05"
tags: ["claude-code", "mdm", "ai-gateway", "macos", "managed-settings"]
excerpt: "Your company's MDM dropped managed-settings.json and the network team wedged Claude through an AI gateway. Here's how each leash works."
featured: false
---

If you're reading this, there's roughly an 80% chance your company rolled out an MDM last quarter, your network team wedged Claude API traffic through an AI gateway around the same time, and now Claude Code boots with MCPs you didn't pick while forwarding your prompts somewhere you haven't audited. `/mcp` shows three servers nothing in your repo touches. `env | grep ANTHROPIC` returns a base URL on a domain you've never seen. The experience got worse and nobody asked you.

<!-- FIG: hand-drawn excalidraw — two corporate leashes on Claude Code: MDM pushing a schg-flagged managed-settings.json into /Library on the left, and an AI gateway intercepting api.anthropic.com via ANTHROPIC_BASE_URL on the right -->

This post covers both leashes. The MDM one is fixable in 12 lines of zsh. The AI gateway one depends on how deep your network team went.

## what's an MDM, in three sentences

MDM stands for Mobile Device Management. Jamf, Kandji, Intune, Workspace ONE, whichever agent enrolled your laptop on day one. It owns parts of `/Library`, can write files there as root with the system-immutable flag set, and re-pushes them on a schedule, which is why a plain `rm` doesn't survive. For Claude Code, the relevant directory is `/Library/Application Support/ClaudeCode/`.

## the managed-settings situation

The two files doing the work are `/Library/Application Support/ClaudeCode/managed-settings.json` and `/Library/Application Support/ClaudeCode/managed-mcp.json`. Claude Code reads them on startup, treats them as the highest-priority settings layer, and merges them over whatever you have in `~/.claude/settings.json`. Anything IT puts in there wins: forced MCPs, forced skills, allowed and denied permission lists, and the `env` block that can set `ANTHROPIC_BASE_URL`. That last one is how the AI gateway routing gets wired into Claude Code in the first place.

## why `rm` doesn't work

First instinct fails, and not in a way that's obvious:

```bash
sudo rm "/Library/Application Support/ClaudeCode/managed-settings.json"
# rm: managed-settings.json: Operation not permitted
```

Root isn't enough. The MDM agent sets the file's system-immutable flag with `chflags schg` after writing it. That flag blocks deletion even by root until it's cleared. The macOS `chflags(1)` man page is the receipt. `schg` is the "system immutable" flag, and the file "may not be changed, moved, or deleted" while it's set.

Confirm it on your own machine:

```bash
ls -lO "/Library/Application Support/ClaudeCode/managed-settings.json"
# -rw-r--r--  1 root  wheel  schg  482 May 14 09:11 managed-settings.json
```

`schg` in column five is the marker.

> **Key Insight:** managed-settings.json is the same config layer your `~/.claude/settings.json` uses. The IT copy just lives under `/Library`, is owned by root, and has the schg flag set. The merge logic doesn't know which file came from a human.

## the cleanup script

Save this as `/usr/local/sbin/claudecode-cleanup.sh`, make it executable, run with `sudo`:

```zsh
#!/bin/zsh
FILES=(
  "/Library/Application Support/ClaudeCode/managed-settings.json"
  "/Library/Application Support/ClaudeCode/managed-mcp.json"
)
for f in "${FILES[@]}"; do
  # Clear immutable flag if file exists, then remove
  [ -e "$f" ] && /usr/bin/chflags noschg "$f" 2>/dev/null
  /bin/rm -f "$f"
done
```

```bash
sudo chmod 755 /usr/local/sbin/claudecode-cleanup.sh
sudo /usr/local/sbin/claudecode-cleanup.sh
```

Two lines do the real work. `chflags noschg` clears the immutable bit. `rm -f` removes the file. The `2>/dev/null` swallows the noise on a clean machine where the file isn't there.

Restart Claude Code. `/mcp` should be back to whatever you actually installed, and `/permissions` should be whatever's in `~/.claude/settings.json` instead of whatever IT decided you needed.

## the launchd arms race

I'd love to tell you this is permanent. It isn't.

MDM agents sync on a schedule. Every 15 minutes, every hour, on login, depending on profile. When they sync, they notice the file is gone, put it back, and re-apply the schg flag. You'll watch managed-mcp.json reappear like a horror-movie villain you keep stabbing.

A few options, in increasing order of trouble you're inviting:

- **Run the script on a `launchd` LaunchAgent that fires at login.** Once per session. Low impact, low effectiveness, but if your MDM only syncs at login this is enough.
- **Run it on a `launchd` timer with a 60-second interval.** Now you're in an arms race with the sync schedule. Works until someone in IT notices a config-drift alert for your hostname.
- **Block the MDM agent's outbound DNS.** Effective, loud, and the kind of thing that gets your laptop wiped on the next compliance audit.

I run the first one. The MDM gets its login telemetry, my dev environment isn't broken for the hour or so between syncs, nobody opens a ticket. Pick the option that matches how much you actually want to fight this.

Minimal `~/Library/LaunchAgents/cloud.harshit.claudecode-cleanup.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>cloud.harshit.claudecode-cleanup</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/sudo</string>
    <string>-n</string>
    <string>/usr/local/sbin/claudecode-cleanup.sh</string>
  </array>
  <key>RunAtLoad</key><true/>
</dict>
</plist>
```

`sudo -n` only works if you've added a NOPASSWD line for that exact script in `/etc/sudoers.d/claudecode-cleanup`. Which the MDM might rewrite. The arms race goes deeper than you think.

## the AI gateway angle

The other leash sits at the network layer. Companies route Claude API traffic through a gateway (Cloudflare AI Gateway, Portkey, LiteLLM, internal proxies) so they can log prompts, strip PII, enforce per-user quotas, or quietly downgrade Opus calls to Haiku when the monthly bill spikes. Claude Code respects `ANTHROPIC_BASE_URL` and will talk to whatever endpoint it points at, as long as your OAuth token or API key authenticates there.

Two routing patterns to recognize:

- **`env` block in managed-settings.json.** IT sets `ANTHROPIC_BASE_URL=https://ai-gw.corp.example.com/v1` inside the env section of the managed file. Claude Code reads it on startup. Same fix as the MCP file. The cleanup script above already kills this.
- **System proxy plus a corporate root CA.** Your laptop has a `Corporate Root CA` in keychain, and either `https.proxy` or transparent network interception routes `api.anthropic.com` traffic through the gateway. Deleting managed-settings.json does nothing here. The interception lives below the application layer.

To tell which one you have, run this in a fresh shell:

```bash
env | grep -i anthropic
# If you see ANTHROPIC_BASE_URL, it's the env block.

curl -v https://api.anthropic.com/v1/messages 2>&1 | grep -iE 'issuer|subject|server certificate'
# If the cert chain is signed by your corporate CA, it's transparent interception.
```

## bypassing the gateway

For the env-block case, the cleanup script already does the work. Restart your shell after running it:

```bash
unset ANTHROPIC_BASE_URL
env | grep -i anthropic
# (empty)
```

For the transparent-proxy case, your options shrink:

- **Personal hotspot for sensitive sessions.** Burns mobile data, leaves no trail through the gateway. Most realistic option for an individual contributor.
- **WireGuard or Tailscale out to a personal node.** Works if your MDM profile allows it. Many block third-party VPNs through `com.apple.systempolicy.kernel-extension-policy`.
- **Personal device for personal work.** Boring answer. The one that holds up in HR if it ever comes up.

What doesn't work: removing the corporate root CA from keychain. It's pinned by an MDM payload and gets re-added on next sync, same pattern as managed-settings.json.

## should you actually do this

Worth saying out loud: both leashes exist because someone at your company had a reason. Compliance, data residency, an incident from six months ago whose postmortem nobody can find.

If the forced MCP is `internal-secrets-lookup` and the gateway logs prompts to a SOC pipeline, your team probably wants you using it. If the MCP is `corporate-docs-mcp` pointed at a 404 and the gateway downgrades Opus to Haiku because someone misread an invoice, you're deleting dead weight.

The script doesn't know which. Ask before you script. Most MDM platforms support per-user opt-out scopes, and one polite Slack message to IT beats a `launchd` plist.

## what these scripts don't do

The cleanup clears two files. It does not:

- Stop the MDM agent.
- Touch `~/.claude/settings.json`. Your settings stay yours.
- Handle `/Library/Application Support/ClaudeCode/managed-permissions.json` if your MDM uses one. Add it to the `FILES` array.
- Survive a reboot or a sync. The agent re-pushes on next check-in.
- Defeat a transparent proxy with a pinned corporate CA. Use the hotspot.

If you wanted a permanent escape from corporate IT, you wouldn't be reading a blog about `chflags`.
