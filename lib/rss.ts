import { Feed } from 'feed';
import { siteConfig } from './site-config';
import { getAllPosts, getPostsByTag, type Post } from './posts';

export function generateRSSFeed(posts: Post[], feedOptions?: { title?: string; description?: string; feedUrl?: string }) {
  const feed = new Feed({
    title: feedOptions?.title || siteConfig.title,
    description: feedOptions?.description || siteConfig.description,
    id: siteConfig.siteUrl,
    link: siteConfig.siteUrl,
    language: 'en',
    image: `${siteConfig.siteUrl}/assets/tinker.svg`,
    favicon: `${siteConfig.siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.author.name}`,
    updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
    generator: 'Next.js using Feed for Node.js',
    feedLinks: {
      rss2: feedOptions?.feedUrl || `${siteConfig.siteUrl}/rss.xml`,
      json: feedOptions?.feedUrl?.replace('.xml', '.json') || `${siteConfig.siteUrl}/rss.json`,
      atom: feedOptions?.feedUrl?.replace('.xml', '.atom') || `${siteConfig.siteUrl}/atom.xml`,
    },
    author: {
      name: siteConfig.author.name,
      email: siteConfig.author.email,
      link: siteConfig.siteUrl,
    },
  });

  posts.forEach((post) => {
    const url = `${siteConfig.siteUrl}/${post.type}/${post.slug}`;

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
          link: siteConfig.siteUrl,
        },
      ],
      date: new Date(post.date),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  });

  return feed;
}

export function generateMainFeed() {
  const blogPosts = getAllPosts('blog');
  const tilPosts = getAllPosts('til');
  const allPosts = [...blogPosts, ...tilPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return generateRSSFeed(allPosts, {
    title: siteConfig.title,
    description: siteConfig.description,
    feedUrl: `${siteConfig.siteUrl}/rss.xml`,
  });
}

export function generateBlogFeed() {
  const posts = getAllPosts('blog');
  return generateRSSFeed(posts, {
    title: `${siteConfig.title} - Blog`,
    description: 'Deep dives into web development and infrastructure',
    feedUrl: `${siteConfig.siteUrl}/blog/rss.xml`,
  });
}

export function generateTILFeed() {
  const posts = getAllPosts('til');
  return generateRSSFeed(posts, {
    title: `${siteConfig.title} - Today I Learned`,
    description: 'Quick insights and daily learnings',
    feedUrl: `${siteConfig.siteUrl}/til/rss.xml`,
  });
}

export function generateTagFeed(tag: string) {
  const posts = getPostsByTag(tag);
  return generateRSSFeed(posts, {
    title: `${siteConfig.title} - ${tag}`,
    description: `Posts tagged with ${tag}`,
    feedUrl: `${siteConfig.siteUrl}/tags/${tag}/rss.xml`,
  });
}
