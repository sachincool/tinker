// Production canonical for build-time metadata (Vercel previews shouldn't leak into canonicals)
const PRODUCTION_SITE_URL = 'https://harshit.cloud';

// The two production domains are independent properties. Each one canonicalizes
// to ITSELF — no 301, no cross-domain canonical between them. www and the blog
// subdomain fold to their own apex (handled here for canonicals, and by
// middleware.ts for the actual redirect). Anything we don't recognise (Vercel
// preview hosts, the onion mirror) falls back to the primary production URL so
// preview URLs never leak into a canonical.
const PRODUCTION_HOSTS: Record<string, string> = {
  'harshit.cloud': 'https://harshit.cloud',
  'www.harshit.cloud': 'https://harshit.cloud',
  'blog.harshit.cloud': 'https://harshit.cloud',
  'tinker.expert': 'https://tinker.expert',
  'www.tinker.expert': 'https://tinker.expert',
};

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // On Vercel (any environment), pin canonical to production domain to avoid
  // preview URLs becoming canonical for harshit.cloud / tinker.expert.
  if (process.env.VERCEL) {
    return PRODUCTION_SITE_URL;
  }

  // Local development
  return 'http://localhost:3000';
}

export const siteConfig = {
  title: 'Infra Magician',
  description: 'Deep dives into web development, infrastructure chaos, and the art of tinkering with technology.',
  siteUrl: getSiteUrl(),
  // v3 onion mirror served off the tor relay (198.251.67.184). Surfaced in the
  // footer and as an Onion-Location header so Tor Browser auto-suggests it.
  onion: 'harshitnia7nl7zgl42ezm656our7pfxqlviokkt7yhusich5wghxeid.onion',
  author: {
    name: 'Harshit Luthra',
    email: 'root@harshit.cloud',
    url: 'https://harshit.cloud/about',
  },
  social: {
    github: 'https://github.com/sachincool',
    twitter: 'https://twitter.com/exploit_sh',
    linkedin: 'https://linkedin.com/in/harshit-luthra/',
    instagram: 'https://instagram.com/exploit.sh',
  },
};

// Helper to get the current domain dynamically (for use in server components).
// Each recognised production host canonicalizes to its own apex, so harshit.cloud
// and tinker.expert stay independent properties (no cross-domain canonical).
// Unknown hosts (preview URLs) fall back to the primary production URL.
export function getCurrentDomain(hostname?: string): string {
  if (hostname) {
    const host = hostname.toLowerCase().split(':')[0];

    if (host === 'localhost' || host.endsWith('.localhost') || host === '127.0.0.1') {
      return `http://${hostname}`;
    }

    return PRODUCTION_HOSTS[host] ?? PRODUCTION_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL) {
    return PRODUCTION_SITE_URL;
  }

  return 'http://localhost:3000';
}
