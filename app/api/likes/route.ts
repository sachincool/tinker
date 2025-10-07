import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import path from 'path';

// Hybrid storage: Vercel KV in production, file-based for local dev
const USE_KV = !!(process.env.KV_REST_API_URL || process.env.KV_URL);
const DATA_FILE = path.join(process.cwd(), 'data', 'likes.json');

interface LikeData {
  [slug: string]: {
    count: number;
    ips: string[];
  };
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
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

    if (USE_KV) {
      // Use Vercel KV (production)
      const count = await kv.get<number>(`likes:${slug}`) || 0;
      return NextResponse.json({ count, liked: false });
    } else {
      // Use file-based storage (local dev)
      const data = await readLikes();
      const postData = data[slug] || { count: 0, ips: [] };
      return NextResponse.json({ 
        count: postData.count,
        liked: false
      });
    }
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

    if (USE_KV) {
      // Use Vercel KV (production)
      const key = `likes:${slug}`;
      const ipsKey = `likes:${slug}:ips`;
      
      const hasLiked = await kv.sismember(ipsKey, clientIP);

      if (action === 'like' && !hasLiked) {
        await kv.incr(key);
        await kv.sadd(ipsKey, clientIP);
      } else if (action === 'unlike' && hasLiked) {
        await kv.decr(key);
        await kv.srem(ipsKey, clientIP);
      }

      const count = await kv.get<number>(key) || 0;
      const liked = await kv.sismember(ipsKey, clientIP);

      return NextResponse.json({ count, liked });
    } else {
      // Use file-based storage (local dev)
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
    }
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
  }
}

