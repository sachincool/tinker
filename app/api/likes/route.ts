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
// Use /tmp on Vercel (serverless), cwd for local dev
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'likes.json');

interface LikeData {
  [slug: string]: {
    count: number;
    ips: string[];
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

// Read likes from storage
async function readLikes(): Promise<LikeData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Write likes to storage
async function writeLikes(data: LikeData) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get client IP (respects proxies)
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a hash of user agent + accept-language for basic fingerprinting
  const ua = req.headers.get('user-agent') || '';
  const lang = req.headers.get('accept-language') || '';
  return Buffer.from(ua + lang).toString('base64').substring(0, 32);
}

// GET /api/likes?slug=post-slug
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    const clientIP = getClientIP(req);

    if (USE_REDIS && redis) {
      try {
        // Use Upstash Redis (production)
        const key = `likes:${slug}`;
        const ipsKey = `likes:${slug}:ips`;

        const count = (await redis.get<number>(key)) || 0;
        const liked = (await redis.sismember(ipsKey, clientIP)) === 1;

        return NextResponse.json({ count, liked });
      } catch (redisError) {
        console.error('Redis GET failed, falling back to file storage:', redisError);
        // Fall through to file-based storage
      }
    }

    // File-based storage (fallback or local dev)
    const data = await readLikes();
    const postData = data[slug] || { count: 0, ips: [] };
    return NextResponse.json({
      count: postData.count,
      liked: postData.ips.includes(clientIP)
    });
  } catch (error) {
    console.error('Error reading likes:', error);
    return NextResponse.json({ error: 'Failed to read likes' }, { status: 500 });
  }
}

// POST /api/likes
export async function POST(req: NextRequest) {
  try {
    const { slug, action } = await req.json();

    if (!slug || !action) {
      return NextResponse.json({ error: 'Slug and action required' }, { status: 400 });
    }

    const clientIP = getClientIP(req);

    if (USE_REDIS && redis) {
      try {
        // Use Upstash Redis (production)
        const key = `likes:${slug}`;
        const ipsKey = `likes:${slug}:ips`;

        const hasLiked = (await redis.sismember(ipsKey, clientIP)) === 1;

        if (action === 'like' && !hasLiked) {
          await redis.incr(key);
          await redis.sadd(ipsKey, clientIP);
        } else if (action === 'unlike' && hasLiked) {
          await redis.decr(key);
          await redis.srem(ipsKey, clientIP);
        }

        const count = (await redis.get<number>(key)) || 0;
        const liked = (await redis.sismember(ipsKey, clientIP)) === 1;

        return NextResponse.json({ count, liked });
      } catch (redisError) {
        console.error('Redis operation failed, falling back to file storage:', redisError);
        // Fall through to file-based storage
      }
    }

    // File-based storage (fallback or local dev)
    const data = await readLikes();

    if (!data[slug]) {
      data[slug] = { count: 0, ips: [] };
    }

    const postData = data[slug];
    const hasLiked = postData.ips.includes(clientIP);

    if (action === 'like' && !hasLiked) {
      postData.count += 1;
      postData.ips.push(clientIP);
    } else if (action === 'unlike' && hasLiked) {
      postData.count = Math.max(0, postData.count - 1);
      postData.ips = postData.ips.filter(ip => ip !== clientIP);
    }

    await writeLikes(data);

    return NextResponse.json({
      count: postData.count,
      liked: postData.ips.includes(clientIP)
    });
  } catch (error) {
    console.error('Error updating likes:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Redis available:', !!redis);
    console.error('Env vars:', {
      hasUrl: !!process.env.KV_REST_API_URL,
      hasToken: !!process.env.KV_REST_API_TOKEN
    });
    return NextResponse.json({
      error: 'Failed to update likes',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

