import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AboutPage from './about/page';
import HomePageContent from './home-page-content';
import { getAllPosts } from '@/lib/posts';
import { siteConfig, getCurrentDomain } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  const isMainDomain = hostname === 'harshit.cloud' || hostname === 'www.harshit.cloud';

  const description = isMainDomain
    ? 'Harshit Luthra — Senior SRE and Infrastructure Wizard. Deep dives into Kubernetes, multi-cloud platforms, observability, and production war stories from the trenches.'
    : "Infra Magician's digital garden — production stories, DevOps deep dives, Kubernetes debugging, and infrastructure tinkering from a senior SRE.";

  return {
    title: isMainDomain ? `${siteConfig.author.name} — Infra Magician` : siteConfig.title,
    description,
    alternates: {
      canonical: `${baseUrl}/`,
    },
    openGraph: {
      title: isMainDomain ? `${siteConfig.author.name} — Infra Magician` : siteConfig.title,
      description,
      type: 'website',
      url: `${baseUrl}/`,
      siteName: siteConfig.title,
      locale: 'en_US',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${siteConfig.title} — ${siteConfig.author.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isMainDomain ? `${siteConfig.author.name} — Infra Magician` : siteConfig.title,
      description,
      creator: '@exploit_sh',
      site: '@exploit_sh',
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export default async function RootPage() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  if (hostname === 'harshit.cloud' || hostname === 'www.harshit.cloud') {
    return <AboutPage />;
  }

  const allBlogPosts = getAllPosts('blog');
  const latestPosts = allBlogPosts.slice(0, 4);
  const tilCount = getAllPosts('til').length;
  const blogCount = allBlogPosts.length;

  return <HomePageContent latestPosts={latestPosts} tilCount={tilCount} blogCount={blogCount} />;
}
