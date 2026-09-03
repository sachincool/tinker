import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";
import AboutPageClient from "./about-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: 'About Harshit Luthra — Senior SRE and infra engineer',
    description: 'Harshit Luthra is a Senior SRE and infrastructure engineer working on Kubernetes, GPU platforms, and observability. The background, the work, and contact links.',
    openGraph: {
      title: 'About Harshit Luthra — Senior SRE and infra engineer',
      description: 'Harshit Luthra, Senior SRE and infrastructure engineer: Kubernetes, GPU platforms, observability, and the production stories behind the writing.',
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
      title: 'About Harshit Luthra — Senior SRE and infra engineer',
      description: 'Harshit Luthra, Senior SRE and infrastructure engineer: Kubernetes, GPU platforms, observability, and the production stories behind the writing.',
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
