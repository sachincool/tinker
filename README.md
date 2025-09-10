# Infra Magician's Lair | harshit.cloud

A modern blogging platform connected to Obsidian, built with Next.js, shadcn/ui, and D3.js for interactive knowledge graphs.

## 🧙‍♂️ Features

- **Obsidian Integration**: Seamless sync between your Obsidian vault and the blog
- **Interactive Knowledge Graph**: D3.js-powered visualization of content relationships
- **TIL (Today I Learned) Section**: Quick insights and code snippets
- **Tag-based Organization**: Categorize and discover content by topics
- **Dark/Light Theme**: Automatic theme switching with system preference
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Search Functionality**: Find content across posts, TILs, and tags
- **PaperMod-inspired Design**: Clean, readable typography and layout

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Visualization**: D3.js for knowledge graphs
- **Content**: Markdown with frontmatter support
- **Deployment**: Vercel/Netlify ready
- **Package Manager**: Bun

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

## 🎨 Customization Ideas

- Add anime-themed Easter eggs
- Implement reading progress indicators
- Add comment system integration
- Create custom 404 pages with personality
- Add RSS feed generation
- Implement full-text search with Algolia

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this for your own digital garden!

---

Built with ❤️ by the Infra Magician | Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer
