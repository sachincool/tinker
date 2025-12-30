---
title: "Access Denied: Edgesuite Edition - When Your Browser Extensions Become Attack Vectors"
date: "2025-12-31"
tags: ["security", "waf", "akamai", "debugging", "browser-extensions", "cdn"]
excerpt: "Tried booking a flight. Got blocked. VPN didn't help. IP was clean. Turns out Akamai thinks my 21 security extensions make me look like a hacker. They're not wrong."
featured: true
type: "post"
---

Last week I tried booking a flight on Indigo. Access Denied. Tried MakeMyTrip. Access Denied. Ixigo? Same story. Yatra? Blocked.

My banking apps worked fine. But every travel booking site using Akamai's CDN decided I was public enemy number one. Sometimes the site would load, then the OTP API calls would silently fail. Making a complete fool out of me at checkout.

![Indigo Access Denied](/images/akamai-browser-extensions-blocking/indigo_access_denied.png)

![MakeMyTrip Access Denied](/images/akamai-browser-extensions-blocking/mmt_access_denied.png)

## The Debugging Rabbit Hole

First thought: bad IP from my ISP's CGNAT pool. Changed my IP. Worked for 10 minutes. Then blocked again.

Second thought: maybe Akamai's IP reputation is flagging me. Checked their [Client Reputation lookup](https://www.akamai.com/us/en/clientrep-lookup/).

![Akamai Clean IP Reputation](/images/akamai-browser-extensions-blocking/akamai_repo_ip.png)

Nope. Clean as a whistle.

![My IP Info - Tata Play, Bengaluru](/images/akamai-browser-extensions-blocking/my_ip.png)

Google dorking time. Found tons of users globally facing the same issue. Not ISP-specific. Not India-specific. Something else was up.

Then I found [this blog](https://leinss.com/blog/?p=3409) that pointed at browser extensions. Interesting.

## The Lightbulb Moment

Switched from Arc to Chrome. Still blocked. Because I carried over the same 21 extensions like a digital hoarder.

![My Extension Arsenal - Part 1](/images/akamai-browser-extensions-blocking/extensions.png)

![My Extension Arsenal - Part 2](/images/akamai-browser-extensions-blocking/extensions_2.png)

Here's my toolkit: Wappalyzer, Shodan, Trufflehog, DotGit, and a bunch of OSINT/greyhat recon tools. The same extensions I use for security research were making me look like an attacker to Akamai's WAF.

Turned off all extensions. Instant access to every site.

## What's Actually Happening

Akamai's WAF isn't counting your requests. It's analyzing payload signatures. Browser extensions inject JavaScript, modify headers, and add tracking parameters to every request. To a WAF, that looks identical to automated scraping tools or injection attempts.

My security toolkit became my own DoS attack vector. Poetic, really.

Some users reported User-Agent changes helped. I didn't test that. I also didn't have time to debug which of the 21 extensions was the actual culprit. Life's too short for that level of troubleshooting.

## The Takeaway

WAF rules are aggressive by design. Your legitimate security tools look exactly like attack vectors because, well, they kind of are. The line between security researcher and threat actor is thinner than we'd like to admit.

If you're getting blocked by Akamai with a clean IP:
1. Check your extensions first, not your ISP
2. VPN working temporarily? That's behavioral detection, not IP blocking
3. The Client Reputation tool won't catch extension-based triggers
4. Your OSINT toolkit makes CDNs nervous

Infrastructure is meant to keep bad actors out. Sometimes it keeps infrastructure wizards out too. Not fun.

Got blocked by Akamai with your security toolkit? Which extension was your culprit? Reach out if this saved you from the same rabbit hole.

