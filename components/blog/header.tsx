"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Moon, 
  Sun, 
  Search, 
  Menu, 
  Home, 
  BookOpen, 
  Lightbulb, 
  Tags,
  Github,
  Twitter,
  Server,
  Zap,
  Network
} from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "TIL", href: "/til", icon: Lightbulb },
    { name: "Tags", href: "/tags", icon: Tags },
    { name: "Graph", href: "/graph", icon: Network },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center shadow-lg">
                <Server className="h-5 w-5 text-white" />
              </div>
              <Zap className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">harshit.cloud</span>
              <span className="text-xs text-muted-foreground leading-none">Infra Magician's Lair</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search - Navigate to blog */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/blog">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Social Links */}
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="https://github.com/sachincool" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="https://twitter.com/exploit_sh" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
              </Link>
            </Button>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
                        <Server className="h-4 w-4 text-white" />
                      </div>
                      <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">Infra Magician</span>
                      <span className="text-xs text-muted-foreground">Level 99 Chaos Engineer</span>
                    </div>
                  </div>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 text-lg font-medium hover:text-blue-600 transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="https://github.com/sachincool" target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="https://twitter.com/exploit_sh" target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
