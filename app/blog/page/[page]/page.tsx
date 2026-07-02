/**
 * Server-side paginated blog index — /blog/page/[page]
 *
 * Purpose: give crawlers (Googlebot, GPTBot, etc.) a fully static, paginated
 * view of every post. The interactive /blog listing works for humans; this route
 * works for bots that can't execute JS filtering.
 *
 * Page size: PAGE_SIZE posts per page.
 * Page 1 redirects to /blog (canonical listing). Pages 2+ render static lists
 * with rel="prev" / rel="next" link elements.
 */

import { getAllPosts } from "@/lib/posts";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import readingTime from "reading-time";

const PAGE_SIZE = 10;

export async function generateStaticParams() {
  const posts = getAllPosts("blog");
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  return Array.from({ length: totalPages }, (_, i) => ({ page: String(i + 1) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page, 10);
  const posts = getAllPosts("blog");
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);

  if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) return {};

  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `Blog · Page ${pageNum} | ${siteConfig.author.name}`,
    description: `Blog posts by ${siteConfig.author.name}, page ${pageNum} of ${totalPages}.`,
    alternates: {
      canonical: pageNum === 1 ? `${baseUrl}/blog` : `${baseUrl}/blog/page/${pageNum}`,
    },
    robots: {
      // Only page 1 (redirected to /blog) and real pages should be indexed.
      index: pageNum > 1,
      follow: true,
    },
  };
}

export default async function PaginatedBlogPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  const posts = getAllPosts("blog");
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);

  if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) notFound();

  // Page 1 is canonical at /blog — redirect to avoid duplicate content
  if (pageNum === 1) redirect("/blog");

  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);

  const start = (pageNum - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  const prevUrl = pageNum === 2 ? `${baseUrl}/blog` : `${baseUrl}/blog/page/${pageNum - 1}`;
  const nextUrl = pageNum < totalPages ? `${baseUrl}/blog/page/${pageNum + 1}` : null;

  return (
    <>
      {/* rel=prev/next for crawlers */}
      <link rel="prev" href={prevUrl} />
      {nextUrl && <link rel="next" href={nextUrl} />}

      <div className="mx-auto max-w-5xl space-y-10 py-8">
        <header className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Page {pageNum} of {totalPages}
          </p>
          <h1 className="font-serif font-normal text-5xl leading-tight">The Blog</h1>
        </header>

        <ul className="divide-y divide-border">
          {pagePosts.map((post) => {
            const stats = readingTime(post.content);
            const date = new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <li key={post.slug}>
                <article className="py-8 space-y-2">
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {date} · {stats.text.toLowerCase()}
                  </p>
                  <h2 className="font-serif font-normal text-2xl leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 max-w-[65ch]">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-x-4 pt-1">
                    {post.tags.slice(0, 4).map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${tag}`}
                        className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground hover:text-primary transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {/* Pagination controls */}
        <nav className="flex justify-between items-center pt-4 border-t border-border text-sm">
          <Link
            href={prevUrl}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
          >
            &larr; Newer
          </Link>
          <span className="font-mono text-[11px] text-muted-foreground">
            {pageNum} / {totalPages}
          </span>
          {nextUrl ? (
            <Link
              href={nextUrl}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
            >
              Older &rarr;
            </Link>
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground opacity-30">Older</span>
          )}
        </nav>
      </div>
    </>
  );
}
