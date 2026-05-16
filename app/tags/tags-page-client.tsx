"use client";

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
    <div className="space-y-12">
      <header className="space-y-3 max-w-2xl">
        <h1>Tags</h1>
        <p className="text-sm text-muted-foreground">
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
          <h2>{debouncedSearchQuery ? "Matching tags" : "All tags"}</h2>
          <div className="flex flex-wrap gap-2.5">
            {filteredTags.map((tag) => (
              <Link key={tag.name} href={`/tags/${tag.name}`} className={tagBadgeClass}>
                <span>#{tag.name}</span>
                <span className="text-xs text-muted-foreground">·&nbsp;{tag.count}</span>
              </Link>
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
          <h2>Most written about</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popularTags.slice(0, 6).map((tag) => (
              <Link key={tag.name} href={`/tags/${tag.name}`} className="group block">
                <Card className="h-full border-border/60 transition-colors group-hover:border-primary/60">
                  <CardContent className="space-y-2 pt-6 pb-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-xl group-hover:text-primary transition-colors">
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
