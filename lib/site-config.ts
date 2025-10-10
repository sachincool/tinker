// Get the site URL dynamically based on environment or fallback
function getSiteUrl(): string {
  // In production, use the environment variable or detect from request
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback for different environments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Default fallback (development)
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
  // If hostname is provided (from headers), use it
  if (hostname) {
    // Always use https in production
    if (hostname.includes('localhost')) {
      return `http://${hostname}`;
    }
    return `https://${hostname}`;
  }
  
  // Fallback to siteConfig
  return siteConfig.siteUrl;
}
