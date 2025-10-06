"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Clock, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      id: "modern-react-patterns",
      title: "Modern React Patterns That Will Make You a Better Developer",
      excerpt: "Exploring advanced React patterns including compound components, render props, and custom hooks that every developer should know.",
      content: "# Modern React Patterns\n\nReact has evolved significantly...",
      date: "2025-09-08",
      readTime: "8 min read",
      tags: ["react", "javascript", "patterns", "web-dev"],
      featured: true
    },
    {
      id: "anime-programming-lessons",
      title: "What Anime Taught Me About Programming",
      excerpt: "Surprisingly, anime contains valuable lessons about debugging, persistence, and the developer mindset.",
      content: "# Anime and Programming\n\nAs a developer who loves anime...",
      date: "2025-09-05",
      readTime: "6 min read",
      tags: ["anime", "philosophy", "career", "mindset"],
      featured: false
    },
    {
      id: "obsidian-blog-setup",
      title: "Building a Blog Connected to Your Obsidian Vault",
      excerpt: "How I created a seamless workflow from my digital garden to a public blog using modern web technologies.",
      content: "# Obsidian to Blog\n\nObsidian is an amazing tool...",
      date: "2025-09-02",
      readTime: "12 min read",
      tags: ["obsidian", "nextjs", "automation", "productivity"],
      featured: true
    },
    {
      id: "css-grid-mastery",
      title: "CSS Grid: From Zero to Hero",
      excerpt: "A comprehensive guide to mastering CSS Grid with practical examples and real-world use cases.",
      content: "# CSS Grid Mastery\n\nCSS Grid is one of the most powerful...",
      date: "2025-08-28",
      readTime: "10 min read",
      tags: ["css", "web-dev", "layout", "responsive"],
      featured: false
    },
    {
      id: "typescript-advanced-types",
      title: "Advanced TypeScript Types You Should Know",
      excerpt: "Diving deep into conditional types, mapped types, and template literal types to write better TypeScript.",
      content: "# Advanced TypeScript\n\nTypeScript's type system...",
      date: "2025-08-25",
      readTime: "15 min read",
      tags: ["typescript", "types", "advanced", "web-dev"],
      featured: false
    }
  ];

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 relative py-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-transparent dark:from-blue-950/20 dark:via-purple-950/20 rounded-3xl"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium mb-4">
          <BookOpen className="h-4 w-4" />
          <span>The Digital Spellbook</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Blog Posts
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Deep dives into web development, infrastructure chaos, and the art of tinkering with technology.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="anime">Anime</SelectItem>
            <SelectItem value="web-dev">Web Dev</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Featured Posts
          </h2>
          <div className="grid gap-6">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-2xl hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {post.excerpt}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag} href={`/tags/${tag}`}>
                        <Badge variant="secondary" className="hover:bg-blue-100 hover:text-blue-800 transition-colors">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                  <Button asChild className="w-fit group/btn">
                    <Link href={`/blog/${post.id}`}>
                      Read More <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Posts</h2>
        <div className="grid gap-6">
          {regularPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/tags/${tag}`}>
                      <Badge variant="secondary" className="hover:bg-blue-100 hover:text-blue-800 transition-colors">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Posts
        </Button>
      </div>
    </div>
  );
}
