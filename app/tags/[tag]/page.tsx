"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hash, BookOpen, Lightbulb } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: tagParam } = use(params);
  const tag = decodeURIComponent(tagParam);

  // In a real app, fetch posts/TILs by this tag from API
  const posts = [
    {
      id: "kubernetes-debugging-tips",
      title: "5 Kubernetes Debugging Tricks That Saved My Production",
      excerpt: "Hard-learned lessons from debugging Kubernetes issues at 3 AM.",
      type: "blog",
      date: "2024-12-15",
      tags: ["kubernetes", "devops", "debugging"],
    },
    {
      id: "kubectl-neat-trick",
      title: "kubectl neat - Remove Kubernetes YAML Clutter",
      excerpt: "Use kubectl neat plugin to remove all the noise from Kubernetes YAML output.",
      type: "til",
      date: "2024-12-10",
      tags: ["kubernetes", "kubectl", "productivity"],
    },
    {
      id: "k8s-ephemeral-containers",
      title: "Kubernetes Ephemeral Debug Containers",
      excerpt: "Debug running pods without rebuilding images.",
      type: "til",
      date: "2024-12-01",
      tags: ["kubernetes", "debugging", "devops"],
    },
  ].filter(post => post.tags.includes(tag.toLowerCase()));

  const blogPosts = posts.filter(p => p.type === "blog");
  const tilPosts = posts.filter(p => p.type === "til");

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/tags">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Tags
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center space-y-4 relative py-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-transparent dark:from-blue-950/20 dark:via-purple-950/20 rounded-3xl"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-sm font-medium mb-4">
          <Hash className="h-4 w-4 text-blue-500" />
          <span>Tag</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            #{tag}
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {posts.length} post{posts.length !== 1 ? 's' : ''} tagged with <span className="font-semibold">#{tag}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {posts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Posts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {blogPosts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Blog Posts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6 text-center">
            <Lightbulb className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {tilPosts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">TILs</p>
          </CardContent>
        </Card>
      </div>

      {/* Blog Posts */}
      {blogPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            Blog Posts
          </h2>
          <div className="grid gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-base">{post.excerpt}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((t) => (
                      <Link key={t} href={`/tags/${t}`}>
                        <Badge
                          variant={t === tag ? "default" : "secondary"}
                          className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                        >
                          {t}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* TIL Posts */}
      {tilPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Today I Learned
          </h2>
          <div className="grid gap-6">
            {tilPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-yellow-600 transition-colors flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <Link href={`/til/${post.id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((t) => (
                      <Link key={t} href={`/tags/${t}`}>
                        <Badge
                          variant={t === tag ? "default" : "outline"}
                          className="hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors text-xs"
                        >
                          {t}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">
                There are no posts tagged with <span className="font-semibold">#{tag}</span> yet.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/tags">
                Browse All Tags
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Related Tags */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Related Tags</h3>
        <div className="flex flex-wrap gap-2">
          {["devops", "kubernetes", "debugging", "productivity", "kubectl"].map((relatedTag) => (
            <Link key={relatedTag} href={`/tags/${relatedTag}`}>
              <Badge variant="outline" className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                #{relatedTag}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
