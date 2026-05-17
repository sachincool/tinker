---
title: "Lazy SRE's guide to secure systems, part 1: the dependencies you didn't read"
date: "2026-04-05"
tags: ["security", "supply-chain", "npm", "devsecops", "lazy-sre"]
excerpt: "A startup-grade defense against npm supply-chain attacks, written for Future You at 3am. Chainjacking, postinstall scripts, and the smallest install that buys the most."
featured: true
---

A few months ago a friend's CI pipeline tried to install a package none of us had heard of. The build failed. The error wasn't a missing dep. The error was a local proxy saying *this is malware, I'm not letting it touch disk*. The package was a transitive dependency, six levels deep, that had been published to npm 38 minutes earlier. Nobody on the team had asked for it.

I do platform work at a startup. The job is: keep production up, keep the bill down, keep the kind of person who reads HN comments from getting a free shell on the cluster. The thesis for the series is short. The best security work for a small team is the work *Future You at 3am* will actually execute. The lazy answer is also, almost always, the right one: the configuration that makes the wrong thing impossible, rather than only discouraged. This is part 1. Part 2 is GitHub (`tj-actions`, OIDC, fork PRs). Part 3 is the unsexy list (IAP, Tailscale, PrivateLink, Okta, default helm creds, the PAT you forgot).

## the picture

You opened your editor, ran `npm install`, and onboarded somewhere between 800 and 2,000 packages maintained by people you have never audited. Your team reviewed five direct dependencies. The other 1,995 came in for the ride.

![A two-panel hand-drawn diagram. Left panel labeled 'what i installed' shows five neat dependency boxes connected to a 'your app' box. Right panel labeled 'what npm install pulled in' shows the same five boxes fanning out into a sprawling cluster of small transitive dependencies, with one highlighted in red labeled evil-helper@1.2.3 and a callout reading 'this one is the one shipping crypto miners.'](/images/lazy-security-part-1-supply-chain/dependency-tree-contrast.png)

*Fig. 1 — left is the dependency graph you reviewed at PR time. Right is the one your CI runner actually executes.*

The job is not to read all 1,995. The job is to make sure that when one of them is the problem, the blast radius is small and the alarm goes off.

## chainjacking

Chainjacking is the umbrella term for "someone got control of a package you depend on and pushed a bad version." The attacker doesn't break npm. They get the credentials of the human who publishes the package, ship a patch version, and semver puts it on your machine the next time anyone runs `npm install`. `event-stream` (2018), `ua-parser-js` (2021), `coa`, `rc`, `lottie-player` (2024), the shai-hulud worm (2024) that self-replicated by stealing npm tokens from packages the infected packages were installed by. The economics still work for the attacker. It is going to keep happening.

![A magazine-infographic-style timeline on a dark navy background. Six stages from left to right: T-7d maintainer account targeted, T-0 malicious version published, T+12m first CI installs it, T+12m02s secrets exfiltrated, T+1h backdoor in artifacts, T+24h credentials for sale. Stages 1-2 highlighted in coral as 'compromise' stages; stages 3-6 in cyan as 'victim' stages.](/images/lazy-security-part-1-supply-chain/chainjacking-timeline.png)

*Fig. 2 — twenty-four hours from maintainer phish to credential resale. Nobody noticed the version bump.*

What matters in that timeline is that the *human* steps are slow and the *automated* steps are fast. The window between "malicious version published" and "your CI runs `npm install`" is whatever your dependabot cron is. If you auto-merge minor and patch bumps, that window is ninety seconds.

## dependency confusion

You have a private package called `internal-utils`. Your CI is configured with both your private registry and the public npm registry. Somebody publishes `internal-utils` to public npm at a higher version. CI installs the public one. Birsan did this against Apple, Microsoft, Tesla, and PayPal in a weekend in 2021 for bug bounties.

Fix, in `.npmrc`:

```
@yourorg:registry=https://npm.yourorg.internal
registry=https://registry.npmjs.org/
```

Scope everything internal. Register your scope on public npm as a parked placeholder. It costs nothing.

## postinstall

Every npm supply-chain incident I have read the postmortem on shipped its malicious code in a `postinstall` script — not in runtime code. The install hook runs before your tests, before your linter, as part of the install. Default is enabled. The one-line change with the highest blast-radius reduction:

```
# .npmrc
ignore-scripts=true
```

You'll need to allowlist two to five packages that genuinely need it (typically `bcrypt`-shaped things). That number is small. The alternative is letting every package run code on install. Pick.

## the install that buys the most

Aikido's [`safe-chain`](https://github.com/AikidoSec/safe-chain) is an open-source local proxy that sits in front of `npm`, `npx`, `yarn`, `pnpm`, `pnpx`, `bun`, `pip`, `uv`, `poetry`, `pipx`. Every package download is intercepted and checked against Aikido Intel, an open malware feed. Malware is blocked before bytes hit disk. Which is before `postinstall` runs. Free. No account.

![A clean dark-editorial flow diagram. Five columns from left to right: developer terminal running 'npm install lodash-utils', a shell alias intercepting the command, a local proxy that all package downloads route through, the Aikido Intel cloud queried for malware reputation, and an outcome column with a green 'allowed → installed' branch and a red 'blocked → install aborted' branch.](/images/lazy-security-part-1-supply-chain/safe-chain-flow.png)

*Fig. 3 — safe-chain in one picture. A local proxy in front of every package manager, checked against an open threat-intel feed.*

