"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface ViewCounterProps {
  slug: string;
  className?: string;
}

function ViewCounterComponent({ slug, className = "" }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const trackView = async () => {
      try {
        // Always try to track the view - let the server decide if it's unique
        const postResponse = await fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug })
        });

        if (postResponse.ok) {
          const postData = await postResponse.json();
          setViews(postData.count);
        } else {
          const getResponse = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);
          if (getResponse.ok) {
            const getData = await getResponse.json();
            setViews(getData.count);
          } else {
            setViews(0);
          }
        }

        setIsLoading(false);
      } catch {
        setViews(0);
        setIsLoading(false);
      }
    };

    trackView();
  }, [slug]);

  // Hide while loading and for low-view posts — a "0 views" or "7 views" line
  // under the title reads as undermining. Surface the counter only once the
  // post has accumulated enough reads to be worth quoting.
  if (isLoading || views == null || views < 100) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
      <Eye className="h-4 w-4" />
      <span className="text-sm">{views.toLocaleString()} views</span>
    </div>
  );
}

export const ViewCounter = ViewCounterComponent;

