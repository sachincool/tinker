#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'scripts', 'syndication-state.json');
const SITE_URL = 'https://harshit.cloud';

// --- load .env.local manually so we don't pull in dotenv ---
async function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  const raw = await fs.readFile(envPath, 'utf8').catch(() => '');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

// --- CLI args ---
function parseArgs() {
  const args = { platform: 'all', type: 'all', post: null, all: false, dryRun: false, throttle: 4000 };
  for (const arg of process.argv.slice(2)) {
    if (arg === '--all') args.all = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--post=')) args.post = arg.slice(7);
    else if (arg.startsWith('--platform=')) args.platform = arg.slice(11);
    else if (arg.startsWith('--type=')) args.type = arg.slice(7);
    else if (arg.startsWith('--throttle=')) args.throttle = parseInt(arg.slice(11), 10);
  }
  return args;
}

// --- state file ---
async function loadState() {
  try { return JSON.parse(await fs.readFile(STATE_PATH, 'utf8')); }
  catch { return { devto: {}, hashnode: {}, hashnode_publication_id: null }; }
}
async function saveState(state) {
  await fs.writeFile(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

// --- post discovery ---
async function discoverPosts(type) {
  const types = type === 'all' ? ['blog', 'til'] : [type];
  const posts = [];
  for (const t of types) {
    const dir = path.join(ROOT, 'content', t);
    const files = await fs.readdir(dir).catch(() => []);
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const slug = file.replace(/\.md$/, '');
      const raw = await fs.readFile(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
      posts.push({ slug, type: t, frontmatter: data, body: content });
    }
  }
  return posts;
}

// --- transform: rewrite relative image paths to absolute, extract first image as cover, strip it from body ---
function rewriteImagesAbsolute(md) {
  return md
    .replace(/!\[([^\]]*)]\((\/[^)\s]+)([^)]*)\)/g, (_, alt, src, rest) => `![${alt}](${SITE_URL}${src}${rest})`)
    .replace(/<img([^>]*?)src="(\/[^"]+)"/g, (_, pre, src) => `<img${pre}src="${SITE_URL}${src}"`);
}

function extractFirstImage(md) {
  const noCode = md.replace(/```[\s\S]*?```/g, '');
  const m = noCode.match(/!\[([^\]]*)]\(([^)\s]+)/);
  return m ? { alt: m[1].trim(), src: m[2].trim() } : null;
}

function stripFirstImageBlock(md) {
  const lines = md.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) inFence = !inFence;
    if (inFence) continue;
    if (/^!\[[^\]]*]\([^)\s]+/.test(lines[i])) {
      lines.splice(i, 1);
      while (i < lines.length && lines[i].trim() === '') lines.splice(i, 1);
      if (i < lines.length && /^\*[^*].+\*\s*$/.test(lines[i])) {
        lines.splice(i, 1);
        while (i < lines.length && lines[i].trim() === '') lines.splice(i, 1);
      }
      break;
    }
  }
  return lines.join('\n');
}

function canonicalUrl(post) {
  return `${SITE_URL}/${post.type}/${post.slug}`;
}

function normaliseTags(tags, max = 4) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '').trim())
    .filter(Boolean)
    .slice(0, max);
}

// --- dev.to ---
async function publishToDevTo(post, { dryRun }) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) throw new Error('DEVTO_API_KEY missing');

  const cover = extractFirstImage(post.body);
  const bodyAbs = rewriteImagesAbsolute(stripFirstImageBlock(post.body));

  // dev.to can't backdate. Prepend an origin note so the reader sees the real date.
  const originDate = post.frontmatter.date
    ? new Date(post.frontmatter.date).toISOString().slice(0, 10)
    : null;
  const originNote = originDate
    ? `*Originally published at [harshit.cloud](${canonicalUrl(post)}) on ${originDate}.*\n\n---\n\n`
    : '';

  const article = {
    title: post.frontmatter.title || post.slug,
    body_markdown: originNote + bodyAbs,
    published: true,
    canonical_url: canonicalUrl(post),
    description: post.frontmatter.excerpt || undefined,
    tags: normaliseTags(post.frontmatter.tags, 4),
  };
  if (cover) article.main_image = cover.src.startsWith('/') ? SITE_URL + cover.src : cover.src;

  if (dryRun) return { dryRun: true, article };

  // dev.to rate limit: 429 → wait and retry up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/vnd.forem.api-v1+json' },
      body: JSON.stringify({ article }),
    });
    const text = await res.text();
    if (res.status === 429) {
      const waitMs = 35_000 * attempt;
      console.log(`  devto      … 429 rate-limited, waiting ${waitMs / 1000}s (attempt ${attempt}/3)`);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }
    if (!res.ok) throw new Error(`dev.to ${res.status}: ${text.slice(0, 400)}`);
    const data = JSON.parse(text);
    return { url: data.url, id: data.id };
  }
  throw new Error('dev.to 429 after 3 retries');
}

