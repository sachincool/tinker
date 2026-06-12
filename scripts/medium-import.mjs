#!/usr/bin/env node
// medium-import.mjs — semi-automated Medium importer.
//
// Medium has no API for new accounts, and https://medium.com/p/import sits
// behind behavioural bot detection (accepts paste events, rejects programmatic
// typing, silently rate-limits at ~9 imports per 10 minutes — see
// medium-retry-snippet.js for the history). So this can't run in CI.
//
// What it does instead: drives the import page in a real, headed Chrome with a
// persistent profile. First run, log in to Medium once in the window that
// opens; the session sticks for subsequent runs. Imports land as DRAFTS at
// https://medium.com/me/stories/drafts — publish manually. Medium reads the
// canonical URL and publish date from the source page's meta tags.
//
// The post must be LIVE on harshit.cloud before importing (Medium fetches the
// public URL), so deploy first, then run this.
//
// usage:
//   node scripts/medium-import.mjs --dry-run          # list pending posts
//   node scripts/medium-import.mjs --post=<slug>      # import one post
//   node scripts/medium-import.mjs                    # import all pending (max --limit)
//
// State lives in syndication-state.json under "medium", same keys as devto
// ("blog/<slug>", "til/<slug>"). Posts already present there are skipped.

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'scripts', 'syndication-state.json');
const SITE_URL = 'https://harshit.cloud';
const IMPORT_URL = 'https://medium.com/p/import';
const PROFILE_DIR = path.join(os.homedir(), '.cache', 'medium-import-profile');
// Medium's importer silently stops responding at ~9 imports per 10 minutes.
const IMPORT_DELAY_MS = 75_000;
const DEFAULT_LIMIT = 8;

function parseArgs() {
  const args = { post: null, dryRun: false, pending: false, limit: DEFAULT_LIMIT };
  for (const arg of process.argv.slice(2)) {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--pending') args.pending = true;
    else if (arg.startsWith('--post=')) args.post = arg.slice(7);
    else if (arg.startsWith('--limit=')) args.limit = parseInt(arg.slice(8), 10);
  }
  return args;
}

async function loadState() {
  return JSON.parse(await fs.readFile(STATE_PATH, 'utf8'));
}
async function saveState(state) {
  await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

async function discoverPosts() {
  const posts = [];
  for (const type of ['blog', 'til']) {
    const dir = path.join(ROOT, 'content', type);
    const files = await fs.readdir(dir).catch(() => []);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const slug = file.replace(/\.md$/, '');
      const raw = await fs.readFile(path.join(dir, file), 'utf8');
      const { data } = matter(raw);
      posts.push({ slug, type, title: data.title || slug });
    }
  }
  return posts;
}

async function isLive(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.ok;
  } catch {
    return false;
  }
}

// Paste the URL into the importer's contenteditable. Real paste events get
// through Medium's input filtering; element.value assignment and key events
// do not.
async function pasteAndImport(page, url) {
  await page.evaluate((importUrl) => {
    const div = document.querySelectorAll('[contenteditable]')[0];
    if (!div) throw new Error('no contenteditable on page');
    div.focus();
    div.textContent = '';
    const dt = new DataTransfer();
    dt.setData('text/plain', importUrl);
    div.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, url);
  await page.getByRole('button', { name: 'Import' }).click();
}

// Success is the draft editor opening (or a link to it appearing). The id in
// /p/<id>/edit is the mediumId. A timeout usually means the silent rate limit.
async function waitForDraft(page, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const m = page.url().match(/\/p\/([0-9a-f]+)\/edit/);
    if (m) return m[1];
    const href = await page
      .locator('a[href*="/edit"]')
      .first()
      .getAttribute('href', { timeout: 1000 })
      .catch(() => null);
    const lm = href && href.match(/\/p\/([0-9a-f]+)\/edit/);
    if (lm) return lm[1];
    await page.waitForTimeout(2000);
  }
  return null;
}

async function ensureLoggedIn(page) {
  await page.goto(IMPORT_URL, { waitUntil: 'domcontentloaded' });
  if (await page.locator('[contenteditable]').count()) return;
  console.log('  Not logged in. Log in to Medium in the browser window (waiting up to 5 minutes)...');
  const deadline = Date.now() + 300_000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(3000);
    if (!page.url().startsWith(IMPORT_URL)) await page.goto(IMPORT_URL, { waitUntil: 'domcontentloaded' }).catch(() => {});
    if (await page.locator('[contenteditable]').count()) return;
  }
  throw new Error('timed out waiting for Medium login');
}

async function main() {
  const args = parseArgs();
  const state = await loadState();
  state.medium ||= {};

  let pending = (await discoverPosts()).filter(p => !state.medium[`${p.type}/${p.slug}`]);
  if (args.post) pending = pending.filter(p => p.slug === args.post);

  // --pending: machine-readable list for CI (no browser, no headers, exit 0)
  if (args.pending) {
    for (const p of pending) console.log(`${p.type}/${p.slug} — ${p.title}`);
    return;
  }

  if (!pending.length) {
    console.log(args.post ? `"${args.post}" is already on Medium (or doesn't exist).` : 'Nothing pending — every post is accounted for in syndication-state.json.');
    return;
  }

  console.log(`Pending for Medium (${pending.length}):`);
  for (const p of pending) console.log(`  ${p.type}/${p.slug} — ${p.title}`);
  if (args.dryRun) return;

  const batch = pending.slice(0, args.limit);
  if (batch.length < pending.length) {
    console.log(`Importing first ${batch.length} (rate limit safety, --limit=${args.limit}). Re-run for the rest after ~10 minutes.`);
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
    viewport: null,
  });
  const page = context.pages()[0] || (await context.newPage());

  try {
    await ensureLoggedIn(page);

    for (const [i, post] of batch.entries()) {
      const key = `${post.type}/${post.slug}`;
      const url = `${SITE_URL}/${post.type}/${post.slug}`;
      console.log(`\n[${i + 1}/${batch.length}] ${key}`);

      if (!(await isLive(url))) {
        console.log(`  ✗ ${url} is not live yet — deploy first, skipping.`);
        continue;
      }

      if (i > 0) {
        console.log(`  waiting ${IMPORT_DELAY_MS / 1000}s (importer rate limit)...`);
        await page.waitForTimeout(IMPORT_DELAY_MS);
      }

      await page.goto(IMPORT_URL, { waitUntil: 'domcontentloaded' });
      await page.locator('[contenteditable]').first().waitFor({ timeout: 15_000 });
      await pasteAndImport(page, url);

      const mediumId = await waitForDraft(page);
      if (!mediumId) {
        console.log('  ✗ no draft appeared within 90s — likely the silent rate limit. Stopping; re-run in ~10 minutes.');
        break;
      }

      state.medium[key] = {
        mediumId,
        editUrl: `https://medium.com/p/${mediumId}/edit`,
        at: new Date().toISOString(),
      };
      await saveState(state);
      console.log(`  ✓ imported as draft: https://medium.com/p/${mediumId}/edit`);
    }
  } finally {
    await context.close();
  }

  console.log('\nDone. Drafts are at https://medium.com/me/stories/drafts — publish from there.');
  console.log('Remember to commit scripts/syndication-state.json.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
