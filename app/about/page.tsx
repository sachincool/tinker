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
          url: `${baseUrl}/images/workspace-setup.jpg`,
          width: 600,
          height: 400,
          alt: 'Harshit Luthra workspace setup',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `About | ${siteConfig.author.name}`,
      description: 'Harshit Luthra - Infrastructure Wizard, Chaos Engineer, and Professional Server Whisperer.',
      creator: '@exploit_sh',
      images: [`${baseUrl}/images/workspace-setup.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/about`,
    },
  };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
