# 🚀 Deployment Guide: tinker.expert & blog.harshit.cloud

Complete step-by-step guide to deploy your blog to both domains with Vercel KV persistence.

---

## 📋 Prerequisites

- [x] Vercel account (free tier works)
- [x] Domain access to `tinker.expert` and `blog.harshit.cloud`
- [x] GitHub repo with your code
- [x] 15 minutes of time

---

## 🎯 Step 1: Set Up Vercel KV (5 minutes)

### 1.1 Create KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **KV**
3. Name it: `blog-storage`
4. Region: **Choose closest to your users** (e.g., `us-east-1` or `iad1`)
5. Click **Create**

### 1.2 Connect to Your Project

1. In KV dashboard, click **Connect Project**
2. Select your blog project (or create new one)
3. Vercel will auto-add environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`

✅ **Done!** KV is now connected.

---

## 🚀 Step 2: Deploy to Vercel (3 minutes)

### 2.1 Import Repository

If not already deployed:

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repo: `sachincool/blogs`
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy**

### 2.2 Wait for Build

First deployment takes ~2 minutes. Vercel will:
- ✅ Install dependencies
- ✅ Build Next.js app
- ✅ Deploy to edge network
- ✅ Auto-inject KV environment variables

You'll get a URL like: `your-blog-xyz.vercel.app`

---

## 🌐 Step 3: Add Custom Domains (5 minutes)

### 3.1 Add tinker.expert

1. In your Vercel project, go to **Settings** → **Domains**
2. Add domain: `tinker.expert`
3. Vercel will show DNS records to add:

**For Root Domain (tinker.expert):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Or use CNAME (if your DNS supports CNAME flattening):**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

4. Add records in your DNS provider (e.g., Cloudflare, Namecheap)
5. Wait 1-5 minutes for DNS propagation
6. Vercel will auto-issue SSL certificate

### 3.2 Add blog.harshit.cloud

1. Click **Add Domain** again
2. Add: `blog.harshit.cloud`
3. Add DNS records:

```
Type: CNAME
Name: blog
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation
5. SSL certificate auto-issues

### 3.3 Set Primary Domain (Optional)

Choose which domain is primary:
1. In Domains settings
2. Click **⋯** next to a domain
3. Select **Set as Primary**

**Recommended:** Set `blog.harshit.cloud` as primary, keep `tinker.expert` as alias.

---

## 🔄 Step 4: Migrate Existing Data (Optional, 2 minutes)

If you have existing likes/views data in `data/` folder:

### 4.1 Install Development Dependencies

```bash
npm install -D tsx
```

### 4.2 Set Up Local Environment

Create `.env.local`:

```env
# Copy from Vercel Dashboard → Storage → blog-storage → .env.local
KV_REST_API_URL=https://xxxxx.kv.vercel-storage.com
KV_REST_API_TOKEN=xxxxx
```

### 4.3 Run Migration

```bash
npx tsx scripts/migrate-to-kv.ts
```

This will transfer all existing likes and views to Vercel KV.

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Domains

Visit both domains:
- https://tinker.expert
- https://blog.harshit.cloud

Both should show your blog (same content).

### 5.2 Test Features

1. **Click Like button** → Should increment
2. **Refresh page** → Count should persist
3. **Open in incognito** → Same count (shared across users)
4. **View counter** → Should increment once per session
5. **Comments** → Should load (after Giscus setup)

### 5.3 Check Vercel KV

1. Go to Vercel Dashboard → Storage → blog-storage
2. Click **Data Browser**
3. You should see keys like:
   - `likes:post-slug`
   - `views:post-slug`
   - `likes:post-slug:ips`
   - `views:post-slug:visitors`

---

## 🎨 Step 6: Configure Giscus Comments (10 minutes)

Comments require GitHub Discussions setup:

### 6.1 Enable Discussions

1. Go to your GitHub repo: `github.com/sachincool/blogs`
2. **Settings** → **Features**
3. Check ✅ **Discussions**
4. Create category: "Blog Comments"

### 6.2 Install Giscus App

