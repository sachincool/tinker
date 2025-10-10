import { getAllPosts, getAllTags } from '@/lib/posts';
import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getCurrentDomain } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  
  // Get all posts
  const blogPosts = getAllPosts('blog');
  const tilPosts = getAllPosts('til');
  const allTags = getAllTags();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/til`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
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
      url: `${baseUrl}/graph`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.9 : 0.8,
  }));

  // TIL pages
  const tilPages: MetadataRoute.Sitemap = tilPosts.map(til => ({
    url: `${baseUrl}/til/${til.slug}`,
    lastModified: new Date(til.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Tag pages
  const tagPages: MetadataRoute.Sitemap = allTags.map(tag => ({
    url: `${baseUrl}/tags/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...tilPages, ...tagPages];
}

