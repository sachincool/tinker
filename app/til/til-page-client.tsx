"use client";

import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import { type Post } from "@/lib/posts";

interface TILPageClientProps {
  initialTils: Post[];
}

export default function TILPageClient({ initialTils }: TILPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter TILs
  const filteredTils = useMemo(() => {
    let filtered = initialTils;

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((til) =>
        til.title.toLowerCase().includes(query) ||
        til.content.toLowerCase().includes(query) ||
        til.excerpt.toLowerCase().includes(query) ||
        til.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter((til) =>
        til.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Sort by date (newest first)
    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [initialTils, debouncedSearchQuery, selectedTag]);

  // Get all unique tags for the dropdown
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    initialTils.forEach((til) => til.tags.forEach((tag) => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [initialTils]);

  const isFiltered = !!debouncedSearchQuery || selectedTag !== "all";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-10 md:space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Today I learned
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight">
          Notes from the workbench.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Short entries. The kind of thing you scribble on the back of a receipt
          before you forget: a flag that finally made sense, a one-liner
          that saved an hour, a footgun that drew blood.
        </p>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
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
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isFiltered && (
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {filteredTils.length} {filteredTils.length === 1 ? "note" : "notes"}
          {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
          {selectedTag !== "all" && ` in ${selectedTag}`}
        </div>
      )}

      {/* TIL list */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          {isFiltered ? "Results" : "All notes"}
        </div>

        {filteredTils.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {filteredTils.map((til, index) => (
              <motion.li
                key={til.slug}
                className="py-5 first:pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.3), ease: [0.25, 0.4, 0.25, 1] }}
              >
                <article className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    <time dateTime={til.date}>
                      {new Date(til.date)
                        .toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        .toLowerCase()}
                    </time>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl leading-[1.2] tracking-tight">
                    <Link
                      href={`/til/${til.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {til.title}
                    </Link>
                  </h2>
                  {til.excerpt && (
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2 max-w-[60ch]">
                      {til.excerpt}
                    </p>
                  )}
                  {til.tags.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                      {til.tags.slice(0, 5).map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${tag}`}
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center space-y-4">
            <p className="font-serif text-lg text-foreground">
              Nothing in this drawer.
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Try a different search or clear the tag filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {/* Back link */}
      <div className="pt-2">
        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
