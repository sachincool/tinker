import { getPostBySlug } from '@/lib/posts';
import { getCurrentDomain } from '@/lib/site-config';
import { headers } from 'next/headers';

// Markdown twin of every post. The MDX source is already markdown, so this is
// a passthrough with a small front-matter header rather than an HTML-to-md
// conversion. Reached two ways:
//   - directly:  /md/blog/<slug>   (what the Link header points at)
//   - by content negotiation: middleware rewrites /blog/<slug> here when the
//     request carries `Accept: text/markdown`.

// ponytail: rendered per request, not prerendered — the canonical is
// host-derived (harshit.cloud vs the tinker.expert mirror), which needs
// headers() and so rules out force-static. Body is an fs read behind the
// existing post cache, so the cost is trivial.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const [type, ...rest] = slug;

  if (type !== 'blog' && type !== 'til') {
    return new Response('Not found\n', { status: 404 });
  }

  const post = getPostBySlug(rest.join('/'), type);
  if (!post) {
    return new Response('Not found\n', { status: 404 });
  }

  const baseUrl = getCurrentDomain((await headers()).get('host') || '');
  const canonical = `${baseUrl}/${post.type}/${post.slug}`;

  const front = [
    `# ${post.title}`,
    '',
    `> ${post.excerpt}`,
    '',
    `- Canonical: ${canonical}`,
    `- Published: ${post.date}`,
    ...(post.updatedAt ? [`- Updated: ${post.updatedAt}`] : []),
    ...(post.tags.length ? [`- Tags: ${post.tags.join(', ')}`] : []),
    '',
    '---',
    '',
  ].join('\n');

  return new Response(front + post.content.trim() + '\n', {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${canonical}>; rel="canonical"`,
    },
  });
}
