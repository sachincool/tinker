---
title: "Lazy SRE's guide to secure systems, part 4: the four DNS records"
date: "2026-04-26"
tags: ["security", "devsecops", "lazy-sre", "dns", "email", "dmarc"]
excerpt: "Four DNS records that close the entire phishing-impersonation class: SPF, DKIM, DMARC, and CAA, plus two monitors, set up correctly in one afternoon."
featured: false
series: "Lazy Security"
seriesPart: 4
---

In February 2024, Guardio Labs published a writeup of a campaign called SubdoMailing. Five million phishing emails a day, sent through subdomains owned by MSN, eBay, VMware, NYC.gov, UNICEF, and McAfee. Every single email passed SPF and DKIM. Every one of them passed DMARC.

The attack didn't break those protocols. It used them. Each victim domain had an `include:` line in its SPF record pointing at a contractor's domain that had been allowed to expire. The attackers re-registered the orphan, inherited the trust, started sending. Some of the broken `include:` chains had been broken for over a year. Guardio dated the operation back to at least late 2022. Nobody had thought to read their own SPF record again after writing it.

This is part 4. Earlier parts covered npm ([Part 1](/blog/lazy-security-part-1-supply-chain)), GitHub Actions ([Part 2](/blog/lazy-security-part-2-github-actions)), and identity, network, and audit logs ([Part 3](/blog/lazy-security-part-3-unsexy-list)). Part 4 is four DNS records and two monitors. One afternoon to write them, three weeks for DMARC to ramp safely. Zero ongoing cost. Closes the entire phishing-impersonation class and the entire rogue-certificate class at the same time.

Future You at 3am will not investigate an SPF chain when finance forwards a wire-transfer email. The records that run in their place will.

## SPF, and the include trap

SPF stands for Sender Policy Framework. The record lives in DNS as a TXT entry on your apex domain. It declares which IP addresses or domains are allowed to send email on your behalf. The receiving mail server checks the sending IP against the list. The check passes or it fails. That is the entire protocol.

The record itself:

```
yourorg.com TXT "v=spf1 include:_spf.google.com include:mailgun.org -all"
```

`v=spf1` is the version marker. `include:` delegates to another domain's SPF record, which expands at lookup time to that vendor's actual IP allowlist. `-all` says anything not listed is hard-fail.

That last token matters. `-all` (hard-fail) tells receivers to reject anything not on the list. `~all` (soft-fail) tells them to mark it suspicious but maybe deliver anyway. `?all` (neutral) tells them you have no opinion. Every getting-started guide ever written defaults to `~all` "to be safe." The major receivers have said for years that they treat `~all` and `-all` the same in scoring. The lazy answer is `-all`. The only reason to use `~all` is during a migration when you can't yet enumerate every legitimate sender.

![A horizontal editorial timeline of the SubdoMailing campaign on a deep navy ground. Six stages along a single line, from a contractor's SPF include published in 2021 through the contractor domain expiring in 2023, an attacker re-registering it in late 2023, the attacker publishing their own SPF record under the orphan, 5 million phishing emails a day passing SPF and DMARC in February 2024, and Guardio Labs' disclosure of 8000 affected subdomains. Attacker-controlled stages in coral, victim stages in cyan, ghosted 'ORPHAN' and 'INHERITED TRUST' phase labels strung across the background.](/images/lazy-security-part-4-dns-records/subdomailing-timeline.png)

*Fig. 1 · three years from include line to five million phishing emails a day. The SPF record never changed.*

The SPF spec has a ten-DNS-lookup limit. Every `include:` counts, recursively. If you chain five SaaS senders (Google + Mailgun + Postmark + SendGrid + Stripe), each one's `include:` expands into its own record, which may include another, and you can blow the limit without realizing. When you blow the limit, the record evaluates as `permerror`, and many receivers treat that as "no SPF," which means anyone can spoof you. Tools like `dmarcian.com/spf-survey` count the lookups for free. Audit yours.

The SubdoMailing failure mode is what happens when one `include:` points at a contractor whose domain you don't control. The contractor goes out of business. The registration expires. Someone buys the lapsed domain. They publish their own SPF allowlist. Your domain now declares that the buyer is an authorized sender for you. Every email they send passes SPF. The fix is to audit your `include:` chain quarterly: does every domain in it still belong to someone you trust? Most teams have never done this once.

## DKIM, in DNS

