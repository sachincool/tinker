# Running my own nameservers (outline)

> Status: OUTLINE ONLY. Most of this isn't built yet — harshit.cloud still answers
> `cloudflare`. Flesh out once the boxes are actually serving NS and DNSSEC validates.
> Voice: dry, prose-forward, no AI tells. See skills/harshit-voice.

---

## Working title options
- "I fired Cloudflare from one job: being my nameserver"
- "Glue records, two boxes, and the hubris of running my own DNS"

## Frontmatter (fill on publish)
- date: <publish date>
- tags: ["dns", "self-hosting", "infrastructure", "networking", "tor"]
- excerpt: one dry line about delegating a zone to metal you own.
- hero image: a diagram of the delegation chain (registrar → glue → ns1/ns2 → zone).

---

## The hook (why bother)
- Cloudflare is genuinely good at this. That's the point — doing it myself is a
  choice, not an upgrade. Frame honestly: control, learning, and the small thrill
  of `dig NS harshit.cloud` returning a box I can SSH into.
- What you give up: anycast, DDoS absorption, free global PoPs, someone else's pager.

## Concepts to land before the how-to
- Authoritative vs recursive. I'm running authoritative only.
- The delegation chain: root → TLD (.cloud) → my NS → my zone.
- Glue records: why `ns1.harshit.cloud` living *inside* harshit.cloud is a
  chicken-and-egg problem, and how glue at the registrar breaks the loop.
- Why you need at least two NS on different networks/ASNs (RFC 2182). One box is a
  single point of failure and most registrars reject a single-NS delegation.

## The build
1. Pick the software. Candidates + why:
   - PowerDNS (DB backend, API — nice for automation)
   - Knot DNS (fast, modern, good DNSSEC)
   - BIND (the incumbent; verbose; everyone knows it)
   - Decision + reasoning goes here.
2. Two authoritative servers, different homes:
   - ns1 → the relay box / a dedicated VPS (198.251.67.184 lineage)
   - ns2 → a second provider on a different ASN
   - Primary/secondary (AXFR/IXFR) vs both-primary-from-git. Pick one, explain.
3. Zone file: SOA, NS, A/AAAA (remember the AAAA — IPv6 from day one), MX, TXT.
4. Registrar side: register `ns1`/`ns2` as host records + add glue (A/AAAA).
5. Flip the delegation. Expect propagation lag; expect to be nervous.

## DNSSEC (its own act)
- KSK/ZSK, signing the zone, pushing the DS record to the registrar.
- How to verify: `dig +dnssec`, `delv`, DNSViz.
- The failure mode everyone hits: expired signatures = silent NXDOMAIN. Automate
  re-signing or you will take yourself offline at 3am.

## Operating it (the unsexy part)
- Monitoring: is the zone serving from BOTH boxes? Serial numbers in sync?
- Backups of keys (lose the KSK and DNSSEC is a bad day).
- Rate limiting / RRL so the boxes don't become a reflection-attack amplifier.
- A runbook for "DNS is down" — because now that pager is mine.

## Verification section (show, don't tell)
- `dig NS harshit.cloud` → my boxes
- `dig AAAA harshit.cloud` → dual-stack
- `dig +dnssec harshit.cloud` → RRSIG present, AD bit set
- ties back to the /lab "poke at the stack" list

## Honest closer
- What broke, what I'd do differently, whether I'd recommend it (probably: "no,
  and I'm keeping it").
- Link to the /lab page and the onion mirror.

## Open questions to resolve before writing
- [ ] Which DNS server did I actually pick, and why?
- [ ] Where does ns2 live (which provider/ASN)?
- [ ] Primary/secondary or git-driven both-primary?
- [ ] Keep Cloudflare as a hidden secondary for safety, or go cold turkey?
