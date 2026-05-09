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
  author: {
    name: 'Harshit Luthra',
    email: 'contact@sachin.cool',
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
export function getCurrentDomain(hostname?: string): string {
  if (hostname) {
    if (hostname.includes('localhost')) {
      return `http://${hostname}`;
    }
    return `https://${hostname}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL) {
    return PRODUCTION_SITE_URL;
  }

  return 'http://localhost:3000';
}
