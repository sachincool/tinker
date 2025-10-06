"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart, 
  Zap, 
  Coffee,
  Terminal,
  Rss
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-auto bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
                <Terminal className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold">harshit.cloud</div>
                <div className="text-xs text-muted-foreground">Infra Magician</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Casting spells in production and making servers cry since 2010. 
              <span className="inline-block ml-1">🧙‍♂️</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog Posts
                </Link>
              </li>
              <li>
                <Link href="/til" className="text-muted-foreground hover:text-foreground transition-colors">
                  Today I Learned
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Tags
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Me
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="font-semibold mb-4">Built With</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Next.js 15
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Shadcn UI
              </li>
              <li className="flex items-center gap-2">
                <Coffee className="h-3 w-3" />
                Too much coffee
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="https://github.com/harshit" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://twitter.com/harshit" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://linkedin.com/in/harshit" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="mailto:hello@harshit.cloud">
                  <Mail className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="/rss.xml" target="_blank">
                  <Rss className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Always happy to chat about infra, K8s, or Dota 2 strategies!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Harshit. Built with{" "}
              <Heart className="inline h-3 w-3 text-red-500 fill-current" /> and chaos.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                "In production, we trust... our backup plans." 🧙‍♂️
              </span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="group cursor-default">
              <div className="text-2xl font-bold text-blue-500 group-hover:scale-110 transition-transform">
                ∞
              </div>
              <div className="text-xs text-muted-foreground">Servers Crashed</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl font-bold text-green-500 group-hover:scale-110 transition-transform">
                127
              </div>
              <div className="text-xs text-muted-foreground">TILs Shared</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl font-bold text-purple-500 group-hover:scale-110 transition-transform">
                2.3k
              </div>
              <div className="text-xs text-muted-foreground">Dota MMR</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl font-bold text-orange-500 group-hover:scale-110 transition-transform">
                9001
              </div>
              <div className="text-xs text-muted-foreground">Coffees Consumed</div>
            </div>
            <div className="group cursor-default">
              <div className="text-2xl font-bold text-pink-500 group-hover:scale-110 transition-transform">
                99
              </div>
              <div className="text-xs text-muted-foreground">Wizard Level</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

