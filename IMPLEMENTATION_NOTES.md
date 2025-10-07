# Implementation Notes

## How to Add Real Data (Future Implementation)

### 1. Likes & Comments System

**Current State:** Removed to keep blog simple and static.

**If you want to add them back:**

#### Option A: Use a Third-Party Service (Recommended)
- **Giscus** (GitHub Discussions): Free, privacy-friendly
  - Add to `app/blog/[slug]/page.tsx`
  - Comments stored in GitHub Discussions
  - Users sign in with GitHub
  
  ```tsx
  import Giscus from '@giscus/react'
  
  <Giscus
    repo="your-username/your-repo"
    repoId="your-repo-id"
    category="Blog Comments"
    categoryId="your-category-id"
    mapping="pathname"
    theme="preferred_color_scheme"
  />
  ```

- **Utterances**: Similar to Giscus, uses GitHub Issues
- **Disqus**: Popular but adds tracking/ads
- **Commento**: Open-source, self-hostable

#### Option B: Build Your Own
- Backend: Supabase, Firebase, or your own API
- Database schema:
  ```sql
  create table likes (
    id uuid primary key,
    post_slug text,
    user_id text,
    created_at timestamp
  );
  
  create table comments (
    id uuid primary key,
    post_slug text,
    user_id text,
    content text,
    created_at timestamp
  );
  ```

### 2. Blog Content from Obsidian

**Current State:** Mock data in page components.

**Real Implementation:**

#### Setup GitHub Action to Sync Obsidian Vault
1. Keep your Obsidian vault in a private/public GitHub repo
2. Add GitHub Action to copy files to this blog repo
3. Parse markdown files at build time

```yaml
# .github/workflows/sync-obsidian.yml
name: Sync from Obsidian
on:
  repository_dispatch:
    types: [obsidian-sync]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout blog repo
        uses: actions/checkout@v3
      
      - name: Checkout Obsidian vault
        uses: actions/checkout@v3
        with:
          repository: your-username/obsidian-vault
          path: vault
          token: ${{ secrets.VAULT_TOKEN }}
      
      - name: Copy content
        run: |
          cp -r vault/blog/* content/blog/
          cp -r vault/til/* content/til/
      
      - name: Commit and push
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add content/
          git commit -m "Sync from Obsidian" || exit 0
          git push
```

#### Parse Markdown Files
Create `lib/content.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  featured?: boolean;
}

export function getAllPosts(): Post[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      return {
        slug,
        title: data.title,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt || '',
        featured: data.featured || false,
        content,
      };
    });
  
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): Post | undefined {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      featured: data.featured || false,
      content,
    };
  } catch {
    return undefined;
  }
}
```

#### Update Blog Pages to Use Real Data

```typescript
// app/blog/page.tsx
import { getAllPosts } from '@/lib/content';

export default function BlogPage() {
  const posts = getAllPosts();
  const featuredPosts = posts.filter(p => p.featured);
  const regularPosts = posts.filter(p => !p.featured);
  
  // ... rest of component
}

// app/blog/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/content';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  // ... render post
}
```

### 3. Graph View with Real Connections

The graph view needs to:
1. Parse markdown files for links between posts
2. Extract tags and create tag nodes
3. Build graph data structure

```typescript
// lib/graph.ts
export function buildGraphData() {
  const posts = getAllPosts();
  const tils = getAllTILs();
  
  const nodes = [];
  const links = [];
  
  // Add post nodes
  posts.forEach(post => {
    nodes.push({ 
      id: post.slug, 
      name: post.title, 
      type: 'post' 
    });
    
    // Link to tags
    post.tags.forEach(tag => {
      if (!nodes.find(n => n.id === tag)) {
        nodes.push({ id: tag, name: tag, type: 'tag' });
      }
      links.push({ source: post.slug, target: tag });
    });
    
    // Parse content for [[wiki-links]] to other posts
    const wikiLinks = post.content.match(/\[\[(.*?)\]\]/g) || [];
    wikiLinks.forEach(link => {
      const targetSlug = link.replace(/[\[\]]/g, '');
      links.push({ source: post.slug, target: targetSlug });
    });
  });
  
  return { nodes, links };
}
```

### 4. TIL "Add New" Feature

**Why it was there:** Placeholder for potential future feature.

**If you want to implement:**
- Option A: Add form that creates GitHub PR with new TIL
- Option B: Webhook to create file in Obsidian vault
- Option C: Just add TILs directly in Obsidian (recommended)

**Recommendation:** Remove the button (done). Add TILs directly in your Obsidian vault, and they'll sync automatically via GitHub Actions.

### 5. Search & Filter Functionality

Currently the search/filter UI exists but doesn't work.

**To implement:**
```typescript
// Use Fuse.js for client-side search
import Fuse from 'fuse.js';

const fuse = new Fuse(posts, {
  keys: ['title', 'excerpt', 'tags'],
  threshold: 0.3
});

const results = fuse.search(searchQuery);
```

Or use a proper search service:
- **Algolia**: Fast, easy to integrate
- **Meilisearch**: Open-source, self-hostable
- **Pagefind**: Static search, generates at build time

## Current Architecture

**Blog Type:** Static Site (JAMstack)
- Pages pre-rendered at build time
- No database needed
- Fast, secure, cheap to host
- Perfect for personal blogs

**Deployment:** Vercel/Netlify
- Push to GitHub → Auto deploy
- Built-in CDN
- Free tier available

**Content Strategy:**
1. Write in Obsidian
2. Push to GitHub
3. GitHub Action triggers rebuild
4. Site updates automatically

This keeps it simple and maintainable!

