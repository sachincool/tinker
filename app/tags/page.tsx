import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Hash, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);

  return {
    title: `Browse Tags | ${siteConfig.author.name}`,
    description: 'Discover content by topics, technologies, and categories. Browse all tags from blog posts and TILs.',
    openGraph: {
      title: `Browse Tags | ${siteConfig.author.name}`,
      description: 'Discover content by topics, technologies, and categories. Browse all tags from blog posts and TILs.',
      type: 'website',
      url: `${baseUrl}/tags`,
      siteName: siteConfig.title,
      images: [
        {
          url: `${baseUrl}/tags/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Browse Tags - Infra Magician's Digital Garden",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Browse Tags | ${siteConfig.author.name}`,
      description: 'Discover content by topics, technologies, and categories.',
      images: [`${baseUrl}/tags/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/tags`,
    },
  };
}

const colorPalettes = [
  "from-blue-500 to-cyan-500",
  "from-cyan-500 to-blue-500",
  "from-blue-600 to-purple-600",
  "from-purple-500 to-pink-500",
  "from-green-500 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-orange-500 to-red-500",
  "from-purple-600 to-indigo-600",
  "from-red-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-green-500",
  "from-gray-500 to-slate-600",
  "from-green-600 to-emerald-500",
  "from-indigo-500 to-blue-600",
  "from-orange-600 to-yellow-500",
];

function getTagColor(tagName: string): string {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalettes[Math.abs(hash) % colorPalettes.length];
}

export default function TagsPage() {
  const allTags = getAllTags();
  
  const tags = allTags.map(tagName => ({
    name: tagName,
    count: getPostsByTag(tagName).length,
    color: getTagColor(tagName),
  }));

  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const totalPosts = tags.reduce((sum, tag) => sum + tag.count, 0);
  const mostPopularTag = sortedTags[0]?.name || 'none';

  return (
    <div className="space-y-8">
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

      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tags... (try 'kubernetes', 'docker', or 'devops')" 
            className="pl-10"
            readOnly
          />
        </div>
      </div>

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
              {mostPopularTag}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Most Popular</p>
          </CardContent>
        </Card>
      </div>

      {sortedTags.length > 0 ? (
        <section className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Hash className="h-6 w-6 text-purple-500" />
            All Tags
          </h2>
          <div className="flex flex-wrap gap-3">
            {sortedTags.map((tag) => {
              const sizeClass = tag.count > 5 
                ? "text-2xl px-6 py-3" 
                : tag.count > 2 
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
      ) : (
        <section className="max-w-6xl mx-auto">
          <Card className="p-12 text-center">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
            <p className="text-muted-foreground">
              Tags will appear here once you add content with tags.
            </p>
          </Card>
        </section>
      )}

      {sortedTags.length >= 3 && (
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
                            {tag.count} post{tag.count !== 1 ? 's' : ''}
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
      )}

      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6 pb-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-500" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Fun Fact:</strong> I have more tags about things 
            breaking than things working. That&apos;s the chaos engineering way!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
