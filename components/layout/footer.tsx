"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative h-16 w-16 transition-all group-hover:scale-105 border-0">
                <Image 
                  src="/logo/infra-magician-clean.png?v=3" 
                  alt="Infra Magician Logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(139,92,246,0.9)] transition-all duration-300 border-0 [border:none!important]"
                  unoptimized
                />
              </div>
              <div>
                <div className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">harshit.cloud</div>
                <div className="text-sm text-muted-foreground">Infra Magician</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Breaking production and fixing it before anyone notices since 2010.
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
              Infra, K8s, Meepo, Tinker. Pick your poison.
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
                • <span className="font-mono">01001001 01110100 01011111 01001000 01100101 01110010 01110100 01111010 01011111 01010111 01000001 01001110 01011111 01001001 01010000</span>
              </span>
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                "In production, we trust... our backups."
              </span>
              <Link href="/resume" className="hover:text-foreground transition-colors">
                Resume
              </Link>
              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { key: '?' });
                  window.dispatchEvent(event);
                }}
                className="hover:text-foreground transition-colors flex items-center gap-1"
                title="Show keyboard shortcuts"
              >
                <span className="hidden md:inline">Press</span>
                <kbd className="px-1 py-0.5 text-[10px] border rounded bg-muted font-mono">?</kbd>
                <span className="hidden md:inline">for shortcuts</span>
              </button>
              <button
                onClick={() => {
                  console.log("%cYou clicked the thing.", "font-size: 20px; color: #6366f1; font-weight: bold;");
                  console.log("%cNow you know about the console.", "font-size: 14px; color: #8b5cf6;");
                  console.log("%cTry the Konami Code. If you know, you know.", "font-size: 12px; color: #ec4899;");

                  toast("Secret activated", {
                    description: "Check the console. Also, the Konami Code might do something interesting.",
                    duration: 3000,
                  });
                }}
                className="hover:text-foreground transition-colors cursor-pointer"
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
                5k
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

