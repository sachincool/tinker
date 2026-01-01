# Environment Variable Setup

## ✅ No Environment Variable Needed!

Your blog now **automatically detects the domain** from the incoming request. This means:

- ✅ `harshit.cloud` → All URLs use `https://harshit.cloud`
- ✅ `tinker.expert` → All URLs use `https://tinker.expert`
- ✅ Works automatically for any custom domain

## How It Works

All RSS feeds, sitemaps, and metadata now use the **`host`** header from the incoming request to dynamically generate the correct URLs. This is the same approach Next.js uses for multi-tenant applications.

## Optional: Override for Specific Domains

If you ever need to override the automatic detection (e.g., for testing), you can set:

```bash
NEXT_PUBLIC_SITE_URL=https://harshit.cloud
```

But this is **not required** for production. The automatic detection is better for multi-domain setups.

## For Local Development

For local development, the site automatically uses `http://localhost:3000`, so you don't need to set this variable locally.

## Verification

After adding the environment variable and redeploying:

1. Visit your sitemap: `https://harshit.cloud/sitemap.xml`
2. Check that all URLs start with `https://harshit.cloud` (not relative paths)
3. Visit a blog post and view source
4. Verify Open Graph tags have absolute URLs like:
   ```html
   <meta property="og:url" content="https://harshit.cloud/blog/post-slug">
   <meta property="og:image" content="https://harshit.cloud/blog/post-slug/opengraph-image">
   ```

## Troubleshooting

**Issue**: URLs in sitemap are still using localhost or wrong domain

**Solution**: 
1. Make sure you saved the environment variable in Vercel
2. Trigger a new deployment (push a commit or redeploy manually)
3. Clear your browser cache
4. Wait a few minutes for the new deployment to go live

**Issue**: Environment variable not working

**Solution**:
1. Double-check the variable name is exactly: `NEXT_PUBLIC_SITE_URL` (case-sensitive)
2. Ensure value has no trailing slash: `https://harshit.cloud` ✅ not `https://harshit.cloud/` ❌
3. Make sure it's enabled for "Production" environment
4. Redeploy after making changes

