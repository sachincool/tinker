---
title: "Lazy SRE's guide to secure systems, part 5: the dev laptop is the perimeter"
date: "2026-05-03"
tags: ["security", "devsecops", "lazy-sre", "endpoint", "mdm", "macos"]
excerpt: "Snowflake taught everyone what happens when a cracked Logic Pro torrent runs on a contractor's Mac. The laptop is the perimeter."
featured: false
---

In April 2024, Mandiant published the writeup for the Snowflake mass-extortion campaign. Ticketmaster, Santander, AT&T, LendingTree, Advance Auto Parts — roughly 165 Snowflake tenants in total had data extracted from their warehouses. The defining detail wasn't sophistication. It was the laptop.

Mandiant traced the entry point to infostealer malware (Lumma, RedLine, Vidar variants) running on contractor and developer machines. Several of the compromised devices were personal Macs also used for, among other things, downloading cracked copies of Logic Pro and Microsoft Office. A torrent containing Lumma harvested every credential the browser had ever saved, including the Snowflake login that didn't have MFA enforced. The attackers walked through the front door of a Fortune 500's data warehouse.

This is part 5. Earlier parts covered npm ([Part 1](/blog/lazy-security-part-1-supply-chain)), GitHub Actions ([Part 2](/blog/lazy-security-part-2-github-actions)), the unsexy infrastructure list ([Part 3](/blog/lazy-security-part-3-unsexy-list)), and DNS auth records ([Part 4](/blog/lazy-security-part-4-dns-records)). Part 5 is about the laptop. The piece of hardware on an engineer's desk that has every SSH key, AWS profile, kubeconfig, GitHub PAT, Slack token, and Stripe key they have ever used to do their job.

The thesis from Part 1 stands. Future You at 3am will not run an EDR scan after every browser extension install. The config that prevents the extension from being installed in the first place is the one that runs while you sleep: the MDM that whitelists, the disk encryption that protects what gets stolen, the hardware MFA that survives the keylogger.

## MDM is the table you set first

Mobile Device Management is the thing every small startup skips and every enterprise has. The bad-faith reason is that it's expensive and annoying. The honest reason in 2026 is that the free options have caught up.

