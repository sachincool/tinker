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
    title: 'All topics: Kubernetes, DevOps, security and SRE tags',
    description: 'Every topic across the blog and TIL notes, from Kubernetes and GPU infrastructure to supply-chain security, observability, Docker, and command-line tooling.',
    openGraph: {
      title: 'All topics: Kubernetes, DevOps, security and SRE tags',
      description: 'Every topic across the blog and TIL notes, from Kubernetes and GPU infrastructure to supply-chain security, observability, Docker, and command-line tooling.',
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
      title: 'All topics: Kubernetes, DevOps, security and SRE tags',
      description: 'Every topic across the blog and TIL notes: Kubernetes, GPU infrastructure, supply-chain security, observability, Docker, and command-line tooling.',
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
