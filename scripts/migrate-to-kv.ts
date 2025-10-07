/**
 * Migration Script: File-based storage → Vercel KV
 * 
 * Run this once after setting up Vercel KV to transfer existing data
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-kv.ts
 */

import { kv } from '@vercel/kv';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

interface LikeData {
  [slug: string]: {
    count: number;
    ips: string[];
  };
}

interface ViewData {
  [slug: string]: {
    count: number;
    uniqueVisitors: string[];
  };
}

async function migrateLikes() {
  const likesFile = path.join(process.cwd(), 'data', 'likes.json');
  
  if (!existsSync(likesFile)) {
    console.log('📭 No likes data to migrate');
    return;
  }

  console.log('📦 Migrating likes...');
  const data: LikeData = JSON.parse(readFileSync(likesFile, 'utf-8'));
  
  let count = 0;
  for (const [slug, postData] of Object.entries(data)) {
    await kv.set(`likes:${slug}`, postData.count);
    
    // Migrate IPs to Redis set
    if (postData.ips.length > 0) {
      await kv.sadd(`likes:${slug}:ips`, ...postData.ips);
    }
    
    count++;
    console.log(`  ✅ ${slug}: ${postData.count} likes`);
  }
  
  console.log(`✨ Migrated ${count} posts with likes\n`);
}

async function migrateViews() {
  const viewsFile = path.join(process.cwd(), 'data', 'views.json');
  
  if (!existsSync(viewsFile)) {
    console.log('📭 No views data to migrate');
    return;
  }

  console.log('📦 Migrating views...');
  const data: ViewData = JSON.parse(readFileSync(viewsFile, 'utf-8'));
  
  let count = 0;
  for (const [slug, postData] of Object.entries(data)) {
    await kv.set(`views:${slug}`, postData.count);
    
    // Migrate unique visitors to Redis set
    if (postData.uniqueVisitors.length > 0) {
      await kv.sadd(`views:${slug}:visitors`, ...postData.uniqueVisitors);
    }
    
    count++;
    console.log(`  ✅ ${slug}: ${postData.count} views`);
  }
  
  console.log(`✨ Migrated ${count} posts with views\n`);
}

async function main() {
  console.log('\n🚀 Starting migration to Vercel KV...\n');

  if (!process.env.KV_REST_API_URL && !process.env.KV_URL) {
    console.error('❌ Error: Vercel KV environment variables not found!');
    console.error('   Please set up Vercel KV first and add the environment variables.');
    console.error('   See DEPLOYMENT_GUIDE.md for instructions.\n');
    process.exit(1);
  }

  try {
    await migrateLikes();
    await migrateViews();
    
    console.log('🎉 Migration complete!\n');
    console.log('Next steps:');
    console.log('  1. Verify data in Vercel KV dashboard');
    console.log('  2. Deploy your application');
    console.log('  3. Test likes and views on production\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

