# Logo Usage Guide

## Quick Reference

### In React/Next.js Components

```tsx
// Header/Footer Logo
<img 
  src="/logo/infra-magician-logo.png" 
  alt="Infra Magician Logo" 
  className="h-12 w-12"
/>

// Favicon in <head> (already configured in app/layout.tsx)
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

// Open Graph Image (for social sharing)
<meta property="og:image" content="https://yoursite.com/og-image.png" />
```

### In HTML

```html
<!-- Logo in content -->
<img src="/logo/infra-magician-logo.png" alt="Infra Magician" width="200" height="200">

<!-- PWA Manifest (already in public/site.webmanifest) -->
{
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### In CSS

```css
/* Background logo */
.hero {
  background-image: url('/logo/infra-magician-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
}

/* Favicon */
/* No CSS needed - handled via <link> tags in <head> */
```

## File Sizes & Use Cases

| File | Size | Use Case |
|------|------|----------|
| `infra-magician-logo.png` | 1024x1024 | Header, footer, main logo display |
| `favicon.ico` | Multi-size | Browser tab icon (legacy support) |
| `favicon-16x16.png` | 16x16 | Browser tab (high DPI) |
| `favicon-32x32.png` | 32x32 | Browser tab (standard) |
| `apple-touch-icon.png` | 180x180 | iOS home screen icon |
| `android-chrome-192x192.png` | 192x192 | Android home screen |
| `android-chrome-512x512.png` | 512x512 | Android splash screen |
| `og-image.png` | 1200x630 | Social media previews (Twitter, LinkedIn, Facebook) |

## Current Implementation

### Files Using Logo

1. `components/layout/header.tsx` - Main site header
2. `components/layout/footer.tsx` - Site footer
3. `components/blog/header.tsx` - Blog header
4. `app/layout.tsx` - Favicon links in HTML head

### Metadata Configuration

The Open Graph image is configured in:
- `app/layout.tsx` (root metadata)
- `app/blog/[slug]/page.tsx` (blog post OG images)
- `app/til/[id]/page.tsx` (TIL post OG images)

## Testing

### Browser Favicon
1. Open your site in Chrome/Firefox/Safari
2. Check the browser tab icon appears correctly
3. Bookmark the page - icon should appear in bookmarks

### Mobile Icons
1. **iOS**: Open site in Safari → Share → Add to Home Screen
2. **Android**: Open site in Chrome → Menu → Add to Home Screen
3. Check the icon displays correctly

### Social Media Previews
Test on:
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## Troubleshooting

### Favicon not updating?
Clear browser cache:
```bash
# Chrome DevTools: Network tab → Disable cache → Hard refresh (Cmd+Shift+R)
# Or visit: chrome://settings/clearBrowserData
```

### Wrong icon on social media?
Force re-scrape:
1. Paste your URL in the respective validator (Twitter/LinkedIn/Facebook)
2. Click "Fetch new scrape data" or similar
3. Wait 24-48 hours for cache to clear

### Icon looks blurry?
Ensure you're using the correct size:
- Favicon: Use 32x32 minimum
- Mobile: Use 192x192 minimum
- Social: Use 1200x630 for OG images

## Updating the Logo

If you need to update the logo design:

1. Replace `public/logo/infra-magician-dark-bg.png` with your new logo
2. Run the regeneration script (see README.md)
3. Commit and deploy
4. Clear CDN cache if using one (Vercel does this automatically)
5. Test on all platforms

## Resources

- [Favicon Generator](https://realfavicongenerator.net/)
- [Open Graph Protocol](https://ogp.me/)
- [PWA Manifest Docs](https://web.dev/add-manifest/)
