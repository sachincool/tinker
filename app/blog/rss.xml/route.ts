import { generateBlogFeed } from '@/lib/rss';
import { headers } from 'next/headers';
import { getCurrentDomain } from '@/lib/site-config';

export async function GET() {
  try {
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    const baseUrl = getCurrentDomain(hostname);
    
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
