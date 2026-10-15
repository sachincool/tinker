import { headers } from 'next/headers';
import { getCurrentDomain } from '@/lib/site-config';

// ponytail: a route handler instead of Next's robots.ts, because
// MetadataRoute.Robots has a closed shape and cannot emit the Content-Signal
// directive, which must sit inside the wildcard group. Same output otherwise.

// AI crawlers are explicitly allowed. The bet: AI search will be the
// discovery layer; sites that train it early get cited later. See
// /til/blocking-ai-crawlers for the reasoning.
const AI_AGENTS = [
  'Googlebot',
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'meta-externalagent',
];

export async function GET() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  const body = [
    '# Content Signals Policy (https://contentsignals.org/). Expresses how this',
    '# content may be used after it is crawled. Preferences, not access control.',
    'User-Agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /_next/',
    '',
    ...AI_AGENTS.flatMap((ua) => [`User-Agent: ${ua}`, 'Allow: /', '']),
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
