# Infra Magician Logo Assets

This directory contains the official Infra Magician logo and branding assets.

## Logo Files

### Primary Logo
- `infra-magician-logo.png` - Main logo with dark background (used in header/footer)
- `infra-magician-dark-bg.png` - Same as above, source file for favicon generation
- `infra-magician-logo-original-backup.png` - Original logo with white background (backup)

### Variations
- `infra-magician-variations.png` - Multiple size variations (for reference)

## Logo Design

The Infra Magician logo features:
- **Wizard Hat**: Made of stacked server racks (purple/blue gradient)
- **Magic Stars**: Representing automation and "magic" in infrastructure
- **Clouds**: Symbolizing cloud infrastructure
- **Circular Border**: Blue to purple gradient frame
- **Color Scheme**: Purple (#8B5CF6), Blue (#3B82F6), Cyan (#06B6D4)

## Usage Guidelines

### Do's ✅
- Use on dark backgrounds for maximum contrast
- Maintain aspect ratio when resizing
- Use provided favicon/icon sizes from `/public/` directory

### Don'ts ❌
- Don't modify the colors
- Don't distort the aspect ratio
- Don't add backgrounds that clash with the gradient
- Don't use low-resolution versions in large displays

## Generated Assets

All favicon and icon files are auto-generated from `infra-magician-dark-bg.png`:
- `/favicon.ico` (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
- `/favicon-16x16.png`
- `/favicon-32x32.png`
- `/apple-touch-icon.png` (180x180)
- `/android-chrome-192x192.png`
- `/android-chrome-512x512.png`
- `/og-image.png` (1200x630, for Open Graph social sharing)

## Regenerating Assets

If you update the logo, regenerate all assets with:

```bash
cd public
magick logo/infra-magician-dark-bg.png -resize 16x16 favicon-16x16.png
magick logo/infra-magician-dark-bg.png -resize 32x32 favicon-32x32.png
magick logo/infra-magician-dark-bg.png -resize 192x192 android-chrome-192x192.png
magick logo/infra-magician-dark-bg.png -resize 512x512 android-chrome-512x512.png
magick logo/infra-magician-dark-bg.png -resize 180x180 apple-touch-icon.png
magick logo/infra-magician-dark-bg.png -define icon:auto-resize=256,128,64,48,32,16 favicon.ico
magick logo/infra-magician-dark-bg.png -resize 1200x630 -gravity center -background "#1a1a2e" -extent 1200x630 og-image.png
```

## Brand Colors

```css
--infra-purple: #8B5CF6;
--infra-blue: #3B82F6;
--infra-cyan: #06B6D4;
--infra-dark: #1a1a2e;
--infra-gradient: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
```

## License

© 2025 Harshit Luthra. All rights reserved.
