"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "motion/react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

/**
 * AnimatedCounter - Animates numbers counting up when scrolled into view
 *
 * For numeric values (including 'k' suffix like "5k"), animates from 0 to the target.
 * For non-numeric values (like "∞"), fades in without counting.
 *
 * @param value - The value to display (e.g., "42", "5k", "∞")
 * @param duration - Animation duration in seconds (default: 2)
 * @param className - Additional CSS classes
 *
 * @example
 * <AnimatedCounter value="100" duration={2.5} />
 * <AnimatedCounter value="5k" />
 * <AnimatedCounter value="∞" />
 */
export default function AnimatedCounter({
  value,
  duration = 2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Check if value is numeric or has 'k' suffix
    const numericMatch = value.match(/^(\d+(?:\.\d+)?)(k)?$/);

    if (numericMatch) {
      const numValue = parseFloat(numericMatch[1]);

      // Subscribe to motion value changes
      const unsubscribe = motionValue.on("change", (latest) => {
        setDisplayValue(Math.round(latest));
      });

      // Animate the number
      const controls = animate(motionValue, numValue, {
        duration,
        ease: [0.25, 0.4, 0.25, 1],
      });

      return () => {
        controls.stop();
        unsubscribe();
      };
    }
  }, [isInView, value, duration, motionValue]);

  // Check if value is numeric
  const numericMatch = value.match(/^(\d+(?:\.\d+)?)(k)?$/);
  const isNumeric = !!numericMatch;
  const hasKSuffix = numericMatch?.[2] === "k";

  if (!isNumeric) {
    // For non-numeric values (like "∞"), just fade in
    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: duration * 0.5, ease: [0.25, 0.4, 0.25, 1] }}
        className={className}
      >
        {value}
      </motion.span>
    );
  }

  // For numeric values, animate the count
  return (
    <span ref={ref} className={className}>
      {displayValue}
      {hasKSuffix && "k"}
    </span>
  );
}
