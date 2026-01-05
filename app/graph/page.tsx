import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Network } from "lucide-react";
import Link from "next/link";
import { GraphView } from "@/components/blog/graph-view";
import { getAllPosts, getAllTags } from "@/lib/posts";
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
    },
    twitter: {
      card: 'summary',
      title: `Knowledge Graph | ${siteConfig.author.name}`,
      description: 'Explore the interactive knowledge graph showing connections between blog posts, TILs, and tags.',
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
      <div className="text-center space-y-4 relative py-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 via-blue-50 to-transparent dark:from-purple-950/20 dark:via-blue-950/20 rounded-3xl"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-sm font-medium mb-4">
          <Network className="h-4 w-4 text-purple-500" />
          <span>Knowledge Graph</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Content Graph
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore the connections between posts, TILs, and tags. Click and drag nodes to rearrange the graph.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {blogPosts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Blog Posts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {tilPosts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">TILs</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {allTags.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unique Tags</p>
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
            blogPosts={blogPosts} 
            tilPosts={tilPosts} 
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
              <span className="text-blue-500">•</span>
              <span>Scroll or use buttons to zoom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>Drag canvas to pan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              <span>Drag nodes to rearrange</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>Double-click to navigate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-500">•</span>
              <span>Lines show connections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              <span>Hover for details</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

