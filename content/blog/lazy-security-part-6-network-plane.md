---
title: "Lazy SRE's guide to secure systems, part 6: the network in front of everything"
date: "2026-05-10"
tags: ["security", "devsecops", "lazy-sre", "network", "vpn", "tailscale"]
excerpt: "Ivanti made everyone re-read their VPN architecture in January 2024. Tailscale, Cloudflare Tunnel, and WireGuard in one afternoon."
featured: false
series: "Lazy Security"
seriesPart: 6
---

In January 2024, Ivanti disclosed two CVEs in their Connect Secure and Policy Secure VPN appliances. CVE-2023-46805 was an authentication bypass. CVE-2024-21887 was an unauthenticated command injection: a remote shell on a box that, by design, had to be reachable from the public internet. Mandiant attributed the in-the-wild exploitation to UNC5221, a suspected Chinese state-sponsored cluster. By the time Ivanti shipped a patch, Mandiant had identified more than a thousand compromised appliances. CISA issued Emergency Directive 24-01 telling every U.S. federal agency to take their Ivanti boxes offline.

This is part 6. Earlier parts covered npm ([Part 1](/blog/lazy-security-part-1-supply-chain)), GitHub Actions ([Part 2](/blog/lazy-security-part-2-github-actions)), the unsexy infrastructure list ([Part 3](/blog/lazy-security-part-3-unsexy-list)), DNS auth records ([Part 4](/blog/lazy-security-part-4-dns-records)), and the dev laptop perimeter ([Part 5](/blog/lazy-security-part-5-dev-laptops)). Part 6 is the network in front of everything. What sits between your engineers and prod, and between prod and the public internet.

The thesis from Part 1 stands. Future You at 3am will not patch a VPN concentrator the same week the CVE lands, especially when the vendor patch breaks LDAP for half the team. The architecture that makes the concentrator irrelevant is the one that runs while you sleep: a mesh network where there is no internet-facing appliance to compromise in the first place.

## the VPN appliance is the attack surface

The Ivanti CVEs are not a unique event. They're the most recent member of a class. The same year (2024) saw:

- **Cisco ASA / FTD**: CVE-2024-20353 + CVE-2024-20359. A web-services DoS and a persistent local code-execution flaw used together by the ArcaneDoor campaign (Line Dancer / Line Runner implants), attributed by Cisco Talos to state-sponsored actors. April 2024.
- **Citrix NetScaler "CitrixBleed"**: CVE-2023-4966. A session-token leak via memory disclosure, exploited by LockBit and others, used in the Boeing and Comcast breaches.
- **Fortinet FortiOS SSL VPN**: CVE-2024-21762. Out-of-bounds write in February 2024, exploited in the wild before patches were widely deployed.
- **Palo Alto Networks GlobalProtect**: CVE-2024-3400. Command injection in April 2024, exploited in a campaign Palo Alto Networks Unit 42 named Operation MidnightEclipse (Volexity tracks the actor as UTA0218).

