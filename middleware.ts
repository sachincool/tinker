import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/lib/site-config';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // No curl. The matcher below already exempts /api, feeds, sitemap and robots,
  // so RSS readers and uptime checks keep working — only human-facing pages
  // get the door slammed. https://harshit.cloud/lab explains the joke.
  const ua = request.headers.get('user-agent') || '';
  if (/\bcurl\//i.test(ua)) {
    return new NextResponse(
      "403 — nice try.\n\nthis site doesn't do curl. spin up a browser, or pipe it\nthrough proxy.sachin.cool like a responsible adult.\n\n(feeds still work: /rss.xml, /atom.xml — knock yourself out.)\n",
      {
        status: 403,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      }
    );
  }

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

  // Advertise the v3 onion mirror. Tor Browser reads Onion-Location (only over
  // HTTPS) and offers the .onion equivalent of whatever page you're on.
  const res = NextResponse.next();
  res.headers.set(
    'Onion-Location',
    `http://${siteConfig.onion}${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return res;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals, static files, and feed/crawler routes
    '/((?!_next/static|_next/image|favicon.ico|api|rss|atom|sitemap|robots).*)',
  ],
};
