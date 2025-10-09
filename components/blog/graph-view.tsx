"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  name: string;
  type: "post" | "til" | "tag";
  size: number;
  slug?: string;
}

interface Link {
  source: string;
  target: string;
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

  useEffect(() => {
    if (!svgRef.current) return;

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

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || 800;
    const height = 600;

    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const simulation = d3
      .forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => Math.sqrt(d.size) * 3));

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
      .on("click", (event, d) => {
        // Navigate to post/til/tag on click
        if (d.type === "post") {
          window.location.href = `/blog/${d.slug}`;
        } else if (d.type === "til") {
          window.location.href = `/til/${d.slug}`;
        } else if (d.type === "tag") {
          window.location.href = `/tags/${d.slug}`;
        }
      })
      .append("title")
      .text((d) => d.name);

    // Add labels (only for tags, too crowded otherwise)
    const labels = svg
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
  }, [blogPosts, tilPosts, allTags]);

  return (
    <div className="w-full">
      <svg ref={svgRef} className="w-full h-[600px] border rounded-lg bg-background"></svg>
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
        Click and drag nodes to rearrange • Click nodes to navigate to content
      </p>
    </div>
  );
}
