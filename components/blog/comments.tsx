"use client";

import Giscus from "@giscus/react";
import { useEffect, useState } from "react";

interface CommentsProps {
  slug: string;
}

export function Comments({ slug }: CommentsProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Giscus errors
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://giscus.app") return;
      
      if (event.data?.giscus?.error) {
        setError(event.data.giscus.error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Check if Giscus is configured
  const giscusRepo = (process.env.NEXT_PUBLIC_GISCUS_REPO || "sachincool/tinker") as `${string}/${string}`;
  const giscusRepoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "R_kgDOOATA-g";
  const giscusCategoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "DIC_kwDOOATA-s4C0aSE";

  if (error) {
    return (
      <div className="mt-16 pt-8 border-t">
        <h3 className="text-2xl font-bold mb-6">Comments</h3>
        <div className="p-6 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-muted-foreground mb-4">
            Comments are temporarily unavailable. 
            {error && (
              <span className="block mt-2 text-sm">
                Error: {error}
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 pt-8 border-t">
      <h3 className="text-2xl font-bold mb-6">Comments</h3>
      <Giscus
        id="comments"
        repo={giscusRepo}
        repoId={giscusRepoId}
        category="Announcements"
        categoryId={giscusCategoryId}
        mapping="pathname"
        term={slug}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="preferred_color_scheme"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}

