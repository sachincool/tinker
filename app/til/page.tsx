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

export default function TILPage() {
  // Fetch TILs on server side
  const tils = getAllPosts('til');

  // Pass to client component for interactivity
  return <TILPageClient initialTils={tils} />;
}
