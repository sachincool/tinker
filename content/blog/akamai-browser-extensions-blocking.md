---
title: "Access denied: when your browser extensions look like attack vectors"
date: "2025-12-31"
tags: ["security", "waf", "akamai", "debugging", "browser-extensions", "cdn"]
excerpt: "Tried booking a flight. Got blocked. Turns out Akamai thinks my 21 security extensions make me look like a hacker. They're not wrong."
featured: true
---

Last week I tried booking a flight on Indigo. Access Denied. Tried MakeMyTrip. Access Denied. Ixigo? Same story. Yatra? Blocked.

My banking apps worked fine. But every travel booking site using Akamai's CDN decided I was public enemy number one. Sometimes the site would load, then the OTP API calls would silently fail. Making a complete fool out of me at checkout.

![Indigo Access Denied](/images/akamai-browser-extensions-blocking/indigo_access_denied.png)

*Fig. 1 · every travel booking site behind Akamai locked me out with the same Access Denied page.*

![MakeMyTrip's booking page returning the same Akamai Access Denied error.](/images/akamai-browser-extensions-blocking/mmt_access_denied.png)

*Fig. 2 · MakeMyTrip served the identical block page, so this wasn't one site's bad config.*

## the debugging rabbit hole

First thought: bad IP from my ISP's CGNAT pool. Changed my IP. Worked for 10 minutes. Then blocked again.

Second thought: maybe Akamai's IP reputation is flagging me. Checked their [Client Reputation lookup](https://www.akamai.com/us/en/clientrep-lookup/).

![Akamai's Client Reputation lookup showing my IP with a clean reputation score.](/images/akamai-browser-extensions-blocking/akamai_repo_ip.png)

*Fig. 3 · Akamai's own Client Reputation lookup rated my IP clean, which ruled out an IP-reputation block.*

Nope. Clean as a whistle.

![IP details showing a Tata Play connection in Bengaluru.](/images/akamai-browser-extensions-blocking/my_ip.png)

*Fig. 4 · my connection was Tata Play in Bengaluru, nothing exotic.*

Google dorking time. Found tons of users globally facing the same issue. Not ISP-specific. Not India-specific. Something else was up.

Then I found [this blog](https://leinss.com/blog/?p=3409) that pointed at browser extensions. Interesting.

## the lightbulb moment

Switched from Arc to Chrome. Still blocked. Because I carried over the same 21 extensions like a digital hoarder.

![The first screen of installed Chrome extensions, a long grid of security tools.](/images/akamai-browser-extensions-blocking/extensions.png)

*Fig. 5 · part of the 21-extension pile I'd carried across browsers.*

![The second screen of installed extensions, mostly OSINT and recon tools.](/images/akamai-browser-extensions-blocking/extensions_2.png)

*Fig. 6 · the rest of the arsenal, heavy on OSINT and recon tools.*

Here's my toolkit: Wappalyzer, Shodan, Trufflehog, DotGit, and a bunch of OSINT/greyhat recon tools. The same extensions I use for security research were making me look like an attacker to Akamai's Bot Manager.

Turned off all extensions. Instant access to every site.

## what's actually happening

Akamai's Bot Manager isn't counting your requests. It's fingerprinting the client environment. Browser extensions can inject JavaScript, mutate the DOM, alter request behavior, and add tracking parameters: all things the client-side fingerprint will flag as bot-shaped, the same way it would flag a scraper or an injection probe.

My security toolkit became my own DoS attack vector. Poetic, really.

Some users reported User-Agent changes helped. I didn't test that. I also didn't have time to debug which of the 21 extensions was the actual culprit. Life's too short for that level of troubleshooting.

## what I'd check first

WAF rules are aggressive by design. Your legitimate security tools look exactly like attack vectors because, well, they kind of are. The line between security researcher and threat actor is thinner than we'd like to admit.

If you're getting blocked by Akamai with a clean IP:

1. Check your extensions first, not your ISP
2. VPN working temporarily? That's behavioral detection, not IP blocking
3. The Client Reputation tool won't catch extension-based triggers
4. Your OSINT toolkit makes CDNs nervous

Infrastructure is meant to keep bad actors out. Sometimes it keeps infrastructure wizards out too. Not fun.
