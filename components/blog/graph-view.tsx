"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  name: string;
  type: "post" | "til" | "tag";
  size: number;
}

interface Link {
  source: string;
  target: string;
}

export function GraphView() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Sample data - in real app, this would come from your content
    const nodes: Node[] = [
      { id: "react", name: "React", type: "tag", size: 15 },
      { id: "typescript", name: "TypeScript", type: "tag", size: 12 },
      { id: "nextjs", name: "Next.js", type: "tag", size: 10 },
      { id: "css", name: "CSS", type: "tag", size: 8 },
      { id: "anime", name: "Anime", type: "tag", size: 6 },
      { id: "post1", name: "Modern React Patterns", type: "post", size: 5 },
      { id: "post2", name: "TypeScript Tips", type: "post", size: 4 },
      { id: "til1", name: "CSS Grid Trick", type: "til", size: 3 },
      { id: "til2", name: "React Hook", type: "til", size: 3 },
    ];

    const links: Link[] = [
      { source: "react", target: "post1" },
      { source: "typescript", target: "post1" },
      { source: "typescript", target: "post2" },
      { source: "css", target: "til1" },
      { source: "react", target: "til2" },
      { source: "nextjs", target: "react" },
      { source: "typescript", target: "react" },
    ];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 200;

    svg.attr("width", width).attr("height", height);

    const simulation = d3
      .forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(30))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);

    // Create nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.size) * 2)
      .attr("fill", (d) => {
        switch (d.type) {
          case "post": return "#3b82f6";
          case "til": return "#10b981";
          case "tag": return "#8b5cf6";
          default: return "#6b7280";
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer");

    // Add labels
    const labels = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text((d) => d.name)
      .attr("font-size", "10px")
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", "#374151")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("pointer-events", "none");

    // Add drag behavior
    const drag = d3
      .drag<SVGCircleElement, Node>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full h-48 border rounded-lg bg-gray-50 dark:bg-gray-900"></svg>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Posts</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>TILs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span>Tags</span>
        </div>
      </div>
    </div>
  );
}
