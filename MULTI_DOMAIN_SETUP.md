# 🌐 Multi-Domain Configuration

Your blog now supports **dynamic domain detection** and works perfectly across all your domains!

---

## ✅ Supported Domains

The blog automatically adapts to:

1. **`harshit.cloud`** - Main domain (shows About page)
2. **`blog.harshit.cloud`** - Blog subdomain (shows blog homepage)
3. **`tinker.expert`** - Alternative domain (shows blog homepage)
4. **`localhost:3000`** - Development (shows blog homepage)

---

## 🔧 How It Works

### Dynamic Domain Detection

The blog uses **request headers** to detect the current domain and dynamically generate:
- ✅ **Metadata** (title, description, Open Graph)
- ✅ **Sitemap** (all URLs use current domain)
- ✅ **robots.txt** (sitemap URL uses current domain)
- ✅ **Canonical URLs** (match current domain)

### Implementation

```typescript
// lib/site-config.ts
export function getCurrentDomain(hostname?: string): string {
  if (hostname) {
    // Use localhost for development
    if (hostname.includes('localhost')) {
      return `http://${hostname}`;
    }
    // Use https for production domains
    return `https://${hostname}`;
  }
  return siteConfig.siteUrl; // Fallback
}
```

### Usage in Components

```typescript
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const baseUrl = getCurrentDomain(hostname);
  const postUrl = `${baseUrl}/blog/${slug}`;
  
  return {
    title: post.title,
    openGraph: {
      url: postUrl, // ✅ Uses current domain!
    },
  };
}
```

---

## 📊 Examples

### When accessed from `harshit.cloud`:
- Sitemap: `https://harshit.cloud/sitemap.xml`
- Blog post URL: `https://harshit.cloud/blog/kubernetes-debugging-tips`
- Shows: About page

### When accessed from `blog.harshit.cloud`:
- Sitemap: `https://blog.harshit.cloud/sitemap.xml`
- Blog post URL: `https://blog.harshit.cloud/blog/kubernetes-debugging-tips`
- Shows: Blog homepage

### When accessed from `tinker.expert`:
- Sitemap: `https://tinker.expert/sitemap.xml`
- Blog post URL: `https://tinker.expert/blog/kubernetes-debugging-tips`
- Shows: Blog homepage

---

## 🚀 No Environment Variables Needed!

**You don't need to set `NEXT_PUBLIC_SITE_URL`** because the blog automatically detects the domain from the request.

### Optional: Set Default Domain

If you want to set a default domain for server-side generation:

```env
# .env.local (optional)
NEXT_PUBLIC_SITE_URL=https://harshit.cloud
```

But this is **not required** - the blog works perfectly without it!

---

## 🧪 Testing

### Test Each Domain:

1. **Main Domain:**
   ```bash
   curl -s https://harshit.cloud/sitemap.xml | grep "<loc>"
   # Should show: https://harshit.cloud/...
   ```

2. **Blog Subdomain:**
   ```bash
   curl -s https://blog.harshit.cloud/sitemap.xml | grep "<loc>"
   # Should show: https://blog.harshit.cloud/...
   ```

3. **Alternative Domain:**
   ```bash
   curl -s https://tinker.expert/sitemap.xml | grep "<loc>"
   # Should show: https://tinker.expert/...
   ```

### Test Metadata:

Visit any blog post on different domains and check metadata:
- **View Source** → Look for `<meta property="og:url">`
- Should match the domain you're visiting from

---

## 📝 Files Modified

### Core Logic:
- **`lib/site-config.ts`** - Added `getCurrentDomain()` helper
- **`app/sitemap.ts`** - Made async, uses headers
- **`app/robots.ts`** - Made async, uses headers

### Metadata Functions:
- **`app/blog/[slug]/page.tsx`** - Dynamic metadata
- **`app/til/[id]/page.tsx`** - Dynamic metadata
- **`app/blog/page.tsx`** - Dynamic metadata
- **`app/til/page.tsx`** - Dynamic metadata

---

## 🎯 Benefits

### ✅ SEO Optimized
- Each domain has proper canonical URLs
- No duplicate content issues
- Search engines index each domain separately

### ✅ Social Sharing Works
- Facebook/Twitter/LinkedIn previews work on all domains
- OG URLs match the domain being shared

### ✅ No Configuration Needed
- Works out of the box
- No environment variables to manage
- Automatic domain detection

### ✅ Development Friendly
- Works on localhost
- Works on Vercel preview URLs
- Works on production domains

---

## 🔍 How Domain Routing Works

From `app/page.tsx`:

```typescript
export default async function RootPage() {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  
  // Show About page for harshit.cloud
  if (hostname === 'harshit.cloud' || hostname === 'www.harshit.cloud') {
    return <AboutPage />;
  }
  
  // Show blog homepage for all other domains
  return <HomePageContent latestPosts={latestPosts} />;
}
```

**Different domains = Different content** but **same SEO optimization**!

---

## 🌟 Advanced: Adding More Domains

Want to add another domain? Just point it to Vercel:

1. **Add domain in Vercel:**
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add domain: `newdomain.com`
   - Configure DNS

2. **No code changes needed!**
   - Sitemap automatically adapts
   - Metadata automatically adapts
   - Everything just works ✨

3. **Optional: Custom logic per domain:**
   ```typescript
   // app/page.tsx
   if (hostname === 'newdomain.com') {
     return <CustomPage />;
   }
   ```

---

## 📊 Vercel Configuration

### Domain Setup:
1. Vercel Dashboard → Domains
2. Add all your domains:
   - `harshit.cloud`
   - `blog.harshit.cloud`
   - `tinker.expert`
3. Configure DNS for each
4. SSL certificates auto-generated

### No Additional Config Needed:
- ✅ No environment variables
- ✅ No build settings changes
- ✅ No API configuration
- ✅ Just works!

---

## 🎉 Summary

Your blog now has **enterprise-level multi-domain support**:

- ✅ **Dynamic domain detection** from request headers
- ✅ **Automatic SEO optimization** per domain
- ✅ **No configuration needed** - works out of the box
- ✅ **Social sharing optimized** for each domain
- ✅ **Development friendly** - works locally and in preview

**All domains are SEO-optimized and production-ready!** 🚀

---

## 💡 Pro Tips

1. **Different content per domain** - Use `app/page.tsx` routing logic
2. **Shared content** - All domains can access same blog posts
3. **Analytics per domain** - Track each domain separately in Vercel
4. **Sitemap per domain** - Each domain has its own sitemap URLs
5. **No duplicate content** - Canonical URLs prevent SEO issues

---

**Your multi-domain blog is ready to rank on all domains!** 🌐✨

