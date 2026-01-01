import { generateMainFeed } from '@/lib/rss';
import { headers } from 'next/headers';
import { getCurrentDomain } from '@/lib/site-config';

export async function GET() {
  try {
    const headersList = await headers();
    // Use x-forwarded-host for custom domains on Vercel, fallback to host
    const hostname = headersList.get('x-forwarded-host') || headersList.get('host') || '';
    const baseUrl = getCurrentDomain(hostname);
    
    const feed = generateMainFeed(baseUrl);
    const json = feed.json1();

    return new Response(json, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating JSON feed:', error);
    return new Response('Error generating JSON feed', { status: 500 });
  }
}
