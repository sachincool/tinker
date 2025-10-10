import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Lightbulb } from "lucide-react";
import Link from "next/link";
import { ViewCounter } from "@/components/blog/view-counter";
import { LikeButton } from "@/components/blog/like-button";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import readingTime from "reading-time";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const til = getPostBySlug(id, 'til');
  
  if (!til) {
    return {
      title: '404 - TIL Not Found',
    };
  }

  const tilUrl = `${siteConfig.siteUrl}/til/${id}`;

  return {
    title: `TIL: ${til.title} | ${siteConfig.author.name}`,
    description: til.excerpt || til.title,
    keywords: til.tags,
    authors: [{ name: siteConfig.author.name, url: siteConfig.siteUrl }],
    openGraph: {
      title: til.title,
      description: til.excerpt || til.title,
      type: 'article',
      publishedTime: til.date,
      url: tilUrl,
      siteName: siteConfig.title,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title: til.title,
      description: til.excerpt || til.title,
      creator: '@exploit_sh',
    },
    alternates: {
      canonical: tilUrl,
    },
  };
}

export default async function TILPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the actual TIL post based on the ID
  const til = getPostBySlug(id, 'til');

  // If TIL doesn't exist, show 404
  if (!til) {
    notFound();
  }

  // Calculate reading time
  const stats = readingTime(til.content);
  const readTime = stats.text;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Back button */}
        <Button variant="ghost" asChild>
          <Link href="/til">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to TILs
          </Link>
        </Button>

        {/* TIL Header */}
        <header className="space-y-6 pb-8 border-b">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span>Today I Learned</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            {til.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(til.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readTime}</span>
            </div>
            <ViewCounter slug={til.slug} />
          </div>

          <div className="flex flex-wrap gap-2">
            {til.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                <Badge variant="secondary" className="hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-800 dark:hover:text-yellow-100 transition-colors">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </header>

        {/* TIL Content */}
        <MarkdownContent content={til.content} />

        {/* Actions Section */}
        <div className="flex items-center justify-between py-6 border-t">
          <LikeButton slug={til.slug} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/til">
              See More TILs
            </Link>
          </Button>
        </div>

        {/* Related TILs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">More TILs You Might Like</h2>
          <div className="grid gap-4">
            {getAllPosts('til')
              .filter(p => p.slug !== til.slug && p.tags.some(tag => til.tags.includes(tag)))
              .slice(0, 2)
              .map((relatedTil) => (
                <Card key={relatedTil.slug} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link href={`/til/${relatedTil.slug}`} className="hover:text-yellow-600 transition-colors flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        {relatedTil.title}
                      </Link>
                    </CardTitle>
                    <div className="flex gap-2">
                      {relatedTil.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
