# Deployment Guide

## 🚀 Current Setup (File-Based Storage)

Your blog currently uses **file-based storage** for likes and views. This works out of the box with zero configuration!

### How It Works
- Likes and views are stored in `data/likes.json` and `data/views.json`
- Works locally and on Vercel (uses filesystem)
- No external services required
- User tracking via IP address/fingerprinting

### Limitations
- **Vercel Free Tier**: Files are ephemeral (reset on deployment)
- **Scale**: Fine for personal blogs (<10k users)
- **Concurrent writes**: May have race conditions under high load

---

## 📦 Storage Options (Choose One)

### Option 1: Keep File-Based (Current - Zero Setup)

✅ **Pros:**
- No setup required
- No external dependencies
- Free forever
- Privacy-friendly

❌ **Cons:**
- Data resets on each Vercel deployment
- Not suitable for high traffic

**When to use:** Personal blog, low traffic, don't care about losing counts

---

### Option 2: Vercel KV (Redis) - **RECOMMENDED**

✅ **Pros:**
- Persistent storage
- Fast (edge network)
- Easy Vercel integration
- Free tier: 256MB, 30k commands/month

❌ **Cons:**
- Requires Vercel account
- Paid plans for higher usage

#### Setup Instructions:

1. **Install Vercel KV:**
```bash
npm install @vercel/kv
```

2. **Create KV Database:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Storage → Create Database → KV
   - Connect to your project

3. **Update API Routes:**

```typescript
// app/api/likes/route.ts
import { kv } from '@vercel/kv';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const count = await kv.get(`likes:${slug}`) || 0;
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  const { slug, action } = await req.json();
  const clientIP = getClientIP(req);
  const key = `likes:${slug}`;
  const ipsKey = `likes:${slug}:ips`;
  
  const hasLiked = await kv.sismember(ipsKey, clientIP);
  
  if (action === 'like' && !hasLiked) {
    await kv.incr(key);
    await kv.sadd(ipsKey, clientIP);
  } else if (action === 'unlike' && hasLiked) {
    await kv.decr(key);
    await kv.srem(ipsKey, clientIP);
  }
  
  const count = await kv.get(key) || 0;
  const liked = await kv.sismember(ipsKey, clientIP);
  
  return NextResponse.json({ count, liked });
}
```

Similar updates for `app/api/views/route.ts`.

---

### Option 3: Upstash Redis (Vercel Alternative)

✅ **Pros:**
- More generous free tier (10k commands/day)
- Works with any host (not just Vercel)
- Edge network

#### Setup:

1. **Install:**
```bash
npm install @upstash/redis
```

2. **Create Database:**
   - Go to [Upstash Console](https://console.upstash.com)
   - Create Redis database
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

3. **Add to `.env.local`:**
```env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

4. **Update API routes** (same as Vercel KV but import from `@upstash/redis`)

---

### Option 4: Analytics Services (Views Only)

For **view tracking only**, consider dedicated analytics:

#### Plausible Analytics
- Privacy-friendly
- Beautiful dashboard
- €9/month (100k pageviews)
- [Setup Guide](https://plausible.io/docs)

#### Umami (Self-Hosted)
- Free, open-source
- Self-host on Vercel
- [GitHub](https://github.com/umami-software/umami)

#### GoatCounter
- Free forever
- Minimalist
- [goatcounter.com](https://goatcounter.com)

---

## 💬 Comments Setup (Giscus)

### Prerequisites
1. Public GitHub repository
2. [giscus app](https://github.com/apps/giscus) installed
3. Discussions enabled in repo settings

### Setup:

1. **Install Giscus:**
```bash
npm install @giscus/react
```

2. **Get Configuration:**
   - Go to [giscus.app](https://giscus.app)
   - Enter your repo: `username/repo`
   - Get your `repoId` and `categoryId`

3. **Update** `components/blog/comments.tsx`:
```tsx
<Giscus
  repo="your-username/your-repo"
  repoId="YOUR_REPO_ID"           // From giscus.app
  categoryId="YOUR_CATEGORY_ID"   // From giscus.app
  // ... rest stays the same
/>
```

4. **Add to Blog Posts:**
```tsx
// app/blog/[slug]/page.tsx
import { Comments } from "@/components/blog/comments";

// Inside your component:
<Comments slug={params.slug} />
```

---

## 🔒 Environment Variables

### Development (`.env.local`):
```env
# Only needed if using Vercel KV or Upstash
KV_REST_API_URL=your-url
KV_REST_API_TOKEN=your-token

# Or for Upstash
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Production (Vercel Dashboard):
- Add same variables in project settings
- Vercel KV auto-injects if connected

---

## 📊 Recommended Setup by Traffic

| Monthly Views | Likes/Views Storage | Comments | Analytics |
|--------------|---------------------|----------|-----------|
| < 1k | File-based | Giscus | None |
| 1k - 10k | Vercel KV | Giscus | Plausible |
| 10k - 100k | Upstash | Giscus | Plausible |
| 100k+ | Upstash Pro | Giscus | Plausible |

---

## 🎯 Quick Start Guide

### For Beginners (Zero Setup):
1. Deploy to Vercel as-is
2. Likes/views work immediately (will reset on deployments)
3. Add Giscus later when you want comments

### For Production (Recommended):
1. Set up Vercel KV or Upstash (15 mins)
2. Update API routes (copy-paste code above)
3. Configure Giscus (5 mins)
4. Optional: Add Plausible for advanced analytics

---

## 🔧 Migration Guide

### From File-Based to Vercel KV:

1. **Before migration**, export current data:
```bash
# Copy data/likes.json and data/views.json
```

2. **Set up Vercel KV** (see Option 2)

3. **Import data** (one-time script):
```typescript
// scripts/migrate-to-kv.ts
import { kv } from '@vercel/kv';
import likes from '../data/likes.json';
import views from '../data/views.json';

// Migrate likes
for (const [slug, data] of Object.entries(likes)) {
  await kv.set(`likes:${slug}`, data.count);
  for (const ip of data.ips) {
    await kv.sadd(`likes:${slug}:ips`, ip);
  }
}

// Similar for views...
```

4. **Deploy with new API routes**

---

## 🐛 Troubleshooting

### Likes/Views not persisting
- Check if `data/` directory exists and is writable
- For Vercel: Upgrade to KV storage

### Comments not showing
- Verify giscus app is installed on your repo
- Check Discussions are enabled
- Ensure repo is public

### High latency
- Consider Upstash for global edge network
- Enable request caching (add `cache: 'force-cache'`)

---

## 📝 Notes

- **File-based storage** is perfectly fine for personal blogs
- **Vercel KV** is the best balance of ease and reliability
- **Giscus** is free and requires zero maintenance
- All solutions are **privacy-friendly** (no tracking pixels)

Need help? Check the [Issues](https://github.com/sachincool/blogs/issues) or open a new one!

