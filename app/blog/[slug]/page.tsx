import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ViewCounter } from "@/components/blog/view-counter";
import { LikeButton } from "@/components/blog/like-button";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Comments } from "@/components/blog/comments";
import { ShareButton } from "@/components/blog/share-button";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import readingTime from "reading-time";

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch the actual post data based on the slug
  const post = getPostBySlug(slug, 'blog');

  // If post doesn't exist, show 404
  if (!post) {
    notFound();
  }

  // Calculate reading time
  const stats = readingTime(post.content);
  const readTime = stats.text;

  return (
    <>
      <ReadingProgress />
      <div className="max-w-7xl mx-auto px-4">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-16">
          <div className="max-w-3xl space-y-8">
            {/* Back button */}
            <Button variant="ghost" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>

            {/* Article Header */}
            <header className="space-y-6 pb-8 border-b">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">{post.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readTime}</span>
                </div>
                <ViewCounter slug={post.slug} />
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge variant="secondary" className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-100 transition-colors">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </header>

            {/* Article Content */}
            <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2">
              <div className="space-y-6">
                {post.content.split('\n\n').map((paragraph, index) => {
                  // H1 - Main heading (already in header, skip if duplicate)
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
                  if (paragraph.includes('```')) {
                    const lines = paragraph.split('\n');
                    const language = lines[0]?.replace('```', '').trim() || 'CODE';
                    const codeLines = lines.slice(1);
                    const lastLineIndex = codeLines.findIndex(line => line.includes('```'));
                    const code = codeLines.slice(0, lastLineIndex >= 0 ? lastLineIndex : undefined).join('\n');

                    return (
                      <div key={index} className="not-prose my-6">
                        <div className="bg-muted/50 border border-border rounded-lg overflow-hidden">
                          <div className="bg-muted/30 px-4 py-2 border-b border-border">
                            <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
                          </div>
                          <pre className="p-4 overflow-x-auto">
                            <code className="text-sm font-mono text-foreground leading-relaxed">{code}</code>
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  // Blockquotes
                  if (paragraph.startsWith('> ')) {
                    return (
                      <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-muted-foreground bg-muted/30 rounded-r">
                        {paragraph.substring(2)}
                      </blockquote>
                    );
                  }

                  // List items
                  if (paragraph.match(/^[\d]+\./m) || paragraph.match(/^[-*]/m)) {
                    const items = paragraph.split('\n').filter(line => line.trim());
                    const isOrdered = items[0]?.match(/^\d+\./);
                    const ListTag = isOrdered ? 'ol' : 'ul';
                    return (
                      <ListTag key={index} className={isOrdered ? "list-decimal list-inside space-y-2 my-6" : "list-disc list-inside space-y-2 my-6"}>
                        {items.map((item, i) => (
                          <li key={i} className="text-lg leading-relaxed">
                            {item.replace(/^[\d]+\.\s*|^[-*]\s*/, '')}
                          </li>
                        ))}
                      </ListTag>
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
              <LikeButton slug={post.slug} />
              <ShareButton title={post.title} excerpt={post.excerpt} />
            </div>

            {/* Related Posts */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid gap-4">
                {getAllPosts('blog')
                  .filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag)))
                  .slice(0, 2)
                  .map((relatedPost) => (
                    <Card key={relatedPost.slug} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          <Link href={`/blog/${relatedPost.slug}`} className="hover:text-blue-600 transition-colors">
                            {relatedPost.title}
                          </Link>
                        </CardTitle>
                        <div className="flex gap-2">
                          {relatedPost.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
            </section>

            {/* Comments Section */}
            <Comments slug={slug} />
          </div>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block">
            <TableOfContents />
          </aside>
        </div>
      </div>
    </>
  );
}
