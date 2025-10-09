import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Lightbulb } from "lucide-react";
import Link from "next/link";
import { ViewCounter } from "@/components/blog/view-counter";
import { LikeButton } from "@/components/blog/like-button";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import readingTime from "reading-time";

export default async function TILPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the actual TIL post based on the ID
  const til = getPostBySlug(id, 'til');

  // If TIL doesn't exist, show 404
  if (!til) {
    notFound();
  }

  // Calculate reading time
  const stats = readingTime(til.content);
  const readTime = stats.text;

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
              <span>{readTime}</span>
            </div>
            <ViewCounter slug={til.slug} />
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

        {/* TIL Content */}
        <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-strong:text-foreground">
          <div className="space-y-6">
            {til.content.split('\n\n').map((paragraph, index) => {
              // H1 - Main heading (skip if duplicate)
              if (paragraph.startsWith('# ') && index > 0) {
                const text = paragraph.substring(2);
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                return <h2 key={index} id={id} className="text-3xl font-bold mt-12 mb-4 scroll-mt-24">{text}</h2>;
              }

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
                const language = lines[0]?.replace('```', '').trim() || 'CODE';
                const codeLines = lines.slice(1);
                const lastLineIndex = codeLines.findIndex(line => line.includes('```'));
                const code = codeLines.slice(0, lastLineIndex >= 0 ? lastLineIndex : undefined).join('\n');

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
          <LikeButton slug={til.slug} />
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
            {getAllPosts('til')
              .filter(p => p.slug !== til.slug && p.tags.some(tag => til.tags.includes(tag)))
              .slice(0, 2)
              .map((relatedTil) => (
                <Card key={relatedTil.slug} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link href={`/til/${relatedTil.slug}`} className="hover:text-yellow-600 transition-colors flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        {relatedTil.title}
                      </Link>
                    </CardTitle>
                    <div className="flex gap-2">
                      {relatedTil.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
