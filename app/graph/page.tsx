import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Network } from "lucide-react";
import Link from "next/link";
import GraphView from "@/components/blog/graph-view-lazy";
import AnimatedCounter from "@/components/animations/animated-counter";
import { getAllPosts, getAllTags, getPostsByTag, extractInternalRefs } from "@/lib/posts";
import { getTagHub, isIndexableTag } from "@/lib/tag-meta";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: 'Interactive knowledge graph of infra posts and tags',
    description: 'An interactive map of every post, TIL, and tag on the site. Edges are shared tags and direct in-body links, so the clusters show where the topics actually run.',
    openGraph: {
      title: 'Interactive knowledge graph of infra posts and tags',
      description: 'An interactive map of every post, TIL, and tag on the site. Edges are shared tags and direct in-body links, so the clusters show where the topics actually run.',
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
      title: 'Interactive knowledge graph of infra posts and tags',
      description: 'An interactive map of every post, TIL, and tag on the site. Edges are shared tags and direct in-body links, so the clusters show where the topics actually run.',
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

  // The visible clusters in the graph are the hub tags. Derive them from the
  // same data the graph draws from so the prose can't drift from the picture.
  const clusters = allTags
    .map((tag) => ({ tag, count: getPostsByTag(tag).length, hub: getTagHub(tag) }))
    .filter((t) => isIndexableTag(t.tag, t.count))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  const edgeCount = [...blogNodes, ...tilNodes].reduce(
    (n, node) => n + node.tags.length + node.related.length,
    0
  );

  const faqs = [
    {
      question: "What does this knowledge graph show?",
      answer:
        `Every blog post (${blogPosts.length}), TIL note (${tilPosts.length}) and tag (${allTags.length}) on this site as a node, with an edge wherever two of them are connected. A post connects to each of its tags, and to any other post it links to in its body. There are roughly ${edgeCount} edges in total.`,
    },
    {
      question: "How do I read the clusters?",
      answer:
        "A cluster is a tag with enough posts to pull them together in the force layout. The dense ones are the topics with real depth here: GPU infrastructure on Kubernetes, the Lazy Security series, observability, and the command-line notes. A post sitting between two clusters shares tags with both.",
    },
    {
      question: "What do the node colours mean?",
      answer:
        "Blue nodes are blog posts, green nodes are TIL notes, and purple nodes are tags. Node size scales with how many edges a node has, so the biggest purple circles are the tags carrying the most posts.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

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
          The knowledge graph
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Every post, TIL note, and tag on this site drawn as one graph. A post connects
          to each tag it carries and to every other post it links to in its body, so the
          dense areas are the topics with real depth rather than the ones written most
          recently. Drag a node to pull its cluster apart; double-click to open it.
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

      {/* Clusters — the prose half of the graph, and the crawl path to the tag hubs */}
      <Card>
        <CardHeader>
          <CardTitle>What the clusters are</CardTitle>
          <CardDescription>
            {clusters.length} tags carry enough posts to form a visible cluster. Each one
            has a hub page with the full list.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {clusters.map(({ tag, count, hub }) => (
              <li key={tag} className="text-sm leading-relaxed">
                <Link href={`/tags/${tag}`} className="font-medium text-primary hover:underline">
                  #{tag}
                </Link>
                <span className="text-muted-foreground">
                  {" "}— {count} post{count === 1 ? "" : "s"}
                  {hub ? `. ${hub.intro.split(". ")[0]}.` : "."}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            The rest of the tags are still browsable from{" "}
            <Link href="/tags" className="text-primary hover:underline">
              the full topic index
            </Link>
            ; they carry one or two posts each and sit at the edge of the graph.
          </p>
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

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Questions about the graph</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="space-y-1.5">
              <h2 className="text-base font-medium">{faq.question}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}

