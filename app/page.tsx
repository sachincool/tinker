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
    ? 'Harshit Luthra. Senior SRE and Infrastructure Wizard. Deep dives into Kubernetes, multi-cloud platforms, observability, and production war stories from the trenches.'
    : 'SRE war stories, Kubernetes debugging deep dives, GPU infra deployments, and DevOps tooling notes from an infrastructure wizard who keeps breaking (and fixing) production.';

  const title = isMainDomain
    ? `${siteConfig.author.name} · Infra Magician`
    : 'Infra Magician — SRE War Stories, Kubernetes Debugging & DevOps Deep Dives';

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
