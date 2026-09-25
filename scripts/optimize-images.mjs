#!/usr/bin/env node
// optimize-images.mjs — write a .webp next to every raster under public/, and
// record intrinsic dimensions so the markdown renderer can reserve space.
//
// Originals are never touched or deleted. The .webp sits alongside as
// `foo.png` -> `foo.webp`, and the renderer offers it through a <picture>
// source; any browser that can't take it falls back to the original.
//
// Two outputs:
//   public/images/**/*.webp   — the smaller encodes
//   lib/image-manifest.json   — { "/images/a/b.png": [width, height, 1] }
//                               the trailing 1 means "a .webp exists"
//
// Run after adding images: `node scripts/optimize-images.mjs`
// ponytail: not wired into `npm run build`. It's slow, the output is
// committed, and images change a few times a year. Re-run it by hand.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const MANIFEST = path.join(ROOT, 'lib', 'image-manifest.json');

const SOURCE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif']);

// Several diagrams are exported at 6000px wide. The article column is ~700 CSS
// px and the lightbox caps at 1280, so 2048 covers both with headroom for a
// retina panel. The original stays on disk at full size either way.
const MAX_WIDTH = 2048;
// Scanned roots, relative to public/. Favicons and the manifest icons are
// referenced by exact filename in <head> and must not gain a sibling.
const ROOTS = ['images', 'logo'];

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

const manifest = {};
let written = 0;
let skipped = 0;
let savedBytes = 0;

for (const root of ROOTS) {
  const dir = path.join(PUBLIC, root);
  if (!(await fs.stat(dir).catch(() => null))) continue;

  for await (const file of walk(dir)) {
    const ext = path.extname(file).toLowerCase();
    const publicPath = '/' + path.relative(PUBLIC, file).split(path.sep).join('/');

    if (ext === '.webp') {
      // Already a webp in the source tree — record its size, nothing to encode.
      const meta = await sharp(file).metadata();
      manifest[publicPath] = [meta.width, meta.height, 0];
      continue;
    }
    if (!SOURCE_EXT.has(ext)) continue;

    const animated = ext === '.gif';
    const image = sharp(file, animated ? { animated: true } : {});
    const meta = await image.metadata();
    // An animated GIF reports the height of the whole filmstrip; pages is the
    // frame count, so the on-screen height is one frame's worth.
    const height = animated && meta.pages > 1 ? Math.round(meta.height / meta.pages) : meta.height;

    const out = file.slice(0, -ext.length) + '.webp';
    const srcSize = (await fs.stat(file)).size;

    // Never overwrite an existing .webp. Some of them are author-provided
    // source images that happen to share a basename with a PNG
    // (victorialogs-vs-loki/hero.webp is the one in this repo), and clobbering
    // those with a re-encode of the PNG silently swaps the published asset.
    // To force a re-encode after changing the settings above, delete the .webp
    // first — that is what the destructive step should look like.
    if (await fs.stat(out).catch(() => null)) {
      skipped++;
      // ...and if that pre-existing .webp is a different picture rather than an
      // encode of this one, don't offer it as a <source> for it.
      const outMeta = await sharp(out).metadata();
      const sameShape =
        Math.abs(outMeta.width / outMeta.height - meta.width / height) < 0.01;
      if (!sameShape) {
        console.log(`  ! ${publicPath}: ${path.basename(out)} is a different image, not linked`);
      }
      manifest[publicPath] = [meta.width, height, sameShape ? 1 : 0];
      continue;
    }

    await image
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(out);
    const outSize = (await fs.stat(out)).size;

    if (outSize >= srcSize) {
      // Rare, but a webp bigger than the original is worse than no webp.
      await fs.unlink(out);
      manifest[publicPath] = [meta.width, height, 0];
      console.log(`  = ${publicPath} (webp was larger, dropped)`);
      continue;
    }

    manifest[publicPath] = [meta.width, height, 1];
    written++;
    savedBytes += srcSize - outSize;
    console.log(
      `  + ${publicPath} ${(srcSize / 1024).toFixed(0)}K -> ${(outSize / 1024).toFixed(0)}K`
    );
  }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await fs.writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');

console.log(
  `\n${written} encoded, ${skipped} up to date, ${Object.keys(sorted).length} in manifest, ` +
    `${(savedBytes / 1024 / 1024).toFixed(1)} MB saved on the wire.`
);