1. Go to [github.com/apps/giscus](https://github.com/apps/giscus)
2. Click **Install**
3. Select your `sachincool/blogs` repo

### 6.3 Get Configuration

1. Visit [giscus.app](https://giscus.app)
2. Enter:
   - Repository: `sachincool/blogs`
   - Mapping: `pathname`
   - Category: `Blog Comments`
3. Copy the generated values:
   - `data-repo-id`
   - `data-category-id`

### 6.4 Update Code

Edit `/components/blog/comments.tsx`:

```tsx
<Giscus
  repo="sachincool/blogs"  // ✅ Already correct
  repoId="YOUR_REPO_ID"     // ⚠️ Paste from giscus.app
  category="Blog Comments"
  categoryId="YOUR_CATEGORY_ID"  // ⚠️ Paste from giscus.app
  // ... rest stays the same
/>
```

### 6.5 Deploy Update

```bash
git add components/blog/comments.tsx
git commit -m "Configure Giscus comments"
git push
```

Vercel will auto-deploy in ~1 minute.

---

## 🔐 Environment Variables Summary

Your production environment should have:

```env
# Auto-added by Vercel KV (don't set manually)
KV_REST_API_URL=https://xxxxx.kv.vercel-storage.com
KV_REST_API_TOKEN=AXXXxxx...
KV_URL=redis://xxxxx.kv.vercel-storage.com

# Optional: if you want to override storage
NODE_ENV=production
```

**Note:** You don't need to set these manually if you connected KV via Vercel dashboard.

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics

1. Go to your project → **Analytics**
2. Free tier includes:
   - Page views
   - Unique visitors
   - Top pages
   - Device breakdown

### Optional: Add External Analytics

**Plausible (Recommended):**
```tsx
// app/layout.tsx
<Script
  defer
  data-domain="blog.harshit.cloud"
  src="https://plausible.io/js/script.js"
/>
```

**Umami (Self-hosted, free):**
Deploy on Vercel, add tracking script.

---

## 🚨 Troubleshooting

### Domain not working?

**Check DNS propagation:**
```bash
dig tinker.expert
dig blog.harshit.cloud
```

Should show Vercel's IP: `76.76.21.21` or CNAME: `cname.vercel-dns.com`

**Common issues:**
- DNS not propagated yet → Wait 5-30 minutes
- Wrong DNS records → Double-check in Vercel Domains tab
- SSL certificate pending → Wait for auto-issuance (5 mins)

### Likes/Views not persisting?

**Check KV connection:**
1. Vercel Dashboard → Settings → Environment Variables
2. Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` exist
3. If missing, reconnect KV database

**Test API endpoints:**
```bash
curl https://blog.harshit.cloud/api/likes?slug=test
# Should return: {"count":0,"liked":false}
```

### Comments not showing?

**Checklist:**
- [ ] GitHub Discussions enabled
- [ ] Giscus app installed on repo
- [ ] Repository is **public** (Giscus requires public repos)
- [ ] `repoId` and `categoryId` are correct in code

**Quick test:**
Visit https://giscus.app and reconfigure from scratch.

### Build failing?

**Check build logs:**
1. Vercel Dashboard → Deployments → Click latest
2. View logs for errors

**Common fixes:**
- Missing dependencies → Run `npm install` locally first
- TypeScript errors → Run `npm run build` locally to test
- Environment variables → Ensure KV is connected

---

## 🎯 Post-Deployment Checklist

After deployment, verify:

- [ ] Both domains load correctly
- [ ] SSL certificates are active (https works)
- [ ] Likes persist across sessions
- [ ] Views increment properly
- [ ] Comments load (after Giscus setup)
- [ ] Konami code works (try it!)
- [ ] Mobile responsive (test on phone)
- [ ] Dark mode switches correctly
- [ ] All links work
- [ ] Resume PDF loads

---

## 🔄 Continuous Deployment

**Automatic deployments:**
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Creates preview deployment
- Pull requests → Generates preview URLs

**Manual deployments:**
```bash
vercel --prod
```

---

## 📈 Scaling & Optimization

### Current Setup (Free Tier)

**Vercel KV Free Tier:**
- 256 MB storage
- 30,000 requests/month
- Global edge network

**Good for:**
- ~10,000 monthly visitors
- ~100 blog posts
- Personal/dev blogs

### When to Upgrade

**Vercel KV Pro ($20/month):**
- 3 GB storage
- 1,000,000 requests/month
- Better performance

**Upgrade when:**
- >10k monthly visitors
- >100k monthly requests
- Need higher throughput

---

## 🎨 Domain-Specific Customization (Optional)

Want different branding per domain?

### Option A: Environment Variables

```tsx
// app/layout.tsx
const domain = headers().get('host');
const siteName = domain?.includes('tinker') ? 'Tinker Expert' : 'Harshit\'s Blog';
```

### Option B: Separate Projects

Deploy same code to two Vercel projects:
1. `tinker-expert` → Connected to tinker.expert
2. `harshit-blog` → Connected to blog.harshit.cloud

Share same KV database between both.

---

## 📚 Additional Resources

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [DNS Propagation Checker](https://dnschecker.org)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

## 🎉 You're Done!

Your blog is now live on:
- ✅ https://tinker.expert
- ✅ https://blog.harshit.cloud

With:
- ✅ Persistent likes & views (Vercel KV)
- ✅ Fast global CDN
- ✅ Automatic SSL
- ✅ Continuous deployment
- ✅ Edge network

**Now just:**
1. Configure Giscus (10 mins)
2. Write amazing content! ✍️

---

## 🆘 Need Help?

**Quick Commands:**
```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

**Issues?** Check:
1. Build logs in Vercel dashboard
2. Browser console for errors
3. API endpoints: `/api/likes?slug=test`
4. KV data browser

**Still stuck?** Open an issue on GitHub!

