"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// A Vestaboard-style split-flap display. Cycles through a list of words; each
// character cell scrambles through a few glyphs (cascading left to right) then
// locks onto the target. No gradients, no neon — muted tiles, rust letters.

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.-/".split("");

function FlapCell({ char, column }: { char: string; column: number }) {
  const target = char.toUpperCase();
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    // More flips for columns further right, so the board "reads" left to right.
    const flips = 5 + column * 2;
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      if (frame >= flips) {
        setDisplay(target);
        clearInterval(id);
      } else {
        setDisplay(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
      }
    }, 45);
    return () => clearInterval(id);
  }, [target, column]);

  const blank = target === " ";

  return (
    <div
      className="relative h-9 w-7 overflow-hidden rounded-[3px] border border-border/60 bg-muted/70"
      aria-hidden
    >
      {/* the split seam */}
      <span className="absolute left-0 top-1/2 z-10 h-px w-full -translate-y-1/2 bg-background/70" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          initial={{ rotateX: -80, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 80, opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className={`absolute inset-0 flex items-center justify-center font-mono text-base font-semibold tabular-nums ${
            blank ? "text-transparent" : "text-primary"
          }`}
        >
          {blank ? "·" : display}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function SplitFlap({
  words,
  interval = 3200,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const cells = Math.max(...words.map((w) => w.length));
  const current = words[index].padEnd(cells, " ");

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        currently
      </span>
      <div className="flex gap-1">
        {Array.from({ length: cells }).map((_, i) => (
          <FlapCell key={i} char={current[i]} column={i} />
        ))}
      </div>
    </div>
  );
}
