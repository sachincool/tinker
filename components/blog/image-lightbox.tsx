"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PostImage } from "./post-image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  // The post hero is the LCP element on every article page. Lazy-loading it
  // costs a round trip the browser could have started from the HTML.
  eager?: boolean;
}

export function ImageLightbox({ src, alt, className, eager }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape while the lightbox is open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      {/* Clickable image */}
      <PostImage
        src={src}
        alt={alt}
        className={`${className} cursor-pointer`}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      />

      {/* Lightbox modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Image preview"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 z-10"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image container */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <PostImage
              src={src}
              alt={alt}
              loading="eager"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Caption */}
            {alt && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <p className="text-white text-center text-sm md:text-base font-medium">
                  {alt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
