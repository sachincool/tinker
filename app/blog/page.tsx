import { Suspense } from "react";
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
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/blog/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Blog - Infra Magician's Digital Garden",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Blog | ${siteConfig.author.name}`,
      description: 'Deep dives into web development, infrastructure chaos, and the art of tinkering with technology.',
      images: [`${baseUrl}/blog/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  };
}

export default async function BlogPage() {
  const posts = getAllPosts('blog');
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.title} · Blog`,
    description: siteConfig.description,
    url: `${baseUrl}/blog`,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: baseUrl,
    },
    blogPost: posts.slice(0, 20).map(post => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.date,
      keywords: post.tags.join(", "),
    })),
  };

  const totalPages = Math.ceil(posts.length / 10);
  const hasNextPage = totalPages > 1;

  // Suspense boundary required because BlogPageClient calls useSearchParams()
  // for ?q= deep-link sync — Next 15 bails out of prerender otherwise.
  return (
    <>
      {/* rel=next pagination hint for crawlers — /blog is page 1 */}
      {hasNextPage && <link rel="next" href={`${baseUrl}/blog/page/2`} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <BlogPageClient initialPosts={posts} />
      </Suspense>
    </>
  );
}
