import { generateBlogFeed } from '@/lib/rss';

export async function GET() {
  try {
    const feed = generateBlogFeed();
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
