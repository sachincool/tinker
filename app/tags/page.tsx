import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Tag, TrendingUp, Hash } from "lucide-react";
import Link from "next/link";

export default function TagsPage() {
  const tags = [
    { name: "typescript", count: 18, description: "Type-safe JavaScript development", color: "bg-blue-100 text-blue-800" },
    { name: "react", count: 15, description: "React library and ecosystem", color: "bg-cyan-100 text-cyan-800" },
    { name: "nextjs", count: 12, description: "Full-stack React framework", color: "bg-gray-100 text-gray-800" },
    { name: "css", count: 14, description: "Styling and layout techniques", color: "bg-pink-100 text-pink-800" },
    { name: "javascript", count: 20, description: "Core JavaScript concepts", color: "bg-yellow-100 text-yellow-800" },
    { name: "web-dev", count: 16, description: "General web development", color: "bg-green-100 text-green-800" },
    { name: "anime", count: 8, description: "Anime culture and recommendations", color: "bg-purple-100 text-purple-800" },
    { name: "productivity", count: 10, description: "Tools and workflows", color: "bg-orange-100 text-orange-800" },
    { name: "performance", count: 7, description: "Optimization techniques", color: "bg-red-100 text-red-800" },
    { name: "accessibility", count: 6, description: "Web accessibility practices", color: "bg-indigo-100 text-indigo-800" },
    { name: "git", count: 9, description: "Version control and workflows", color: "bg-gray-100 text-gray-800" },
    { name: "vscode", count: 5, description: "VS Code tips and extensions", color: "bg-blue-100 text-blue-800" },
    { name: "obsidian", count: 4, description: "Knowledge management", color: "bg-violet-100 text-violet-800" },
    { name: "automation", count: 6, description: "Workflow automation", color: "bg-teal-100 text-teal-800" },
    { name: "responsive", count: 8, description: "Responsive design patterns", color: "bg-emerald-100 text-emerald-800" },
    { name: "hooks", count: 11, description: "React hooks patterns", color: "bg-cyan-100 text-cyan-800" },
    { name: "types", count: 13, description: "Type systems and patterns", color: "bg-blue-100 text-blue-800" },
    { name: "optimization", count: 5, description: "Code and performance optimization", color: "bg-red-100 text-red-800" },
    { name: "i18n", count: 3, description: "Internationalization", color: "bg-purple-100 text-purple-800" },
    { name: "workflow", count: 7, description: "Development workflows", color: "bg-orange-100 text-orange-800" }
  ];

  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const popularTags = sortedTags.slice(0, 6);
  const allTags = sortedTags;

  const tagsByCategory = {
    "Frontend": tags.filter(tag => ["react", "nextjs", "css", "javascript", "responsive", "hooks"].includes(tag.name)),
    "Languages & Types": tags.filter(tag => ["typescript", "javascript", "types"].includes(tag.name)),
    "Tools & Workflow": tags.filter(tag => ["git", "vscode", "obsidian", "automation", "workflow", "productivity"].includes(tag.name)),
    "Performance & Optimization": tags.filter(tag => ["performance", "optimization"].includes(tag.name)),
    "Other": tags.filter(tag => ["anime", "accessibility", "i18n", "web-dev"].includes(tag.name))
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Tag className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold">Tags</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore content by topics and technologies. Each tag represents a journey of learning and discovery.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tags..." className="pl-10" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-muted-foreground">Total tags</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tags.reduce((sum, tag) => sum + tag.count, 0)}</div>
            <p className="text-xs text-muted-foreground">Tagged content</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Math.round(tags.reduce((sum, tag) => sum + tag.count, 0) / tags.length)}</div>
            <p className="text-xs text-muted-foreground">Avg per tag</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Tags */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Most Popular
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTags.map((tag) => (
            <Card key={tag.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {tag.name}
                  </CardTitle>
                  <Badge className={tag.color}>
                    {tag.count}
                  </Badge>
                </div>
                <CardDescription>{tag.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/tags/${tag.name}`}>
                    View Content
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tags by Category */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="space-y-8">
          {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-4">{category}</h3>
              <div className="flex flex-wrap gap-3">
                {categoryTags.map((tag) => (
                  <Link key={tag.name} href={`/tags/${tag.name}`}>
                    <Badge 
                      variant="secondary" 
                      className="hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer text-sm py-2 px-3"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.name} ({tag.count})
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Tags Cloud */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Tags</h2>
        <div className="flex flex-wrap gap-3">
          {allTags.map((tag) => {
            const size = Math.min(Math.max(tag.count / 5, 0.8), 2);
            return (
              <Link key={tag.name} href={`/tags/${tag.name}`}>
                <Badge 
                  variant="outline" 
                  className="hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                  style={{ fontSize: `${size * 0.75}rem`, padding: `${size * 0.25}rem ${size * 0.5}rem` }}
                >
                  {tag.name} ({tag.count})
                </Badge>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
