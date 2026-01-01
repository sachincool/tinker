import { generateBlogFeed } from '@/lib/rss';
import { headers } from 'next/headers';
import { getCurrentDomain } from '@/lib/site-config';

export async function GET() {
  try {
    const headersList = await headers();
    // Use x-forwarded-host for custom domains on Vercel, fallback to host
    const hostname = headersList.get('x-forwarded-host') || headersList.get('host') || '';
    
    // Debug logging (remove after confirming fix)
    console.log('[RSS] x-forwarded-host:', headersList.get('x-forwarded-host'));
    console.log('[RSS] host:', headersList.get('host'));
    console.log('[RSS] Using hostname:', hostname);
    
    const baseUrl = getCurrentDomain(hostname);
    console.log('[RSS] Generated baseUrl:', baseUrl);
    
    const feed = generateBlogFeed(baseUrl);
    const rss = feed.rss2();

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating blog RSS feed:', error);
    return new Response('Error generating blog RSS feed', { status: 500 });
  }
}
