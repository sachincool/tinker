import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/blog/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'
import { KonamiCode } from '@/components/easter-eggs/konami-code'
import { ConsoleMessage } from '@/components/easter-eggs/console-message'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Harshit\'s Blog - Infra Magician\'s Digital Garden',
  description: 'Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer',
  keywords: ['infrastructure', 'devops', 'kubernetes', 'chaos engineering', 'dota2', 'web development'],
  authors: [{ name: 'Harshit' }],
  openGraph: {
    title: 'Harshit\'s Blog - Infra Magician\'s Digital Garden',
    description: 'Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer',
    type: 'website',
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
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
        <link rel="alternate" type="application/json" title="JSON Feed" href="/rss.json" />
        <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/atom.xml" />
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
