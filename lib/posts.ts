import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  featured?: boolean;
  type: 'blog' | 'til';
}

const contentDirectory = path.join(process.cwd(), 'content');

export function getPostBySlug(slug: string, type: 'blog' | 'til' = 'blog'): Post | null {
  try {
    const filePath = path.join(contentDirectory, type, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      content,
      featured: data.featured || false,
      type,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(type: 'blog' | 'til' = 'blog'): Post[] {
  try {
    const postsDirectory = path.join(contentDirectory, type);

    // Create directory if it doesn't exist
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        return getPostBySlug(slug, type);
      })
      .filter((post): post is Post => post !== null)
      .sort((a, b) => {
        // Sort by date, newest first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    return posts;
  } catch (error) {
    console.error(`Error getting all posts for ${type}:`, error);
    return [];
  }
}

export function getPostsByTag(tag: string): Post[] {
  const blogPosts = getAllPosts('blog');
  const tilPosts = getAllPosts('til');
  const allPosts = [...blogPosts, ...tilPosts];

  return allPosts
    .filter((post) => post.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllTags(): string[] {
  const blogPosts = getAllPosts('blog');
  const tilPosts = getAllPosts('til');
  const allPosts = [...blogPosts, ...tilPosts];

  const tagsSet = new Set<string>();
  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}
