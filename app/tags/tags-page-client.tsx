"use client";

import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

interface TagData {
  name: string;
  count: number;
  description?: string | null;
}

interface TagsPageClientProps {
  initialTags: TagData[];
}

const tagBadgeClass =
  "inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/60 px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary";

export default function TagsPageClient({ initialTags }: TagsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const alphabeticalTags = useMemo(() => {
    return [...initialTags].sort((a, b) => a.name.localeCompare(b.name));
  }, [initialTags]);

  const popularTags = useMemo(() => {
    return [...initialTags].sort((a, b) => b.count - a.count);
  }, [initialTags]);

  const filteredTags = useMemo(() => {
    if (!debouncedSearchQuery) return alphabeticalTags;

    const query = debouncedSearchQuery.toLowerCase();
    return alphabeticalTags.filter(tag =>
      tag.name.toLowerCase().includes(query)
    );
  }, [alphabeticalTags, debouncedSearchQuery]);

  const totalPosts = initialTags.reduce((sum, tag) => sum + tag.count, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12">
      <header className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Tags
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight">
          Everything, filed by subject.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {initialTags.length} tags across {totalPosts} posts.
        </p>
      </header>

      <div className="max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {debouncedSearchQuery && (
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredTags.length} match{filteredTags.length === 1 ? "" : "es"} for &ldquo;{debouncedSearchQuery}&rdquo;
          </p>
        )}
      </div>

      {filteredTags.length > 0 ? (
        <section className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            {debouncedSearchQuery ? "Matching tags" : "All tags"}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {filteredTags.map((tag, i) => (
              <motion.div
                key={tag.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.4), ease: [0.25, 0.4, 0.25, 1] }}
              >
                <Link href={`/tags/${tag.name}`} className={tagBadgeClass}>
                  <span>#{tag.name}</span>
                  <span className="text-xs text-muted-foreground">·&nbsp;{tag.count}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <Card className="p-10 text-center">
          <Search className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            No tags match &ldquo;{debouncedSearchQuery}&rdquo;.
          </p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>
            Clear search
          </Button>
        </Card>
      )}

      {!debouncedSearchQuery && popularTags.length >= 3 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Most written about
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularTags.slice(0, 6).map((tag, i) => (
              <motion.div
                key={tag.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4), ease: [0.25, 0.4, 0.25, 1] }}
              >
                <Link href={`/tags/${tag.name}`} className="group block h-full">
                <Card className="h-full border-border/60 transition-colors group-hover:border-primary/60 hover:-translate-y-0.5 duration-300">
                  <CardContent className="space-y-2 pt-6 pb-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-xl group-hover:text-primary transition-colors">
                        #{tag.name}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {tag.count} post{tag.count === 1 ? "" : "s"}
                      </span>
                    </div>
                    {tag.description && (
                      <p className="text-sm italic text-muted-foreground">
                        {tag.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
