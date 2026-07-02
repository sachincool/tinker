---
title: "Lazy SRE's guide to secure systems, part 2: the actions you didn't pin"
date: "2026-04-12"
tags: ["security", "lazy-sre", "github-actions", "supply-chain", "ci-cd", "devsecops"]
excerpt: "Hardening GitHub Actions for small teams. SHA pinning, OIDC, cooldowns, and the trigger Future You at 3am should not touch."
featured: false
series: "Lazy Security"
seriesPart: 2
---

Last March, someone with write access to the `trivy-action` repo rewrote 76 of its 77 version tags in place. The tags still resolved to `aquasecurity/trivy-action`. They just resolved to different commits than they did the week before. Every pipeline that ran `aquasecurity/trivy-action@0.20.0` (and every other tagged version) ran the attacker's commit instead. Secrets exfiltrated. The stolen credentials chained into PyPI and took down LiteLLM. Nobody noticed for hours, because the workflow file diff was still clean.

This is part 2. [Part 1](/blog/lazy-security-part-1-supply-chain) covered npm: the dependencies you didn't read. Part 2 is the same problem one level up: the workflows you didn't pin. Part 3 is the unsexy list: Tailscale, PrivateLink, IAP, the PAT you forgot.

The thesis from Part 1 stands. The best security work for a small team is the work *Future You at 3am* will actually execute. The configuration that makes the wrong thing impossible beats the runbook that only discourages it. With GitHub Actions, "the wrong thing" has gotten very specific over the last twelve months, and the configs to block each variety have gotten correspondingly precise.

## pinning is necessary but not sufficient

The first thing the trivy-action incident proves: hash-pinning to `@0.20.0` is not pinning. It's a name lookup. The owner of the repo is allowed to rewrite that name. The pin you actually wanted was:

```yaml
- uses: aquasecurity/trivy-action@9b9a3f5c8a5c7e1b6e4d2f1c9b8a7e6d5c4b3a2f # v0.20.0
```

Full forty-character SHA. Immutable. The version comment is so the next reader knows what they're looking at; the SHA is so the workflow runs the code you reviewed.

![A horizontal editorial timeline of the trivy-action force-push attack of March 2026 on a deep navy ground. Six stages along a single line, from a maintainer credential phish at T-30d through 76 of 77 tags force-pushed at T-0, first CI pipelines picking up the rewritten tag at T+1h, secrets exfiltrated minutes later, a trojanized LiteLLM published to PyPI at T+6h, and detection at T+9d. Attacker-controlled stages are coral, victim stages cyan, with ghosted 'FORCE-PUSH' and 'VICTIM' phase labels strung across the background.](/images/lazy-security-part-2-github-actions/trivy-action-timeline.png)

*Fig. 1 · nine days from force-push to advisory. The workflow files never changed.*

Two GitHub features shipped in 2025 that change the math:

- **SHA pinning enforcement** (Aug 2025). An org-level policy that *fails* workflow runs using unpinned actions, instead of warning about them. Settings → Actions → General → Action pinning. Turn it on. There is no "we'll get to it" version of this toggle.
- **Immutable Releases** (Oct 2025, GA). Action authors opt in to making release tags non-rewritable after publication. If you publish actions, turn this on for downstream consumers. If you consume actions, prefer ones that have.

The lazy stance: enforcement at the org level. The workflow that doesn't have a forty-character SHA fails the run. The PR can't merge. The work of remembering to pin moves from every engineer's head to one setting.

What this doesn't catch: an attacker who compromises the maintainer account and ships a new tag at a new SHA. The SHA is real. Pinning by SHA doesn't help, because the workflow author *will* rev to the new version when they read the maintainer's release notes. Which is the next config.

## cooldown is the same trick that worked for npm

Part 1's load-bearing config was `SAFE_CHAIN_MINIMUM_PACKAGE_AGE_HOURS=48`. The principle: most published malware is detected and pulled within hours. If you can wait, the wait does the work for you.

