"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import DottedMap from "dotted-map";

// The actual geography of the stack: where the boxes physically sit. Bengaluru
// is me; New York is the vps that runs the relay, onion, and proxy (sshvps);
// Helsinki is the Hetzner box. The arcs are the traffic that bounces between
// them so the wire stays boring to watch.
type Point = { lat: number; lng: number; label: string };

const NODES: Point[] = [
  { lat: 12.97, lng: 77.59, label: "bengaluru" },
  { lat: 40.71, lng: -74.01, label: "new york" },
  { lat: 60.17, lng: 24.94, label: "helsinki" },
];

const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 2],
];

// Equirectangular projection onto the 800×400 overlay that sits on top of the
// dotted map. Same aspect ratio (2:1) as the generated SVG, so points land.
function project(lat: number, lng: number) {
  return {
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  };
}

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = Math.min(a.y, b.y) - 60;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export function RelayMap() {
  const { resolvedTheme } = useTheme();

  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 60, grid: "diagonal" });
    return map.getSVG({
      radius: 0.22,
      color: resolvedTheme === "dark" ? "#FFFFFF33" : "#00000026",
      shape: "circle",
      backgroundColor: "transparent",
    });
  }, [resolvedTheme]);

  const projected = NODES.map((n) => ({ ...project(n.lat, n.lng), label: n.label }));

  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden rounded-md border border-border/60 bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt="Dotted world map showing the relay node locations."
        className="pointer-events-none h-full w-full select-none object-cover [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
        draggable={false}
      />

      <svg
        viewBox="0 0 800 400"
        className="absolute inset-0 h-full w-full text-primary"
        preserveAspectRatio="xMidYMid slice"
      >
        {LINKS.map(([from, to], i) => (
          <motion.path
            key={`link-${i}`}
            d={curve(projected[from], projected[to])}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.7}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.3, delay: 0.4 + i * 0.3, ease: "easeInOut" }}
          />
        ))}

        {projected.map((p, i) => (
          <g key={`node-${i}`}>
            <circle cx={p.x} cy={p.y} r={2.5} fill="currentColor" />
            <circle cx={p.x} cy={p.y} r={2.5} fill="currentColor" opacity={0.4}>
              <animate attributeName="r" from="2.5" to="14" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.4" to="0" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      {/* Node labels — quiet mono, positioned over the projected points */}
      {projected.map((p, i) => (
        <span
          key={`label-${i}`}
          className="absolute -translate-x-1/2 translate-y-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground"
          style={{ left: `${(p.x / 800) * 100}%`, top: `${(p.y / 400) * 100}%` }}
        >
          {NODES[i].label}
        </span>
      ))}
    </div>
  );
}
