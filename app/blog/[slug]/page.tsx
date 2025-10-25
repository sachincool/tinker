import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ViewCounter } from "@/components/blog/view-counter";
import { LikeButton } from "@/components/blog/like-button";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Comments } from "@/components/blog/comments";
import { ShareButton } from "@/components/blog/share-button";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
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
    title: `${post.title} | ${siteConfig.author.name}`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: siteConfig.author.name, url: baseUrl }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [siteConfig.author.name],
      tags: post.tags,
      url: postUrl,
      siteName: siteConfig.title,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@exploit_sh',
    },
    alternates: {
      canonical: postUrl,
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

  return (
    <>
      <ReadingProgress />
      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16">
          <div className="max-w-3xl space-y-8">
            {/* Back button */}
            <Button variant="ghost" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>

            {/* Article Header */}
            <header className="space-y-6 pb-8 border-b border-border/50">
              {/* Featured badge for featured posts */}
              {post.featured && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Featured Post
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {post.title}
              </h1>

              {/* Excerpt if available */}
              {post.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-blue-500 pl-4 py-2 bg-muted/30">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{readTime}</span>
                </div>
                <ViewCounter slug={post.slug} />
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge 
                      variant="secondary" 
                      className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-100 transition-all hover:scale-105 hover:shadow-md"
                    >
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </header>

            {/* Article Content */}
            <MarkdownContent content={post.content} />

            {/* Actions Section */}
            <div className="flex items-center justify-between py-8 border-t border-border/50 bg-gradient-to-r from-muted/30 to-transparent rounded-lg px-6 shadow-sm">
              <LikeButton slug={post.slug} />
              <ShareButton title={post.title} excerpt={post.excerpt} />
            </div>

            {/* Related Posts */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-4 bg-gradient-to-r from-blue-500/5 to-transparent py-2">
                Related Posts
              </h2>
              <div className="grid gap-6">
                {getAllPosts('blog')
                  .filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag)))
                  .slice(0, 2)
                  .map((relatedPost) => (
                    <Card 
                      key={relatedPost.slug} 
                      className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-muted/20"
                    >
                      <CardHeader className="space-y-3">
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/blog/${relatedPost.slug}`} 
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {relatedPost.title}
                          </Link>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {relatedPost.tags.slice(0, 3).map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary"
                              className="text-xs hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            </section>

            {/* Comments Section */}
            <Comments slug={slug} />
          </div>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </>
  );
}
