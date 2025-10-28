import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Upstash Redis client (uses KV_* env vars from Vercel/Upstash integration)
let redis: Redis | null = null;
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
const DATA_FILE = path.join(DATA_DIR, 'likes.json');

// Warn if running on Vercel without Redis
if (IS_VERCEL && !USE_REDIS) {
  console.error('⚠️  CRITICAL: Running on Vercel without Redis! Data will NOT persist.');
  console.error('Set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.');
}

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

    if (USE_REDIS && redis) {
      try {
        // Use Upstash Redis (production)
        const key = `likes:${slug}`;
        const count = (await redis.get<number>(key)) || 0;

        // Don't return liked status - client handles this via localStorage
        return NextResponse.json({ count });
      } catch (redisError) {
        console.error('Redis GET failed, falling back to file storage:', redisError);
        // Fall through to file-based storage
      }
    }

    // File-based storage (fallback or local dev)
    const data = await readLikes();
    const postData = data[slug] || { count: 0, ips: [] };
    return NextResponse.json({
      count: postData.count
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
        const rateLimitKey = `ratelimit:like:${clientIP}`;

        // Rate limiting: max 10 actions per hour per IP (prevents spam)
        const recentActions = (await redis.get<number>(rateLimitKey)) || 0;
        if (recentActions >= 10) {
          return NextResponse.json({ 
            error: 'Rate limit exceeded. Please try again later.' 
          }, { status: 429 });
        }

        // Update like count (client manages their own state)
        if (action === 'like') {
          await redis.incr(key);
        } else if (action === 'unlike') {
          await redis.decr(key);
        }

        // Track rate limit (expires after 1 hour)
        await redis.incr(rateLimitKey);
        await redis.expire(rateLimitKey, 3600); // 1 hour

        const count = Math.max(0, (await redis.get<number>(key)) || 0);

        return NextResponse.json({ count, success: true });
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

    // Rate limiting for file-based storage
    const now = Date.now();
    const recentIPs = postData.ips.filter(ip => {
      // Simple rate limit: check if IP appears multiple times
      return ip === clientIP;
    });
    
    if (recentIPs.length >= 10) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }

    // Update count
    if (action === 'like') {
      postData.count += 1;
      postData.ips.push(clientIP); // Track for rate limiting only
    } else if (action === 'unlike') {
      postData.count = Math.max(0, postData.count - 1);
    }

    // Keep only last 1000 IPs for rate limiting
    if (postData.ips.length > 1000) {
      postData.ips = postData.ips.slice(-1000);
    }

    await writeLikes(data);

    return NextResponse.json({
      count: postData.count,
      success: true
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

