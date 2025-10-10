"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["?"], description: "Show this help dialog", category: "General" },
  { keys: ["⌘/Ctrl", "/"], description: "Toggle dark mode", category: "General" },
  { keys: ["Esc"], description: "Close modals/dialogs", category: "General" },
  { keys: ["G", "then", "H"], description: "Go to Home", category: "Navigation" },
  { keys: ["G", "then", "B"], description: "Go to Blog", category: "Navigation" },
  { keys: ["G", "then", "T"], description: "Go to TIL", category: "Navigation" },
  { keys: ["G", "then", "G"], description: "Scroll to top (vim style)", category: "Navigation" },
  { keys: ["Home"], description: "Scroll to top", category: "Navigation" },
  { keys: ["End"], description: "Scroll to bottom", category: "Navigation" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let waitingForSecondKey = false;
    let sequenceTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Show help on ? (Shift+/)
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        if (!isInInput) {
          e.preventDefault();
          setOpen(true);
        }
      }

      // Close on Escape
      if (e.key === "Escape") {
        setOpen(false);
        waitingForSecondKey = false;
      }

      // Toggle dark mode on Ctrl+/ or Cmd+/
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        const htmlElement = document.documentElement;
        const isDark = htmlElement.classList.contains("dark");
        
        if (isDark) {
          htmlElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        } else {
          htmlElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        }
      }

      // G shortcuts (vim-style)
      if (!isInInput) {
        if ((e.key === "g" || e.key === "G") && !waitingForSecondKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          waitingForSecondKey = true;
          
          clearTimeout(sequenceTimer);
          sequenceTimer = setTimeout(() => {
            waitingForSecondKey = false;
          }, 1000);
        } else if (waitingForSecondKey) {
          e.preventDefault();
          waitingForSecondKey = false;
          clearTimeout(sequenceTimer);
          
          const key = e.key.toLowerCase();
          if (key === "h") {
            window.location.href = "/";
          } else if (key === "b") {
            window.location.href = "/blog";
          } else if (key === "t") {
            window.location.href = "/til";
          } else if (key === "g") {
            // Double g to scroll to top (vim style)
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }

      // Home/End keys
      if (e.key === "Home") {
        if (!isInInput) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
      if (e.key === "End") {
        if (!isInInput) {
          e.preventDefault();
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(sequenceTimer);
    };
  }, []);

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto my-4">
        <DialogHeader className="sticky top-0 bg-background pb-4 z-10">
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate faster with keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pb-2">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx} className="flex items-center">
                            {key === "then" ? (
                              <span className="mx-1 text-muted-foreground text-xs">
                                then
                              </span>
                            ) : (
                              <Badge
                                variant="outline"
                                className="font-mono text-xs px-2 py-0.5"
                              >
                                {key}
                              </Badge>
                            )}
                            {keyIdx < shortcut.keys.length - 1 && key !== "then" && shortcut.keys[keyIdx + 1] !== "then" && (
                              <span className="mx-1 text-muted-foreground">
                                +
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          Press <Badge variant="outline" className="font-mono mx-1">?</Badge> anytime to see this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}

