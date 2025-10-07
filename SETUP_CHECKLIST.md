# 🚀 Setup Checklist

## ✅ Already Done (Automatic)

These work out of the box with zero configuration:

- [x] Likes system with real counts
- [x] View tracking with unique visitors
- [x] File-based storage (auto-creates `data/` directory)
- [x] Privacy-friendly IP tracking
- [x] Optimistic UI updates
- [x] Error handling and loading states
- [x] Improved Konami Code hint

## ⚠️ Manual Setup Required

### 1. Enable GitHub Discussions (5 minutes)

**For Comments to Work:**

1. Go to your GitHub repo: `https://github.com/sachincool/blogs`
2. Click **Settings** → **Features**
3. Check ✅ **Discussions**
4. Create a category called "Blog Comments" (or any name)

### 2. Configure Giscus (10 minutes)

1. Install Giscus app: https://github.com/apps/giscus
2. Click **Configure** → Select your `sachincool/blogs` repo
3. Go to https://giscus.app
4. Enter:
   - Repository: `sachincool/blogs`
   - Page ↔️ Discussions Mapping: `pathname`
   - Discussion Category: `Blog Comments`
5. **Copy the generated values:**
   - `data-repo-id`
   - `data-category-id`

6. Update `/components/blog/comments.tsx`:
```tsx
<Giscus
  repo="sachincool/blogs"  // ✅ Already correct
  repoId="YOUR_REPO_ID"     // ⚠️ Replace this
  categoryId="YOUR_CATEGORY_ID"  // ⚠️ Replace this
  // ... rest stays the same
/>
```

### 3. Test Locally (2 minutes)

```bash
npm run dev

# Visit http://localhost:3000
# Test:
# 1. Click like button → should persist on refresh
# 2. View counter → should increment once per session
# 3. Scroll to comments → should see Giscus widget
```

### 4. Deploy to Vercel (3 minutes)

```bash
# Push to GitHub
git add .
git commit -m "Add robust likes, views, and comments"
git push

# Vercel auto-deploys on push
# Or manually: vercel --prod
```

**Note:** File-based storage works on Vercel but **resets on deployment**. For production persistence, see upgrade options below.

---

## 🎯 Optional Upgrades (When Ready)

### For Production Traffic

**When you have >10k monthly visitors OR deploy frequently:**

#### Option A: Upgrade to Vercel KV (Recommended)
- **Cost:** Free tier (256MB, 30k requests/month)
- **Setup time:** 15 minutes
- **Instructions:** See `DEPLOYMENT_GUIDE.md` → Option 2

#### Option B: Use Upstash Redis
- **Cost:** Free tier (10k requests/day)
- **Setup time:** 20 minutes
- **Instructions:** See `DEPLOYMENT_GUIDE.md` → Option 3

#### Option C: Use Analytics Service (Views only)
- **Options:** Plausible, Umami, GoatCounter
- **Setup time:** 10 minutes
- **Instructions:** See `DEPLOYMENT_GUIDE.md` → Option 4

---

## 🐛 Troubleshooting

### Likes/Views not working?

**Check:**
1. API routes are accessible: Visit `/api/likes?slug=test`
   - Should return: `{"count":0,"liked":false}`
2. `data/` directory is writable
3. No errors in browser console

**Quick fix:**
```bash
# Create data directory manually
mkdir -p data
touch data/likes.json data/views.json
echo '{}' > data/likes.json
echo '{}' > data/views.json
```

### Comments not showing?

**Check:**
1. GitHub Discussions is enabled ✅
2. Giscus app is installed on your repo ✅
3. `repoId` and `categoryId` are correct ⚠️
4. Repository is **public** (Giscus doesn't work with private repos)

**Quick test:**
Visit https://giscus.app and follow the configuration wizard again.

### Data resets on Vercel?

**This is expected with file-based storage!**

Vercel's serverless functions are stateless, so files reset on deployment.

**Solutions:**
1. **Accept it** - Fine for dev blogs where exact counts don't matter
2. **Upgrade to Vercel KV** - 15 min setup, free tier
3. **Use Upstash** - More generous free tier

---

## 📊 Current Status

| Feature | Status | Production Ready? |
|---------|--------|-------------------|
| Likes | ✅ Working | ⚠️ Upgrade for high traffic |
| Views | ✅ Working | ⚠️ Upgrade for high traffic |
| Comments | ⚠️ Needs Giscus config | ✅ Yes, after setup |
| Konami Code | ✅ Working | ✅ Yes |

---

## 🎓 Next Steps

### Must Do (Before Going Live):
1. [ ] Enable GitHub Discussions
2. [ ] Configure Giscus (get IDs)
3. [ ] Update `comments.tsx` with your IDs
4. [ ] Test all features locally
5. [ ] Deploy to Vercel

### Should Do (Within First Month):
1. [ ] Monitor traffic and data growth
2. [ ] Set up error monitoring (Sentry, etc.)
3. [ ] Add rate limiting to API routes
4. [ ] Consider upgrading storage if traffic grows

### Nice to Have (When You Have Time):
1. [ ] Add RSS feed
2. [ ] Implement search
3. [ ] Add Open Graph tags for social sharing
4. [ ] Set up CI/CD tests
5. [ ] Add sitemap generation

---

## 📚 Documentation

- **ROBUST_IMPLEMENTATION.md** - Technical details
- **DEPLOYMENT_GUIDE.md** - Upgrade options
- **BLOG_FEATURES.md** - All features overview

---

## ✨ You're Almost There!

**Just 2 steps to complete:**
1. Configure Giscus (10 min)
2. Deploy to Vercel (3 min)

Then you'll have a **production-ready blog with:**
- ✅ Real like counts (shared across users)
- ✅ Accurate view tracking
- ✅ GitHub-powered comments
- ✅ No Supabase needed!

**Questions?** Check the docs or open an issue on GitHub.

