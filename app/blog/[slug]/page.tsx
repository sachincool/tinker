import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ViewCounter } from "@/components/blog/view-counter";

import { TableOfContents } from "@/components/blog/table-of-contents";
import { Comments } from "@/components/blog/comments";
import { ShareButton } from "@/components/blog/share-button";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { ImageLightbox } from "@/components/blog/image-lightbox";
import { getPostBySlug, getAllPosts, stripFirstImageBlock } from "@/lib/posts";
import { SeriesNav } from "@/components/blog/series-nav";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { notFound } from "next/navigation";
import readingTime from "reading-time";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug, 'blog');
  
  if (!post) {
    return {
      title: '404 - Post Not Found',
    };
  }

  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  const postUrl = `${baseUrl}/blog/${slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: siteConfig.author.name, url: baseUrl }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      authors: [siteConfig.author.name],
      tags: post.tags,
      url: postUrl,
      siteName: siteConfig.title,
      locale: 'en_US',
      images: [
        {
          url: `${baseUrl}/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@exploit_sh',
      site: '@exploit_sh',
      images: [`${baseUrl}/blog/${slug}/opengraph-image`],
    },
    alternates: {
      canonical: postUrl,
    },
    other: {
      'article:published_time': post.date,
      'article:modified_time': post.updatedAt ?? post.date,
      'article:author': siteConfig.author.name,
      'article:section': 'Technology',
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch the actual post data based on the slug
  const post = getPostBySlug(slug, 'blog');

  // If post doesn't exist, show 404
  if (!post) {
    notFound();
  }

  // Calculate reading time
  const stats = readingTime(post.content);
  const readTime = stats.text;

  const [primaryTag, ...secondaryTags] = post.tags;

  // Get base URL for structured data
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  const postUrl = `${baseUrl}/blog/${slug}`;

  // JSON-LD structured data for SEO and LLM discovery
  // Using TechArticle for technical/infrastructure content
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.excerpt,
    image: `${baseUrl}/blog/${slug}/opengraph-image`,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url,
      email: siteConfig.author.email,
      affiliation: {
        '@type': 'Organization',
        name: 'TrueFoundry',
        url: 'https://truefoundry.com',
      },
      sameAs: [
        siteConfig.social.github,
        siteConfig.social.twitter,
        siteConfig.social.linkedin,
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.author.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags.join(', '),
    articleSection: 'Technology',
    articleBody: post.excerpt,
    wordCount: stats.words,
    inLanguage: 'en-US',
    proficiencyLevel: 'Expert',
    dependencies: post.tags.join(', '),
  };

  // FAQPage JSON-LD — emitted only when post frontmatter includes a `faqs` array
  const faqJsonLd = post.faqs && post.faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqs.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        })),
      }
    : null;

  // Series navigation data — built from all blog posts that share the same `series` tag
  const seriesNavData = post.series
    ? (() => {
        const allPosts = getAllPosts('blog');
        const seriesPosts = allPosts
          .filter(p => p.series === post.series && typeof p.seriesPart === 'number')
          .sort((a, b) => (a.seriesPart ?? 0) - (b.seriesPart ?? 0));
        return seriesPosts.map(p => ({
          part: p.seriesPart as number,
          slug: p.slug,
          title: p.title,
        }));
      })()
    : null;

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* Skip to main content link for accessibility */}
      <a
        href="#article-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to content
      </a>
      <ReadingProgress />
      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16">
          <div className="max-w-3xl space-y-8 min-w-0">
            <Button variant="ghost" size="sm" asChild className="-ml-3 h-8 text-muted-foreground hover:text-foreground">
              <Link href="/blog">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Blog
              </Link>
            </Button>

            <header className="relative space-y-6 pb-10">
              {primaryTag && (
                <Link
                  href={`/tags/${primaryTag}`}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="h-1 w-1 rounded-full bg-current" />
                  {primaryTag}
                </Link>
              )}

              <h1 className="text-balance text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-foreground break-words">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-pretty text-lg md:text-xl text-muted-foreground leading-[1.55] max-w-[62ch]">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readTime}
                </span>
                <ViewCounter slug={post.slug} />
              </div>

              {secondaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {secondaryTags.map((tag) => (
                    <Link key={tag} href={`/tags/${tag}`}>
                      <Badge
                        variant="secondary"
                        className="font-normal text-xs bg-muted/60 hover:bg-primary/10 hover:text-primary"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              <div
                aria-hidden="true"
                className="h-px w-16 bg-primary/60"
              />
            </header>

            {post.heroImage && (
              <figure className="-mx-4 sm:mx-0 my-8 sm:my-10">
                <div className="relative overflow-hidden sm:rounded-lg border-y sm:border border-border/60 bg-muted/40">
                  <ImageLightbox
                    src={post.heroImage}
                    alt={post.heroAlt || post.title}
                    className="block w-full h-auto"
                  />
                </div>
              </figure>
            )}

            {seriesNavData && post.series && typeof post.seriesPart === 'number' && (
              <SeriesNav
                series={post.series}
                currentPart={post.seriesPart}
                totalParts={6}
                parts={seriesNavData}
              />
            )}

            <div id="article-content">
              <MarkdownContent content={post.heroImage ? stripFirstImageBlock(post.content) : post.content} />
            </div>

            <Comments slug={slug} shareButton={<ShareButton title={post.title} excerpt={post.excerpt} />} />

            {(() => {
              const relatedPosts = getAllPosts('blog')
                .filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag)))
                .slice(0, 2);
              if (relatedPosts.length === 0) return null;
              return (
                <section className="mt-16 pt-10 border-t border-border/60">
                  <h2 className="text-2xl font-semibold mb-6 tracking-tight">Related posts</h2>
                  <div className="grid gap-4">
                    {relatedPosts.map((relatedPost) => (
                      <Card key={relatedPost.slug} className="border-border/60 hover:border-border">
                        <CardHeader className="space-y-2">
                          <CardTitle className="text-lg">
                            <Link
                              href={`/blog/${relatedPost.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {relatedPost.title}
                            </Link>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })()}

            <NewsletterForm
              title="Enjoyed this post?"
              description="Subscribe to get notified when I publish new infrastructure adventures and TILs."
            />
          </div>

          <TableOfContents />
        </div>
      </div>
    </>
  );
}
