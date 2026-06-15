import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Network } from "lucide-react";
import Link from "next/link";
import GraphView from "@/components/blog/graph-view-lazy";
import AnimatedCounter from "@/components/animations/animated-counter";
import { getAllPosts, getAllTags, extractInternalRefs } from "@/lib/posts";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `Knowledge Graph | ${siteConfig.author.name}`,
    description: 'Explore the interactive knowledge graph showing connections between blog posts, TILs, and tags.',
    openGraph: {
      title: `Knowledge Graph | ${siteConfig.author.name}`,
      description: 'Explore the interactive knowledge graph showing connections between blog posts, TILs, and tags.',
      type: 'website',
      url: `${baseUrl}/graph`,
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Knowledge Graph | ${siteConfig.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Knowledge Graph | ${siteConfig.author.name}`,
      description: 'Explore the interactive knowledge graph showing connections between blog posts, TILs, and tags.',
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/graph`,
    },
  };
}

export default function GraphPage() {
  // Fetch all posts and tags for the graph
  const blogPosts = getAllPosts('blog');
  const tilPosts = getAllPosts('til');
  const allTags = getAllTags();

  // Build a slim, serializable payload for the client graph. We compute internal
  // cross-references server-side so post bodies don't have to ship to the browser.
  const validKeys = new Set<string>([
    ...blogPosts.map((p) => `blog:${p.slug}`),
    ...tilPosts.map((p) => `til:${p.slug}`),
  ]);
  const toGraphNode = (p: typeof blogPosts[number]) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
    type: p.type,
    related: extractInternalRefs(p.content)
      .map((r) => `${r.type}:${r.slug}`)
      .filter((key) => key !== `${p.type}:${p.slug}` && validKeys.has(key)),
  });
  const blogNodes = blogPosts.map(toGraphNode);
  const tilNodes = tilPosts.map(toGraphNode);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <Network aria-hidden className="h-3.5 w-3.5 text-primary" />
          Knowledge graph
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight">
          Content Graph
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Explore the connections between posts, TILs, and tags. Click and drag nodes to rearrange the graph.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
          <CardContent className="pt-6 text-center">
            <div className="font-serif text-4xl text-primary">
              <AnimatedCounter value={String(blogPosts.length)} />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground mt-1.5">Blog Posts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
          <CardContent className="pt-6 text-center">
            <div className="font-serif text-4xl text-primary">
              <AnimatedCounter value={String(tilPosts.length)} />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground mt-1.5">TILs</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
          <CardContent className="pt-6 text-center">
            <div className="font-serif text-4xl text-primary">
              <AnimatedCounter value={String(allTags.length)} />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground mt-1.5">Unique Tags</p>
          </CardContent>
        </Card>
      </div>

      {/* Graph View */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Knowledge Graph</CardTitle>
          <CardDescription>
            Visualizing the relationships between posts, TILs, and tags. Blue nodes are blog posts, green nodes are TILs, and purple nodes are tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GraphView
            blogPosts={blogNodes}
            tilPosts={tilNodes}
            allTags={allTags}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Scroll or use buttons to zoom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Drag canvas to pan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Drag nodes to rearrange</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Double-click to navigate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Lines show connections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Hover for details</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

