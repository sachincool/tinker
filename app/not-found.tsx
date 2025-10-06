"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Search, 
  BookOpen, 
  Lightbulb,
  ArrowRight,
  Terminal,
  AlertTriangle,
  Coffee
} from "lucide-react";

export default function NotFound() {
  const [errorCode, setErrorCode] = useState("404");
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      const codes = ["404", "4Ø4", "4O4", "4θ4", "404"];
      setErrorCode(codes[Math.floor(Math.random() * codes.length)]);
      setTimeout(() => {
        setGlitchActive(false);
        setErrorCode("404");
      }, 100);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  const funMessages = [
    "Looks like this page went CrashLoopBackOff! 💥",
    "Even my Kubernetes cluster couldn't find this one. 🚀",
    "Error 404: Page not in this dimension. 🌌",
    "This page is like my Dota MMR - lost somewhere in the void. 🎮",
    "The infrastructure gods have spoken: NO. ⚡",
    "This endpoint returned undefined. Classic JavaScript move. 🤷",
  ];

  const [message] = useState(funMessages[Math.floor(Math.random() * funMessages.length)]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
        {/* Glitch Effect 404 */}
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 rounded-3xl blur-3xl"></div>
          
          <div className="relative">
            <Terminal className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
            <h1 
              className={`text-8xl md:text-9xl font-bold mb-4 transition-all duration-100 ${
                glitchActive 
                  ? "text-red-500 animate-pulse" 
                  : "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent"
              }`}
            >
              {errorCode}
            </h1>
          </div>
        </div>

        {/* Fun Message */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-sm font-medium">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Page Not Found</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold">
            Oops! Lost in the Cloud ☁️
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            {message}
          </p>

          <Card className="mt-8 bg-muted/50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Coffee className="h-5 w-5" />
                <p className="text-left">
                  <strong>Pro Tip:</strong> While you&apos;re here, grab a coffee. 
                  This 404 error took me weeks to perfect with just the right amount of sass.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Options */}
        <div className="space-y-6 pt-8">
          <p className="text-sm text-muted-foreground">Where would you like to go?</p>
          
          <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button asChild size="lg" className="group">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Home
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="group">
              <Link href="/blog">
                <BookOpen className="mr-2 h-5 w-5" />
                Blog
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="group">
              <Link href="/til">
                <Lightbulb className="mr-2 h-5 w-5" />
                TILs
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="group">
              <Link href="/tags">
                <Search className="mr-2 h-5 w-5" />
                Search Tags
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Easter Egg */}
        <div className="pt-8 border-t">
          <p className="text-xs text-muted-foreground italic">
            Fun fact: This page has been viewed {Math.floor(Math.random() * 1000) + 100} times. 
            You&apos;re not alone in getting lost. 🗺️
          </p>
        </div>
      </div>
    </div>
  );
}

