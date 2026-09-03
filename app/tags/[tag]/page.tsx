import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { getTagMeta, getTagHub, isIndexableTag } from "@/lib/tag-meta";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag: tagParam } = await params;
  const tag = decodeURIComponent(tagParam);
  const posts = getPostsByTag(tag);
  const meta = getTagMeta(tag);
  const hub = getTagHub(tag);

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

  // Hub tags carry a hand-written, keyword-front-loaded meta line sized for the
  // SERP snippet window. Everything else falls back to the generated one.
  const description = hub?.metaDescription ?? (meta?.description
    ? count
      ? `${meta.description} ${breakdown}.${titlePreview ? ` Featuring: ${titlePreview}.` : ''}`
      : meta.description
    : count
      ? `Explore ${breakdown} on #${tag}: DevOps, Kubernetes, infrastructure, and production war stories from the Infra Magician's digital garden.${titlePreview ? ` Featuring: ${titlePreview}.` : ''}`
      : `Articles, notes, and tutorials on #${tag} from the Infra Magician's digital garden: DevOps, Kubernetes, infrastructure, and production engineering insights.`);

  const trimmed = description.length > 158
    ? description.slice(0, description.lastIndexOf(' ', 155)).replace(/[,;:.\s]+$/, '') + '…'
    : description;

  // `#tagname` was a 9-character title on 107 URLs. Hub tags get a real one;
  // the thin tags get a descriptive fallback and are kept out of the index.
  const title = hub
    ? `${hub.seoTitle.replace('{n}', String(count))} · ${siteConfig.title}`
    : `#${tag} — ${count} post${count === 1 ? '' : 's'} · ${siteConfig.title}`;

  return {
    title,
    description: trimmed,
    // Thin tag pages stay browsable and keep passing link equity, but they
    // stop competing in the index with the posts they link to.
    robots: isIndexableTag(tag, count)
      ? undefined
      : { index: false, follow: true },
    openGraph: {
      title,
      description: trimmed,
      type: 'website',
      url: tagUrl,
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/tags/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `#${tag} on ${siteConfig.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: trimmed,
      images: [`${baseUrl}/tags/opengraph-image`],
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
  const hub = getTagHub(tag);

  const blogPosts = posts.filter(p => p.type === "blog");
  const tilPosts = posts.filter(p => p.type === "til");

  // Related tags used to be the first eight tags alphabetically, which linked
  // #akamai from every page on the site. Rank by how often a tag actually
  // co-occurs with this one, and send the links to hubs where a hub exists —
  // that's where the crawl budget is worth spending.
  const cooccurrence = new Map<string, number>();
  for (const post of posts) {
    for (const other of post.tags) {
      if (other === tag) continue;
      cooccurrence.set(other, (cooccurrence.get(other) ?? 0) + 1);
    }
  }
  const relatedTags = Array.from(cooccurrence.entries())
    .sort((a, b) =>
      Number(isIndexableTag(b[0], getPostsByTag(b[0]).length)) -
        Number(isIndexableTag(a[0], getPostsByTag(a[0]).length)) ||
      b[1] - a[1] ||
      a[0].localeCompare(b[0])
    )
    .slice(0, 8)
    .map(([t]) => t);

  const counts: string[] = [];
  if (blogPosts.length) counts.push(`${blogPosts.length} blog post${blogPosts.length === 1 ? "" : "s"}`);
  if (tilPosts.length) counts.push(`${tilPosts.length} TIL${tilPosts.length === 1 ? "" : "s"}`);
  const countLine = counts.join(" · ");

  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  const tagUrl = `${baseUrl}/tags/${encodeURIComponent(tag)}`;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub ? hub.seoTitle.replace('{n}', String(posts.length)) : `#${tag}`,
    description: hub?.metaDescription || meta?.description || `Posts tagged #${tag}`,
    url: tagUrl,
    isPartOf: { "@type": "WebSite", name: siteConfig.title, url: baseUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 25).map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${baseUrl}/${post.type}/${post.slug}`,
        name: post.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Tags", item: `${baseUrl}/tags` },
      { "@type": "ListItem", position: 3, name: `#${tag}`, item: tagUrl },
    ],
  };

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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

      {hub && (
        <section className="max-w-2xl -mt-6">
          <p className="text-base leading-relaxed text-muted-foreground">{hub.intro}</p>
        </section>
      )}

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
