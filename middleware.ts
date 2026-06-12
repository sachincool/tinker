import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Redirect www to apex — www serves identical pages with host-derived
  // canonicals, which Google flags as duplicates of harshit.cloud
  if (hostname === 'www.harshit.cloud') {
    const url = request.nextUrl.clone();
    url.host = 'harshit.cloud';
    return NextResponse.redirect(url, 301);
  }

  // Redirect blog subdomain to /blog path
  if (hostname === 'blog.harshit.cloud' || hostname === 'www.blog.harshit.cloud') {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;
    
    // Construct the redirect URL
    url.host = 'harshit.cloud';
    url.pathname = pathname === '/' ? '/blog' : `/blog${pathname}`;
    
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals, static files, and feed/crawler routes
    '/((?!_next/static|_next/image|favicon.ico|api|rss|atom|sitemap|robots).*)',
  ],
};
