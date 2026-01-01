import { generateMainFeed } from '@/lib/rss';
import { headers } from 'next/headers';
import { getCurrentDomain } from '@/lib/site-config';

export async function GET() {
  try {
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    const baseUrl = getCurrentDomain(hostname);
    
    const feed = generateMainFeed(baseUrl);
    const atom = feed.atom1();

    return new Response(atom, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating Atom feed:', error);
    return new Response('Error generating Atom feed', { status: 500 });
  }
}
