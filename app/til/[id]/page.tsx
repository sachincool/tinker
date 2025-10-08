import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, Lightbulb, Copy } from "lucide-react";
import Link from "next/link";
import { ViewCounter } from "@/components/blog/view-counter";
import { LikeButton } from "@/components/blog/like-button";

export default function TILPost({ params }: { params: { id: string } }) {
  // In a real app, you'd fetch this data based on the ID
  // For now, we'll use mock data
  const tils = {
    "kubectl-neat-trick": {
      id: "kubectl-neat-trick",
      title: "kubectl neat - Remove Kubernetes YAML Clutter",
      content: `Tired of seeing all the noise in Kubernetes YAML output? The \`kubectl neat\` plugin is a game-changer.

## The Problem

When you run \`kubectl get pod my-pod -o yaml\`, you get tons of unnecessary fields:
- \`managedFields\` (usually hundreds of lines)
- \`creationTimestamp\`
- \`resourceVersion\`
- \`uid\`
- And more...

## The Solution

Install kubectl neat:

\`\`\`bash
kubectl krew install neat
\`\`\`

Now your output is clean:

\`\`\`bash
kubectl get pod my-pod -o yaml | kubectl neat
\`\`\`

## Why This Matters

- **Easier debugging** - See only what matters
- **Better diffs** - Compare resources without noise
- **Cleaner GitOps** - Store only essential config
- **Save time** - No more scrolling through garbage

This simple plugin has saved me hours of frustration.`,
      date: "2024-12-10",
      tags: ["kubernetes", "kubectl", "productivity"],
      codeExample: "kubectl get pod my-pod -o yaml | kubectl neat",
      readTime: "2 min read"
    },
    "docker-build-cache-trick": {
      id: "docker-build-cache-trick",
      title: "Docker Build Cache: The .dockerignore Gotcha",
      content: `A proper \`.dockerignore\` file saved me from 5-minute builds turning into 10-second builds.

## The Problem

I kept invalidating my Docker build cache and couldn't figure out why. Turns out, editor swap files and temp files were the culprit.

## The Solution

Create a comprehensive \`.dockerignore\`:

\`\`\`
# Editor files
*.swp
*.swo
*~
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Dependencies
node_modules/
vendor/

# Build artifacts
dist/
build/
*.log
\`\`\`

## The Impact

- **Before:** 5-minute builds every time
- **After:** 10-second builds (cache hits)
- **Result:** Saved hours per day

## Pro Tip

Add \`.dockerignore\` to your project templates. Future you will thank present you.`,
      date: "2024-12-05",
      tags: ["docker", "devops", "optimization"],
      codeExample: "# .dockerignore\n*.swp\n.DS_Store\nnode_modules",
      readTime: "2 min read"
    },
    "k8s-ephemeral-containers": {
      id: "k8s-ephemeral-containers",
      title: "Kubernetes Ephemeral Debug Containers",
      content: `Debug running pods without rebuilding images or adding debug tools to your production containers.

## The Old Way (Painful)

1. Rebuild image with debug tools
2. Push to registry
3. Update deployment
4. Wait for rollout
5. Debug
6. Rollback
7. Repeat

## The New Way (Magical)

\`\`\`bash
kubectl debug -it my-pod --image=nicolaka/netshoot
\`\`\`

Boom. You're in a container with curl, dig, tcpdump, and every tool you need.

## Why This Is Amazing

- **No image rebuilds** - Debug production images as-is
- **No security compromise** - Don't bloat prod images with tools
- **Instant access** - Start debugging in seconds
- **Shared namespace** - See what the pod sees

## Common Use Cases

\`\`\`bash
# Network debugging
kubectl debug -it my-pod --image=nicolaka/netshoot

# File system inspection
kubectl debug -it my-pod --image=busybox

# Custom tooling
kubectl debug -it my-pod --image=your-debug-image
\`\`\`

This feature is a lifesaver for production debugging.`,
      date: "2024-12-01",
      tags: ["kubernetes", "debugging", "devops"],
      codeExample: "kubectl debug -it my-pod --image=nicolaka/netshoot",
      readTime: "3 min read"
    }
  };

  const til = tils[params.id as keyof typeof tils] || {
    id: params.id,
    title: "TIL Post Not Found",
    content: "This TIL post doesn't exist yet. Check back later!",
    date: new Date().toISOString().split('T')[0],
    tags: [],
    codeExample: "",
    readTime: "1 min read"
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Back button */}
        <Button variant="ghost" asChild>
          <Link href="/til">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to TILs
          </Link>
        </Button>

        {/* TIL Header */}
        <header className="space-y-6 pb-8 border-b">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <span>Today I Learned</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            {til.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(til.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{til.readTime}</span>
            </div>
            <ViewCounter slug={til.id} />
          </div>

          <div className="flex flex-wrap gap-2">
            {til.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                <Badge variant="secondary" className="hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:text-yellow-800 dark:hover:text-yellow-100 transition-colors">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        </header>

        {/* Quick Code Example */}
        {til.codeExample && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Quick Snippet</span>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {til.codeExample}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TIL Content */}
        <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-strong:text-foreground">
          <div className="space-y-6">
            {til.content.split('\n\n').map((paragraph, index) => {
              // H2 - Section heading
              if (paragraph.startsWith('## ')) {
                const text = paragraph.substring(3);
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                return <h2 key={index} id={id} className="text-2xl font-bold mt-10 mb-4 scroll-mt-24">{text}</h2>;
              }

              // H3 - Sub-section heading
              if (paragraph.startsWith('### ')) {
                const text = paragraph.substring(4);
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                return <h3 key={index} id={id} className="text-xl font-semibold mt-8 mb-3 scroll-mt-24">{text}</h3>;
              }

              // Code blocks (multi-line code)
              if (paragraph.startsWith('```')) {
                const lines = paragraph.split('\n');
                const language = lines[0].replace('```', '').trim();
                const code = lines.slice(1, -1).join('\n');
                return (
                  <div key={index} className="not-prose my-6">
                    <div className="bg-muted/50 border border-border rounded-lg overflow-hidden">
                      {language && (
                        <div className="bg-muted/30 px-4 py-2 border-b border-border">
                          <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
                        </div>
                      )}
                      <pre className="p-4 overflow-x-auto">
                        <code className="text-sm font-mono text-foreground leading-relaxed">{code}</code>
                      </pre>
                    </div>
                  </div>
                );
              }

              // List items
              if (paragraph.match(/^[-*]\s/m)) {
                const items = paragraph.split('\n').filter(line => line.trim());
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 my-6">
                    {items.map((item, i) => (
                      <li key={i} className="text-lg leading-relaxed">
                        {item.replace(/^[-*]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Regular paragraphs
              if (paragraph.trim()) {
                return (
                  <p key={index} className="text-lg leading-relaxed text-foreground/90">
                    {paragraph}
                  </p>
                );
              }

              return null;
            })}
          </div>
        </article>

        {/* Actions Section */}
        <div className="flex items-center justify-between py-6 border-t">
          <LikeButton slug={til.id} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/til">
              See More TILs
            </Link>
          </Button>
        </div>

        {/* Related TILs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">More TILs You Might Like</h2>
          <div className="grid gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href="/til/terraform-fmt-check" className="hover:text-yellow-600 transition-colors flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Terraform fmt in CI/CD
                  </Link>
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">terraform</Badge>
                  <Badge variant="secondary">cicd</Badge>
                </div>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href="/til/git-interactive-rebase" className="hover:text-yellow-600 transition-colors flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Git interactive rebase for clean history
                  </Link>
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">git</Badge>
                  <Badge variant="secondary">workflow</Badge>
                </div>
              </CardHeader>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
