'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load D3 only when needed
const D3Graph = dynamic(() => import('./d3-graph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-muted/20 rounded-lg flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading graph...</div>
    </div>
  )
});

interface GraphNode {
  id: string;
  name: string;
  type: 'post' | 'til' | 'tag';
  connections: string[];
}

interface GraphViewProps {
  className?: string;
}

export default function GraphView({ className }: GraphViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Memoize graph data to prevent recalculation
  const graphData = useMemo(() => {
    return {
      nodes: [
        { id: 'react', name: 'React', type: 'tag' as const, connections: ['modern-react', 'hooks-guide'] },
        { id: 'typescript', name: 'TypeScript', type: 'tag' as const, connections: ['ts-tips', 'type-safety'] },
        { id: 'nextjs', name: 'Next.js', type: 'tag' as const, connections: ['modern-react', 'performance'] },
        { id: 'modern-react', name: 'Modern React Patterns', type: 'post' as const, connections: ['react', 'nextjs'] },
        { id: 'hooks-guide', name: 'useCallback dependency gotcha', type: 'til' as const, connections: ['react'] },
        { id: 'ts-tips', name: 'TypeScript satisfies operator', type: 'til' as const, connections: ['typescript'] },
        { id: 'css-grid', name: 'CSS Grid auto-fit vs auto-fill', type: 'til' as const, connections: ['css'] },
        { id: 'css', name: 'CSS', type: 'tag' as const, connections: ['css-grid'] }
      ],
      links: [
        { source: 'react', target: 'modern-react' },
        { source: 'react', target: 'hooks-guide' },
        { source: 'typescript', target: 'ts-tips' },
        { source: 'nextjs', target: 'modern-react' },
        { source: 'css', target: 'css-grid' }
      ]
    };
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-xs">📊</span>
            Knowledge Graph
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGraph(!showGraph)}
              className="h-6 w-6 p-0"
            >
              {showGraph ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showGraph ? (
          <div className={`transition-all duration-300 ${isExpanded ? 'h-96' : 'h-48'}`}>
            <D3Graph data={graphData} />
          </div>
        ) : (
          <div className="h-32 bg-muted/20 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
            <div className="text-2xl mb-2">🕸️</div>
            <div className="text-xs text-center">
              Click to explore<br />content connections
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">Posts</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">TILs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-muted-foreground">Tags</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
