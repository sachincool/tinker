import { getAllPosts } from "@/lib/posts";
import BlogPageClient from "./blog-page-client";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.author.name}`,
  description: 'Deep dives into web development, infrastructure chaos, and the art of tinkering with technology.',
  openGraph: {
    title: `Blog | ${siteConfig.author.name}`,
    description: 'Deep dives into web development, infrastructure chaos, and the art of tinkering with technology.',
    type: 'website',
    url: `${siteConfig.siteUrl}/blog`,
  },
  alternates: {
    canonical: `${siteConfig.siteUrl}/blog`,
  },
};

export default function BlogPage() {
  // Fetch posts on server side
  const posts = getAllPosts('blog');

  // Pass to client component for interactivity
  return <BlogPageClient initialPosts={posts} />;
}
