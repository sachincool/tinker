import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";
import AboutPageClient from "./about-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `About | ${siteConfig.author.name}`,
    description: 'Harshit Luthra - Infrastructure Wizard, Chaos Engineer, and Professional Server Whisperer. Learn about the person behind the blog.',
    openGraph: {
      title: `About | ${siteConfig.author.name}`,
      description: 'Harshit Luthra - Infrastructure Wizard, Chaos Engineer, and Professional Server Whisperer.',
      type: 'profile',
      url: `${baseUrl}/about`,
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/about/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'About Harshit Luthra - Infrastructure Wizard',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `About | ${siteConfig.author.name}`,
      description: 'Harshit Luthra - Infrastructure Wizard, Chaos Engineer, and Professional Server Whisperer.',
      creator: '@exploit_sh',
      images: [`${baseUrl}/about/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/about`,
    },
  };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
