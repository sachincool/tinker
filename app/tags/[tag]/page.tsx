import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { getTagMeta } from "@/lib/tag-meta";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata({
  params
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag: tagParam } = await params;
  const tag = decodeURIComponent(tagParam);
  const posts = getPostsByTag(tag);
  const meta = getTagMeta(tag);

  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  const tagUrl = `${baseUrl}/tags/${encodeURIComponent(tag)}`;

  const count = posts.length;
  const blogCount = posts.filter(p => p.type === 'blog').length;
  const tilCount = posts.filter(p => p.type === 'til').length;

  const breakdown = blogCount && tilCount
    ? `${blogCount} blog post${blogCount !== 1 ? 's' : ''} and ${tilCount} TIL note${tilCount !== 1 ? 's' : ''}`
    : blogCount
      ? `${blogCount} in-depth blog post${blogCount !== 1 ? 's' : ''}`
      : `${tilCount} TIL note${tilCount !== 1 ? 's' : ''}`;

  const titlePreview = posts
    .slice(0, 3)
    .map(p => p.title)
    .filter(Boolean)
    .join(' · ');

  // Prefer the hand-written tag description when available; it's the cleanest meta line.
  const description = meta?.description
    ? count
      ? `${meta.description} ${breakdown}.${titlePreview ? ` Featuring: ${titlePreview}.` : ''}`
      : meta.description
    : count
      ? `Explore ${breakdown} on #${tag} — DevOps, Kubernetes, infrastructure, and production war stories from the Infra Magician's digital garden.${titlePreview ? ` Featuring: ${titlePreview}.` : ''}`
      : `Articles, notes, and tutorials on #${tag} from the Infra Magician's digital garden — DevOps, Kubernetes, infrastructure, and production engineering insights.`;

  const trimmed = description.length > 158
    ? description.slice(0, description.lastIndexOf(' ', 155)).replace(/[,;:.\s]+$/, '') + '…'
    : description;

  return {
    title: `#${tag}`,
    description: trimmed,
    openGraph: {
      title: `#${tag} — ${siteConfig.title}`,
      description: trimmed,
      type: 'website',
      url: tagUrl,
      siteName: siteConfig.title,
    },
    twitter: {
      card: 'summary',
      title: `#${tag} — ${siteConfig.title}`,
      description: trimmed,
    },
    alternates: {
      canonical: tagUrl,
    },
  };
}

const relatedTagClass =
  "inline-flex items-center rounded-md border border-border/60 bg-muted/60 px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary";

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: tagParam } = await params;
  const tag = decodeURIComponent(tagParam);

  const posts = getPostsByTag(tag);
  const meta = getTagMeta(tag);

  const blogPosts = posts.filter(p => p.type === "blog");
  const tilPosts = posts.filter(p => p.type === "til");

  const allTags = getAllTags();
  const relatedTags = allTags.filter(t => t !== tag).slice(0, 8);

  const counts: string[] = [];
  if (blogPosts.length) counts.push(`${blogPosts.length} blog post${blogPosts.length === 1 ? "" : "s"}`);
  if (tilPosts.length) counts.push(`${tilPosts.length} TIL${tilPosts.length === 1 ? "" : "s"}`);
  const countLine = counts.join(" · ");

  return (
    <div className="space-y-12">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/tags">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tags
        </Link>
      </Button>

      <header className="space-y-3 max-w-2xl">
        <h1>#{tag}</h1>
        {meta?.description && (
          <p className="text-base md:text-lg italic text-muted-foreground">
            {meta.description}
          </p>
        )}
        {countLine && (
          <p className="text-sm text-muted-foreground">{countLine}.</p>
        )}
      </header>

      {blogPosts.length > 0 && (
        <section className="space-y-5">
          <h2>Blog posts</h2>
          <div className="grid gap-4">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="border-border/60 transition-colors hover:border-primary/60">
                <CardHeader>
                  <CardTitle className="text-xl">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  {post.excerpt && (
                    <CardDescription className="text-base">{post.excerpt}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {tilPosts.length > 0 && (
        <section className="space-y-5">
          <h2>Today I learned</h2>
          <div className="grid gap-4">
            {tilPosts.map((post) => (
              <Card key={post.slug} className="border-border/60 transition-colors hover:border-primary/60">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={`/til/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  {post.excerpt && (
                    <CardDescription>{post.excerpt}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <Card className="p-10 text-center">
          <CardContent className="space-y-4 p-0">
            <p className="text-sm text-muted-foreground">
              Nothing tagged <span className="font-medium text-foreground">#{tag}</span> yet.
            </p>
            <Button variant="outline" asChild>
              <Link href="/tags">Browse all tags</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {relatedTags.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base text-muted-foreground">Related tags</h3>
          <div className="flex flex-wrap gap-2">
            {relatedTags.map((relatedTag) => (
              <Link key={relatedTag} href={`/tags/${relatedTag}`} className={relatedTagClass}>
                #{relatedTag}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