DKIM (DomainKeys Identified Mail) is a cryptographic signature on every outbound email. The signing key is a public/private keypair. The private key lives in your mail server (Google Workspace, Microsoft 365, Postmark, your own Postfix, whatever). The public key lives in DNS, under a selector subdomain.

```
selector1._domainkey.yourorg.com TXT "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ..."
```

The selector (`selector1` here) is so you can rotate keys. Publish a new selector, switch the mail server to sign with the new private key, leave the old selector live for a week so in-flight emails still verify, then retire it. Most providers handle this rotation for you once the original selector is configured.

Two things go wrong in practice. First, key length. RSA-1024 was the standard a decade ago and is now considered weak; RSA-2048 is the current default. Some old DKIM records still publish 1024-bit keys, and many major receivers now fail or ignore 1024-bit signatures. Audit with `dig TXT selector1._domainkey.yourorg.com`. Second, third parties signing on your behalf without your knowledge. If finance connects a new SaaS tool that sends email as `noreply@yourorg.com` and nobody sets up DKIM for that path, that vendor's emails will fail DKIM alignment. Receivers see a domain with DKIM mostly working and one path failing, which is often enough to flag the whole domain in spam filters.

Most providers (Google Workspace, Microsoft 365, Postmark, Mailgun, SendGrid) make DKIM publishing a checklist item in their onboarding. If a vendor doesn't, that is a signal about the vendor's sophistication, not yours.

## DMARC, the part that does the work

DMARC (Domain-based Message Authentication, Reporting & Conformance) is the policy layer on top of SPF and DKIM. It tells receivers what to do when SPF and DKIM checks fail, and it tells you, via aggregate reports, what's happening to your domain in the wild.

A minimal DMARC record:

```
_dmarc.yourorg.com TXT "v=DMARC1; p=reject; sp=reject; rua=mailto:dmarc@yourorg.com; pct=100; adkim=s; aspf=s"
```

The fields that matter:

- `p=reject`: policy for emails that fail both SPF and DKIM on the apex. Three values, `none` (just report), `quarantine` (deliver to spam), `reject` (drop). The end state is `reject`. The path is `none → quarantine → reject`.
- `sp=reject`: same policy for subdomains. This is the SubdoMailing detail every public DMARC how-to forgets. A domain with `p=reject` but `sp=none` is wide open for subdomain abuse. Set both.
- `rua=mailto:`: where aggregate reports get sent. Free DMARC report parsers (Postmark, dmarcian, EasyDMARC) accept these and render them as human-readable summaries.
- `pct=100`: fraction of failing mail to apply the policy to. Start at 25% during the ramp, end at 100%.
- `adkim=s` and `aspf=s`: strict alignment. The From-address domain must match the DKIM signing domain (and SPF return path) exactly. The default is relaxed, which lets subdomains substitute. Strict is what you want unless something is breaking.

The ramp from `p=none` to `p=reject` is what takes three weeks. The risk is breaking a legitimate sender path you didn't know existed. Week one, publish `p=none; pct=100`. Receive DMARC aggregate reports for seven days. Identify every IP and `From:` domain that sent on your behalf. There will be three or four you didn't expect: a newsletter platform finance signed up for, an HR tool, a calendar invite system. Onboard each into SPF and DKIM. Week two, move to `p=quarantine; pct=25`, watch reports for new failures. Week three, `p=reject; pct=100`. Done.

![An animated horizontal bar chart in a dark editorial palette showing FBI IC3 business email compromise losses in the United States by year, from 2020 ($1.8B) through 2024 ($2.77B). Bars fill in sequence. The 2024 bar is accented with a brighter cyan and a coral tip. A bottom strip notes that the average loss per incident in 2024 was $129K and that the dataset is U.S.-only, and that global BEC losses are higher.](/images/lazy-security-part-4-dns-records/bec-losses.gif)

*Fig. 2 · BEC losses by year, U.S. only. The 2024 number exceeded ransomware.*

Most small teams stop at `p=quarantine` and never finish the ramp. The difference between `quarantine` and `reject` is whether the attacker's spoofed wire-transfer email lands in the CFO's spam folder or never enters the mail system at all. Spam is where employees go to recover legitimate mail that was filtered too aggressively, which means they go there to fish out emails they want to trust. Reject is the answer.

## CAA, two lines to gate cert issuance

CAA (Certification Authority Authorization) is a DNS record that names which Certificate Authorities are allowed to issue TLS certificates for your domain. Without one, any publicly trusted CA in the world can issue a cert for your domain to anyone who passes that CA's domain-validation challenge. With one, only the CAs you've named can.

