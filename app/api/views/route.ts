import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Upstash Redis client (uses KV_* env vars from Vercel/Upstash integration)
let redis = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
} catch (error) {
  console.error('Redis initialization error:', error);
}

// Hybrid storage: Upstash Redis in production, file-based for local dev
const USE_REDIS = !!redis;

// CRITICAL: On serverless (Vercel), Redis is REQUIRED for persistence
// The filesystem is read-only, so /tmp won't persist between invocations
// For local dev, use data/ directory
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'views.json');

// Warn if running on Vercel without Redis
if (IS_VERCEL && !USE_REDIS) {
  console.error('⚠️  CRITICAL: Running on Vercel without Redis! Data will NOT persist.');
  console.error('Set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.');
}

interface ViewData {
  [slug: string]: {
    count: number;
    uniqueVisitors: string[];
  };
}

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read views from storage
async function readViews(): Promise<ViewData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Write views to storage
async function writeViews(data: ViewData) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get client fingerprint (respects proxies)
function getClientFingerprint(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a hash of user agent + accept-language
  const ua = req.headers.get('user-agent') || '';
  const lang = req.headers.get('accept-language') || '';
  return Buffer.from(ua + lang).toString('base64').substring(0, 32);
}

// GET /api/views?slug=post-slug
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    if (USE_REDIS && redis) {
      try {
        // Use Upstash Redis (production)
        const count = await redis.get<number>(`views:${slug}`) || 0;
        return NextResponse.json({ count });
      } catch (redisError) {
        console.error('Redis GET failed, falling back to file storage:', redisError);
        // Fall through to file-based storage
      }
    }
    
    // Use file-based storage (local dev or fallback)
    const data = await readViews();
    const postData = data[slug] || { count: 0, uniqueVisitors: [] };
    return NextResponse.json({ count: postData.count });
  } catch (error) {
    console.error('Error reading views:', error);
    return NextResponse.json({ 
      error: 'Failed to read views',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST /api/views
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    if (USE_REDIS && redis) {
      try {
        // Use Upstash Redis (production)
        const key = `views:${slug}`;

        // Always increment - track total page views
        await redis.incr(key);
        const count = (await redis.get<number>(key)) || 0;

        return NextResponse.json({
          count,
          isNewView: true
        });
      } catch (redisError) {
        console.error('Redis operation failed, falling back to file storage:', redisError);
        // Fall through to file-based storage
      }
    }

    // File-based storage (fallback or local dev)
    const data = await readViews();

    if (!data[slug]) {
      data[slug] = { count: 0, uniqueVisitors: [] };
    }

    const postData = data[slug];
    
    // Always increment - track total page views
    postData.count += 1;

    await writeViews(data);

    return NextResponse.json({
      count: postData.count,
      isNewView: true
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Redis available:', !!redis);
    return NextResponse.json({
      error: 'Failed to track view',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

