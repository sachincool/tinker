# Public Directory Cleanup & UI/UX Improvements Plan

**Created:** 2026-01-12
**Status:** Ready for Implementation

---

## Part 1: Favicon & Public Directory Cleanup

### Task 1.1: Remove Unused Files

**Files to DELETE:**

```bash
# Root-level duplicate/outdated favicons
rm /public/favicon.ico
rm /public/favicon-16x16.png
rm /public/favicon-32x32.png
rm /public/apple-touch-icon.png
rm /public/android-chrome-192x192.png
rm /public/android-chrome-512x512.png
rm /public/site.webmanifest

# Unused logo variants
rm /public/logo/infra-magician-transparent-backup.png
rm /public/logo/infra-magician-truly-transparent.png
rm /public/logo/infra-magician-transparent.png
rm /public/logo/.DS_Store
```

### Task 1.2: Move Favicon Files to Root

Move files from `/public/logo/favicon/` to `/public/`:

```bash
mv /public/logo/favicon/favicon-96x96.png /public/
mv /public/logo/favicon/favicon.svg /public/
mv /public/logo/favicon/favicon.ico /public/
mv /public/logo/favicon/apple-touch-icon.png /public/
mv /public/logo/favicon/web-app-manifest-192x192.png /public/
mv /public/logo/favicon/web-app-manifest-512x512.png /public/
mv /public/logo/favicon/site.webmanifest /public/
rmdir /public/logo/favicon/
```

### Task 1.3: Fix site.webmanifest

**Current (WRONG):**
```json
{
  "name": "Linkedintel",
  "short_name": "Linkedintel",
  ...
}
```

**Should be:**
```json
{
  "name": "Infra Magician's Digital Spellbook",
  "short_name": "Infra Magician",
  "description": "Level 99 Infrastructure Wizard - SRE/DevOps blog",
  "icons": [
    {
      "src": "/web-app-manifest-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/web-app-manifest-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "theme_color": "#6366f1",
  "background_color": "#0a0a0a",
  "display": "standalone",
  "start_url": "/"
}
```

### Task 1.4: Update layout.tsx Favicon References

**File:** `app/layout.tsx` (lines 77-82)

**Current:**
```tsx
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

**Replace with:**
```tsx
<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### Task 1.5: Final Public Directory Structure

After cleanup, `/public/` should contain:

```
public/
├── favicon-96x96.png          # New
├── favicon.svg                 # New
├── favicon.ico                 # Moved from logo/favicon/
├── apple-touch-icon.png        # Moved from logo/favicon/
├── web-app-manifest-192x192.png # Moved from logo/favicon/
├── web-app-manifest-512x512.png # Moved from logo/favicon/
├── site.webmanifest            # Moved & fixed
├── og-image.png                # Keep
├── logo.png                    # Keep (used in structured data)
├── Harshit_Resume.pdf          # Keep
├── logo/
│   ├── infra-magician-clean.png       # Keep (actively used)
│   ├── infra-magician-transparent-v2.png  # Keep (per user)
│   ├── infra-magician-logo.png        # Keep (per user)
│   └── infra-magician-dark-bg.png     # Keep (per user)
└── images/                     # Keep all (blog images)
    ├── akamai-browser-extensions-blocking/
    ├── victorialogs-vs-loki/
    ├── netlify-to-dokploy-migration/
    ├── delivery-social-engineering/
    └── workspace-setup.jpg
```

---

## Part 2: UI/UX Issues & Improvements

### Critical Priority (Functional Fixes)

#### Task 2.1: Fix Tags Page Search
**File:** `/app/tags/page.tsx` (or related component)
**Issue:** Search `<Input>` is set to `readOnly` and non-functional
**Fix:** Wire up the search to filter tags list (similar to Blog/TIL search)

#### Task 2.2: Fix Blog Sorting - "Most Popular"
**File:** `/app/blog/page.tsx` (or related component)
**Issue:** "Most Popular" sort option returns 0 results - unimplemented
**Fix:** Either implement view-based sorting or remove the option

---

### High Priority (Content & Polish)

#### Task 2.3: Fix About Page Copy
**File:** `/app/about/about-page-client.tsx`
**Issue:** Awkward phrasing - "He does all head-butted stuffs"
**Fix:** Reword to something like "He head-butts his way through problems"

#### Task 2.4: Spelling Consistency
**Files:** Various
**Issue:** Mixed British/American spelling ("optimising" vs "optimizing")
**Fix:** Standardize to American English (since "color" is used)

---

### Medium Priority (Enhancements)

#### Task 2.5: New TIL Page Enhancement
**File:** `/app/til/new/page.tsx`
**Issue:** Save button only logs to console - marked as "demo"
**Suggestion:** Allow download as `.md` file for Obsidian vault import

#### Task 2.6: Graph View Enhancement
**File:** `/components/blog/graph-view.tsx`
**Issue:** Hardcoded `slice(0, 10)` limits visible nodes
**Suggestion:** Add "Load More" or "Full View" toggle

---

### Low Priority

#### Task 2.7: Font Consistency Audit
**Files:** `app/layout.tsx`, `app/globals.css`
**Issue:** Potential mismatch between `inter.className` and `geist` CSS variables
**Fix:** Verify intended font stack is actually applying

---

## Implementation Order

1. **Phase 1 - Cleanup (Part 1)**
   - [ ] 1.1 Delete unused files
   - [ ] 1.2 Move favicon files
   - [ ] 1.3 Fix site.webmanifest content
   - [ ] 1.4 Update layout.tsx favicon references
   - [ ] 1.5 Verify structure

2. **Phase 2 - Critical Fixes (Part 2)**
   - [ ] 2.1 Fix Tags search
   - [ ] 2.2 Fix Blog sorting

3. **Phase 3 - Polish (Part 2)**
   - [ ] 2.3 Fix About page copy
   - [ ] 2.4 Spelling consistency

4. **Phase 4 - Enhancements (Optional)**
   - [ ] 2.5 TIL download feature
   - [ ] 2.6 Graph view expansion
   - [ ] 2.7 Font audit

---

## Verification Steps

After implementation:
1. Run `npm run build` - ensure no broken references
2. Test all pages load correctly
3. Verify favicons appear in browser tabs
4. Test PWA manifest (if applicable)
5. Check mobile responsiveness
6. Verify search works on Tags page
7. Verify blog sorting options work
