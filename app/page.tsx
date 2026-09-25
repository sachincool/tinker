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
    ? 'Harshit Luthra, Senior SRE. Deep dives into Kubernetes, GPU infrastructure, observability, and the production war stories that came out of running them.'
    : 'SRE war stories, Kubernetes debugging, GPU infrastructure deployments, and DevOps tooling notes from someone who keeps breaking and fixing production.';

  const title = isMainDomain
    ? `${siteConfig.author.name} · SRE notes on Kubernetes and infra`
    : 'Infra Magician — Kubernetes, SRE and DevOps deep dives';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/`,
      siteName: siteConfig.title,
      locale: 'en_US',
      images: [
        {
          url: `${baseUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${siteConfig.title} · ${siteConfig.author.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@exploit_sh',
      site: '@exploit_sh',
      images: [`${baseUrl}/opengraph-image`],
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
