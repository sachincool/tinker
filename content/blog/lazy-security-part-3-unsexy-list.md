---
title: "Lazy SRE's guide to secure systems, part 3: the unsexy list"
date: "2026-04-19"
tags: ["security", "devsecops", "lazy-sre", "identity", "supply-chain", "audit-logs"]
excerpt: "Identity, network, default creds, attestation, audit logs — the controls that close most of the gap Parts 1 and 2 left."
featured: false
series: "Lazy Security"
seriesPart: 3
---

I have a calendar reminder that fires on the first of every month. It says "rotate the PAT." I have hit "snooze for 1 week" seventeen times in a row. The PAT in question is a `ghp_` token with read-write access to four private repos and permission to push tags, and the last time I rotated it was October 2024. If anyone has phished my GitHub session in the past fifteen months, they have had a year's head start on me.

This is part 3. [Part 1](/blog/lazy-security-part-1-supply-chain) was npm. [Part 2](/blog/lazy-security-part-2-github-actions) was GitHub Actions. This part is the unsexy list: the controls that don't fit a single attacker narrative, that protect against many different classes of incident in small ways. Identity, network access, default credentials, attestation, the audit log you'll need when the rest of the series missed what you needed it to catch.

The thesis from Part 1 stands. Future You at 3am will not rotate the PAT. The config that makes the rotation unnecessary (short-lived expiry, fine-grained scope, SSO enforcement, audit streaming) is the one that runs while you sleep.

## the PAT you forgot is in four places

Personal-access tokens hide in more places than I want to think about. Mine, when I went through them this weekend:

- `~/.netrc` (the one git falls back to when no credential helper is set)
- `~/.zshrc`, exported as `GH_TOKEN` because some script three years ago needed it
- Mac Keychain, two duplicates, one expired in 2023 but the dialogue still surfaces it
- A `.env` in a repo I haven't pushed to since last summer, committed in plaintext to the `staging` branch (`git log -S 'ghp_'` finds these surprisingly often)
- One CI secret in a repo whose workflow file I deleted six months ago; the workflow went, the secret did not

That's five, not four, which is on-brand for this section.

![A stylized editorial map on a dark navy ground showing the typical places a credential lives on an engineer's machine and inside the org. Nodes for shell config (`~/.zshrc`, `~/.netrc`), Mac Keychain, the CI secret store with one node tagged 'orphaned' in coral, a `.env` file in a stale repo, a browser-cached session, a Slack DM history, a password manager entry, and a post-it from 2022 also in coral. Arrows show the typical sprawl, with concentric rings labeling 'on disk', 'in cloud', and 'in someone else's possession'.](/images/lazy-security-part-3-unsexy-list/credentials-in-the-wild.png)

*Fig. 1 — every place a credential hides. Most teams have it in all of them simultaneously.*

The fix isn't "rotate them all." It's "make the next leak useless." Three configs at the org level do the work.

