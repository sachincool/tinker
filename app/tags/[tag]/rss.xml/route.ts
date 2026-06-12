import { generateTagFeed } from '@/lib/rss';
import { getAllTags } from '@/lib/posts';
import { siteConfig } from '@/lib/site-config';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;

    const allTags = getAllTags();
    if (!allTags.includes(tag)) {
      return new Response('Tag not found', { status: 404 });
    }

    const feed = generateTagFeed(tag, siteConfig.siteUrl);
    const rss = feed.rss2();

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch (error) {
    console.error('Error generating tag RSS feed:', error);
    return new Response('Error generating tag RSS feed', { status: 500 });
  }
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({ tag }));
}