On a dev machine:

```bash
curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh
# restart your shell
npm safe-chain-verify
# expected: OK: Safe-chain works!
```

In CI:

```yaml
- name: Install safe-chain
  run: |
    curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh \
      | sh -s -- --install-dir /usr/local/.safe-chain
    echo "$HOME/.safe-chain/bin" >> "$GITHUB_PATH"
- run: npm ci
```

And, the part that quietly does the most work — refuse to install anything younger than 48 hours, because that's the window in which most npm malware is caught and removed:

```bash
export SAFE_CHAIN_MINIMUM_PACKAGE_AGE_HOURS=48
```

## the receipts

The above stack is approximately one afternoon of work: `npm ci` from a committed lockfile, `ignore-scripts=true` with a tiny allowlist, scoped private packages with locked registry resolution, safe-chain in front of every install, minimum package age of 48 hours. It will catch most known-bad packages, kill dependency-confusion at the registry level, and reduce postinstall blast radius to zero for the long tail. It will not catch a maintainer-account compromise that ships clean-looking malware that only activates in production weeks later. Nothing in this post will. The next-tier defenses (sigstore signing, npm provenance, reproducible builds) are real, and Part 3 will name them.

For a startup the delta from this post is moving from "one of the next ten incidents has a non-trivial chance of being yours" to "you would have to be very unlucky." That's the only delta that matters.

If you do one thing this week, go register your npm scope.

---

## diagrams: what i tried

Three diagrams, three different tools, one brief: "explain a supply-chain attack to a tired SRE in one image." Prompts kept short. Results below.

### #1 — the napkin contrast (coleam00 excalidraw-diagram skill)

Brief: *"two-panel hand-drawn napkin. Left panel 'what i installed': five direct deps off a 'your app' box. Right panel 'what npm install pulled in': same five direct deps, transitive sprawl under each, one of them is a red `evil-helper@1.2.3`, callout reads 'shipping crypto miners.'"*

Result: [Fig. 1](/images/lazy-security-part-1-supply-chain/dependency-tree-contrast.png). Built with the [`excalidraw-diagram`](https://github.com/coleam00/excalidraw-diagram-skill) skill, a Claude Code skill that enforces a design methodology (depth assessment → pattern mapping → evidence artifacts → mandatory render-and-validate loop) and ships a Playwright-based renderer. The `.excalidraw` source is [downloadable](/images/lazy-security-part-1-supply-chain/dependency-tree-contrast.excalidraw); open it on excalidraw.com to edit.

Two things the skill produced that I wouldn't have prompted for: a semantic color palette (Start/Trigger orange for "your app", Error red for the malicious package, Inactive blue-dashed for the "+N more" bags), and a summary-flow strip at the bottom (`5 direct → 1,200 transitive → 1 malicious → full keychain`) that compresses the post's thesis into nine words. The methodology turns a drawing into an argument.

One install gotcha worth knowing: the skill loads Excalidraw via ESM and the default CDN (`esm.sh`) was unreachable from my environment. One-line patch in `render_template.html` to use `cdn.jsdelivr.net` and it worked.

Verdict: **won for the hero.** The Excalidraw aesthetic earns a place when a post needs a punchline; the skill's methodology adds the second zoom level that elevates a punchline into something that teaches.

### #2 — the chainjacking timeline (diagram-design, polished editorial)

Brief: *"Horizontal six-stage timeline. Dark navy `#11141c` ground, coral `#ff6b5a` for the two 'compromise' stages, muted cyan `#5bc0d9` for the four 'victim' stages. Each stage: small timestamp label (T-7d, T-0, T+12m, T+12m02s, T+1h, T+24h), a node on the line, a short title, one-line caption. Title 'a chainjacking attack, in six steps' (lowercase). Italic figcaption. Magazine-infographic feel, no neon, no scanlines."*

Result: [Fig. 2](/images/lazy-security-part-1-supply-chain/chainjacking-timeline.png). Built by a diagram-design subagent. Came back with a ghosted "COMPROMISE / VICTIM" phase label in the background that I hadn't asked for and now wouldn't part with.

Verdict: **won for explaining attacker workflow.** Editorial polish without being a dashboard. The agent's improvisation (the phase label) was the part I would not have prompted my way to.

### #3 — the safe-chain flow (diagram-design, five-column system diagram)

Brief: *"Five columns left to right: developer terminal running `npm install lodash-utils`, shell alias intercepting, local proxy as the focal column, Aikido Intel cloud with a lookup arrow, outcome column with a green 'installed' branch and a red 'install aborted' branch. Dark editorial background `#0d1117`. Cyan normal flow, red blocked, green allowed. Legend strip at the bottom."*

Result: [Fig. 3](/images/lazy-security-part-1-supply-chain/safe-chain-flow.png). Same skill as #2. Came back with `harshit.cloud · lazy security` baked into the footer (also unprompted, also welcome) and a clean two-outcome fork that makes the block/allow decision the visual sink.

Verdict: **won for explaining a system.** When the diagram has to show *what a tool does*, this format beats the napkin every time. The napkin is a punchline. This one is a reference.

I did not ship an animated `.gif` for Part 1. The `infographic-gif` skill is the right tool for *quantitative motion* — a funnel decaying, a bar chart counting up. Nothing in Part 1 needed motion to make the point. If Part 3 ends up wanting a "blast radius over 24 hours" visualisation, that's where the GIF goes.
