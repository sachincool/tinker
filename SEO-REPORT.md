# SEO execution report — harshit.cloud / tinker.expert

Branch: `seo/audit-2026-08-30`. Four commits, not pushed.
Build: **pass** (`npm run build`, 285 static pages, 0 errors).

Baseline came from the 2026-09-04 audit crawl: 157 URLs per domain, 107 of them
`/tags/*` pages averaging 107 words and 9-character titles, 113 of 157 titles
under 30 characters, and ~25 MB of unoptimised PNGs in `public/images/`.

---

## 1. What changed

### P0 — tag-page index bloat

107 tags, 91 of which carried one or two posts. Those pages were 68% of the
sitemap, all titled `#tagname`, all near-duplicates of one another.

| File | Change |
|---|---|
| `lib/tag-meta.ts` | Added `HUB_TAG_MIN_POSTS = 3`, `TAG_HUBS`, `getTagHub()`, `isIndexableTag()`. 20 hub tags each get a hand-written `seoTitle` (with a `{n}` count token), a 140–160 char meta description, and a 60–120 word intro written from the posts that tag actually carries. No templating: each intro names real posts. |
| `app/tags/[tag]/page.tsx` | Hub title/description/intro; `robots: { index: false, follow: true }` for anything under the threshold; `BreadcrumbList` JSON-LD added next to the existing `CollectionPage`; related tags now ranked by real co-occurrence and biased toward hubs, instead of the first eight tags alphabetically. |
| `app/sitemap.ts` | Tag URLs filtered through `isIndexableTag()`. |

`devsecops` carries exactly the same six posts as `lazy-sre`. Two indexable
pages listing an identical set is a duplicate, so `devsecops` is in an explicit
`DUPLICATE_TAGS` set and defers to the series hub. Documented in the file with
the condition for removing it.

Result: **107 tag URLs in the sitemap → 19.** The other 88 stay browsable from
`/tags`, return 200, and keep passing link equity.

### P1 — titles and snippets

