"use client";

import Giscus from "@giscus/react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface CommentsProps {
  slug: string;
  shareButton?: React.ReactNode;
}

export function Comments({ slug, shareButton }: CommentsProps) {
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    // Listen for Giscus errors and status updates
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://giscus.app") return;
      
      if (event.data?.giscus) {
        // Handle errors, but ignore "Discussion not found" as it's expected for new posts
        // Giscus will create the discussion automatically when someone comments
        if (event.data.giscus.error && event.data.giscus.error !== "Discussion not found") {
          setError(event.data.giscus.error);
          setErrorDetails(event.data.giscus);
        }
        // Clear error if discussion loads successfully
        if (event.data.giscus.discussion) {
          setError(null);
          setErrorDetails(null);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Check if Giscus is configured
  const giscusRepo = (process.env.NEXT_PUBLIC_GISCUS_REPO || "sachincool/tinker") as `${string}/${string}`;
  const giscusRepoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "R_kgDOOATA-g";
  const giscusCategoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "DIC_kwDOOATA-s4C0aSE";

  // Don't render until mounted on client
  if (!mounted) {
    return (
      <div className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Comments</h3>
          {shareButton}
        </div>
        <div className="p-6 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isDev = process.env.NODE_ENV !== "production";
    return (
      <div className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Comments</h3>
          {shareButton}
        </div>
        <div className="p-6 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-muted-foreground">
            Comments are temporarily unavailable.
          </p>
          {isDev && (
            <details className="mt-4 text-xs text-muted-foreground">
              <summary className="cursor-pointer">debug</summary>
              <p className="mt-2 font-mono break-all">{error}</p>
              {errorDetails && (
                <pre className="mt-2 bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              )}
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Repo: {giscusRepo}</li>
                <li>Repo ID: {giscusRepoId}</li>
                <li>Category ID: {giscusCategoryId}</li>
                <li>Term: /blog/{slug}</li>
              </ul>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Comments</h3>
        {shareButton}
      </div>
      <Giscus
        id="comments"
        repo={giscusRepo}
        repoId={giscusRepoId}
        categoryId={giscusCategoryId}
        mapping="pathname"
        term={`/blog/${slug}`}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={resolvedTheme === "dark" ? "dark_dimmed" : "light"}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}

