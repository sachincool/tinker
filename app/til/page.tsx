import { getAllPosts } from "@/lib/posts";
import TILPageClient from "./til-page-client";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `Today I Learned | ${siteConfig.author.name}`,
    description: 'Quick insights, code snippets, and daily learnings from the trenches of DevOps and infrastructure.',
    openGraph: {
      title: `Today I Learned | ${siteConfig.author.name}`,
      description: 'Quick insights, code snippets, and daily learnings from the trenches of DevOps and infrastructure.',
      type: 'website',
      url: `${baseUrl}/til`,
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/til/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Today I Learned - Infra Magician's Digital Garden",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Today I Learned | ${siteConfig.author.name}`,
      description: 'Quick insights, code snippets, and daily learnings from the trenches of DevOps and infrastructure.',
      images: [`${baseUrl}/til/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/til`,
    },
  };
}

export default async function TILPage() {
  const tils = getAllPosts('til');
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteConfig.title} — Today I Learned`,
    description: "Quick insights, code snippets, and daily learnings from the trenches of DevOps and infrastructure.",
    url: `${baseUrl}/til`,
    isPartOf: { "@type": "WebSite", name: siteConfig.title, url: baseUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tils.length,
      itemListElement: tils.slice(0, 25).map((til, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${baseUrl}/til/${til.slug}`,
        name: til.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TILPageClient initialTils={tils} />
    </>
  );
}
