---
title: "Blocking AI Crawlers is the New 'noindex'"
date: "2026-01-21"
tags: ["seo", "ai", "crawlers", "strategy"]
type: "til"
---

# TIL: Blocking AI Crawlers is the New "noindex"

If you're blocking GPTBot, Anthropic, Perplexity, Gemini — you're trading future reach for short-term control.

## the math

AI search traffic today: ~1%
AI search traffic tomorrow: 25–35%

Let them crawl. Train the discovery layer. Be early.

## common AI crawler user agents

| Crawler | Company |
|---------|---------|
| `GPTBot` | OpenAI |
| `ClaudeBot` / `Anthropic-AI` | Anthropic |
| `PerplexityBot` | Perplexity |
| `Google-Extended` | Google (Gemini) |

## the robots.txt decision

Blocking these crawlers:

```
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /
```

Feels like control. Actually it's invisibility.

## why this matters

When someone asks an AI "how do I do X" and your content isn't in the training data, you don't exist in that conversation.

The sites that trained the discovery layer early will own the AI search results later.

Visibility > invisibility.
