import { getAllTags, getPostsByTag } from "@/lib/posts";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";
import TagsPageClient from "./tags-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `Browse Tags | ${siteConfig.author.name}`,
    description: 'Discover content by topics, technologies, and categories. Browse all tags from blog posts and TILs.',
    openGraph: {
      title: `Browse Tags | ${siteConfig.author.name}`,
      description: 'Discover content by topics, technologies, and categories. Browse all tags from blog posts and TILs.',
      type: 'website',
      url: `${baseUrl}/tags`,
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/tags/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Browse Tags - Infra Magician's Digital Garden",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Browse Tags | ${siteConfig.author.name}`,
      description: 'Discover content by topics, technologies, and categories.',
      images: [`${baseUrl}/tags/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/tags`,
    },
  };
}

const colorPalettes = [
  "from-blue-500 to-cyan-500",
  "from-cyan-500 to-blue-500",
  "from-blue-600 to-purple-600",
  "from-purple-500 to-pink-500",
  "from-green-500 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-orange-500 to-red-500",
  "from-purple-600 to-indigo-600",
  "from-red-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-green-500",
  "from-gray-500 to-slate-600",
  "from-green-600 to-emerald-500",
  "from-indigo-500 to-blue-600",
  "from-orange-600 to-yellow-500",
];

function getTagColor(tagName: string): string {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalettes[Math.abs(hash) % colorPalettes.length];
}

export default function TagsPage() {
  const allTags = getAllTags();
  
  const tags = allTags.map(tagName => ({
    name: tagName,
    count: getPostsByTag(tagName).length,
    color: getTagColor(tagName),
  }));

  return <TagsPageClient initialTags={tags} />;
}
