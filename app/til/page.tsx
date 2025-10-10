import { getAllPosts } from "@/lib/posts";
import TILPageClient from "./til-page-client";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Today I Learned | ${siteConfig.author.name}`,
  description: 'Quick insights, code snippets, and daily learnings from the trenches of DevOps and infrastructure.',
  openGraph: {
    title: `Today I Learned | ${siteConfig.author.name}`,
    description: 'Quick insights, code snippets, and daily learnings from the trenches of DevOps and infrastructure.',
    type: 'website',
    url: `${siteConfig.siteUrl}/til`,
  },
  alternates: {
    canonical: `${siteConfig.siteUrl}/til`,
  },
};

export default function TILPage() {
  // Fetch TILs on server side
  const tils = getAllPosts('til');

  // Pass to client component for interactivity
  return <TILPageClient initialTils={tils} />;
}
