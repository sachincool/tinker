import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/blog/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'
import { KonamiCode } from '@/components/easter-eggs/konami-code'
import { ConsoleMessage } from '@/components/easter-eggs/console-message'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { siteConfig } from '@/lib/site-config'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: 'Harshit\'s Blog - Infra Magician\'s Digital Garden',
  description: 'Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer. Deep dives into DevOps, Kubernetes, AWS cost optimization, and production war stories from the trenches.',
  keywords: ['infrastructure', 'devops', 'kubernetes', 'chaos engineering', 'dota2', 'web development'],
  authors: [{ name: 'Harshit Luthra', url: siteConfig.siteUrl }],
  creator: 'Harshit Luthra',
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  openGraph: {
    title: 'Harshit\'s Blog - Infra Magician\'s Digital Garden',
    description: 'Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer. Deep dives into DevOps, Kubernetes, AWS cost optimization, and production war stories from the trenches.',
    type: 'website',
    url: siteConfig.siteUrl,
    siteName: siteConfig.title,
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Harshit\'s Blog - Infra Magician\'s Digital Garden',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harshit\'s Blog - Infra Magician\'s Digital Garden',
    description: 'Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer. Deep dives into DevOps, Kubernetes, AWS cost optimization, and production war stories from the trenches.',
    creator: '@exploit_sh',
    site: '@exploit_sh',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* RSS Feeds */}
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
        <link rel="alternate" type="application/json" title="JSON Feed" href="/rss.json" />
        <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/atom.xml" />
        
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Harshit Luthra',
              url: siteConfig.siteUrl,
              image: `${siteConfig.siteUrl}/og-image.png`,
              jobTitle: 'Infrastructure Engineer',
              description: 'Level 99 Infrastructure Wizard, Professional Chaos Engineer',
              sameAs: [
                siteConfig.social.github,
                siteConfig.social.twitter,
                siteConfig.social.linkedin,
                siteConfig.social.instagram,
              ],
              knowsAbout: [
                'DevOps',
                'Kubernetes',
                'Infrastructure as Code',
                'AWS',
                'Cloud Computing',
                'Site Reliability Engineering',
                'Chaos Engineering',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Harshit\'s Blog - Infra Magician\'s Digital Garden',
              url: siteConfig.siteUrl,
              description: 'Deep dives into DevOps, Kubernetes, AWS cost optimization, and production war stories from the trenches.',
              author: {
                '@type': 'Person',
                name: 'Harshit Luthra',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteConfig.siteUrl}/blog?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <KonamiCode />
          <ConsoleMessage />
          <ScrollToTop />
          <KeyboardShortcuts />
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
