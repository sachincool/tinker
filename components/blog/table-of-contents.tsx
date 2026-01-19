"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("article h2, article h3"));
    const headingData: Heading[] = elements.map((elem) => ({
      id: elem.id || elem.textContent?.toLowerCase().replace(/\s+/g, "-") || "",
      text: elem.textContent || "",
      level: parseInt(elem.tagName.substring(1)),
    }));

    // Add IDs to headings that don't have them
    elements.forEach((elem, i) => {
      if (!elem.id) {
        elem.id = headingData[i].id;
      }
    });

    setHeadings(headingData);

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    elements.forEach((elem) => observer.observe(elem));

    return () => observer.disconnect();
  }, []);

  const TocContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="mb-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Table of Contents
        </div>
        <ul className="space-y-1.5 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "transition-colors",
                heading.level === 3 && "ml-4"
              )}
            >
              <a
                href={`#${heading.id}`}
                onClick={onNavigate}
                className={cn(
                  "block py-1.5 px-3 rounded transition-all border-l-2",
                  activeId === heading.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-8 pt-8 border-t">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Links
        </div>
        <div className="space-y-2 text-sm">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
             className="block py-1.5 px-3 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            ↑ Back to Top
          </a>
        </div>
      </div>
    </>
  );

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop ToC */}
      <nav className="sticky top-24 hidden lg:block">
        <TocContent />
      </nav>

      {/* Mobile ToC Button */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" className="rounded-full shadow-lg h-12 w-12 p-0">
              <List className="h-5 w-5" />
              <span className="sr-only">Table of Contents</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <div className="mt-6">
              <TocContent onNavigate={() => {
                const closeButton = document.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement;
                closeButton?.click();
              }} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

