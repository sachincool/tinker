// Production canonical for build-time metadata (Vercel previews shouldn't leak into canonicals)
const PRODUCTION_SITE_URL = 'https://harshit.cloud';

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
  onion: 'zufs5srx4x4xaukduvn3dbfhjesee3hy7bdtjsuiq7c4w35npyszfsyd.onion',
  author: {
    name: 'Harshit Luthra',
    email: 'harshit@truefoundry.com',
    url: 'https://harshit.cloud/about',
  },
  social: {
    github: 'https://github.com/sachincool',
    twitter: 'https://twitter.com/exploit_sh',
    linkedin: 'https://linkedin.com/in/harshit-luthra/',
    instagram: 'https://instagram.com/exploit.sh',
  },
};

// Helper to get the current domain dynamically (for use in server components)
// Non-localhost hosts are pinned to the production domain so duplicate hosts
// (tinker.expert, www) canonicalize to harshit.cloud instead of themselves —
// Google was indexing/deindexing the two hosts as competing duplicates.
export function getCurrentDomain(hostname?: string): string {
  if (hostname) {
    if (hostname.includes('localhost')) {
      return `http://${hostname}`;
    }
    return PRODUCTION_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL) {
    return PRODUCTION_SITE_URL;
  }

  return 'http://localhost:3000';
}
