# 🚀 Deployment Guide for Infra Magician's Lair

## Quick Setup Checklist

### 1. Repository Setup
- [ ] Fork/clone this repository
- [ ] Create a separate repository for your Obsidian vault
- [ ] Set up GitHub secrets (see below)

### 2. Obsidian Vault Structure
```
your-obsidian-vault/
├── Blog/                 # Blog posts
│   ├── post1.md
│   └── post2.md
├── TIL/                  # Today I Learned entries
│   ├── til1.md
│   └── til2.md
└── Templates/            # Obsidian templates (ignored)
    └── Blog Post Template.md
```

### 3. Markdown Frontmatter Format

#### Blog Posts
```yaml
---
title: "Your Amazing Post Title"
date: "2025-09-10"
tags: ["kubernetes", "devops", "chaos-engineering"]
excerpt: "Brief description that appears in previews"
type: "post"
---

# Your Content Here

Write your blog post content in markdown...
```

#### TIL Entries
```yaml
---
title: "Quick Learning Insight"
date: "2025-09-10"
tags: ["kubectl", "debugging"]
type: "til"
---

Your quick insight or code snippet here.

```bash
kubectl get pods --field-selector=status.phase=Failed
```
```

### 4. GitHub Secrets Configuration

Go to your blog repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `OBSIDIAN_REPO` | Your Obsidian vault repository | `username/my-obsidian-vault` |
| `OBSIDIAN_TOKEN` | GitHub token with repo access | `ghp_xxxxxxxxxxxx` |
| `VERCEL_DEPLOY_HOOK` | Vercel deploy webhook URL | `https://api.vercel.com/v1/integrations/deploy/...` |

### 5. Vercel Deployment

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts to link your project
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - **Build Command**: `bun run build`
   - **Output Directory**: `.next`
   - **Install Command**: `bun install`

### 6. Domain Configuration

#### For harshit.cloud:
1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add `harshit.cloud` as a custom domain
4. Update your DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### 7. Environment Variables (Optional)

In Vercel dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://harshit.cloud` | Your site URL |
| `GITHUB_TOKEN` | `ghp_xxxxxxxxxxxx` | For API rate limits |

## 🔄 Content Workflow

### Daily Workflow:
1. **Write in Obsidian**: Create posts/TILs in your vault
2. **Use Templates**: Leverage Obsidian templates for consistency
3. **Tag Content**: Use tags for categorization
4. **Link Ideas**: Use `[[Internal Links]]` for connections
5. **Commit & Push**: Push changes to your Obsidian vault repo
6. **Auto-Deploy**: GitHub Actions processes and deploys automatically

### Manual Sync:
If you need to trigger a manual sync:
1. Go to your blog repository on GitHub
2. Navigate to Actions tab
3. Select "Sync Obsidian Vault to Blog"
4. Click "Run workflow"

## 🛠 Customization

### Update Branding:
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "Your Site Title",
  description: "Your description",
};

// components/blog/header.tsx
// Update logo and navigation
```

### Modify Content Types:
```typescript
// lib/obsidian.ts
// Add new content types or modify processing logic
```

### Styling Changes:
```css
/* app/globals.css */
/* Add your custom styles */
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. GitHub Actions Failing
- Check if secrets are properly set
- Verify Obsidian repository access
- Ensure markdown files have proper frontmatter

#### 2. Content Not Updating
- Check GitHub Actions logs
- Verify webhook is triggered
- Manual sync via Actions tab

#### 3. Build Errors
- Check Vercel build logs
- Ensure all dependencies are installed
- Verify TypeScript types

#### 4. Styling Issues
- Clear browser cache
- Check for CSS conflicts
- Verify Tailwind classes

### Debug Commands:
```bash
# Local development
bun dev

# Check build locally
bun run build

# Lint code
bun run lint

# Type check
bun run type-check
```

## 📊 Analytics & Monitoring

### Add Analytics:
```typescript
// app/layout.tsx
// Add Google Analytics, Plausible, or other analytics
```

### Performance Monitoring:
- Use Vercel Analytics
- Monitor Core Web Vitals
- Set up error tracking (Sentry)

## 🔒 Security

### Best Practices:
- Use environment variables for sensitive data
- Regularly rotate GitHub tokens
- Keep dependencies updated
- Enable Vercel security headers

### Security Headers:
```javascript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

## 🚀 Going Live

### Pre-launch Checklist:
- [ ] Test all functionality locally
- [ ] Verify Obsidian sync works
- [ ] Check responsive design
- [ ] Test dark/light themes
- [ ] Validate SEO meta tags
- [ ] Set up analytics
- [ ] Configure custom domain
- [ ] Test performance (Lighthouse)

### Launch Day:
1. Deploy to production
2. Update DNS records
3. Test live site thoroughly
4. Share your new digital garden! 🎉

---

**Need Help?** 
- Check the main README.md for detailed setup
- Review GitHub Actions logs for sync issues
- Test locally first before deploying

Happy blogging, Infra Magician! 🧙‍♂️✨
