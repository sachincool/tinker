"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Clock, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const posts = [
    {
      id: "kubernetes-debugging-tips",
      title: "5 Kubernetes Debugging Tricks That Saved My Production",
      excerpt: "Hard-learned lessons from debugging Kubernetes issues at 3 AM. These tricks will save you hours of frustration.",
      content: "# 5 Kubernetes Debugging Tricks\n\nAfter countless nights debugging...",
      date: "2024-12-15",
      readTime: "8 min read",
      tags: ["kubernetes", "devops", "debugging", "production"],
      featured: true
    },
    {
      id: "infrastructure-as-code-mistakes",
      title: "Infrastructure as Code: Mistakes I Made So You Don't Have To",
      excerpt: "Learning Terraform the hard way. Here are the mistakes that cost me sleep, money, and a bit of my sanity.",
      content: "# Infrastructure as Code Mistakes\n\nAfter managing infrastructure...",
      date: "2024-11-28",
      readTime: "12 min read",
      tags: ["terraform", "iac", "devops", "infrastructure"],
      featured: true
    },
    {
      id: "docker-optimization-guide",
      title: "Docker Image Optimization: From 2GB to 50MB",
      excerpt: "How I reduced my Docker images by 97% using multi-stage builds and Alpine Linux.",
      content: "# Docker Optimization\n\nDocker images getting too big?",
      date: "2024-11-15",
      readTime: "10 min read",
      tags: ["docker", "optimization", "devops"],
      featured: false
    },
    {
      id: "kubernetes-networking-deep-dive",
      title: "Kubernetes Networking Deep Dive",
      excerpt: "Understanding how pods communicate, what CNI plugins do, and why network policies matter.",
      content: "# K8s Networking\n\nKubernetes networking is complex...",
      date: "2024-10-28",
      readTime: "15 min read",
      tags: ["kubernetes", "networking", "infrastructure"],
      featured: false
    },
    {
      id: "cicd-best-practices",
      title: "CI/CD Best Practices I Learned the Hard Way",
      excerpt: "Building reliable CI/CD pipelines isn't just about automation - it's about building trust.",
      content: "# CI/CD Best Practices\n\nAfter breaking production with bad deploys...",
      date: "2024-10-10",
      readTime: "9 min read",
      tags: ["cicd", "devops", "automation", "bestpractices"],
      featured: false
    }
  ];

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search query (using debounced value)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Sort posts
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      // "popular" - could be based on likes/views in the future
      return 0;
    });

    return sorted;
  }, [posts, debouncedSearchQuery, selectedTag, sortBy]);

  const featuredPosts = filteredAndSortedPosts.filter(post => post.featured);
  const regularPosts = filteredAndSortedPosts.filter(post => !post.featured);

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
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="kubernetes">Kubernetes</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="terraform">Terraform</SelectItem>
            <SelectItem value="docker">Docker</SelectItem>
            <SelectItem value="cicd">CI/CD</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
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

      {/* Results count */}
      {(debouncedSearchQuery || selectedTag !== "all") && (
        <div className="text-sm text-muted-foreground">
          Found {filteredAndSortedPosts.length} post{filteredAndSortedPosts.length !== 1 ? 's' : ''}
          {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
          {selectedTag !== "all" && ` in ${selectedTag}`}
        </div>
      )}

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
        {regularPosts.length > 0 ? (
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
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
