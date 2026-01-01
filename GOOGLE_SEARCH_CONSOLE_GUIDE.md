# Google Search Console Sitemap Submission Guide

This guide will help you submit your blog's sitemap to Google Search Console to ensure proper indexing and visibility in search results.

## Why This Matters

Without submitting your sitemap to Google Search Console:
- Google relies on discovering links from other sites (slow, can take weeks/months)
- New posts might not get indexed for a long time
- No priority signals for which content matters most
- You can't monitor crawl errors or indexing issues

**After submitting**: Google actively crawls your sitemap daily, indexing new posts within 24-48 hours.

## Prerequisites

✅ Your site is deployed (works for both `https://harshit.cloud` and `https://tinker.expert`)
✅ Your site is already verified in Google Search Console  
✅ Your sitemap automatically uses the correct domain

**Note:** This codebase powers multiple domains. The RSS feeds and sitemaps automatically detect which domain is being accessed and use the correct URLs. No configuration needed!

## Step-by-Step Instructions

### Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Log in with your Google account
3. Select your verified property: **`https://harshit.cloud`**

### Step 2: Navigate to Sitemaps

1. In the **left sidebar**, click **"Sitemaps"**
2. You'll see a page titled "Sitemaps" with an input field

### Step 3: Submit Your Main Sitemap

1. In the **"Add a new sitemap"** field, enter: `sitemap.xml`
2. Click the **"Submit"** button
3. Wait a few seconds for confirmation
4. You should see:
   - Status: **"Success"** (green checkmark)
   - Discovered URLs will appear within 24-48 hours

### Step 4: Submit Additional Sitemaps (Recommended)

Google likes targeted sitemaps for better content classification. Submit these as well:

#### Blog RSS Sitemap
1. Enter: `blog/rss.xml`
2. Click **"Submit"**

#### TIL RSS Sitemap
1. Enter: `til/rss.xml`
2. Click **"Submit"**

### Step 5: Request Immediate Indexing (For Priority Posts)

For your most important posts (like the VictoriaLogs article), request immediate indexing:

1. At the top of Google Search Console, click **"URL Inspection"**
2. Enter the full URL: `https://harshit.cloud/blog/victorialogs-vs-loki`
3. Wait for Google to check the URL
4. Click **"Request Indexing"**
5. Google will prioritize crawling this page within 24-48 hours

**Repeat for your top 3-5 posts:**
- `https://harshit.cloud/blog/ja4-fingerprinting-network-security`
- `https://harshit.cloud/blog/aws-cost-optimization-tricks`
- `https://harshit.cloud/blog/prometheus-grafana-monitoring-guide`
- `https://harshit.cloud/blog/kubernetes-debugging-tips`

### Step 6: Monitor Indexing Progress

1. In the left sidebar, click **"Pages"**
2. This shows your indexing status:
   - **Indexed pages**: Pages successfully added to Google
   - **Not indexed**: Pages with issues (check reasons)
   - **Valid with warnings**: Indexed but with minor issues

Check this every 3-5 days to monitor progress.

### Step 7: Check Coverage Report

1. In the left sidebar, click **"Coverage"** (or it might be under "Pages")
2. Review:
   - **Valid**: Successfully indexed pages ✅
   - **Valid with warnings**: Indexed with minor issues ⚠️
   - **Error**: Pages with critical issues ❌
   - **Excluded**: Pages intentionally not indexed (API routes, etc.)

Fix any errors by clicking on them to see details.

## Expected Timeline

| Milestone | Timeline |
|-----------|----------|
| Sitemap processed | 1-2 days |
| First pages appear in index | 3-7 days |
| Majority of site indexed | 2-4 weeks |
| Ranking improvements visible | 4-8 weeks |

## Verification Steps

After submitting, verify everything is working:

### 1. Test Your Sitemap
Visit: `https://harshit.cloud/sitemap.xml`
- Should see XML with all your blog posts and pages
- Should include URLs for blog posts, TIL posts, and static pages

### 2. Test Robots.txt
Visit: `https://harshit.cloud/robots.txt`
- Should see: `Sitemap: https://harshit.cloud/sitemap.xml`
- Should allow Googlebot to crawl everything except `/api/` and `/_next/`

### 3. Test Rich Results
1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter: `https://harshit.cloud/blog/victorialogs-vs-loki`
3. Should see:
   - ✅ BlogPosting structured data
   - ✅ BreadcrumbList structured data
   - ✅ Article metadata (title, author, date)

