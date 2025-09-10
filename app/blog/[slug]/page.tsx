import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, Share2, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      {/* Article Header */}
      <header className="space-y-6">
        <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
        
        <div className="flex items-center gap-4 text-muted-foreground">
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
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Badge variant="secondary" className="hover:bg-blue-100 hover:text-blue-800 transition-colors">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>

        <Separator />
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none dark:prose-invert">
        <div className="whitespace-pre-wrap leading-relaxed space-y-4">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.substring(2)}</h1>;
            }
            if (paragraph.startsWith('## ')) {
              return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{paragraph.substring(3)}</h2>;
            }
            if (paragraph.includes('function ') || paragraph.includes('<Dropdown')) {
              return (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 my-4">
                  <code className="text-sm font-mono whitespace-pre-wrap">{paragraph}</code>
                </div>
              );
            }
            return <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">{paragraph}</p>;
          })}
        </div>
      </article>

      {/* Article Actions */}
      <div className="flex items-center justify-between py-6 border-t border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            Like (42)
          </Button>
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-2 h-4 w-4" />
            Comment (8)
          </Button>
        </div>
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
                <Link href="/blog/typescript-advanced-types" className="hover:text-blue-600 transition-colors">
                  Advanced TypeScript Types You Should Know
                </Link>
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">typescript</Badge>
                <Badge variant="secondary">types</Badge>
              </div>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href="/blog/css-grid-mastery" className="hover:text-blue-600 transition-colors">
                  CSS Grid: From Zero to Hero
                </Link>
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">css</Badge>
                <Badge variant="secondary">web-dev</Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
