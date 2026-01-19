"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "post" | "til" | "tag";
  size: number;
  slug?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

interface Post {
  slug: string;
  title: string;
  tags: string[];
  type: "blog" | "til";
}

interface GraphViewProps {
  blogPosts: Post[];
  tilPosts: Post[];
  allTags: string[];
}

export function GraphView({ blogPosts, tilPosts, allTags }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<any>(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Build nodes from real data
    const nodes: Node[] = [];
    const links: Link[] = [];
    const tagCounts = new Map<string, number>();

    // Count tag usage
    [...blogPosts, ...tilPosts].forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Create tag nodes
    allTags.forEach(tag => {
      const count = tagCounts.get(tag) || 1;
      nodes.push({
        id: `tag-${tag}`,
        name: tag,
        type: "tag",
        size: 10 + count * 2, // Size based on usage
        slug: tag
      });
    });

    // Create blog post nodes and links
    blogPosts.slice(0, 10).forEach((post, idx) => { // Limit to 10 for readability
      const nodeId = `post-${post.slug}`;
      nodes.push({
        id: nodeId,
        name: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
        type: "post",
        size: 6,
        slug: post.slug
      });

      // Link to tags
      post.tags.forEach(tag => {
        links.push({
          source: `tag-${tag}`,
          target: nodeId
        });
      });
    });

    // Create TIL nodes and links
    tilPosts.slice(0, 10).forEach((til, idx) => { // Limit to 10 for readability
      const nodeId = `til-${til.slug}`;
      nodes.push({
        id: nodeId,
        name: til.title.length > 25 ? til.title.substring(0, 25) + '...' : til.title,
        type: "til",
        size: 5,
        slug: til.slug
      });

      // Link to tags
      til.tags.forEach(tag => {
        links.push({
          source: `tag-${tag}`,
          target: nodeId
        });
      });
    });

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const container = svgElement.parentElement;
    const width = container?.clientWidth || 800;
    const height = svgElement.clientHeight || 600;

    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    // Create a group for zoom/pan transformations
    const g = svg.append("g");

    // Add zoom behavior to SVG
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4]) // Min and max zoom levels
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom as any);
    
    // Store zoom instance for controls
    zoomRef.current = { zoom, svg };

    const simulation = d3
      .forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => Math.sqrt(d.size) * 3));

    // Create links (in the zoomable group)
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);

    // Create nodes (in the zoomable group)
    const node = g
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => Math.sqrt(d.size) * 3)
      .attr("fill", (d) => {
        switch (d.type) {
          case "post": return "#3b82f6";
          case "til": return "#10b981";
          case "tag": return "#8b5cf6";
          default: return "#6b7280";
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("dblclick", (event, d) => {
        // Double-click to navigate (prevents accidental navigation while dragging)
        event.stopPropagation(); // Prevent zoom reset on double-click
        if (d.type === "post") {
          window.location.href = `/blog/${d.slug}`;
        } else if (d.type === "til") {
          window.location.href = `/til/${d.slug}`;
        } else if (d.type === "tag") {
          window.location.href = `/tags/${d.slug}`;
        }
      });

    // Add title tooltips separately
    node.append("title").text((d) => d.name);

    // Add labels (only for tags, too crowded otherwise) (in the zoomable group)
    const labels = g
      .append("g")
      .selectAll("text")
      .data(nodes.filter(d => d.type === "tag"))
      .enter()
      .append("text")
      .text((d) => d.name)
      .attr("font-size", "12px")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-weight", "600")
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.7em")
      .style("pointer-events", "none")
      .style("user-select", "none");

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
        .attr("x1", (d: any) => (d.source as any).x || 0)
        .attr("y1", (d: any) => (d.source as any).y || 0)
        .attr("x2", (d: any) => (d.target as any).x || 0)
        .attr("y2", (d: any) => (d.target as any).y || 0);

      node
        .attr("cx", (d: any) => d.x || 0)
        .attr("cy", (d: any) => d.y || 0);

      labels
        .attr("x", (d: any) => d.x || 0)
        .attr("y", (d: any) => d.y || 0);
    });

    return () => {
      simulation.stop();
    };
  }, [blogPosts, tilPosts, allTags]);

  const handleZoomIn = () => {
    if (zoomRef.current) {
      const { svg, zoom } = zoomRef.current;
      svg.transition()
        .duration(300)
        .call(zoom.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (zoomRef.current) {
      const { svg, zoom } = zoomRef.current;
      svg.transition()
        .duration(300)
        .call(zoom.scaleBy, 0.7);
    }
  };

  const handleResetView = () => {
    if (zoomRef.current) {
      const { svg, zoom } = zoomRef.current;
      svg.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity);
    }
  };

  return (
    <div className="w-full relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-background/95 backdrop-blur shadow-lg"
          title="Zoom In (Scroll Up)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-background/95 backdrop-blur shadow-lg"
          title="Zoom Out (Scroll Down)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="bg-background/95 backdrop-blur shadow-lg"
          title="Reset View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <svg ref={svgRef} className="w-full h-[400px] sm:h-[500px] lg:h-[600px] border rounded-lg bg-background"></svg>
      <div className="flex gap-6 mt-4 text-sm text-muted-foreground justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Blog Posts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>TILs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Tags</span>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Scroll to zoom • Drag to pan • Double-click nodes to navigate
      </p>
    </div>
  );
}
