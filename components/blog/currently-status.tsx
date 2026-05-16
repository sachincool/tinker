"use client";

import { useEffect, useState } from "react";

interface CurrentlyStatusProps {
  activities: string[];
  intervalMs?: number;
}

export function CurrentlyStatus({ activities, intervalMs = 2800 }: CurrentlyStatusProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (activities.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % activities.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [activities.length, intervalMs]);

  return (
    <span className="inline-flex items-baseline gap-2 font-mono text-sm text-muted-foreground">
      <span className="text-[11px] uppercase tracking-[0.18em]">Currently</span>
      <span aria-hidden className="text-muted-foreground/60">/</span>
      <span key={index} className="text-foreground transition-opacity duration-300">
        {activities[index]}
      </span>
    </span>
  );
}
