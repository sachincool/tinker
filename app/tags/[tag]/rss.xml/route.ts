import { generateTagFeed } from '@/lib/rss';
import { getAllTags } from '@/lib/posts';

export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const tag = params.tag;

    // Verify tag exists
    const allTags = getAllTags();
    if (!allTags.includes(tag)) {
      return new Response('Tag not found', { status: 404 });
    }

    const feed = generateTagFeed(tag);
    const rss = feed.rss2();

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating tag RSS feed:', error);
    return new Response('Error generating tag RSS feed', { status: 500 });
  }
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag,
  }));
}
