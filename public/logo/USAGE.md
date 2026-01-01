# Logo Usage Guide

## Available Logo Files

### Main Logo
- **`infra-magician-logo.png`** (1024x1024)
  - Primary logo file
  - Used in header and footer
  - Works well in both light and dark modes

### Padded Version
- **`infra-magician-logo-padded.png`** (1200x1200)
  - Extra padding around the logo
  - Better for social media sharing
  - Use when logo needs more breathing room

## Where the Logo is Used

1. **Header** (`components/blog/header.tsx`)
   - Size: 48x48px
   - Rounded corners with gradient background
   - Hover effect: scales up slightly

2. **Footer** (`components/layout/footer.tsx`)
   - Size: 48x48px
   - Clickable link to homepage
   - Matches header styling

3. **Favicons** (auto-generated)
   - `favicon.ico` - Browser tab icon
   - `favicon-16x16.png` - Small favicon
   - `favicon-32x32.png` - Standard favicon
   - `apple-touch-icon.png` - iOS home screen
   - `android-chrome-192x192.png` - Android icon
   - `android-chrome-512x512.png` - High-res Android

4. **Web Manifest** (`public/site.webmanifest`)
   - PWA configuration
   - App icons for mobile devices

## Logo Design

The logo features:
- 🧙‍♂️ Wizard's hat made of server racks
- ☁️ Cloud infrastructure elements
- ✨ Magical sparkles
- 🎨 Purple and blue color scheme
- 💻 Tech aesthetic with fantasy elements

Perfect representation of "Infra Magician" - where infrastructure meets magic!

## Regenerating Favicons

If you update the logo, regenerate favicons with:

```bash
cd /Users/bluebox/projects/blogs/public
magick logo/infra-magician-logo.png -resize 16x16 favicon-16x16.png
magick logo/infra-magician-logo.png -resize 32x32 favicon-32x32.png
magick logo/infra-magician-logo.png -resize 192x192 android-chrome-192x192.png
magick logo/infra-magician-logo.png -resize 512x512 android-chrome-512x512.png
magick logo/infra-magician-logo.png -resize 180x180 apple-touch-icon.png
magick favicon-16x16.png favicon-32x32.png favicon.ico
```

## Brand Colors

From the logo:
- **Primary Blue**: `#6366f1` (Indigo)
- **Purple**: `#8b5cf6` (Violet)
- **Pink Accent**: `#ec4899` (Pink)
- **Dark Background**: `#0a0a0a`

These colors are used throughout the site for consistency.