// --- Hashnode ---
async function hashnodeGraphQL(query, variables) {
  const token = process.env.HASHNODE_TOKEN;
  if (!token) throw new Error('HASHNODE_TOKEN missing');
  const res = await fetch('https://gql.hashnode.com/', {
    method: 'POST',
    headers: { 'Authorization': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error('hashnode GQL: ' + JSON.stringify(json.errors));
  return json.data;
}

async function getHashnodePublicationId(state) {
  if (state.hashnode_publication_id) return state.hashnode_publication_id;
  const host = process.env.HASHNODE_PUBLICATION_HOST;
  if (!host) throw new Error('HASHNODE_PUBLICATION_HOST missing');
  const data = await hashnodeGraphQL(
    `query Pub($host: String!) { publication(host: $host) { id title } }`,
    { host }
  );
  if (!data.publication) throw new Error(`Hashnode publication not found for host ${host}`);
  state.hashnode_publication_id = data.publication.id;
  return data.publication.id;
}

async function publishToHashnode(post, publicationId, { dryRun }) {
  const cover = extractFirstImage(post.body);
  const bodyAbs = rewriteImagesAbsolute(stripFirstImageBlock(post.body));
  const coverAbs = cover ? (cover.src.startsWith('/') ? SITE_URL + cover.src : cover.src) : null;
  const publishedAt = post.frontmatter.date ? new Date(post.frontmatter.date).toISOString() : undefined;

  const tags = normaliseTags(post.frontmatter.tags, 5).map(slug => ({ slug, name: slug }));

  const input = {
    publicationId,
    title: post.frontmatter.title || post.slug,
    contentMarkdown: bodyAbs,
    slug: post.slug,
    tags,
    originalArticleURL: canonicalUrl(post),
    publishedAt,
  };
  if (coverAbs) input.coverImageOptions = { coverImageURL: coverAbs };

  if (dryRun) return { dryRun: true, input };

  const data = await hashnodeGraphQL(
    `mutation Publish($input: PublishPostInput!) {
      publishPost(input: $input) { post { id slug url } }
    }`,
    { input }
  );
  return { url: data.publishPost.post.url, id: data.publishPost.post.id, slug: data.publishPost.post.slug };
}

// --- main ---
async function main() {
  await loadEnv();
  const args = parseArgs();
  const state = await loadState();

  if (!args.all && !args.post) {
    console.error('Usage: syndicate.mjs [--all | --post=<slug>] [--platform=devto|hashnode|all] [--type=blog|til|all] [--dry-run] [--throttle=<ms>]');
    process.exit(1);
  }

  let posts = await discoverPosts(args.type);
  if (args.post) posts = posts.filter(p => p.slug === args.post);
  if (posts.length === 0) { console.error('No posts matched'); process.exit(1); }

  posts.sort((a, b) => new Date(a.frontmatter.date) - new Date(b.frontmatter.date));

  const wantDevto = args.platform === 'all' || args.platform === 'devto';
  const wantHashnode = args.platform === 'all' || args.platform === 'hashnode';

  let publicationId = null;
  if (wantHashnode) {
    publicationId = await getHashnodePublicationId(state);
    console.log(`Hashnode publication: ${publicationId}`);
  }

  let i = 0;
  for (const post of posts) {
    i++;
    const key = `${post.type}/${post.slug}`;
    console.log(`\n[${i}/${posts.length}] ${key}  (${post.frontmatter.date})`);

    if (wantDevto) {
      if (state.devto[key] && !args.dryRun) {
        console.log(`  devto      ↩ already syndicated: ${state.devto[key].url}`);
      } else {
        try {
          const out = await publishToDevTo(post, { dryRun: args.dryRun });
          if (args.dryRun) console.log(`  devto      ✎ dry-run ok (${out.article.tags.join(',')})`);
          else {
            console.log(`  devto      ✓ ${out.url}`);
            state.devto[key] = { id: out.id, url: out.url, at: new Date().toISOString() };
            await saveState(state);
          }
        } catch (e) {
          console.log(`  devto      ✗ ${e.message}`);
        }
      }
    }

    if (wantHashnode) {
      if (state.hashnode[key] && !args.dryRun) {
        console.log(`  hashnode   ↩ already syndicated: ${state.hashnode[key].url}`);
      } else {
        try {
          const out = await publishToHashnode(post, publicationId, { dryRun: args.dryRun });
          if (args.dryRun) console.log(`  hashnode   ✎ dry-run ok`);
          else {
            console.log(`  hashnode   ✓ ${out.url}`);
            state.hashnode[key] = { id: out.id, url: out.url, slug: out.slug, at: new Date().toISOString() };
            await saveState(state);
          }
        } catch (e) {
          console.log(`  hashnode   ✗ ${e.message}`);
        }
      }
    }

    if (!args.dryRun && i < posts.length) await new Promise(r => setTimeout(r, args.throttle));
  }

  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