The action ecosystem has the same property, with a longer window. [yossarian's analysis](https://blog.yossarian.net/2025/11/21/We-should-all-be-using-dependency-cooldowns) puts the cooldown that catches most supply-chain attacks at 7-14 days. So:

```bash
pinact --min-age 7 .github/workflows/*.yml
```

Refuses to write a pin younger than seven days. Add to pre-commit, your CI lint, or whatever your dependabot equivalent runs before opening the bump PR.

For Renovate users, the equivalent lives in the action manager:

```json
{
  "packageRules": [
    { "matchManagers": ["github-actions"], "minimumReleaseAge": "7 days" }
  ]
}
```

That's it. Same trick, different ecosystem.

![An animated horizontal bar chart in a dark editorial palette showing the share of recent supply-chain action compromises caught by a cooldown of 0, 3, 7, 14, or 21 days. The 0-day bar lands at 3% and the 3-day bar at 38%. The 7-day bar reaches 76% and the 14-day bar reaches 89%, both accented with a brighter cyan and a coral tip. The 21-day bar lands at 94%. A bottom strip notes that the trivy-action force-push was detected at about nine days.](/images/lazy-security-part-2-github-actions/cooldown-window.gif)

*Fig. 2 · the wait is doing the work. Seven days closes most of the door; fourteen closes most of the rest.*

The empirical question is whether seven days is enough. The trivy-action force-push was detected at about nine. Seven would have caught most consumers, not all of them. The cost of fourteen is "your action versions lag upstream by two weeks." If your action surface is small (most teams are running `actions/checkout`, `actions/setup-node`, one cloud-login action, maybe a deploy action), set fourteen and forget.

## pull_request_target is the new postinstall

Part 1 named `postinstall` as the single trigger that does the most damage and the single switch (`ignore-scripts=true`) that closes the most doors. Actions has the same shape and the same fix.

`pull_request_target` runs in the context of the base repository, with access to repository secrets, but is triggered by a PR from a fork. The legitimate use case is small: comment on PRs, label them, run lightweight metadata jobs. The illegitimate use case is enormous: check out the fork's code and execute it. The attack writes itself. Open a fork, modify a script the trusted workflow runs, watch the runner exfiltrate every secret in the env.

Astral, who maintain `uv` and `ruff`, [wrote it cleanly](https://astral.sh/blog/open-source-security-at-astral): "these triggers are almost impossible to use securely." GitHub partially mitigated this in November 2025 by forcing `pull_request_target` to always use the default branch's version of the workflow, so an attacker can't push a vulnerable workflow on a feature branch and trigger it. But the foot-cannon still ships loaded if your default-branch workflow checks out PR-head code.

![A hand-drawn two-panel napkin. Left panel labeled 'pull_request_target' shows a fork PR boundary as a dashed line, a modified script.sh inside the fork, and a runner on the base side reaching across the boundary while holding a red keyring labeled NPM_TOKEN, AWS_KEY, GH_PAT. Right panel labeled 'pull_request' shows the same setup, but the keyring is replaced by a greyed-out 'secrets.* not in scope' bag. The two panels are structurally identical except for the presence or absence of secrets in the runner.](/images/lazy-security-part-2-github-actions/pull-request-target-contrast.png)

*Fig. 3 · same workflow, different trigger, opposite blast radius.*

The lazy stance:

- Don't use `pull_request_target` unless you've named the specific reason and one other person has signed off.
- If you do, never `actions/checkout` the PR head from inside it. Check out the base SHA, do the metadata thing, exit.
- For everything else, use `pull_request`. It runs without secrets. Attacker-controlled code stays attacker-jailed.

Same shape as `ignore-scripts=true`. The setting that closes the class.

## the safe defaults that go in every workflow

The four-line workflow header that does the most work per character:

```yaml
permissions:
  contents: read

defaults:
  run:
    shell: bash -euo pipefail {0}
```

`contents: read` overrides the org-level default. If a step needs to push a tag or open a PR, that job opts back up to `contents: write` explicitly. The default is the safe one.

At the checkout step:

```yaml
- uses: actions/checkout@<sha> # v4.2.0
  with:
    persist-credentials: false
```

The default behavior of `actions/checkout` is to leave a credential sitting in `.git/config` for the rest of the workflow. Later steps have shipped this credential into uploaded artifacts more than once. Opt out unless a later step in the same job needs to push.

Three secret-access rules with the same flavor:

- Step-scoped `env:`, never workflow-scoped, for any secret.
- Never `${{ toJson(secrets) }}`. Exposes every secret in the project to the runner. There is no use case.
- Never `secrets: inherit` on reusable workflows. Pass each secret by name. The reusable workflow gets exactly what it asked for.

The trivy-action exfiltration worked partly because secrets were workflow-scoped. The malicious step inherited every credential in the env, not just the one the legitimate scan needed. Step-scoping wouldn't have prevented the credential theft, but it would have bounded the blast radius to one secret instead of all of them.

## OIDC, the promise from part 1

Part 1 ended on "the next-tier defenses are real, Part 3 names them." OIDC is the part of that conversation that lives here.

The trade: instead of storing an `AWS_ACCESS_KEY_ID` in repo secrets and praying nobody exfiltrates it, you configure AWS to trust GitHub's OIDC issuer for a specific repo, branch, and workflow. GitHub mints a short-lived (five-minute) OIDC identity token for the workflow run. The workflow trades that for STS credentials whose lifetime you set (default one hour). Nothing long-lived ever sits in the env.

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@<sha> # v4.0.2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deploy
          aws-region: us-east-1
      - run: aws s3 sync ./dist s3://my-bucket
```

The role's trust policy restricts the OIDC subject to your exact repo and (ideally) branch. An attacker who compromises a fork PR can't assume the role, because they don't match the trust condition. The OIDC JWT itself lasts five minutes and the STS credential is scoped to whatever you configure (default one hour). Even an exfiltrated credential gets the attacker a bounded window of scoped access, not a permanent IAM user.

For Google Cloud, the equivalent is Workload Identity Federation. For HashiCorp Vault, the JWT auth backend. Same shape across providers.

The labor here is genuinely one-time. Configure the trust relationship once per repo, delete the long-lived key, forget about rotation forever. The rotation runbook you're not maintaining is one of the better quiet wins in this post.

## zizmor is the local proxy for workflows

Part 1's `safe-chain` sat in front of every package install and refused malware before bytes hit disk. The action ecosystem's equivalent is `zizmor`, a workflow linter that reads your YAML and catches the patterns this post is about, before they merge.

```bash
brew install zizmor
zizmor .github/workflows/
```

It catches unpinned actions, `pull_request_target` with PR-head checkouts, template-injection patterns where attacker-controlled input lands in a `run:` string, jobs with excessive permissions. Add it to pre-commit:

```yaml
# .pre-commit-config.yaml
- repo: https://github.com/woodruffw/zizmor-pre-commit
  rev: v1.x  # pin the rev, obviously
  hooks:
    - id: zizmor
```

The principle is identical to safe-chain. Move the security check from "after the incident, in the postmortem" to "before the PR can merge, on the dev machine." The CI run is the second line of defense. The pre-commit is the first.

## the receipts

The above stack is approximately one afternoon: org-level SHA pinning enforcement, `pinact --min-age 7` or Renovate `minimumReleaseAge: 7 days`, the four-line workflow header, `persist-credentials: false`, no `pull_request_target` with PR-head checkouts, OIDC for every cloud credential, `zizmor` in pre-commit.

It will not catch a maintainer-account compromise that ships clean-looking code which activates weeks later. It will not catch a determined attacker who studies your build and writes a payload that survives every linter and looks innocent at PR review. Nothing in this post will. Part 3 will name the controls that buy partial mitigation against that class: sigstore, npm provenance, reproducible builds, attested deployments. And the ones that exist to make the postmortem readable, not to prevent the incident.

For a small team, the delta from this post is moving from "we're one tag-rewrite away from a credential theft cascade" to "an attacker would need a credentialed insider, or a fifteen-minute window of luck against a scoped IAM role." That's the only delta that matters at this scale.

If you do one thing this week, turn on SHA pinning enforcement at the org level. Everything else gates off that.
