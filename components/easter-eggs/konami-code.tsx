"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Trophy } from "lucide-react";

export function KonamiCode() {
  const [activated, setActivated] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const newSequence = [...sequence, key].slice(-konamiCode.length);
      setSequence(newSequence);

      if (newSequence.join(',') === konamiCode.join(',')) {
        setActivated(true);
        setSequence([]);
        
        // Add confetti effect
        document.body.classList.add('konami-activated');
        setTimeout(() => {
          document.body.classList.remove('konami-activated');
        }, 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence]);

  if (!activated) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="max-w-md mx-4 border-2 border-yellow-500 shadow-2xl animate-in zoom-in duration-300">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
          </div>
          <CardTitle className="text-2xl">
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Achievement Unlocked
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Konami Code</p>
            <p className="text-sm text-muted-foreground">
              You know the code. You are the culture.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-mono">
              ↑ ↑ ↓ ↓ ← → ← → B A
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">+30 Lives</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          </div>

          <div className="text-xs text-muted-foreground italic">
            &quot;The code remembers.&quot;
          </div>

          <Button 
            onClick={() => setActivated(false)}
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Continue Your Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

