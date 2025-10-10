import { getAllPosts } from "@/lib/posts";
import BlogPageClient from "./blog-page-client";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `Blog | ${siteConfig.author.name}`,
    description: 'Deep dives into web development, infrastructure chaos, and the art of tinkering with technology.',
    openGraph: {
      title: `Blog | ${siteConfig.author.name}`,
      description: 'Deep dives into web development, infrastructure chaos, and the art of tinkering with technology.',
      type: 'website',
      url: `${baseUrl}/blog`,
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  };
}

export default function BlogPage() {
  // Fetch posts on server side
  const posts = getAllPosts('blog');

  // Pass to client component for interactivity
  return <BlogPageClient initialPosts={posts} />;
}