First, require expiration on all PATs. GitHub org settings → Personal access tokens → Require an expiration date; set the org max to 90 days (GitHub's platform ceiling is 366, but 90 is the right org default). Tokens issued before the setting keep working until their original expiry, so old tokens die naturally as they age out. No big-bang migration.

Second, enforce SSO on the org. A leaked PAT without an active SSO session can't reach SSO-protected repos. Most SaaS git-hosted orgs should have this on already; if yours doesn't, that is the highest-yield ten minutes in this post.

Third, stream the GitHub audit log somewhere SQL-shaped, with two-year retention. The default is six months. You will want eighteen months of history exactly when you need eighteen months of history. The question "did this token get used last week?" should be a query, not a support ticket.

The thing that took me longest to learn is that fine-grained PATs (`github_pat_` prefix, not `ghp_`) let you scope a token to one repo with read-only contents and nothing else. The default scope (full account) is what turns a leaked PAT into a domain compromise. To stop typing `ghp_` into shells entirely:

```
# ~/.gitconfig
[credential]
  helper = !gh auth git-credential
[url "https://github.com/"]
  insteadOf = git@github.com:
```

`gh auth login` once, and `git push` works for the rest of your career. The PAT now lives in one place: `gh`'s keyring entry, scoped to your machine, rotated by `gh` whenever it likes.

## identity is the perimeter

SSO + MFA + SCIM is the only thing on the unsexy list that competes with the PAT story for "worst yield from neglect." A single phished password without these is a domain admin compromise. With them, the same phish gets the attacker a soup of session cookies that expire in eight hours and an MFA prompt they can't satisfy.

The three configs, in rough order of cost:

- **MFA, mandatory, no exceptions.** Including the founder, including the contractor, including the on-call rotation. The exception list is the attack list.
- **SSO for every system that supports it.** Yes, Okta SSO Tax is real. Yes, it is annoying. It is cheaper than rebuilding identity after a session-token compromise. Most of the Snowflake-customer breaches of 2024 started with a non-SSO'd account.
- **SCIM provisioning to every system that supports it.** SCIM means offboarding actually offboards. The day someone leaves, every connected system revokes their access in the same SAML attribute push. Without SCIM, the median time to fully revoke at a small startup is days, and there is always one Postgres console nobody remembered.

![An animated horizontal bar chart in a dark editorial palette comparing the time to fully revoke an employee's access after offboarding. Top bar 'without SCIM (median, small-startup surveys 2024-2025)' grows over several seconds to around four days. Bottom bar 'with SCIM, SAML attribute push' grows to roughly forty-five seconds and is almost invisible at the scale of the first. Coral tip on the without-SCIM bar marks the window of compromise.](/images/lazy-security-part-3-unsexy-list/scim-revocation-window.gif)

*Fig. 2 — the no-SCIM bar is the entire window of compromise.*

One nightly cron closes most of the rest of the gap:

```bash
# nightly: diff "people on payroll" vs "humans with prod access"
okta-cli list-users --status active | sort > /tmp/active.txt
aws iam list-users --query 'Users[].UserName' | jq -r '.[]' | sort > /tmp/prod.txt
diff /tmp/active.txt /tmp/prod.txt | mail -s "identity-diff $(date +%F)" sec@yourorg.io
```

It runs in twelve seconds and surfaces the contractor whose SCIM hook silently broke in March.

## the access plane: Tailscale, IAP, PrivateLink

Nothing internal needs to be on the public internet. Anything that isn't can't be scanned by Shodan, can't be hit by a credential stuffer, can't be 0-day'd by a CVE published yesterday. The configs are different per layer, but the move is the same: take the thing off the internet and put authentication in front of it.

For shell access and internal HTTP services, Tailscale. The pitch is honest. Install the daemon on every machine, write a twelve-line ACL, you have a private network without running a VPN appliance. Replace SSH-to-bastion with `tailscale ssh`. Replace the internal Grafana on `grafana.yourorg.io` with `grafana.your-tailnet.ts.net`. Both stop existing on the public internet the same afternoon.

For web apps that need real auth-aware proxying (customer-facing internal tools, vendor admin panels), Cloudflare Access or Google IAP. The user hits a public URL, the proxy hands them off to your IdP, then proxies the request to a private backend. The backend has no public route.

For service-to-service inside cloud accounts, AWS PrivateLink and GCP Private Service Connect. These exist so your `stripe-receiver` lambda doesn't need to leave the VPC to reach Stripe's API. They are also what you need so the data warehouse in account A can reach the production database in account B without anything traversing the public internet.

![A hand-drawn two-panel napkin. Left panel labeled 'what the security group says (`0.0.0.0/0`)' shows three boxes (postgres, redis, grafana) sitting in the open, with arrows from labeled attackers (a Shodan crawler, a credential stuffer, a CVE-2026-12345 scanner) landing directly on them. A dashed line labeled 'the bastion SG' floats nearby, doing nothing. Right panel labeled 'what the tailnet says' shows the same three boxes behind a solid Tailnet boundary, with the same attacker arrows bouncing off the boundary line. Bottom strip reads 'twelve lines of ACL → entire blast radius'.](/images/lazy-security-part-3-unsexy-list/access-plane-contrast.png)

*Fig. 3 — same services, different boundary. The right panel is whatever Future You at 3am will thank you for.*

The anti-pattern is the "we'll just rotate the bastion IP" security group. We won't. The credentials for the bastion are in a Slack channel from 2023. The bastion is one of those things that exists because someone set it up before everyone joined and nobody knows whether it's safe to turn off. The lazy answer is to make the bastion irrelevant.

## the helm chart that ships with admin/admin

Every operator-installed thing in the cluster has a default password. Argo CD's `admin` with auto-generated password is fine, because the password isn't `admin`. Grafana's chart that ships with `admin/admin` is not fine. Jenkins ships with a random initial password printed to `initialAdminPassword` that most operators copy in once and never rotate. Half the database charts have `password: changeme` in `values.yaml` and the README says "you should change this," which is not the same as the chart changing it.

The lazy fix is two configs.

First, every secret in the cluster comes from external-secrets or sealed-secrets, never from a `values.yaml`. Pick one. The choice matters less than the consistency. Mine is external-secrets pointing at Vault, because reconciliation handles rotation upstream and the YAML stays clean.

Second, a weekly cron that hits every Service in the cluster with the top 25 default credentials and pages on success. `nuclei` ships a template set for this:

```bash
nuclei -t http/default-logins/ -l services.txt -severity critical,high
```

If it finds something, that's a real incident. If it doesn't, you have evidence, which is the audit-log argument postponed by one section.

One honest aside in parentheses: the rate at which Helm chart maintainers have moved away from default passwords is encouraging. Bitnami's PostgreSQL chart now generates a random password by default instead of `changeme`. The chart that ships with `admin/admin` today is more likely to be a private internal chart someone wrote three years ago than something current from Bitnami. (Note: the official Grafana chart still defaults to `admin/admin` — override it via Helm values before first install; "I'll change it later" is the part nobody does.) Check the internal charts first.

## sigstore, provenance, and reproducible builds

Part 1 ended on "the next-tier defenses are real, Part 3 will name them." These are them. Sigstore signing, npm provenance, reproducible builds. Each closes a class of attack that pinning and cooldowns can't.

**Sigstore for container images.** `cosign verify` confirms an image was built by your specific GitHub Actions workflow, with your repo's OIDC identity, against a transparency-log entry that's public and append-only.

```bash
cosign verify ghcr.io/yourorg/api:abc123 \
  --certificate-identity-regexp '^https://github.com/yourorg/api/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

If an attacker pushes a malicious image to your registry without also compromising your CI's OIDC trust, the verify fails. Bake the verify into your deploy step; refuse to deploy what doesn't pass. That is the attested-deployment pattern Part 2 named, in one verb in your CD pipeline.

**npm provenance.** `npm audit signatures` (since npm 9.5) tells you which dependencies have published provenance attestations linking the `.tgz` to a specific GitHub Actions build. A package with provenance gives you a tamper-evident chain: this artifact came from this commit on this branch in this repo, built by this workflow. Coverage is uneven (most `@types/*` packages have it; most one-maintainer packages don't), but the trend is good. The number to track is "what fraction of my install graph has provenance?" That's your remaining audit surface.

**Reproducible builds.** The hardest of the three. Same source produces the same binary, bit-for-bit, on every build machine. Two implementations have shipped at scale: Debian's reproducible-builds program (`reproducible-builds.org` tracks coverage by package) and Nix. The lazy version, for a small team, is to build the production artifact twice on two different runners and compare hashes. If they match, your CI is reproducible enough to detect a poisoned-build attack. If they don't, you have a non-determinism bug to fix, which is also worth knowing about.

## audit logs are for after the incident

Part 2 ended on "Part 3 will name the controls that exist to make the postmortem readable, not to prevent the incident." This is the section. Audit logging is what tells you whether everything in the previous six sections actually worked, what got accessed when one of them didn't, and which credential to roll at 03:11.

Three streams, all of which support direct destination handoff:

GitHub's audit log to S3, Splunk, Datadog, or whichever SQL-shaped destination you'll actually query. Settings → Audit log → Streaming. Default retention is six months; you want two years. The same goes for Okta's System Log (Reports → System Log → Stream).

AWS CloudTrail to a separate audit account, write-only from production, S3 with Object Lock and KMS-encrypted. Multi-region. The level of paranoia required is "this bucket survives a full prod-account compromise." GCP and Azure have equivalents (Cloud Audit Logs, Activity Logs).

Application audit. Stripe webhook history, Slack audit log, Google Workspace audit log. Each is one config and one Splunk index. The marginal effort approaches zero. The payoff is the difference between a one-page incident summary and a six-week panic.

The runbook for "we think we had a breach Thursday" is then a SQL query against a known schema. Without these, it's an interview with everyone who had access.

## the receipts

The unsexy list is one afternoon, one quarter, and one year. The afternoon: PAT cleanup, SSO/MFA mandatory, GitHub audit log streaming on. The quarter: SCIM provisioning everywhere, Tailscale on every internal service, external-secrets across the cluster. The year: sigstore for your images, an `npm audit signatures` report tracked weekly, reproducible-build hash comparison in CI.

It will not catch a nation-state with patience. It will not catch an insider with a grudge. It will not catch the next Log4j the day it lands. Those are different problems with different budgets, and worth a separate post when one of them happens to one of us.

What it does: it makes the postmortem on your next incident readable. It moves "we don't know what got accessed" out of the executive summary and into "Appendix A, the SQL query." For a small team, that is the difference between recovering and rebuilding.

If you do one thing this week, generate a fresh fine-grained PAT scoped to one repo with a 90-day expiry, switch your `gh auth login` to it, and delete the eight-year-old `ghp_` from your `~/.zshrc`. The calendar reminder won't help. Future You at 3am will not rotate it. Make the wrong default impossible.