- Optional `seoTitle` frontmatter (`lib/posts.ts`, `app/blog/[slug]/page.tsx`,
  `app/til/[id]/page.tsx`). The `<h1>` keeps the editorial headline; only the
  SERP line changes. Applied to **22 posts**: the 13 titles over 62 characters,
  the whole GPU series (editorial headlines carrying no keyword, e.g. "Scaling
  GPUs past one box" → "Multi-node GPU training: InfiniBand and gang
  scheduling"), and `seven-visual-tools-one-diagram`.
- Hub page titles and descriptions rewritten: `/`, `/blog`, `/til`, `/tags`,
  `/about`, `/resume`, `/graph`, `/dog-eared`, plus `/blog/page/[page]`
  (previously "Blog · Page 2 | Harshit Luthra", 30 chars, with a 42-char
  description).
- `app/graph/page.tsx` expanded from 132 words: a real lead paragraph, a
  "what the clusters are" section generated from the same data the graph draws
  (which is also the crawl path to all 19 tag hubs), a three-question FAQ with
  `FAQPage` JSON-LD, and an `<h1>` of "The knowledge graph" instead of
  "Content Graph".

Verified across all 73 sitemap URLs: **0 titles over 62 chars, 0 under 40; 0
descriptions over 165, 0 under 120.**

### P2 — image weight

| File | Change |
|---|---|
| `scripts/optimize-images.mjs` | New. sharp encodes a `.webp` beside every raster under `public/images` and `public/logo`, capped at 2048 px wide, and records intrinsic dimensions in `lib/image-manifest.json`. |
| `lib/image-manifest.ts` | Resolves `{ width, height, webp }` for a public path. |
| `components/blog/post-image.tsx` | New. `<picture>` with the WebP source plus `width`/`height`. `display:contents` on the wrapper so no existing layout class changes behaviour. |
| `components/blog/markdown-content.tsx`, `components/blog/image-lightbox.tsx` | Render through it. `h-auto` added wherever the new dimension attributes apply. |
| `app/blog/[slug]/page.tsx` | The post hero is the LCP element, so it now loads `eager` with `fetchpriority="high"` instead of lazy. |

91 encodes, **17.1 MB less on the wire**. The named offenders:

| Image | PNG | WebP |
|---|---|---|
| `lazy-security-part-4-dns-records/dns-records-napkin.png` | 2243 K | 204 K |
| `lazy-security-part-2-github-actions/pull-request-target-contrast.png` | 1802 K | 166 K |
| `lazy-security-part-3-unsexy-list/access-plane-contrast.png` | 1141 K | 112 K |
| `lazy-security-part-6-network-plane/tailscale-acl-napkin.png` | 1045 K | 127 K |
| `lazy-security-part-5-dev-laptops/whats-on-your-laptop.png` | 846 K | 97 K |
| `lazy-security-part-1-supply-chain/dependency-tree-contrast.png` | 789 K | 84 K |

Originals are never touched or deleted. Two safety rules in the script, both
earned during this run: a WebP that comes out **larger** than its source is
dropped (which is what happens to five of the six animated GIFs), and an
existing `.webp` is never overwritten. That second one matters because
`public/images/victorialogs-vs-loki/hero.webp` is an author-provided source
image that shares a basename with a `hero.png`; the first version of the script
clobbered it, and it was restored from git. The script now also refuses to offer
a pre-existing `.webp` as the `<source>` for a raster whose aspect ratio does
not match.

### P3 — content

Three posts, written to the repo's own `harshit-voice` skill and checked against
its greps: zero em dashes, zero banned constructions, lowercase sentence-case
headers, balanced code fences, language-tagged blocks, expected-output blocks
next to key commands.

Each carries a `faqs` block. The `FAQPage` JSON-LD was previously emitted with
**no visible counterpart on the page**, which Google's structured-data
guidelines do not allow and which is no use to an AI summariser either. So
`app/blog/[slug]/page.tsx` now renders a "Questions people ask" section from the
same data. This retroactively fixes `self-hosting-simplelogin`,
`github-actions-gitlab-ci-comparison` and `aws-cost-optimization-tricks` too.

`content/til/docker-build-cache-trick.md` expanded from 103 words with the
verification step and the `filepath.Match` caveat.

Four tags cross the hub threshold with the new posts (`containers`, `sre`,
`prometheus`, `ci-cd`) and were given hub copy. Hardcoded post counts were
removed from the hub intros so they stop drifting as posts are added; the count
in the title is computed at render time.

### P4 — internal linking

Nine existing posts and TILs gained in-body contextual links with descriptive
anchors: `kubernetes-debugging-tips`, `prometheus-grafana-monitoring-guide`,
`docker-security-hardening`, `github-actions-gitlab-ci-comparison`,
`gpu-deployments-part-4-observability`, `gpu-deployments-part-7-serving-ops`,
`ja4-fingerprinting-network-security`, `victorialogs-vs-loki`,
`til/kubectl-neat-trick`, `til/docker-build-cache-trick`.

Every new post has **3 or more inbound in-body links** plus the automatic paths
(`/blog`, related-posts, tag hubs, `/graph`, feeds). Posts that previously
linked nowhere now reach their tag hubs.

Series part-to-part links were deliberately **not** added to the GPU series. The
repo's `harshit-voice` skill says `SeriesNav` auto-discovers parts and that
hand-linking them in prose is not house style, and both GPU parts touched end on
a hook into the next part that an appended link block would have broken. Links
were inserted mid-body instead.

`public/llms.txt` and `public/llms-full.txt` updated: the three new posts with
summaries, a new "Topic hubs" section listing all 19 indexable hubs, and the
`/graph` page.

---

## 2. New URLs

| URL | Primary keyword | Intent |
|---|---|---|
| `/blog/kubernetes-crashloopbackoff-triage` | kubernetes crashloopbackoff | Troubleshooting. Someone has a crash-looping pod right now and needs to classify it. |
| `/blog/prometheus-burn-rate-alerts` | prometheus burn rate alerting | Informational / how-to. Replacing threshold alerts with SLO-based ones. |
| `/blog/docker-build-cache-buildkit` | docker build cache ci | Troubleshooting. Build caches locally, rebuilds on every CI run. |

Four tag hubs also became indexable for the first time:
`/tags/containers`, `/tags/sre`, `/tags/prometheus`, `/tags/ci-cd`.

No cannibalisation introduced. The crash-loop post targets the symptom-triage
query; `kubernetes-debugging-tips` keeps the broader "kubernetes debugging"
query and the two now link to each other. The burn-rate post targets alerting;
`prometheus-grafana-monitoring-guide` keeps the setup query.

---

## 3. Build result

```
$ npm run build
✓ Compiled successfully in 1897ms
✓ Generating static pages (285/285)
```

Frontmatter gate also passes:

```
$ node scripts/validate-frontmatter.mjs
Frontmatter OK (0 warning(s)).
```

Verified against a live `npm run start`, crawling every URL in the sitemap:

```
sitemap URLs: 73 | non-200: 0
title >62: []  | title <40: []
desc >165: []  | desc <120: []
noindex in sitemap: []
missing canonical: [] | h1!=1: [] | no json-ld: []
```

Sitemap: **157 URLs → 73.** Tag URLs: **107 → 19.**

---

## 4. What I deliberately did not do

- **No 301s or cross-domain canonicals** between harshit.cloud and
  tinker.expert. Owner decision, not revisited.
- **`middleware.ts` untouched**, including the deliberate 403 on the `curl` UA.
- **No AVIF.** WebP already takes the biggest PNG from 2243 K to 204 K; AVIF
  encoding ~100 images with sharp adds minutes of build-adjacent work for a
  smaller marginal gain. Add `.avif()` to `scripts/optimize-images.mjs` if the
  owner wants it.
- **Five of six animated GIFs left as GIFs.** Animated WebP came out *larger*
  at quality 82 and only beat the GIF by 8% at quality 60, with visible loss on
  chart text. The script detects and skips this case rather than shipping a
  regression.
- **`optimize-images.mjs` is not wired into `npm run build`.** It is slow, its
  output is committed, and images change a few times a year. Run it by hand
  after adding images. Deleting a `.webp` is how you force a re-encode.
- **No hero images for the three new posts.** The `harshit-voice` skill's figure
  pipeline (hand-authored HTML rendered through Playwright in the house
  editorial palette) is a real per-figure design job, and inventing dashboard
  screenshots would have been worse than none. The posts are code-forward with
  expected-output blocks, which the skill explicitly sanctions. OG cards still
  render through `app/blog/[slug]/opengraph-image.tsx`.
- **No fabricated numbers.** The new posts contain no invented benchmarks,
  prices, incident dates, or first-person war stories. Every number is either
  structural (exit code 137, the 10 GB GitHub Actions cache cap) or sourced
  (the 14.4 / 6 / 1 burn-rate tiers are the Google SRE Workbook's). Two draft
  sentences that carried invented measurements were rewritten before commit.
- **Did not "fix" canonicals, JSON-LD, `alt` text, the sitemap format, or
  `robots.txt`.** They were already correct per the brief.
- **Did not touch the `/til` thin-content question beyond one expansion.**
  Three TILs are still under 150 words (`blocking-ai-crawlers` 143,
  `kubectl-neat-trick` 123→~200, `docker-build-cache-trick` 103→~350). See
  below.

---

## 5. Remaining opportunities, ranked, that need the owner

1. **Resubmit the sitemap in Google Search Console for both properties, and
   expect a large "Excluded by 'noindex' tag" count.** 88 tag URLs per domain
   (176 total) just went from indexable to `noindex, follow`. This is the
   intended outcome, but GSC will report it as a coverage regression for
   several weeks and it should not be "fixed" by reverting. Watch total
   impressions rather than indexed-page count.
2. **Confirm tinker.expert is verified separately in GSC.** The two domains are
   independent properties by design and the dual-domain duplicate content is a
   standing, accepted cost. If only harshit.cloud is verified, half the picture
   is invisible.
3. **Review the `devsecops` noindex decision.** It currently defers to
   `lazy-sre` because the post sets are identical. `devsecops` has real search
   volume; if the owner would rather index it and noindex `lazy-sre`, it is one
   line in `DUPLICATE_TAGS`. Better still, publish a post tagged `devsecops`
   without `lazy-sre` and drop the entry entirely.
4. **Backlinks.** Nothing in this repo can move this. The GPU series and the
   Lazy Security series are the two assets worth promoting; both are
   eight- and six-part sequences with original operational detail and neither
   appears to have external citations proportional to their depth.
5. **Eyeball the new visible FAQ section** on `/blog/self-hosting-simplelogin`
   and the three new posts. It renders answers that were previously JSON-LD
   only, so those words are now on the page for the first time and should read
   like the owner wrote them.
6. **Decide on the three remaining sub-150-word TILs.** Options are expand,
   merge into a related post, or `noindex` them the way thin tags now are. I did
   not apply the tag-page threshold logic to `/til` because the brief did not
   ask for it and TILs are a deliberate format, not accidental bloat.
7. **`public/llms-full.txt` still lists `harshit@truefoundry.com`** as the
   contact while `lib/site-config.ts` uses `root@harshit.cloud`. Not an SEO
   issue; worth reconciling.
8. **Consider `next/image` for post bodies.** The current `<picture>` +
   manifest approach gets the WebP and kills CLS without a rewrite, but it
   serves one size to every viewport. Real `srcset` breakpoints would help
   mobile further. This is a larger change to a custom markdown renderer and
   was out of proportion to the remaining win.
