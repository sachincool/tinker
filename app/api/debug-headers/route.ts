import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const headersList = await headers();
  
  // Convert headers to object
  const headersObj: Record<string, string> = {};
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });
  
  return NextResponse.json({
    'x-forwarded-host': headersList.get('x-forwarded-host'),
    'host': headersList.get('host'),
    'x-forwarded-for': headersList.get('x-forwarded-for'),
    'x-real-ip': headersList.get('x-real-ip'),
    'all-headers': headersObj
  }, {
    headers: {
      'Cache-Control': 'no-store',
    }
  });
}