![A wide editorial system diagram on deep navy ground. Center: a large rectangular box labeled 'YOUR VPN APPLIANCE: internet-facing HTTPS portal' with five sub-labels (login UI, session manager, tunnel termination, admin panel, OS). Five red curved arrows from the outside converge on it, each labeled with a real 2023-2024 CVE: CVE-2023-46805 (Ivanti), CVE-2024-21887 (Ivanti), CVE-2024-20353 (Cisco), CVE-2023-4966 (CitrixBleed), CVE-2024-3400 (Palo Alto). Behind the appliance, a smaller cluster of internal services labeled 'prod database', 'admin panel', 'engineer SSH'. The cluster is all reachable once the appliance is compromised. The whole assembly sits inside a coral-tinted boundary labeled 'the attack surface you can't shrink'. A small inset on the right shows the mesh alternative as a dotted hexagon of peers with no central appliance, captioned 'no concentrator, no portal, no inbound port'.](/images/lazy-security-part-6-network-plane/vpn-appliance-attack-surface.png)

*Fig. 1 · five vendors, twelve months, the same shape of vulnerability. The mesh alternative is the small diagram on the right.*

Five different vendors. Five different products. Five different attacker campaigns. The common shape is a publicly reachable HTTPS portal that handles authentication and tunnel termination. Every one of them has had a pre-authentication remote code execution in the last twelve months. That isn't a coincidence; it's an architecture.

What mesh networks (Tailscale, Cloudflare Access, Headscale, native WireGuard) don't have is an internet-facing login portal. The control plane authenticates over the same OIDC/SSO your engineers already use; the data plane is WireGuard between authorized peers; there is no single box that, if compromised, lets the attacker into the rest of the network. The lazy stance is: don't run a VPN appliance. Every use case has a mesh-or-proxy answer that ships with less attack surface and less operational pain.

## Tailscale for outbound

The fast path: install the daemon on every machine you want to access from, and every machine you want to access. Each daemon authenticates against your IdP. Within sixty seconds, every node in your tailnet can reach every other node over WireGuard, with private IPv4/IPv6 addresses inside the tailnet.

Replace `ssh user@bastion.yourorg.com` with `tailscale ssh user@prod-db.your-tailnet.ts.net`. Replace `grafana.yourorg.com` (publicly reachable, gated by a Cloudflare IP allowlist that nobody can remember the source of) with `grafana.your-tailnet.ts.net` (only reachable to tailnet members, no public DNS record, no public route).

![A hand-drawn napkin showing a Tailscale ACL annotated with marker arrows and red callouts. The center of the napkin has a 20-line ACL in HuJSON (JSON with comments), with tagOwners, groups, and acls sections. Red arrows point from the 'group:engineers' line to a sketch of three engineer laptop icons, from 'tag:prod-db' to a sketched database cylinder with a 'prod' label, and from the comment '// only platform can reach prod databases' to a small underline beneath the matching ACL rule. A red callout reads 'twenty lines of declarative-policy → entire access plane'. Bottom strip mirrors Parts 1/3/4 chevron pattern with colored dots: 'one ACL → one SSO group → one git diff → entire blast radius'.](/images/lazy-security-part-6-network-plane/tailscale-acl-napkin.png)

*Fig. 2 · twenty lines of HuJSON beats two hundred lines of iptables, and you can `git diff` the change.*

The ACL itself, in HuJSON (JSON with comments, native to Tailscale):

```json
{
  "tagOwners": {
    "tag:prod-db":  ["group:platform"],
    "tag:internal": ["group:platform"]
  },
  "groups": {
    "group:platform":  ["[email protected]", "[email protected]"],
    "group:engineers": ["group:platform", "[email protected]"]
  },
  "acls": [
    // Engineers can reach internal HTTP services.
    { "action": "accept", "src": ["group:engineers"], "dst": ["tag:internal:80,443,3000,8080"] },
    // Only platform can reach prod databases.
    { "action": "accept", "src": ["group:platform"],  "dst": ["tag:prod-db:5432,6379,9200"] }
  ]
}
```

Twenty lines of declarative policy. Each change is a PR. Each merge is reviewed. Each rule is a sentence a human can read in three seconds. The version of this living in iptables is two hundred lines that nobody touches because nobody knows whether the bottom forty are still load-bearing.

Cost: under Tailscale Pricing v4 (April 2026), Free covers up to 6 users and 100 devices. Paid plans are Standard at $6/user/month, Premium at $18/user/month, and Enterprise above that. For a 15-person team, $90/month on Standard buys SSO, audit logs, and ACL change history.

## Cloudflare Tunnel for inbound

Different shape of problem. You have a service that needs to be reachable to specific users (employees, customers, a vendor's support team) but should never have a public DNS record. The wrong answer is putting it on the public internet with an IP allowlist. The right answer is Cloudflare Tunnel.

The architecture: `cloudflared` runs on the origin and dials *outbound* to Cloudflare's edge. There is no inbound port. The origin has no public IP. Cloudflare Access (the policy layer) sits in front of the URL and requires the user to authenticate via your IdP (Google, Okta, GitHub, OneLogin, generic OIDC) before the request is proxied to the origin.

```bash
# On the origin
cloudflared tunnel login
cloudflared tunnel create vendor-admin
cloudflared tunnel route dns vendor-admin admin.yourorg.com
cloudflared tunnel run vendor-admin
```

Three commands of consequence. The vendor admin panel is now reachable at `admin.yourorg.com`, gated by your SSO, with no public route to the underlying service. Add Cloudflare Access policy rules (a few clicks in the dashboard or a Terraform resource) to require a specific Okta group, a specific email domain, a specific device posture, or an mTLS cert.

Cost: Cloudflare Zero Trust Free covers up to 50 users. $7/user/month above that. The Tunnel daemon itself is free; the metering is on Access seats.

## WireGuard, when you can't run Tailscale

For the regulated, air-gapped, or contract-forbids-SaaS case, WireGuard has been in mainline Linux since kernel 5.6 (March 2020) and is enabled by default in most distros. The configuration is plain text. The minimum viable setup is about twenty lines per peer.

```ini
# /etc/wireguard/wg0.conf, on the server
[Interface]
Address = 10.7.0.1/24
ListenPort = 51820
PrivateKey = <server-private-key>

[Peer]
PublicKey = <engineer-public-key>
AllowedIPs = 10.7.0.2/32
```

```ini
# On the engineer's laptop
[Interface]
Address = 10.7.0.2/32
PrivateKey = <engineer-private-key>

[Peer]
PublicKey = <server-public-key>
Endpoint = vpn.yourorg.com:51820
AllowedIPs = 10.7.0.0/24, 192.168.10.0/24
PersistentKeepalive = 25
```

`wg-quick up wg0` and the tunnel is live.

The pain at scale is peer management. Twenty engineers means twenty keypairs, twenty `AllowedIPs` blocks on the server, and a manual re-deploy each time someone joins or leaves. Two OSS tools fix that: **Headscale**, which is a Tailscale-protocol-compatible control plane you self-host (same Tailscale clients on each device, but the coordination server is yours); and **wg-easy**, a small web UI for adding and removing peers. Both give you the Tailscale UX with none of the SaaS dependency.

When to pick this path over Tailscale: your contract forbids data-plane traffic transiting a U.S. SaaS, you operate in a region where Tailscale can't legally provide service, or you're regulatory-bound to run the full stack yourself. Otherwise, Tailscale Standard at $6/user/month is a better use of a platform engineer's time than peer management cron jobs.

## the ACLs you can actually read

The reason the appliance era was painful wasn't just the CVEs. It was the iptables rulesets nobody read.

```
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -i lo -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp -d 10.0.1.5 --dport 22 -s 10.0.0.0/24 -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp -d 10.0.1.5 --dport 5432 -s 10.0.0.50/32 -j ACCEPT
-A INPUT -m state --state NEW -m tcp -p tcp -d 10.0.1.6 --dport 6379 -s 10.0.0.50/32 -j ACCEPT
# ... 200 more lines, no comments, no group names, no diff history
```

versus the Tailscale ACL above. Twenty lines of declarative policy, with group names that mirror Okta groups, with comments that say what each rule is for, version-controlled in `git`. The same is true for Cloudflare Access policies (declarative JSON, also Terraform-supported), Headscale ACLs (the same HuJSON Tailscale uses), and even WireGuard's `AllowedIPs` per peer (one line per route per peer).

If the only person who can read your firewall rules is the person who wrote them three years ago, that is a security problem, not just an operations problem. The audit answer "what does the prod network allow?" should be a `git log` and a code review, not a screen-share with the senior engineer who took notes on a sticky.

## the receipts

For 15 engineers, the network-in-front-of-everything bill:

- **Tailscale Standard** at $6/user/month: $90/month for 15 engineers. Covers SSH-to-bastion, internal HTTP access, prod database access, MagicDNS, ACL audit logs. The primary line item.
- **Cloudflare Zero Trust Free** (<50 users): $0. Replaces public-internet vendor portals, internal-with-SSO web apps, customer-facing internal tools.
- **Self-hosted WireGuard or Headscale**: $0, plus a small VPS for the control plane if needed (~$5/month). For the use case Tailscale can't legally cover.
- **The retired VPN appliance contract**: somewhere between $5K and $50K per year, depending on vendor and seat count, going back into your budget when the contract ends.

![An animated horizontal bar chart in a dark editorial palette comparing the annual access-plane cost for a 15-engineer team across four configurations. Top bar: legacy SSL VPN appliance (Pulse Secure / Ivanti / GlobalProtect at small-business pricing) at roughly $600/year plus the CVE risk; subtitle 'plus appliance ops time'. Middle-top bar (accented, brighter cyan, coral tip): Tailscale Standard at $1,080/year (15 × $6/mo × 12); subtitle 'recommended default'. Middle-bottom bar: Tailscale Free + Cloudflare Zero Trust Free at $0; subtitle 'works up to 6 users / 50 seats'. Bottom bar: self-hosted Headscale + WireGuard at $60/year (just a small VPS); subtitle 'for the air-gapped or contract-bound case'. Annotation strip notes the appliance bar's true cost is dominated by patch/CVE response and is undercounted at $600.](/images/lazy-security-part-6-network-plane/access-plane-cost-stack.gif)

*Fig. 3 · the bottom two bars are not an emergency, the top bar is.*

Net cost: $90/month for the access plane covering most of the surface, with optional fallbacks at near-zero cost. For comparison, the median per-seat price of a legacy SSL VPN appliance (Pulse Secure / Ivanti, GlobalProtect, AnyConnect) at small-business pricing is around $40/seat/year, or roughly the same number, without the CVE risk and without the iptables ruleset.

What this catches: every internet-facing VPN appliance CVE, because you don't have one. Every "the bastion's security group was opened to 0.0.0.0/0 to debug a contractor's IP last summer and never closed" incident, because the bastion isn't reachable. Every "the static VPN certificate leaked from a contractor's laptop" incident, because the credential is a short-lived OIDC session, not a long-lived cert.

What it doesn't catch: a compromise of your IdP itself. If an attacker controls Okta, they control your tailnet. (Cloudflare's Thanksgiving 2023 incident report, attributed to Okta's October 2023 support-system breach, is the canonical reference for this failure mode and the response.) The mitigation lives in [Part 3](/blog/lazy-security-part-3-unsexy-list): FIDO2-only admin access on the IdP, audit log streaming, and a runbook for "rotate all sessions in five minutes."

If you do one thing this week, install Tailscale on your laptop and one prod host, get them talking over the tailnet, and replace one `ssh bastion.yourorg.com` invocation with `tailscale ssh prod-host`. Cost: zero. Time: ten minutes. Then plan the rest of the rollout for next quarter, when you have the budget conversation with whoever still pays for the SSL VPN renewal.
