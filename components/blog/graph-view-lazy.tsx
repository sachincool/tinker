"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { GraphView as GraphViewType } from "@/components/blog/graph-view";

const GraphView = dynamic(
  () => import("@/components/blog/graph-view").then((m) => m.GraphView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center text-muted-foreground">
        Loading knowledge graph…
      </div>
    ),
  }
);

export default function GraphViewLazy(props: ComponentProps<typeof GraphViewType>) {
  return <GraphView {...props} />;
}