For a 15-person Apple-heavy team, the lazy stack is **Apple Business Manager** (free, Apple-only) plus **Fleet** (OSS, free under 300 endpoints on the self-hosted path, generous free tier on Fleet's cloud). Apple Business Manager assigns a Mac to your organization at first boot, before the user creates a personal Apple ID on it. Fleet runs the osquery agent on every machine and lets you push configuration profiles (the same plist payloads Jamf would push) plus query inventory in SQL syntax.

![A hand-drawn napkin sketch of a laptop, viewed top-down on a workbench. Inside the laptop are labeled icons representing what's actually stored on it: a key labeled SSH, a wallet labeled AWS keys, a kubeconfig folder, a GitHub PAT token, a Slack icon, a Stripe API key, a stack of browser cookies, and a small keychain icon for the password manager. Around the outside, a red dashed boundary labeled 'the perimeter'. A red callout reads 'any one of these, full org compromise'. Bottom strip: 'one device → one keychain → twelve services → entire blast radius'.](/images/lazy-security-part-5-dev-laptops/whats-on-your-laptop.png)

*Fig. 1 — what's actually on the device you take to coffee shops.*

The lazy default config profile, in plain English:

- Require FileVault. Escrow the recovery key to MDM. If the laptop walks, the disk is encrypted; if the user forgets the password, you can recover.
- Require auto-lock at five minutes idle, password to wake. Not a screensaver.
- Block unsigned package installs, restrict the Mac App Store to managed Apple IDs only.
- Require macOS updates within fourteen days of release. The fourteen days lets you skip a known-bad point release; longer than fourteen is negligence.
- Block AirDrop on the corporate Wi-Fi, restrict USB external storage to read-only (or block entirely if your workflow doesn't need it).
- Install osquery via MDM, enrolled to your Fleet server.

For Linux and Windows in the mix, Fleet covers both with the same osquery agent and the same query syntax. The MDM-config-profile half is Windows Intune (free with Microsoft 365 Business Premium) or Workspace ONE's free tier. Either way, the stack is "Fleet for inventory and detections + a platform-specific MDM for enforcement."

The lazy fix for the most common gap: a weekly cron that runs one Fleet query, "every laptop without FileVault enabled," and posts a Slack alert with the user's name. The conversation that follows is "we found your machine, can you enable it today" — not a six-month audit.

## hardware keys, one-time spend

YubiKey 5 NFC is $50. Buy two per engineer: one for the desk, one for the bag. Total for 15 engineers: $1,500, one-time, capital expense, deductible.

What it gets you:

- WebAuthn / FIDO2 for SSO login (Google, Okta, GitHub, Cloudflare, AWS): a keylogger can record every keystroke and still never get the second factor.
- SSH key storage in hardware. `ssh-keygen -t ed25519-sk -O resident` writes the key into the YubiKey. The private key never exists on disk.
- PIV smartcard for VPN auth, code signing (`gpg --card-edit`).
- TOTP fallback for the SaaS that hasn't shipped WebAuthn yet.

The free alternative for the SaaS that doesn't support hardware keys is passkeys. Passkeys are WebAuthn under the hood, also phishing-resistant, built into iOS, macOS, Android, Windows Hello, Chrome, and Safari. Free. The catch is sync: if the engineer's iCloud is compromised, so is the passkey. Hardware keys aren't synced; they are a physical token. The lazy answer is both: passkeys for low-risk auth, YubiKeys for the keys that gate production.

Cost: $1,500 one-time for 15 engineers. The cheapest line item in this post for what it gets you.

## EDR is where the budget goes

Endpoint Detection and Response is the part of this stack that costs real money. For OSS-only, the answer is osquery + Wazuh, which works but requires writing detections by hand. For a 15-person team with one platform engineer, "write your own EDR detections" is not a project anyone will finish.

The honest 2026 small-team answer is **Microsoft Defender for Business** at $3/user/month. It ships in Microsoft 365 Business Premium (also useful if you're on M365 anyway), has acceptable macOS coverage, and includes managed detections written by Microsoft's security team. Cost for 15 engineers: $540/year. **CrowdStrike Falcon Go** is $60/endpoint/year if you want best-in-class detection at small-team scale; same math, $900/year for 15.

![An animated horizontal bar chart in a dark editorial palette comparing the annual endpoint stack cost for a 15-engineer team across three configurations. Top bar: OSS-only (osquery + Wazuh self-hosted) at roughly $240/year (just the VPS). Middle bar (accented, brighter cyan, coral tip): Defender for Business at $540/year, the recommended default. Bottom bar: CrowdStrike Falcon Go at $900/year. A small note underneath each bar shows what each catches and what each misses; a strip at the bottom reads 'one-time YubiKey spend not included ($1,500 for 15 engineers across all three).'](/images/lazy-security-part-5-dev-laptops/endpoint-cost-stack.gif)

*Fig. 2 — three configurations. Pick the middle bar unless you have a reason.*

The lazy stance: Defender for Business if you're on Microsoft 365 already. Falcon Go if you're not on M365 and want managed detection without the OSS-engineer overhead. osquery + Wazuh only if you have a security engineer with bandwidth to maintain the detections, which most 15-person startups don't. Pretending otherwise is how you end up with a fancy SIEM nobody reads.

## the password manager and browser hygiene argument

1Password Teams at $8/user/month. Bitwarden Teams at $4. Apple Passwords (or 1Password Families) if you're Mac-only and don't need shared vaults. Pick one and stop arguing about it on the team's `#tools` channel.

The point of the password manager isn't strong passwords. The point is:

- One place for credentials, audited.
- Shared vaults for vendor logins, instead of "share the password in Slack DM" hygiene.
- Breach notifications when a saved password appears in a public breach corpus.
- Masked email aliases (1Password feature, Apple's Hide My Email equivalent): every signup gets a separate alias, every spam list is contained.

Browser hygiene matters because the Snowflake infostealer harvested credentials from browser local storage. Specifically:

- Enforce browser auto-updates via MDM. Both Chrome and Edge expose policy keys for this; Firefox via `policies.json`.
- Block sync of work browser profiles to personal Google/Apple accounts. The "I signed into Chrome with my personal account and now all my work bookmarks are in someone else's cloud" leak is real.
- Block "developer mode" extension installs. Force extensions to come from the Chrome Web Store; force the Web Store to honor the org's allowlist via the `ExtensionInstallAllowlist` policy.
- Disable browser password saving entirely. Everything routes through the password manager.

Total: $1,440/year for 15 engineers on 1Password Teams. $720 on Bitwarden Teams. $0 on Apple Passwords if it covers your needs. Pick a line and walk it.

## the personal device problem

The Snowflake breach was about contractors using personal Macs for work. The lazy answer at a 15-person startup might surprise: corp-issue every contractor a laptop. Yes, including the four-hour-a-week consultant.

A refurbished MacBook Air with 16GB RAM is roughly $700 from Apple's Education store. The cost of a Snowflake-scale breach starts at $370K (the reported AT&T ransom) and ends in the customer-churn and legal-exposure column. The break-even point on hardware-for-contractors is under three serious incidents, ever.

![An editorial side-by-side system diagram on a dark navy ground. Left panel labeled 'personal device, BYOD' shows a laptop with chaotic state: unenforced FileVault status, a personal iCloud sign-in, a Mac App Store with personal Apple ID, a Chrome browser synced to a personal Google account, a Slack web app session that's been logged in for nine months, a folder labeled 'pirated software' with a red warning. Right panel labeled 'corp-issued, MDM enrolled' shows the same laptop with each item enforced: FileVault ON, MDM-managed Apple ID, App Store restricted, Chrome work profile only, Slack session expires daily, no third-party software installs. Each enforced item has a green check; each unenforced item on the left has a coral X. A title above reads 'where the Snowflake breach lived'.](/images/lazy-security-part-5-dev-laptops/personal-vs-corp-laptop.png)

*Fig. 3 — same laptop, different enrollment. The right panel is the one where Mandiant doesn't write your name down.*

What "no work on personal devices" actually requires:

- Contract clause: hardware is issued, personal-device use for work is prohibited.
- MDM enrollment at first boot via Apple Business Manager (or Windows Autopilot).
- Disabled iCloud personal sign-in; only managed Apple IDs.
- Wipe via MDM on offboarding, before reissue.
- No "I can just SSH from home for ten minutes" escape hatch. The escape hatch is what the contractor will use the day they get phished.

This is the section of the post that gets the most pushback. The pushback is right about cost and wrong about risk. Run the math at your scale; it runs the same direction every time.

## the receipts

For 15 engineers, the first-year laptop security budget:

- YubiKey 5 × 30 keys (two per engineer): $1,500, one-time.
- Fleet (OSS self-hosted on a small VPS): $240/year.
- Microsoft Defender for Business: $540/year. Substitute Falcon Go at $900 if not on M365, or osquery+Wazuh at $0 if you have a security engineer.
- 1Password Teams: $1,440/year. Or Bitwarden Teams at $720. Or Apple Passwords at $0.
- Refurbished corp laptops for non-employee contractors: ~$700 per, as needed.

Total recurring: roughly $1,020–$2,220/year for 15 engineers, depending on the EDR and password-manager line. Add the one-time YubiKey spend and the first year lands at $2,520–$3,720. Call it $14–$21 per engineer per month.

What it catches: every infostealer that hits a managed laptop (Defender flags it), every credential that lives in the browser (replaced by the password manager), every login that doesn't have phishing-resistant MFA (the YubiKey is required), every personal device touching production (blocked by the no-BYOD policy).

What it doesn't catch: a determined adversary with physical access and unlimited time. A laptop in a hotel room with no FileVault is owned. A laptop with FileVault and a YubiKey left in the USB-A port overnight is owned slower. Neither situation is what this stack is built for; it is built for the cracked-Logic-Pro torrent on the contractor's personal Mac.

If you do one thing this week, buy two YubiKeys for yourself, enroll them on GitHub, Google, and Okta, and turn off SMS-based MFA on each. Total cost: $100, one hour. Then do the rest of the team next quarter.
