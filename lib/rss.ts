import { Feed } from 'feed';
import { siteConfig } from './site-config';
import { getAllPosts, getPostsByTag, type Post } from './posts';

export function generateRSSFeed(posts: Post[], baseUrl: string, feedOptions?: { title?: string; description?: string; feedUrl?: string }) {
  const feed = new Feed({
    title: feedOptions?.title || siteConfig.title,
    description: feedOptions?.description || siteConfig.description,
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    image: `${baseUrl}/assets/tinker.svg`,
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.author.name}`,
    updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
    generator: 'Next.js using Feed for Node.js',
    feedLinks: {
      rss2: feedOptions?.feedUrl || `${baseUrl}/rss.xml`,
      json: feedOptions?.feedUrl?.replace('.xml', '.json') || `${baseUrl}/rss.json`,
      atom: feedOptions?.feedUrl?.replace('.xml', '.atom') || `${baseUrl}/atom.xml`,
    },
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: baseUrl,
    },
  });

  posts.forEach((post) => {
    const url = `${baseUrl}/${post.type}/${post.slug}`;

    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.excerpt,
      content: post.content,
      author: [
        {
          name: siteConfig.author.name,
          email: siteConfig.author.email,
          link: baseUrl,
        },
      ],
      date: new Date(post.date),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  });

  return feed;
}

export function generateMainFeed(baseUrl: string) {
  const blogPosts = getAllPosts('blog');
  const tilPosts = getAllPosts('til');
  const allPosts = [...blogPosts, ...tilPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return generateRSSFeed(allPosts, baseUrl, {
    title: siteConfig.title,
    description: siteConfig.description,
    feedUrl: `${baseUrl}/rss.xml`,
  });
}

export function generateBlogFeed(baseUrl: string) {
  const posts = getAllPosts('blog');
  return generateRSSFeed(posts, baseUrl, {
    title: `${siteConfig.title} - Blog`,
    description: 'Deep dives into web development and infrastructure',
    feedUrl: `${baseUrl}/blog/rss.xml`,
  });
}

export function generateTILFeed(baseUrl: string) {
  const posts = getAllPosts('til');
  return generateRSSFeed(posts, baseUrl, {
    title: `${siteConfig.title} - Today I Learned`,
    description: 'Quick insights and daily learnings',
    feedUrl: `${baseUrl}/til/rss.xml`,
  });
}

export function generateTagFeed(tag: string, baseUrl: string) {
  const posts = getPostsByTag(tag);
  return generateRSSFeed(posts, baseUrl, {
    title: `${siteConfig.title} - ${tag}`,
    description: `Posts tagged with ${tag}`,
    feedUrl: `${baseUrl}/tags/${tag}/rss.xml`,
  });
}
