import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

// Editorial redraw of the Infra Magician logo. Same composition as the original
// dark webp — wizard hat with a server stack inside, two clouds, a rust star —
// but flat hairline strokes that adapt to both themes via currentColor.
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Infra Magician"
      className={cn("text-foreground", className)}
    >
      {/* Outer frame */}
      <circle cx="32" cy="32" r="28" strokeWidth={1} opacity={0.55} />

      {/* Left cloud */}
      <path
        d="M 11 39 C 9 39, 9 36, 12 36 C 12 33, 16 33, 17 35 C 20 34, 21 38, 19 39 C 17 41, 13 41, 11 39 Z"
        fill="currentColor"
        fillOpacity={0.08}
        strokeWidth={1}
      />

      {/* Right cloud */}
      <path
        d="M 53 39 C 51 39, 51 36, 54 36 C 54 33, 58 33, 59 35 C 62 34, 63 38, 61 39 C 59 41, 55 41, 53 39 Z"
        fill="currentColor"
        fillOpacity={0.08}
        strokeWidth={1}
      />

      {/* Wizard hat: pointed top, gently curved body, flared brim */}
      <path
        d="M 36 10 C 33 22, 30 32, 24 42 L 16 46 C 14 47, 14 49, 17 49.5 C 27 51, 37 51, 47 49.5 C 50 49, 50 47, 48 46 L 41 42 C 39 30, 38 20, 36 10 Z"
        fill="currentColor"
        fillOpacity={0.06}
      />

      {/* Server racks inside the hat body */}
      <line x1="29" y1="29" x2="38" y2="29" strokeWidth={1} opacity={0.75} />
      <line x1="27" y1="34" x2="40" y2="34" strokeWidth={1} opacity={0.75} />
      <line x1="26" y1="39" x2="41" y2="39" strokeWidth={1} opacity={0.75} />

      {/* Star accent in the rust primary token */}
      <polygon
        points="44,16 44.93,17.87 47,18.17 45.5,19.68 45.85,21.77 44,20.87 42.15,21.77 42.5,19.68 41,18.17 43.07,17.87"
        className="fill-primary"
        stroke="none"
      />
    </svg>
  );
}
