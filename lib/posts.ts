import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostFaq {
  question: string;
  answer: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  updatedAt?: string;
  tags: string[];
  excerpt: string;
  content: string;
  featured?: boolean;
  heroImage?: string;
  heroAlt?: string;
  type: 'blog' | 'til';
  faqs?: PostFaq[];
  series?: string;
  seriesPart?: number;
}

const contentDirectory = path.join(process.cwd(), 'content');

// ponytail: process-lifetime cache — content is immutable during a build. Prod-only so `next dev` still reflects edits live.
const CACHE = process.env.NODE_ENV === 'production';
const postCache = new Map<string, Post | null>();
const allPostsCache = new Map<string, Post[]>();

// Clamp text to ~155 chars on a word boundary, suitable for a meta description.
function clampToMetaLength(text: string): string {
  const max = 155;
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const cut = slice.lastIndexOf(' ');
  return (cut > 80 ? slice.slice(0, cut) : slice).replace(/[,;:.\s]+$/, '') + '…';
}

// Pull the first inline image from markdown — that's the hero, by project convention.
// Returns { src, alt } or null. Skips images inside code fences.
function extractFirstImage(content: string): { src: string; alt: string } | null {
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');
  const match = withoutCode.match(/!\[([^\]]*)]\(([^)\s]+)/);
  if (!match) return null;
  return { alt: match[1].trim(), src: match[2].trim() };
}

// Strip the first inline image (and an optional italic caption line right after it)
// from raw markdown — used so the post page can render the hero as a frontispiece
// without it appearing twice in the body.
export function stripFirstImageBlock(content: string): string {
  const lines = content.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    if (/^!\[[^\]]*]\([^)\s]+/.test(line)) {
      // Found the first image. Drop it.
      lines.splice(i, 1);
      // Drop blank lines and an italic caption (a *Fig. — ...* style line) immediately after.
      while (i < lines.length && lines[i].trim() === '') lines.splice(i, 1);
      if (i < lines.length && /^\*[^*].+\*\s*$/.test(lines[i])) {
        lines.splice(i, 1);
        while (i < lines.length && lines[i].trim() === '') lines.splice(i, 1);
      }
      break;
    }
  }
  return lines.join('\n');
}

// Derive a meta-description-friendly excerpt from raw markdown content.
// Strips frontmatter, headings, code blocks, links, images, and clamps to ~155 chars on a word boundary.
function deriveExcerpt(content: string, fallback: string): string {
  const stripped = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s.*$/gm, ' ')
    .replace(/^>\s?/gm, ' ')
    .replace(/[*_~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!stripped) return fallback;
  return clampToMetaLength(stripped);
}

export function getPostBySlug(slug: string, type: 'blog' | 'til' = 'blog'): Post | null {
  const cacheKey = `${type}:${slug}`;
  if (CACHE && postCache.has(cacheKey)) {
    return postCache.get(cacheKey)!;
  }
  try {
    const filePath = path.join(contentDirectory, type, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    // Future-dated posts are hidden in production. Dev shows everything so drafts
    // can be previewed. Set BLOG_SHOW_DRAFTS=1 to override in production.
    const date = data.date || new Date().toISOString();
    const isFuture = new Date(date).getTime() > Date.now();
    const showDrafts = process.env.NODE_ENV !== 'production' || process.env.BLOG_SHOW_DRAFTS === '1';
    if (isFuture && !showDrafts) {
      if (CACHE) postCache.set(cacheKey, null);
      return null;
    }

    const title = data.title || 'Untitled';
    const rawExcerpt = (data.excerpt || '').trim();
    const excerpt = rawExcerpt
      ? clampToMetaLength(rawExcerpt)
      : deriveExcerpt(content, title);

    const hero = extractFirstImage(content);

    const post: Post = {
      slug,
      title,
      date,
      updatedAt: data.updatedAt || data.lastModified || undefined,
      tags: data.tags || [],
      excerpt,
      content,
      featured: data.featured || false,
      heroImage: hero?.src,
      heroAlt: hero?.alt,
      type,
      faqs: Array.isArray(data.faqs) ? data.faqs : undefined,
      series: data.series || undefined,
      seriesPart: typeof data.seriesPart === 'number' ? data.seriesPart : undefined,
    };

    if (CACHE) postCache.set(cacheKey, post);
    return post;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(type: 'blog' | 'til' = 'blog'): Post[] {
  if (CACHE && allPostsCache.has(type)) {
    return allPostsCache.get(type)!;
  }
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

    if (CACHE) allPostsCache.set(type, posts);
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

// Scan a post's markdown for internal references to other posts/TILs.
// Matches markdown links like `[label](/blog/some-slug)` and `[label](/til/some-slug)`,
// ignoring fragments and trailing punctuation. Used by the knowledge graph to draw
// post-to-post edges (not just post-to-tag).
export function extractInternalRefs(content: string): Array<{ type: 'blog' | 'til'; slug: string }> {
  const refs = new Map<string, { type: 'blog' | 'til'; slug: string }>();
  const re = /\]\(\/(blog|til)\/([a-z0-9][a-z0-9-]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const type = m[1].toLowerCase() as 'blog' | 'til';
    const slug = m[2];
    refs.set(`${type}:${slug}`, { type, slug });
  }
  return Array.from(refs.values());
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
