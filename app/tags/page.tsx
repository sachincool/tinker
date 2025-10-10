"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Hash, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

// Note: Metadata should be in a parent server component or separate metadata file
// For now, this page is client-side only
export default function TagsPage() {
  const tags = [
    { name: "kubernetes", count: 23, color: "from-blue-500 to-cyan-500" },
    { name: "react", count: 18, color: "from-cyan-500 to-blue-500" },
    { name: "typescript", count: 15, color: "from-blue-600 to-purple-600" },
    { name: "nextjs", count: 12, color: "from-purple-500 to-pink-500" },
    { name: "devops", count: 20, color: "from-green-500 to-teal-500" },
    { name: "docker", count: 14, color: "from-blue-400 to-indigo-500" },
    { name: "aws", count: 10, color: "from-orange-500 to-red-500" },
    { name: "terraform", count: 8, color: "from-purple-600 to-indigo-600" },
    { name: "chaos-engineering", count: 16, color: "from-red-500 to-pink-500" },
    { name: "javascript", count: 22, color: "from-yellow-500 to-orange-500" },
    { name: "css", count: 14, color: "from-pink-500 to-rose-500" },
    { name: "web-dev", count: 19, color: "from-teal-500 to-green-500" },
    { name: "git", count: 7, color: "from-gray-500 to-slate-600" },
    { name: "performance", count: 11, color: "from-green-600 to-emerald-500" },
    { name: "automation", count: 9, color: "from-indigo-500 to-blue-600" },
    { name: "productivity", count: 13, color: "from-orange-600 to-yellow-500" },
    { name: "dota2", count: 5, color: "from-red-600 to-orange-600" },
    { name: "anime", count: 3, color: "from-purple-500 to-fuchsia-500" },
  ];

  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 relative py-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-transparent dark:from-indigo-950/20 dark:via-purple-950/20 rounded-3xl"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-sm font-medium mb-4">
          <Hash className="h-4 w-4 text-purple-500" />
          <span>Explore Topics</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Browse Tags
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover content by topics, technologies, and random chaos categories.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tags... (try 'kubernetes', 'react', or 'chaos')" 
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default">
          <CardContent className="pt-6 text-center">
            <Hash className="h-6 w-6 mx-auto mb-2 text-indigo-500 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {tags.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Tags</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {totalPosts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tagged Posts</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-pink-500 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              {sortedTags[0].name}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Most Popular</p>
          </CardContent>
        </Card>
      </div>

      {/* Tag Cloud */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Hash className="h-6 w-6 text-purple-500" />
          All Tags
        </h2>
        <div className="flex flex-wrap gap-3">
          {sortedTags.map((tag, index) => {
            // Size based on count
            const sizeClass = tag.count > 15 
              ? "text-2xl px-6 py-3" 
              : tag.count > 10 
              ? "text-xl px-5 py-2.5" 
              : "text-lg px-4 py-2";
            
            return (
              <Link key={tag.name} href={`/tags/${tag.name}`}>
                <Badge 
                  variant="outline" 
                  className={`${sizeClass} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 group relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tag.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <span className="relative flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {tag.name}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${tag.color} text-white`}>
                      {tag.count}
                    </span>
                  </span>
                </Badge>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Tags */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-500" />
          Trending Topics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTags.slice(0, 6).map((tag, index) => (
            <Card 
              key={tag.name}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            >
              <Link href={`/tags/${tag.name}`}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${tag.color} flex items-center justify-center text-white font-bold`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold group-hover:text-purple-600 transition-colors">
                          {tag.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tag.count} posts
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Fun Fact */}
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6 pb-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-500" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Fun Fact:</strong> I have more tags about things 
            breaking than things working. That&apos;s the chaos engineering way! 💥
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
