import { getAllPosts } from "@/lib/posts";
import BlogPageClient from "./blog-page-client";

export default function BlogPage() {
  // Fetch posts on server side
  const posts = getAllPosts('blog');

  // Pass to client component for interactivity
  return <BlogPageClient initialPosts={posts} />;
}