```
yourorg.com CAA 0 issue "letsencrypt.org"
yourorg.com CAA 0 issuewild "letsencrypt.org"
yourorg.com CAA 0 iodef "mailto:security@yourorg.com"
```

`issue` restricts standard certificates. `issuewild` restricts wildcard certificates. `iodef` is where notifications are sent when an unauthorized CA tries to issue. If you use multiple CAs (one for ACM in AWS, one for Let's Encrypt in your edge, one for Cloudflare-managed certs), list them all:

```
yourorg.com CAA 0 issue "letsencrypt.org"
yourorg.com CAA 0 issue "amazon.com"
yourorg.com CAA 0 issue "digicert.com"
```

CAA cannot prevent a misbehaving CA from issuing anyway. But CAs are required by the CA/Browser Forum baseline requirements to honor CAA at issuance time. They mostly do. When they don't, the misissuance ends in a Mozilla CA-incident bug report and eventual CA distrust. CAA exists so that legitimate misissuance is detected (because the CA you named never issued the cert and the issuing CA broke the rule) and accidental misissuance is structurally impossible. Both buy you something.

Cost: three DNS lines. Effort: ten minutes. Catches a class of attack (man-in-the-middle via misissued cert) that most teams have no other defense against.

## the monitors

Two streams pay back the four records.

First, certificate transparency log monitoring. Every publicly trusted CA is required to log every certificate they issue to public append-only logs. `crt.sh` is a free queryable index. The `certstream` Python library streams new entries in real time, also free. Cloudflare offers free CT monitoring for any domain on its DNS. Whatever you pick, the workflow is: cert is issued for `*.yourorg.com` → log entry appears within seconds → your monitor pages a Slack channel → you check whether you issued it. If you didn't, that is an incident, not a notification.

![A hand-drawn napkin showing the four DNS records as a cheat sheet, written in marker, ready to copy into a DNS panel. Top of the napkin reads 'the four-record afternoon'. Four labeled blocks underneath: SPF as a TXT record with `-all` circled in red, DKIM as a TXT record with the selector subdomain highlighted, DMARC with `p=reject` and `sp=reject` both underlined twice, CAA with the issuer name circled. Bottom of the napkin has two boxes labeled 'CT log monitor' and 'DMARC report inbox', with arrows pointing to a small Slack icon and a small email icon. A red callout at the bottom reads 'fifteen minutes a week'.](/images/lazy-security-part-4-dns-records/dns-records-napkin.png)

*Fig. 3 · the whole afternoon, sketched. Plus what runs after.*

Second, DMARC aggregate report parsing. The `rua=` address in your DMARC record receives daily XML reports from every receiver. Reading the XML raw is unpleasant. The free tiers of Postmark, dmarcian, and EasyDMARC all accept the report stream and render it as "here are the IPs that sent as you this week, here are the ones that failed alignment, here are the new ones since last week." The new-sender alerts are where you find out that someone in marketing has connected a SaaS tool that's now sending emails as you, failing alignment, and getting your domain reputation downgraded.

A weekly fifteen-minute review of both monitors is what good looks like at a 25-person team. The cost is fifteen minutes a week. The product is "we'd have noticed if someone issued a cert for our login subdomain on Tuesday."

## the receipts

Four DNS records. Two monitors. One afternoon for the records, three weeks for the DMARC ramp, fifteen minutes a week for the reviews. Cost: zero, unless you upgrade past the free tier of a DMARC parser at $15–$50 a month, which is the only thing on the list that's not free.

What this catches: every attempt to send email impersonating your domain from outside your authorized sender list, every attempt to issue a TLS cert for your domain from an unauthorized CA. The FBI's 2024 IC3 report attributed $2.77B in U.S. business email compromise losses to roughly 21,000 incidents, a $129K average. The fraction of those that would have been caught by a domain publishing `p=reject; sp=reject` with an honest SPF audit is enormous.

What it doesn't catch: phishing from a lookalike domain (`yourorg-corp.com`, `yourorg-support.com`, `yourorg.co`). Lookalike-domain defense needs a paid monitoring service at the tier that matters, and there's no free version that works at small-team scale. Skip it until you have a budget line for security. Note it in the runbook.

If you do one thing this week, publish `_dmarc.yourorg.com TXT "v=DMARC1; p=none; rua=mailto:dmarc@yourorg.com"` and point the address at a Postmark free-tier DMARC inbox. Read the first report in seven days. The list of senders you didn't know about is the answer to "why has this been skipped for two years."
