'use client';

import { useEffect, useRef } from 'react';

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    type: 'post' | 'til' | 'tag';
    connections: string[];
  }>;
  links: Array<{
    source: string;
    target: string;
  }>;
}

interface D3GraphProps {
  data: GraphData;
}

export default function D3Graph({ data }: D3GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Simple static visualization instead of heavy D3 simulation
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear previous content
    svg.innerHTML = '';

    // Create simple circular layout
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    data.nodes.forEach((node, index) => {
      const angle = (index / data.nodes.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Create node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', 
        node.type === 'post' ? '#3b82f6' : 
        node.type === 'til' ? '#10b981' : '#8b5cf6'
      );
      circle.setAttribute('class', 'cursor-pointer hover:opacity-80 transition-opacity');
      
      // Add click handler
      circle.addEventListener('click', () => {
        if (node.type === 'tag') {
          window.location.href = `/tags/${node.id}`;
        } else if (node.type === 'post') {
          window.location.href = `/blog/${node.id}`;
        } else {
          window.location.href = `/til#${node.id}`;
        }
      });

      svg.appendChild(circle);

      // Add label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x.toString());
      text.setAttribute('y', (y + 20).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'text-xs fill-current text-muted-foreground');
      text.textContent = node.name.length > 10 ? node.name.substring(0, 10) + '...' : node.name;
      svg.appendChild(text);
    });

    // Draw simple connections
    data.links.forEach(link => {
      const sourceNode = data.nodes.find(n => n.id === link.source);
      const targetNode = data.nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        const sourceIndex = data.nodes.indexOf(sourceNode);
        const targetIndex = data.nodes.indexOf(targetNode);
        
        const sourceAngle = (sourceIndex / data.nodes.length) * 2 * Math.PI;
        const targetAngle = (targetIndex / data.nodes.length) * 2 * Math.PI;
        
        const x1 = centerX + Math.cos(sourceAngle) * radius;
        const y1 = centerY + Math.sin(sourceAngle) * radius;
        const x2 = centerX + Math.cos(targetAngle) * radius;
        const y2 = centerY + Math.sin(targetAngle) * radius;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-opacity', '0.3');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
      }
    });

  }, [data]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: '200px' }}
    />
  );
}
