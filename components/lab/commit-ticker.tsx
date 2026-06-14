"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCommitHorizontal, RefreshCw } from "lucide-react";

// A faux git terminal that pulls a fresh, real commit message from
// whatthecommit.com on every refresh. The honesty is the point.
export function CommitTicker() {
  const [message, setMessage] = useState<string>("loading the wheel of regret…");
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState("a1b2c3d");

  const fetchCommit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commit", { cache: "no-store" });
      const data = await res.json();
      setMessage(data.message ?? "git: command not found");
    } catch {
      setMessage("fatal: not a git repository (or any of the parent directories)");
    } finally {
      // Cosmetic short hash so the line reads like a real git log entry.
      setHash(Math.random().toString(16).slice(2, 9));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommit();
    const id = setInterval(fetchCommit, 7000);
    return () => clearInterval(id);
  }, [fetchCommit]);

  return (
    <div className="rounded-md border border-border/60 bg-muted/40 overflow-hidden font-mono text-sm">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/60 px-3 py-2">
        <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="flex gap-1.5" aria-hidden>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </span>
          git log --oneline
        </span>
        <button
          onClick={fetchCommit}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-label="Fetch another commit message"
        >
          <RefreshCw className={loading ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
          another one
        </button>
      </div>
      <div className="px-4 py-4 leading-relaxed">
        <span className="text-primary">{hash}</span>{" "}
        <span className="text-muted-foreground">
          <GitCommitHorizontal aria-hidden className="mr-1 inline h-4 w-4" />
        </span>
        <span className="text-foreground break-words">{message}</span>
      </div>
    </div>
  );
}
