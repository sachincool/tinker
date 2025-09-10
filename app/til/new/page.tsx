"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X, Lightbulb, Save } from "lucide-react";
import Link from "next/link";

export default function NewTILPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [codeExample, setCodeExample] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const suggestedTags = [
    "javascript", "typescript", "react", "nextjs", "css", "html",
    "node", "git", "vscode", "productivity", "performance", "accessibility"
  ];

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to your backend/CMS
    console.log({ title, content, codeExample, tags });
    alert("TIL saved! (This is a demo - in real app it would sync to your Obsidian vault)");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/til">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to TILs
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Share Your Learning</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Capture that "aha!" moment and share it with the world. Every small insight counts!
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>New TIL</CardTitle>
          <CardDescription>
            Share a quick insight, code snippet, or lesson learned. Keep it concise and actionable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., CSS Grid auto-fit vs auto-fill"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">What did you learn? *</Label>
              <Textarea
                id="content"
                placeholder="Explain your insight in a few sentences. What was the problem? What did you discover? Why is it useful?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Code Example */}
            <div className="space-y-2">
              <Label htmlFor="code">Code Example (optional)</Label>
              <Textarea
                id="code"
                placeholder="Add a code snippet to illustrate your point..."
                value={codeExample}
                onChange={(e) => setCodeExample(e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>
              
              {/* Current tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add new tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(newTag);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(newTag)}
                  disabled={!newTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested tags */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter(tag => !tags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save TIL
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/til">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview */}
      {(title || content) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your TIL will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    {title || "Your TIL title..."}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {content || "Your learning insight will appear here..."}
              </p>
              
              {codeExample && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {codeExample}
                  </code>
                </div>
              )}
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
