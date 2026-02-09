"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * ScrollReveal - A reusable component for scroll-triggered reveal animations
 *
 * @param direction - Animation direction: "up" | "down" | "left" | "right" (default: "up")
 * @param delay - Animation delay in seconds (default: 0)
 * @param duration - Animation duration in seconds (default: 0.6)
 * @param className - Additional CSS classes
 *
 * @example
 * <ScrollReveal direction="up" delay={0.2}>
 *   <YourContent />
 * </ScrollReveal>
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
}: ScrollRevealProps) {
  // Define initial and animate states based on direction
  const directionOffset = 50;

  const initial = {
    opacity: 0,
    x: direction === "left" ? -directionOffset : direction === "right" ? directionOffset : 0,
    y: direction === "up" ? directionOffset : direction === "down" ? -directionOffset : 0,
  };

  const whileInView = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1], // Custom easing for smooth animation
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
