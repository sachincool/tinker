"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  slug: string;
  className?: string;
}

export function LikeButton({ slug, className = "" }: LikeButtonProps) {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real like count from API
    const fetchLikes = async () => {
      try {
        // Fetch server count AND server-side liked status
        const response = await fetch(`/api/likes?slug=${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          setLikes(data.count);
          // TRUST THE SERVER for liked status, not localStorage
          setIsLiked(data.liked);

          // Sync localStorage with server truth
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
          if (data.liked) {
            likedPosts[slug] = true;
          } else {
            delete likedPosts[slug];
          }
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
        // Fallback to localStorage only if server fails
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        setIsLiked(!!likedPosts[slug]);
        setLikes(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();
  }, [slug]);

  const handleLike = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const action = isLiked ? 'unlike' : 'like';

    // Optimistic update
    const newLiked = !isLiked;
    const newCount = isLiked ? Math.max(0, likes - 1) : likes + 1;
    setIsLiked(newLiked);
    setLikes(newCount);

    try {
      // Update server
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action })
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.count);
        setIsLiked(data.liked);
        
        // Update localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        if (data.liked) {
          likedPosts[slug] = true;
        } else {
          delete likedPosts[slug];
        }
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      } else {
        // Revert on error
        setIsLiked(!newLiked);
        setLikes(likes);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert on error
      setIsLiked(!newLiked);
      setLikes(likes);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn("group transition-all animate-pulse", className)}
      >
        <Heart className="mr-2 h-4 w-4" />
        <span>--</span>
      </Button>
    );
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isAnimating}
      className={cn(
        "group transition-all",
        isLiked && "bg-red-500 hover:bg-red-600 text-white",
        className
      )}
    >
      <Heart
        className={cn(
          "mr-2 h-4 w-4 transition-all",
          isLiked && "fill-current",
          isAnimating && "scale-125"
        )}
      />
      <span>{likes}</span>
    </Button>
  );
}

