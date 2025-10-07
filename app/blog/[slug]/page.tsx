import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ViewCounter } from "@/components/blog/view-counter";
import { LikeButton } from "@/components/blog/like-button";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { Comments } from "@/components/blog/comments";

export default function BlogPost({ params }: { params: { slug: string } }) {
  // In a real app, you'd fetch this data based on the slug
  const post = {
    id: "modern-react-patterns",
    title: "Modern React Patterns That Will Make You a Better Developer",
    excerpt: "Exploring advanced React patterns including compound components, render props, and custom hooks that every developer should know.",
    content: `# Modern React Patterns That Will Make You a Better Developer

React has evolved significantly since its inception, and with it, the patterns we use to build applications have become more sophisticated. Today, I want to share some advanced React patterns that have transformed how I approach component design and state management.

## 1. Compound Components Pattern

The compound component pattern allows you to create components that work together to form a complete UI element. Think of how HTML's select and option elements work together.

Instead of this monolithic approach:
<Dropdown options={['Option 1', 'Option 2']} onSelect={handleSelect} />

Use compound components:
<Dropdown onSelect={handleSelect}>
  <Dropdown.Trigger>Select an option</Dropdown.Trigger>
  <Dropdown.Menu>
    <Dropdown.Item value="1">Option 1</Dropdown.Item>
    <Dropdown.Item value="2">Option 2</Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>

This pattern provides incredible flexibility while maintaining a clean API.

## 2. Custom Hooks for Logic Reuse

Custom hooks are one of React's most powerful features for extracting and reusing stateful logic.

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

## Conclusion

These patterns have made my React code more maintainable, testable, and reusable. The key is knowing when to apply each pattern and not over-engineering simple components.

What patterns do you find most useful in your React applications? I'd love to hear your thoughts!`,
    date: "2025-09-08",
    readTime: "8 min read",
    tags: ["react", "javascript", "patterns", "web-dev"],
    author: {
      name: "Harshit",
      avatar: "/api/placeholder/40/40"
    }
  };

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
                  <span>{post.readTime}</span>
                </div>
                <ViewCounter slug={post.id} />
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
                  if (paragraph.includes('function ') || paragraph.includes('const ') || 
                      paragraph.includes('import ') || paragraph.startsWith('<') || 
                      paragraph.includes('```')) {
                    const code = paragraph.replace(/```\w*\n?/g, '').trim();
                    return (
                      <div key={index} className="not-prose my-6">
                        <div className="bg-muted/50 border border-border rounded-lg overflow-hidden">
                          <div className="bg-muted/30 px-4 py-2 border-b border-border">
                            <span className="text-xs font-mono text-muted-foreground">CODE</span>
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
              <LikeButton slug={post.id} />
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Related Posts */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
              <div className="grid gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link href="/blog/docker-optimization-guide" className="hover:text-blue-600 transition-colors">
                        Docker Image Optimization: From 2GB to 50MB
                      </Link>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">docker</Badge>
                      <Badge variant="secondary">optimization</Badge>
                    </div>
                  </CardHeader>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link href="/blog/kubernetes-networking-deep-dive" className="hover:text-blue-600 transition-colors">
                        Kubernetes Networking Deep Dive
                      </Link>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">kubernetes</Badge>
                      <Badge variant="secondary">networking</Badge>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </section>

            {/* Comments Section */}
            <Comments slug={params.slug} />
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
