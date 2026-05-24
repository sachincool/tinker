import { getAllPosts, getAllTags, getPostsByTag } from '@/lib/posts';
import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getCurrentDomain } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostname = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  
  const blogPosts = getAllPosts('blog');
  const tilPosts = getAllPosts('til');
  const allTags = getAllTags();

  // Newest content date drives the lastModified on index pages — fewer
  // false-positive "site changed" hits when nothing was actually written.
  const allPosts = [...blogPosts, ...tilPosts];
  const latestPostDate = allPosts.length
    ? new Date(allPosts.reduce((max, p) => (p.date > max ? p.date : max), allPosts[0].date))
    : new Date();
  const latestBlogDate = blogPosts.length
    ? new Date(blogPosts.reduce((max, p) => (p.date > max ? p.date : max), blogPosts[0].date))
    : new Date();
  const latestTilDate = tilPosts.length
    ? new Date(tilPosts.reduce((max, p) => (p.date > max ? p.date : max), tilPosts[0].date))
    : new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latestPostDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestBlogDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/til`,
      lastModified: latestTilDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/graph`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const PAGE_SIZE = 10;
  const totalBlogPages = Math.ceil(blogPosts.length / PAGE_SIZE);
  // /blog/page/1 redirects to /blog — start from page 2
  const paginatedBlogPages: MetadataRoute.Sitemap = Array.from(
    { length: Math.max(0, totalBlogPages - 1) },
    (_, i) => ({
      url: `${baseUrl}/blog/page/${i + 2}`,
      lastModified: latestBlogDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })
  );

  const blogPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    // Use updatedAt when the post has been revised, else fall back to publish date
    lastModified: new Date(post.updatedAt ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.9 : 0.8,
  }));

  const tilPages: MetadataRoute.Sitemap = tilPosts.map(til => ({
    url: `${baseUrl}/til/${til.slug}`,
    lastModified: new Date(til.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Tag lastModified is the newest post date carrying that tag — a stable
  // signal that the tag page actually changed, vs. a new-Date-on-every-deploy
  // false positive.
  const tagPages: MetadataRoute.Sitemap = allTags
    .map(tag => {
      const posts = getPostsByTag(tag);
      if (posts.length === 0) return null;
      const newest = posts.reduce((max, p) => (p.date > max ? p.date : max), posts[0].date);
      return {
        url: `${baseUrl}/tags/${tag}`,
        lastModified: new Date(newest),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return [...staticPages, ...blogPages, ...paginatedBlogPages, ...tilPages, ...tagPages];
}

