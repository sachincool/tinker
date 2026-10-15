import { cn } from "@/lib/utils";

// Hand-drawn "h" brand mark; decorative, so hidden from screen readers.
export function HMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("inline-block h-[1.3em] w-auto align-[-0.3em] text-green-600 dark:text-green-400", className)}
    >
      <path d="M10.5 3.5 4 28.5" />
      <path d="M6.6 19.5C8.6 14.6 11.6 12.6 14 13.2c2.6.7 1.8 6.4 1.2 9.6-.5 3 1.9 5 5 2.4" />
    </svg>
  );
}