### 4. Test Open Graph Images
1. Go to [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
2. Enter: `https://harshit.cloud/blog/victorialogs-vs-loki`
3. Should see a beautiful generated OG image with:
   - Post title
   - Excerpt
   - Tags
   - Your branding

Alternatively, try sharing on Twitter/X to see the preview.

## Monitoring & Maintenance

### Weekly Checks (First Month)
1. **Google Search Console** → "Pages"
   - Track number of indexed pages
   - Fix any new errors

2. **Search Appearance**
   - Monitor click-through rates
   - Check which queries drive traffic

### Monthly Checks (Ongoing)
1. **Performance Report**
   - See which posts rank well
   - Identify opportunities to improve content

2. **Coverage Report**
   - Ensure no new indexing issues
   - Verify all new posts are being indexed

## Troubleshooting Common Issues

### ❌ "Sitemap could not be read"
**Solution**: 
- Verify `https://harshit.cloud/sitemap.xml` loads without errors
- Check that it's valid XML (no syntax errors)
- Ensure all URLs start with `https://` (not relative URLs)

### ❌ "Submitted URL not found (404)"
**Solution**: 
- Verify the page exists and loads correctly
- Check for typos in the URL
- Ensure the page is not behind authentication

### ⚠️ "Crawled - currently not indexed"
**Reasons**: 
- Content is too thin or low quality
- Too similar to existing content
- Page has technical issues (slow load, broken JS)

**Solution**: 
- Improve content quality and depth
- Add internal links from other posts
- Request indexing again after improvements

### ⚠️ "Discovered - currently not indexed"
**Meaning**: Google found the URL but hasn't crawled it yet.

**Solution**: 
- Wait 1-2 weeks (Google is prioritizing other content)
- Request indexing manually via URL Inspection
- Add internal links to the page

## Pro Tips for Better Indexing

### 1. Add Internal Links
Update your existing blog posts to link to new content:
- When mentioning "logging" → link to VictoriaLogs post
- When mentioning "monitoring" → link to Prometheus/Grafana post
- When mentioning "cost optimization" → link to AWS cost post

**Why**: Internal links help Google discover and understand content relationships.

### 2. Update Content Regularly
- Add new sections to popular posts
- Fix outdated information
- Update dates in frontmatter when making substantial changes

**Why**: Google prefers fresh, maintained content.

### 3. Promote Your Content
- Share on Twitter/X with relevant hashtags
- Post on LinkedIn with industry tags
- Submit to relevant subreddits (r/devops, r/kubernetes, etc.)
- Add to developer newsletters

**Why**: External signals help Google prioritize crawling.

### 4. Build Backlinks
- Comment on related blog posts with valuable insights (link back when relevant)
- Participate in dev.to, Hashnode, or Medium
- Answer questions on Stack Overflow (link to your detailed posts)

**Why**: Backlinks = authority = faster indexing + better rankings.

## What You Should See in Search Results

After 2-4 weeks, searching Google for:

**"victorialogs vs loki"**
- Your post should appear in top 10 results
- Should show: Title, excerpt, date, breadcrumbs

**"harshit luthra devops"** or **"harshit.cloud"**
- Your homepage should rank #1
- Should show sitelinks to major sections

**Long-tail queries like:**
- "victorialogs query performance benchmarks"
- "loki vs victorialogs resource usage"
- "kubernetes logging victorialogs"

These should start ranking within 4-8 weeks if content is unique and valuable.

## Need Help?

If you encounter issues:

1. **Check Google Search Console "Help" docs**: Most errors have detailed explanations
2. **Search Console Community**: Post questions in the Google Search Central community
3. **Validate structured data**: Use Google's Rich Results Test tool
4. **Test site speed**: Use PageSpeed Insights (slow sites index poorly)

## Summary Checklist

- [ ] Submitted `sitemap.xml` to Google Search Console
- [ ] Submitted `blog/rss.xml` (optional but recommended)
- [ ] Submitted `til/rss.xml` (optional but recommended)
- [ ] Requested indexing for top 3-5 posts via URL Inspection
- [ ] Verified sitemap loads correctly at `/sitemap.xml`
- [ ] Verified robots.txt references sitemap
- [ ] Tested Rich Results for at least one blog post
- [ ] Tested Open Graph images on social media
- [ ] Set up weekly monitoring of Pages report
- [ ] Added internal links between related posts

## Next Steps

1. **Submit your sitemap today** (takes 5 minutes)
2. **Wait 3-7 days** for initial indexing
3. **Check progress** in Google Search Console weekly
4. **Write more great content** while Google indexes your existing posts
5. **Promote your best posts** on social media and dev communities

Your blog now has everything it needs for excellent SEO. The technical foundation is solid—now it's just a matter of time for Google to discover and rank your content!

---

**Last Updated**: January 2025  
**Your Domain**: https://harshit.cloud  
**Sitemap URL**: https://harshit.cloud/sitemap.xml

