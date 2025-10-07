import { generateMainFeed } from '@/lib/rss';

export async function GET() {
  try {
    const feed = generateMainFeed();
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
