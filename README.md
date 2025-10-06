# 🧙‍♂️ Infra Magician's Digital Spellbook | harshit.cloud

A **stunningly beautiful**, sassy, and modern blogging platform built with Next.js 15, Tailwind CSS, and Shadcn UI. Features gorgeous animations, smooth transitions, and personality packed into every pixel.

## ✨ Features

### 🎨 **Visual Excellence**
- **Animated Gradients**: Smooth, eye-catching gradient animations throughout
- **Micro-interactions**: Hover effects, transitions, and delightful animations on every element
- **Glass Morphism**: Modern, translucent design elements with backdrop blur
- **Floating Elements**: Animated background elements that add depth and movement
- **Custom 404 Page**: Sassy, fun error page with personality and glitch effects
- **Dark/Light Theme**: Seamless theme switching with system preference support

### 📝 **Content Management**
- **Blog Posts**: Beautiful card layouts with featured post sections
- **TIL (Today I Learned)**: Quick insights and code snippets with dedicated styling
- **Tag System**: Comprehensive tag browsing with visual hierarchy and trending topics
- **Obsidian Integration**: Ready for seamless sync with your Obsidian vault

### 🚀 **Performance & UX**
- **Next.js 15**: Latest features with App Router and Turbopack
- **Responsive Design**: Mobile-first approach that looks great on all devices
- **Smooth Scrolling**: Buttery smooth navigation experience
- **Accessibility**: Reduced motion support and semantic HTML
- **Fast Loading**: Optimized images and code splitting

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router & Turbopack
- **Styling**: Tailwind CSS v4 + Shadcn UI components
- **Animations**: Custom CSS animations + Framer Motion (motion package)
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode
- **Typography**: Inter font family
- **Deployment**: Vercel/Netlify ready
- **Package Manager**: npm/bun

## 📁 Project Structure

```
harshit-blog/
├── app/                    # Next.js app directory
│   ├── blog/              # Blog posts pages
│   ├── til/               # TIL pages
│   ├── tags/              # Tag pages
│   └── layout.tsx         # Root layout
├── components/
│   ├── blog/              # Blog-specific components
│   │   ├── header.tsx     # Navigation header
│   │   ├── sidebar.tsx    # Sidebar with graph
│   │   └── graph-view.tsx # D3.js knowledge graph
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── obsidian.ts        # Obsidian integration utilities
│   └── utils.ts           # Utility functions
└── public/
    └── content/           # Static content files
```

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd harshit-blog
bun install
```

### 2. Development Server

```bash
bun dev
```

Visit `http://localhost:3000` to see your blog.

### 3. Obsidian Integration Setup

#### Option A: GitHub Actions (Recommended)

1. Create a GitHub repository for your Obsidian vault
2. Set up GitHub Actions workflow:

```yaml
# .github/workflows/sync-obsidian.yml
name: Sync Obsidian to Blog

on:
  push:
    branches: [main]
    paths: ['**/*.md']

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Process Markdown Files
        run: |
          # Process your .md files
          # Convert to blog format
          # Trigger blog rebuild
```

3. Configure webhook to trigger blog rebuild

#### Option B: Obsidian Publish

1. Enable Obsidian Publish in your vault
2. Configure publish settings
3. Set up API integration (see `lib/obsidian.ts`)

### 4. Content Structure

#### Blog Posts
Create markdown files with frontmatter:

```markdown
---
title: "Your Post Title"
date: "2025-09-10"
tags: ["kubernetes", "devops", "chaos-engineering"]
excerpt: "Brief description of your post"
type: "post"
---

# Your Content Here

Your blog post content in markdown format.
```

#### TILs
Create TIL entries:

```markdown
---
title: "kubectl get pods --field-selector"
date: "2025-09-10"
tags: ["kubernetes", "kubectl", "debugging"]
type: "til"
---

Quick way to find all failed pods across namespaces without grep gymnastics.

```bash
kubectl get pods --field-selector=status.phase=Failed
```
```

### 5. Customization

#### Update Branding
- Edit `app/layout.tsx` for site metadata
- Modify `components/blog/header.tsx` for navigation
- Update `app/page.tsx` for homepage content

#### Styling
- Customize colors in `app/globals.css`
- Modify component styles in respective files
- Add custom animations and effects

#### Graph Configuration
- Edit `components/blog/graph-view.tsx`
- Customize node colors, sizes, and interactions
- Add new relationship types

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `bun run build`
   - Output Directory: `.next`
3. Set environment variables if needed
4. Deploy!

### Netlify

1. Connect repository to Netlify
2. Build settings:
   - Build command: `bun run build && bun run export`
   - Publish directory: `out`

## 🔄 Obsidian Sync Workflow

1. **Write in Obsidian**: Create posts and TILs in your vault
2. **Tag and Link**: Use tags and internal links for relationships
3. **Commit to Git**: Push changes to your vault repository
4. **Auto-Deploy**: GitHub Actions processes and deploys changes
5. **Live Update**: Your blog updates automatically

## 📊 Knowledge Graph

The interactive knowledge graph shows:
- **Blue nodes**: Blog posts
- **Green nodes**: TILs
- **Purple nodes**: Tags
- **Connections**: Relationships between content

Drag nodes to explore connections and click to navigate to content.

## 🎨 What Makes This Special

### **Personality & Sass**
Every page has character! From the waving wizard emoji to the sassy 404 page, this blog doesn't take itself too seriously. Perfect for a "Level 99 Infrastructure Wizard" and "Professional Chaos Engineer."

### **Stunning Animations**
- Floating background elements
- Gradient text animations
- Wave emoji animation
- Glitch effect on 404 page
- Smooth card hover effects with 3D transforms
- Button micro-interactions

### **Visual Hierarchy**
- Featured posts with special styling
- Tag cloud with size-based visualization
- Trending topics section
- Stats with animated counters and gradient text

### **Future Enhancements**
- Reading progress indicators on blog posts
- Comment system integration (Giscus ready)
- RSS feed generation
- Full-text search
- Command palette (CMD+K navigation)
- More Easter eggs and Konami code surprises

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this for your own digital garden!

## 🎯 Pages Included

- **Home** (`/`) - Hero section with animations, stats, latest posts, and tech stack showcase
- **Blog** (`/blog`) - All blog posts with search, filters, and featured sections
- **Blog Post** (`/blog/[slug]`) - Individual post view with related posts
- **TIL** (`/til`) - Today I Learned snippets with code examples
- **Tags** (`/tags`) - Comprehensive tag browser with trending topics
- **404** (`/not-found`) - Sassy, fun error page with personality

## 💡 Design Philosophy

This blog embodies the personality of its creator - a blend of technical excellence, playful chaos, and visual delight. Every interaction is crafted to bring a smile while maintaining professional quality. The design says: "I know what I'm doing, but I also know how to have fun doing it."

---

Built with ❤️, ☕, and chaos by the Infra Magician | Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer

**"In production, we trust... our backup plans."** 🧙‍♂️
