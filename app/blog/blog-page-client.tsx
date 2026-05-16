"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/hooks/use-debounce";
import { type Post } from "@/lib/posts";
import readingTime from "reading-time";
import { motion } from "motion/react";

interface BlogPageClientProps {
  initialPosts: Post[];
}

export default function BlogPageClient({ initialPosts }: BlogPageClientProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Sync if user lands with ?q= via header search
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== searchQuery) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = initialPosts;

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

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return sorted;
  }, [initialPosts, debouncedSearchQuery, selectedTag, sortBy]);

  const isFiltered = !!debouncedSearchQuery || selectedTag !== "all";

  // Single unified list, sorted strictly by date. The `Featured` eyebrow on each
  // card is enough signal — don't reorder, or the newest post gets buried under
  // older posts that happen to be flagged.
  const orderedPosts = filteredAndSortedPosts;

  // Masthead metadata — newest post's month, total post count, issue number
  const issueMeta = useMemo(() => {
    if (initialPosts.length === 0) return null;
    const newest = [...initialPosts].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    const d = new Date(newest.date);
    const month = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { issue: String(initialPosts.length).padStart(2, '0'), month };
  }, [initialPosts]);

  // Get all unique tags for the dropdown
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    initialPosts.forEach(post => post.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [initialPosts]);

  return (
    <div className="mx-auto max-w-5xl space-y-14 md:space-y-20 py-4 md:py-8">
      {/* ── MASTHEAD ─────────────────────────────────────────── */}
      <header className="space-y-6">
        {/* Issue strip */}
        {issueMeta && (
          <div className="flex items-center gap-3 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <span>Issue No. {issueMeta.issue}</span>
            <span className="h-px w-8 bg-border" aria-hidden />
            <span>{issueMeta.month}</span>
          </div>
        )}
        {/* Title + tagline */}
        <div className="flex flex-col gap-4 md:gap-6">
          <h1 className="font-serif font-normal text-6xl md:text-8xl leading-[0.95] tracking-[-0.02em] text-foreground">
            The Blog
          </h1>
          <p className="font-serif italic text-lg md:text-xl text-muted-foreground max-w-2xl leading-snug">
            I tinker with infrastructure and write about what broke. The good stuff is at the top; the rest is in the archive.
          </p>
        </div>
      </header>

      {/* ── SEARCH / FILTER STRIP ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 border-y border-border py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts…"
            className="pl-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full sm:w-44 border-0 bg-transparent text-sm shadow-none focus:ring-0">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44 border-0 bg-transparent text-sm shadow-none focus:ring-0">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count — only when filtering */}
      {isFiltered && (
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <motion.span
            key={filteredAndSortedPosts.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'result' : 'results'}
          </motion.span>
          {debouncedSearchQuery && (
            <span className="text-muted-foreground/70 normal-case tracking-normal font-sans"> for &ldquo;{debouncedSearchQuery}&rdquo;</span>
          )}
          {selectedTag !== "all" && (
            <span className="text-muted-foreground/70 normal-case tracking-normal font-sans"> in #{selectedTag}</span>
          )}
        </div>
      )}

      {/* ── POST LIST ─────────────────────────────────────────── */}
      <section>
        {orderedPosts.length > 0 ? (
          <ul className="divide-y divide-border">
            {orderedPosts.map((post, index) => {
              const stats = readingTime(post.content);
              const date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              }).toLowerCase();
              return (
                <motion.li
                  key={post.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.3 }}
                >
                  <article className="group py-8 md:py-10">
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-10">
                      {post.heroImage && (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="block relative w-full sm:w-44 md:w-56 aspect-[16/10] sm:aspect-[4/3] shrink-0 overflow-hidden bg-muted border border-border"
                        >
                          <Image
                            src={post.heroImage}
                            alt={post.heroAlt || post.title}
                            fill
                            sizes="(min-width: 768px) 224px, (min-width: 640px) 176px, 100vw"
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                          <span>{date}</span>
                          <span className="h-px w-3 bg-border" aria-hidden />
                          <span>{stats.text.toLowerCase()}</span>
                          {post.featured && (
                            <>
                              <span className="h-px w-3 bg-border" aria-hidden />
                              <span className="text-primary">Featured</span>
                            </>
                          )}
                        </div>
                        <h2 className="font-serif font-normal text-2xl md:text-3xl leading-[1.1] tracking-[-0.01em]">
                          <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                            {post.title}
                          </Link>
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2 max-w-[65ch]">
                          {post.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                          {post.tags.slice(0, 4).map((tag) => (
                            <Link
                              key={tag}
                              href={`/tags/${tag}`}
                              className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground hover:text-primary transition-colors"
                            >
                              {tag}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <div className="space-y-4">
              <Search className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
              <div>
                <h3 className="font-serif text-2xl mb-2">Nothing matches</h3>
                <p className="text-sm text-muted-foreground">
                  Try a different tag or clear the search.
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

