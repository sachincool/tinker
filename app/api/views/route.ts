// ponytail: read-only view counts served from committed data/views.json. Live tracking needs a KV store (Vercel KV / Upstash) — the filesystem is read-only on Vercel.
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'views.json');

interface ViewData {
  [slug: string]: {
    count: number;
    uniqueVisitors: string[];
  };
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readViews(): Promise<ViewData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// GET /api/views?slug=post-slug
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const data = await readViews();
    const postData = data[slug] || { count: 0, uniqueVisitors: [] };
    return NextResponse.json({ count: postData.count });
  } catch (error) {
    console.error('Error reading views:', error);
    return NextResponse.json({ error: 'Failed to read views' }, { status: 500 });
  }
}
