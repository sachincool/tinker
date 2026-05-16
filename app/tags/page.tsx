import { getAllTags, getPostsByTag } from "@/lib/posts";
import { getTagMeta } from "@/lib/tag-meta";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";
import TagsPageClient from "./tags-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `Tags | ${siteConfig.author.name}`,
    description: 'Every tag used across the writing — blog posts and TILs, alphabetized.',
    openGraph: {
      title: `Tags | ${siteConfig.author.name}`,
      description: 'Every tag used across the writing — blog posts and TILs, alphabetized.',
      type: 'website',
      url: `${baseUrl}/tags`,
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/tags/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Tags',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Tags | ${siteConfig.author.name}`,
      description: 'Every tag used across the writing.',
      images: [`${baseUrl}/tags/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/tags`,
    },
  };
}

export default function TagsPage() {
  const allTags = getAllTags();

  const tags = allTags.map(tagName => ({
    name: tagName,
    count: getPostsByTag(tagName).length,
    description: getTagMeta(tagName)?.description ?? null,
  }));

  return <TagsPageClient initialTags={tags} />;
}
