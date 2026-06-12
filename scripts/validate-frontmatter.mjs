#!/usr/bin/env node
// validate-frontmatter.mjs — gate bad frontmatter before it syndicates.
//
// dev.to descriptions, Buttondown emails, and OG cards all consume frontmatter
// blindly; a missing excerpt or malformed date degrades three platforms in one
// push. This runs as the first step of the syndicate and newsletter workflows.
//
// Hard errors (exit 1): missing/empty title, missing/invalid date, missing
// excerpt, tags not a non-empty array, cover path that doesn't exist.
// Warnings (exit 0): long excerpts, >6 tags, non-kebab-case tags.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
const warnings = [];

for (const type of ['blog', 'til']) {
  const dir = path.join(ROOT, 'content', type);
  const files = (await fs.readdir(dir).catch(() => [])).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const key = `${type}/${file}`;
    let data;
    try {
      ({ data } = matter(await fs.readFile(path.join(dir, file), 'utf8')));
    } catch (e) {
      errors.push(`${key}: frontmatter does not parse — ${e.message}`);
      continue;
    }

    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      errors.push(`${key}: missing title`);
    }
    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date).slice(0, 10)) || isNaN(Date.parse(data.date))) {
      errors.push(`${key}: date must be ISO YYYY-MM-DD (got ${JSON.stringify(data.date)})`);
    }
    if (!data.excerpt || typeof data.excerpt !== 'string' || !data.excerpt.trim()) {
      errors.push(`${key}: missing excerpt (becomes the dev.to description and newsletter body)`);
    } else if (data.excerpt.length > 250) {
      warnings.push(`${key}: excerpt is ${data.excerpt.length} chars (aim for ~140, it doubles as the OG description)`);
    }
    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      errors.push(`${key}: tags must be a non-empty array`);
    } else {
      if (data.tags.length > 6) warnings.push(`${key}: ${data.tags.length} tags (house style caps at 6)`);
      for (const t of data.tags) {
        if (typeof t !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(t)) {
          warnings.push(`${key}: tag ${JSON.stringify(t)} is not lowercase-kebab-case`);
        }
      }
    }
    if (data.cover && typeof data.cover === 'string' && data.cover.startsWith('/')) {
      const coverPath = path.join(ROOT, 'public', data.cover);
      await fs.access(coverPath).catch(() => errors.push(`${key}: cover ${data.cover} not found under public/`));
    }
  }
}

for (const w of warnings) console.log(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} frontmatter error(s).`);
  process.exit(1);
}
console.log(`Frontmatter OK (${warnings.length} warning(s)).`);
