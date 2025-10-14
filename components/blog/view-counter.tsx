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
        // Check if already viewed in this session (localStorage for client-side)
        const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '{}');
        
        // Always fetch current count
        const getResponse = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);
        if (getResponse.ok) {
          const getData = await getResponse.json();
          setViews(getData.count);
        }

        // Increment view if not already viewed in this session
        if (!viewedPosts[slug]) {
          viewedPosts[slug] = true;
          sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
          
          // Track the view on server
          const postResponse = await fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug })
          });

          if (postResponse.ok) {
            const postData = await postResponse.json();
            setViews(postData.count);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error tracking view:', error);
        setViews(0);
        setIsLoading(false);
      }
    };

    trackView();
  }, [slug]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground animate-pulse ${className}`}>
        <Eye className="h-4 w-4" />
        <span className="text-sm">---</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
      <Eye className="h-4 w-4" />
      <span className="text-sm">{views?.toLocaleString()} views</span>
    </div>
  );
}

export const ViewCounter = ViewCounterComponent;

