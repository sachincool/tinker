'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

const popularTags = [
  { name: 'typescript', count: 15 },
  { name: 'react', count: 12 },
  { name: 'nextjs', count: 8 },
  { name: 'anime', count: 6 },
  { name: 'css', count: 10 },
  { name: 'web-dev', count: 14 }
];

const recentActivity = [
  { title: 'Building Modern UIs', date: '2 days ago', type: 'post' },
  { title: 'CSS Grid Tricks', date: '3 days ago', type: 'til' },
  { title: 'Anime & Programming', date: '1 week ago', type: 'post' },
  { title: 'TypeScript Tips', date: '1 week ago', type: 'til' }
];

const monthlyStats = {
  posts: 3,
  tils: 12,
  tags: 2
};

export default function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Simple Knowledge Graph Placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-xs">📊</span>
            Knowledge Graph
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-32 bg-muted/20 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
            <div className="text-2xl mb-2">🕸️</div>
            <div className="text-xs text-center">
              Interactive graph<br />coming soon
            </div>
          </div>
          
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

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 6).map((tag) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => window.location.href = `/tags/${tag.name}`}
              >
                {tag.name} ({tag.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'post' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* This Month Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-500">{monthlyStats.posts}</div>
              <div className="text-xs text-muted-foreground">Blog Posts</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">{monthlyStats.tils}</div>
              <div className="text-xs text-muted-foreground">TILs</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-500">{monthlyStats.tags}</div>
              <div className="text-xs text-muted-foreground">New Tags</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick TIL CTA */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-medium mb-2">Quick TIL</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Got a quick insight? Share it with the world!
            </p>
            <button 
              onClick={() => window.location.href = '/til#add-til'}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-xs font-medium transition-colors"
            >
              Add TIL
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
