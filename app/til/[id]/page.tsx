import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { ViewCounter } from "@/components/blog/view-counter";
import { ReadingProgress } from "@/components/blog/reading-progress";

import { MarkdownContent } from "@/components/blog/markdown-content";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import readingTime from "reading-time";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const til = getPostBySlug(id, "til");

  if (!til) {
    return {
      title: "404 - TIL Not Found",
    };
  }

  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);
  const tilUrl = `${baseUrl}/til/${id}`;

  return {
    title: `TIL: ${til.title}`,
    description: til.excerpt || til.title,
    keywords: til.tags,
    authors: [{ name: siteConfig.author.name, url: baseUrl }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    openGraph: {
      title: til.title,
      description: til.excerpt || til.title,
      type: "article",
      publishedTime: til.date,
      modifiedTime: til.date,
      url: tilUrl,
      siteName: siteConfig.title,
      locale: "en_US",
      images: [
        {
          url: `${baseUrl}/til/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: til.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: til.title,
      description: til.excerpt || til.title,
      creator: "@exploit_sh",
      site: "@exploit_sh",
      images: [`${baseUrl}/til/${id}/opengraph-image`],
    },
    alternates: {
      canonical: tilUrl,
    },
  };
}

export default async function TILPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const til = getPostBySlug(id, "til");

  if (!til) {
    notFound();
  }

  const stats = readingTime(til.content);
  const readTime = stats.text;

  const [primaryTag, ...secondaryTags] = til.tags;

  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);
  const tilUrl = `${baseUrl}/til/${id}`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: til.title,
    description: til.excerpt || til.title,
    image: `${baseUrl}/til/${id}/opengraph-image`,
    datePublished: til.date,
    dateModified: til.date,
    author: {
      "@type": "Person",
      name: siteConfig.author.name,
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.author.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": tilUrl,
    },
    keywords: til.tags.join(", "),
    articleBody: til.excerpt || til.title,
    wordCount: stats.words,
    inLanguage: "en-US",
  };

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "TIL",
        item: `${baseUrl}/til`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: til.title,
        item: tilUrl,
      },
    ],
  };

  const relatedTils = getAllPosts("til")
    .filter((p) => p.slug !== til.slug && p.tags.some((tag) => til.tags.includes(tag)))
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <a
        href="#article-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to content
      </a>
      <ReadingProgress />
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-10">
        {/* Back link */}
        <Link
          href="/til"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to notes
        </Link>

        {/* Header */}
        <header className="space-y-5 pb-8 border-b border-border/60">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            {primaryTag ? (
              <Link href={`/tags/${primaryTag}`} className="hover:text-foreground transition-colors">
                {primaryTag}
              </Link>
            ) : (
              <span>Today I learned</span>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.08] tracking-tight text-foreground">
            {til.title}
          </h1>

          {til.excerpt && (
            <p className="text-base md:text-lg text-muted-foreground leading-[1.55] max-w-[62ch]">
              {til.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={til.date}>
                {new Date(til.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readTime}
            </span>
            <ViewCounter slug={til.slug} />
          </div>

          {secondaryTags.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {secondaryTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Body */}
        <div id="article-content">
          <MarkdownContent content={til.content} />
        </div>

        {/* Related notes */}
        {relatedTils.length > 0 && (
          <section className="pt-10 border-t border-border/60 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Adjacent notes
            </div>
            <ul className="divide-y divide-border/60">
              {relatedTils.map((relatedTil) => (
                <li key={relatedTil.slug} className="py-4 first:pt-2">
                  <article className="space-y-1.5">
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      <time dateTime={relatedTil.date}>
                        {new Date(relatedTil.date)
                          .toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          .toLowerCase()}
                      </time>
                    </div>
                    <h3 className="font-serif text-lg leading-tight">
                      <Link
                        href={`/til/${relatedTil.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {relatedTil.title}
                      </Link>
                    </h3>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Footer link */}
        <div className="pt-4">
          <Link
            href="/til"
            className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; All notes
          </Link>
        </div>
      </div>
    </>
  );
}
