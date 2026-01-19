# Work Plan: Blog Enhancements - TILs Stats, Redirect, Newsletter

**Created**: 2026-01-19
**Status**: Ready for Implementation
**Assignee**: frontend-ui-ux-engineer

---

## Overview

Three enhancements to harshit.cloud blog:
1. Make TILs stats dynamic (show actual count)
2. Redirect blog.harshit.cloud → harshit.cloud/blog (preserve paths)
3. Add Buttondown newsletter integration (footer, homepage, blog posts)

---

## Task 1: Dynamic TILs Count

### Current State
- **Homepage** (`/app/home-page-content.tsx` line 126): Hardcoded "42+"
- **Footer** (`/components/layout/footer.tsx` line 210): Hardcoded "127"
- **Actual TIL count**: 9 files in `/content/til/`
- **Data source**: `getAllPosts('til')` from `/lib/posts.ts`

### Requirements
- Both "TILs Written" (homepage) and "TILs Shared" (footer) should show the SAME dynamic number
- Number should reflect actual TIL count from filesystem

### Implementation

#### 1.1 Homepage Fix (`/app/home-page-content.tsx`)

**Problem**: Component is client-side (`"use client"`) and receives `latestPosts` prop but not TIL count.

**Solution**: Pass TIL count from server component.

**File**: `/app/page.tsx`
```typescript
// Add this import and fetch
import { getAllPosts } from '@/lib/posts';

// In RootPage function, add:
const allTils = getAllPosts('til');
const tilCount = allTils.length;

// Pass to HomePageContent:
return <HomePageContent latestPosts={latestPosts} tilCount={tilCount} />;
```

**File**: `/app/home-page-content.tsx`
```typescript
// Update interface (around line 24):
interface HomePageContentProps {
  latestPosts: Post[];
  tilCount: number;  // ADD THIS
}

// Update function signature (around line 28):
export default function HomePageContent({ latestPosts, tilCount }: HomePageContentProps) {

// Update stats array (around line 126):
// Change: { label: "TILs Written", value: "42+", ... }
// To:     { label: "TILs Written", value: `${tilCount}`, ... }
```

#### 1.2 Footer Fix (`/components/layout/footer.tsx`)

**Problem**: Footer is client-side component with no access to server data.

**Solution A (Recommended)**: Create a server component wrapper that fetches TIL count and passes to Footer.

**Solution B (Simpler)**: Use a lightweight API route or fetch TIL count client-side.

**Recommended Implementation** - Create TilCountProvider:

**New File**: `/components/providers/til-count-provider.tsx`
```typescript
"use client";

import { createContext, useContext, ReactNode } from "react";

const TilCountContext = createContext<number>(0);

export function TilCountProvider({ 
  children, 
  count 
}: { 
  children: ReactNode; 
  count: number;
}) {
  return (
    <TilCountContext.Provider value={count}>
      {children}
    </TilCountContext.Provider>
  );
}

export function useTilCount() {
  return useContext(TilCountContext);
}
```

**File**: `/app/layout.tsx`
- Import TilCountProvider
- Wrap children with provider, passing tilCount fetched server-side

**File**: `/components/layout/footer.tsx`
- Import `useTilCount` hook
- Replace hardcoded "127" with `tilCount` from hook (line 210)

---

## Task 2: blog.harshit.cloud Redirect

### Current State
- `blog.harshit.cloud` shows blog homepage (same app, different behavior based on hostname)
- No redirect exists for this subdomain

### Requirements
- `blog.harshit.cloud/*` → `harshit.cloud/blog/*` (301 permanent redirect)
- Preserve all paths: `/some-post` → `/blog/some-post`

### Implementation

**Create New File**: `/middleware.ts` (in project root)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Redirect blog.harshit.cloud to harshit.cloud/blog
  if (hostname === 'blog.harshit.cloud' || hostname === 'www.blog.harshit.cloud') {
    const url = request.nextUrl.clone();
    const pathname = url.pathname;
    
    // Construct new URL
    url.host = 'harshit.cloud';
    url.pathname = `/blog${pathname === '/' ? '' : pathname}`;
    
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|rss).*)'],
};
```

### Testing
- Local: Add `127.0.0.1 blog.harshit.cloud` to `/etc/hosts`
- Run `bun dev` and visit `http://blog.harshit.cloud:3000/test`
- Should redirect to `http://harshit.cloud:3000/blog/test`

---

## Task 3: Buttondown Newsletter Integration

### Requirements
- Newsletter signup form in THREE locations:
  1. Footer (compact form)
  2. Homepage CTA section (styled form)
  3. End of blog posts (inline form)
- Use Buttondown API (free tier)
- Match existing design system (Shadcn UI, Tailwind)

### Implementation

#### 3.1 Environment Setup

**File**: `/.env.local` (add):
```bash
BUTTONDOWN_API_KEY=your_api_key_here
```

**File**: `/.env` (add placeholder):
```bash
BUTTONDOWN_API_KEY=
```

#### 3.2 API Route

**Create New File**: `/app/api/newsletter/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.BUTTONDOWN_API_KEY;
    if (!apiKey) {
      console.error('BUTTONDOWN_API_KEY not configured');
      return NextResponse.json(
        { error: 'Newsletter service not configured.' },
        { status: 500 }
      );
    }

    // Subscribe via Buttondown API
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        tags: ['website'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle already subscribed
      if (response.status === 400 && errorData.email) {
        return NextResponse.json(
          { error: 'You\'re already subscribed! Check your inbox.' },
          { status: 400 }
        );
      }
      
      console.error('Buttondown API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully subscribed! Check your email to confirm.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
```

#### 3.3 Newsletter Form Component

