"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { List, ArrowUp } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function TocContent({
  headings,
  activeId,
  onNavigate,
}: {
  headings: Heading[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between mb-5">
        <div className="text-[10px] font-semibold text-muted-foreground/90 uppercase tracking-[0.22em]">
          On this page
        </div>
        <div className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
          {String(headings.length).padStart(2, "0")}
        </div>
      </div>

      <ul className="relative border-l border-border/50">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={onNavigate}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block -ml-px border-l-2 py-1.5 transition-colors duration-150",
                  heading.level === 3 ? "pl-6 text-[12.5px]" : "pl-4 text-[13.5px]",
                  isActive
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 pt-5 border-t border-border/40">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowUp className="h-3 w-3" />
          Back to top
        </a>
      </div>
    </>
  );
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [showFab, setShowFab] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId((prev) => (prev === id ? prev : id));
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    elements.forEach((elem) => observer.observe(elem));

    return () => observer.disconnect();
  }, []);

  // Hide the floating button until the reader is past the title region (~200px).
  useEffect(() => {
    let frame = 0;
    let queued = false;
    const update = () => {
      queued = false;
      setShowFab(window.scrollY > 200);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      <nav
        aria-label="Table of contents"
        className="sticky top-24 hidden lg:block max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 -mr-2"
      >
        <TocContent headings={headings} activeId={activeId} />
      </nav>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Open table of contents"
            className={cn(
              "fixed bottom-6 right-6 lg:hidden z-40 h-10 rounded-full border border-border/60 bg-background/90 backdrop-blur px-4 text-muted-foreground shadow-lg transition-opacity duration-200 hover:text-foreground",
              showFab ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <List className="h-4 w-4" />
            <span className="text-xs font-medium">Contents</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="overflow-y-auto p-6">
          <div className="mt-6">
            <TocContent
              headings={headings}
              activeId={activeId}
              onNavigate={() => setSheetOpen(false)}
            />
          </div>
          <SheetClose className="sr-only">Close</SheetClose>
        </SheetContent>
      </Sheet>
    </>
  );
}

