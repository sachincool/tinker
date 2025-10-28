"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface LikeButtonProps {
  slug: string;
  className?: string;
}

export function LikeButton({ slug, className = "" }: LikeButtonProps) {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    
    // Capture current state BEFORE any updates (prevent stale closure)
    const oldLiked = isLiked;
    const oldCount = likes;
    const action = oldLiked ? 'unlike' : 'like';

    // Optimistic update
    const newLiked = !oldLiked;
    const newCount = oldLiked ? Math.max(0, oldCount - 1) : oldCount + 1;
    setIsLiked(newLiked);
    setLikes(newCount);

    // Celebration effect when liking
    if (!oldLiked && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Heart burst confetti
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x, y },
        colors: ['#ef4444', '#f87171', '#fca5a5', '#fee2e2'],
        shapes: ['circle'],
        scalar: 0.8,
        gravity: 1.2,
        ticks: 100,
      });

      // Check for milestones
      if (newCount === 10 || newCount === 50 || newCount === 100) {
        // Extra celebration for milestones
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { x, y },
            colors: ['#fbbf24', '#f59e0b', '#d97706'],
            startVelocity: 45,
          });
        }, 150);
      }
    }

    try {
      // Update server
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action })
      });

      if (response.ok) {
        const data = await response.json();
        // Trust server response as source of truth
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
        console.error('Like API returned error:', await response.text());
        // Revert to captured old state
        setIsLiked(oldLiked);
        setLikes(oldCount);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert to captured old state
      setIsLiked(oldLiked);
      setLikes(oldCount);
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
      ref={buttonRef}
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

