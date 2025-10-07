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
                <Link href="https://github.com/sachincool" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://twitter.com/exploit_sh" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="https://linkedin.com/in/harshit-luthra/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href="mailto:contact@sachin.cool">
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
            <div className="mt-3 p-2 rounded border border-dashed border-muted-foreground/30 hover:border-yellow-500/50 transition-colors group cursor-help" title="Try the Konami Code on your keyboard!">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/60 group-hover:text-yellow-500 transition-colors">🎮</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">↑</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">↑</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">↓</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">↓</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">←</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">→</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">←</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">→</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">B</kbd>
                  <kbd className="px-1 text-[10px] border rounded bg-muted font-mono group-hover:border-yellow-500/50 transition-colors">A</kbd>
                </div>
                <span className="text-xs text-muted-foreground/60 italic group-hover:text-yellow-500 transition-colors">Try it!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Harshit Luthra. Built with{" "}
              <Heart className="inline h-3 w-3 text-red-500 fill-current" /> and chaos.
              <span className="hidden lg:inline ml-2 text-xs">
                • <span className="font-mono">01000100 01000011 00100000 01010011 01110101 01100011 01101011 01110011</span>
              </span>
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                "In production, we trust... our backup plans." 🧙‍♂️
              </span>
              <Link href="/resume" className="hover:text-foreground transition-colors">
                Resume
              </Link>
              <button 
                onClick={() => {
                  console.log("%c🧙‍♂️ Hey there, fellow code wizard!", "font-size: 20px; color: #6366f1; font-weight: bold;");
                  console.log("%cYou found the secret developer console message!", "font-size: 14px; color: #8b5cf6;");
                  console.log("%cWant to see something cool? Try typing: document.body.style.transform = 'rotate(180deg)'", "font-size: 12px; color: #ec4899;");
                  console.log("%c(Just kidding, don't do that... unless? 😏)", "font-size: 10px; color: #64748b;");
                }}
                className="hover:text-foreground transition-colors"
              >
                Secret
              </button>
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

