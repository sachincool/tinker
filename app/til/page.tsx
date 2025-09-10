import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Plus, Lightbulb, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function TILPage() {
  const tils = [
    {
      id: "css-grid-auto-fit",
      title: "CSS Grid auto-fit vs auto-fill",
      content: "The difference is subtle but important for responsive layouts. `auto-fit` collapses empty tracks, while `auto-fill` keeps them. Use `auto-fit` when you want columns to expand to fill available space.",
      date: "2025-09-10",
      tags: ["css", "responsive", "grid"],
      codeExample: "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));"
    },
    {
      id: "typescript-satisfies",
      title: "TypeScript satisfies operator",
      content: "A better way to ensure type safety without losing inference. Instead of type assertions, use `satisfies` to validate that an object matches a type while preserving its literal types.",
      date: "2025-09-09",
      tags: ["typescript", "types", "inference"],
      codeExample: "const config = { theme: 'dark', port: 3000 } satisfies Config;"
    },
    {
      id: "react-use-callback-deps",
      title: "useCallback dependency gotcha",
      content: "Don't forget to include all dependencies in useCallback! Missing deps can cause stale closures. Use ESLint plugin react-hooks to catch these automatically.",
      date: "2025-09-08",
      tags: ["react", "hooks", "performance"],
      codeExample: "useCallback(() => { doSomething(value); }, [value]); // Include value!"
    },
    {
      id: "git-interactive-rebase",
      title: "Git interactive rebase for clean history",
      content: "Use `git rebase -i HEAD~n` to clean up your commit history before merging. You can squash, reword, or reorder commits to tell a better story.",
      date: "2025-09-07",
      tags: ["git", "workflow", "productivity"],
      codeExample: "git rebase -i HEAD~3"
    },
    {
      id: "css-logical-properties",
      title: "CSS Logical Properties for i18n",
      content: "Use logical properties like `margin-inline-start` instead of `margin-left` for better internationalization support. They automatically adapt to writing direction.",
      date: "2025-09-06",
      tags: ["css", "i18n", "accessibility"],
      codeExample: "margin-inline-start: 1rem; /* Better than margin-left */"
    },
    {
      id: "js-optional-chaining-nullish",
      title: "Optional chaining with nullish coalescing",
      content: "Combine `?.` and `??` for robust property access. Optional chaining returns undefined for missing properties, nullish coalescing provides fallbacks only for null/undefined.",
      date: "2025-09-05",
      tags: ["javascript", "es2020", "safety"],
      codeExample: "const name = user?.profile?.name ?? 'Anonymous';"
    },
    {
      id: "next-dynamic-imports",
      title: "Next.js dynamic imports for code splitting",
      content: "Use dynamic imports to reduce bundle size. Perfect for components that aren't needed on initial load, like modals or heavy libraries.",
      date: "2025-09-04",
      tags: ["nextjs", "performance", "optimization"],
      codeExample: "const Modal = dynamic(() => import('./Modal'), { ssr: false });"
    },
    {
      id: "vscode-multi-cursor",
      title: "VS Code multi-cursor magic",
      content: "Hold Alt and click to place multiple cursors, or use Ctrl+Shift+L to select all occurrences of current selection. Game changer for bulk edits!",
      date: "2025-09-03",
      tags: ["vscode", "productivity", "shortcuts"],
      codeExample: "Alt + Click = Multiple cursors"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Today I Learned</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Quick insights, code snippets, and "aha!" moments from my daily tinkering.
        </p>
        <Button asChild size="lg">
          <Link href="/til/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New TIL
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search TILs..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="nextjs">Next.js</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Total TILs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Different topics</p>
          </CardContent>
        </Card>
      </div>

      {/* TIL Grid */}
      <div className="grid gap-6">
        {tils.map((til) => (
          <Card key={til.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    {til.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(til.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/til/${til.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {til.content}
              </p>
              
              {til.codeExample && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {til.codeExample}
                  </code>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {til.tags.map((tag) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge variant="outline" className="hover:bg-blue-100 hover:text-blue-800 transition-colors text-xs">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More TILs
        </Button>
      </div>
    </div>
  );
}