**Create New File**: `/components/blog/newsletter-form.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface NewsletterFormProps {
  variant?: "default" | "compact" | "card";
  title?: string;
  description?: string;
  className?: string;
}

export function NewsletterForm({
  variant = "default",
  title = "Subscribe to my newsletter",
  description = "Get notified about new posts, TILs, and infrastructure chaos. No spam, unsubscribe anytime.",
  className = "",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
      toast.success("Subscribed!", {
        description: data.message,
      });

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Failed to subscribe";
      setMessage(errorMessage);
      toast.error("Subscription failed", {
        description: errorMessage,
      });
    }
  };

  // Compact variant (for footer)
  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="h-9 text-sm"
            required
          />
          <Button
            type="submit"
            size="sm"
            disabled={status === "loading" || status === "success"}
            className="shrink-0"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </div>
        {message && (
          <p className={`text-xs ${status === "error" ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}
      </form>
    );
  }

  // Card variant (for homepage CTA)
  if (variant === "card") {
    return (
      <div className={`relative overflow-hidden rounded-lg border bg-card p-6 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="wizard@infrastructure.magic"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading" || status === "success"}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="group"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
          {status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant (for blog posts)
  return (
    <div className={`space-y-4 py-8 border-t border-b ${className}`}>
      <div className="space-y-2">
        <h3 className="font-semibold text-xl flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          className="flex-1"
          required
        />
        <Button
          type="submit"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Done!
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-500" : "text-green-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
```

#### 3.4 Integration Points

##### Footer (`/components/layout/footer.tsx`)

Add newsletter section in the "Connect" column (after line 126):

```typescript
// Import at top:
import { NewsletterForm } from "@/components/blog/newsletter-form";

// In the Connect section, after RSS button and before the text "Infra, K8s...":
<div className="mt-4">
  <p className="text-xs text-muted-foreground mb-2">Get chaos delivered</p>
  <NewsletterForm variant="compact" />
</div>
```

##### Homepage (`/app/home-page-content.tsx`)

Replace or augment the CTA section (around line 223-249):

```typescript
// Import at top:
import { NewsletterForm } from "@/components/blog/newsletter-form";

// Add newsletter card inside the CTA section, after existing content (around line 245):
<div className="mt-8">
  <NewsletterForm 
    variant="card"
    title="Join the Chaos Newsletter"
    description="Weekly infrastructure spells, TILs, and tales from production. No spam, just chaos."
  />
</div>
```

##### Blog Post Page (`/app/blog/[slug]/page.tsx`)

Add newsletter form at the end of blog post content:

```typescript
// Import:
import { NewsletterForm } from "@/components/blog/newsletter-form";

// Add after the main content, before related posts section:
<NewsletterForm 
  title="Enjoyed this post?"
  description="Subscribe to get notified when I publish new infrastructure adventures and TILs."
/>
```

---

## Implementation Order

1. **Task 1**: Dynamic TILs Count (fastest, least risk)
2. **Task 2**: Redirect middleware (simple, isolated)
3. **Task 3**: Newsletter integration (most complex)

---

## Testing Checklist

### Task 1: TILs Count
- [ ] Homepage shows actual TIL count (currently 9)
- [ ] Footer shows same TIL count
- [ ] Adding a new TIL file updates both counts
- [ ] No hydration errors

### Task 2: Redirect
- [ ] `blog.harshit.cloud/` → `harshit.cloud/blog`
- [ ] `blog.harshit.cloud/some-slug` → `harshit.cloud/blog/some-slug`
- [ ] `blog.harshit.cloud/til/something` → `harshit.cloud/blog/til/something`
- [ ] Redirect is 301 (permanent)
- [ ] Static assets still work

### Task 3: Newsletter
- [ ] API route validates email format
- [ ] Rate limiting works (5 requests/hour per IP)
- [ ] Success message shows in all three locations
- [ ] Error handling for already subscribed
- [ ] Toast notifications work
- [ ] Form resets after success
- [ ] Responsive on mobile

---

## Files to Create

1. `/middleware.ts`
2. `/app/api/newsletter/route.ts`
3. `/components/blog/newsletter-form.tsx`
4. `/components/providers/til-count-provider.tsx`

## Files to Modify

1. `/app/page.tsx` - Pass tilCount prop
2. `/app/home-page-content.tsx` - Accept tilCount, add newsletter
3. `/app/layout.tsx` - Add TilCountProvider
4. `/components/layout/footer.tsx` - Use dynamic count, add newsletter
5. `/app/blog/[slug]/page.tsx` - Add newsletter form
6. `/.env.local` - Add BUTTONDOWN_API_KEY
7. `/.env` - Add placeholder for BUTTONDOWN_API_KEY

---

## Environment Variables Required

```bash
BUTTONDOWN_API_KEY=<user_must_provide>
```

---

## MUST DO

- Use existing Shadcn UI components (Button, Input, Card)
- Use existing toast system (sonner)
- Match existing code style and patterns
- Use Tailwind classes consistent with existing codebase
- Handle loading, success, and error states
- Implement rate limiting on API route
- Use TypeScript with proper types
- Test all three newsletter form variants
- Verify middleware doesn't break existing routes
- Run `bun run build` after all changes to verify no build errors

## MUST NOT DO

- Do NOT add new dependencies (all required packages exist)
- Do NOT modify the TIL content files
- Do NOT change existing API routes (/api/likes, /api/views)
- Do NOT use `as any` or `@ts-ignore`
- Do NOT hardcode the Buttondown API key
- Do NOT modify the design system colors/fonts
- Do NOT add console.log statements (except for error logging)
- Do NOT break mobile responsiveness
