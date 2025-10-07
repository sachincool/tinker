"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Lightbulb, ExternalLink, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function TILPage() {
  const tils = [
    {
      id: "kubectl-neat-trick",
      title: "kubectl neat - Remove Kubernetes YAML Clutter",
      content: "Use kubectl neat plugin to remove all the noise from Kubernetes YAML output. No more creationTimestamp and managedFields garbage!",
      date: "2024-12-10",
      tags: ["kubernetes", "kubectl", "productivity"],
      codeExample: "kubectl get pod my-pod -o yaml | kubectl neat"
    },
    {
      id: "docker-build-cache-trick",
      title: "Docker Build Cache: The .dockerignore Gotcha",
      content: "Editor swap files and temp files can invalidate your Docker build cache. A proper .dockerignore saved me from 5-minute builds.",
      date: "2024-12-05",
      tags: ["docker", "devops", "optimization"],
      codeExample: "# .dockerignore\n*.swp\n.DS_Store\nnode_modules"
    },
    {
      id: "k8s-ephemeral-containers",
      title: "Kubernetes Ephemeral Debug Containers",
      content: "Debug running pods without rebuilding images. Just attach a debug container with all your tools!",
      date: "2024-12-01",
      tags: ["kubernetes", "debugging", "devops"],
      codeExample: "kubectl debug -it my-pod --image=nicolaka/netshoot"
    },
    {
      id: "terraform-fmt-check",
      title: "Terraform fmt in CI/CD",
      content: "Use `terraform fmt -check -recursive` in CI to catch formatting issues before merge. Keeps the team sane.",
      date: "2024-11-25",
      tags: ["terraform", "cicd", "devops"],
      codeExample: "terraform fmt -check -recursive"
    },
    {
      id: "aws-cli-output-table",
      title: "AWS CLI Table Output for Humans",
      content: "Switch from JSON to table output for better readability. Your eyes will thank you.",
      date: "2024-11-20",
      tags: ["aws", "cli", "productivity"],
      codeExample: "aws ec2 describe-instances --output table"
    },
    {
      id: "git-interactive-rebase",
      title: "Git interactive rebase for clean history",
      content: "Use `git rebase -i HEAD~n` to clean up your commit history before merging. Squash those 'fix typo' commits!",
      date: "2024-11-15",
      tags: ["git", "workflow", "productivity"],
      codeExample: "git rebase -i HEAD~3"
    },
    {
      id: "bash-set-options",
      title: "Bash set -euxo pipefail for Safer Scripts",
      content: "Stop silent failures in bash scripts. These flags make your scripts fail fast and show what they're doing.",
      date: "2024-11-10",
      tags: ["bash", "scripting", "debugging"],
      codeExample: "set -euxo pipefail  # Exit on error, undefined vars, pipe fails"
    },
    {
      id: "k8s-events-debugging",
      title: "kubectl get events for Quick Debugging",
      content: "Before diving into logs, check events. They often tell you exactly what went wrong with scheduling or startup.",
      date: "2024-11-05",
      tags: ["kubernetes", "debugging", "kubectl"],
      codeExample: "kubectl get events --field-selector involvedObject.name=my-pod"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 relative py-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-yellow-50 via-orange-50 to-transparent dark:from-yellow-950/20 dark:via-orange-950/20 rounded-3xl"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span>Daily Knowledge Drops</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Lightbulb className="h-10 w-10 text-yellow-500 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Today I Learned
            </span>
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Quick insights, code snippets, and "aha!" moments from my daily tinkering and chaos engineering.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search TILs..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            <SelectItem value="kubernetes">Kubernetes</SelectItem>
            <SelectItem value="docker">Docker</SelectItem>
            <SelectItem value="terraform">Terraform</SelectItem>
            <SelectItem value="aws">AWS</SelectItem>
            <SelectItem value="bash">Bash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default">
          <CardContent className="pt-6 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">127</div>
            <p className="text-xs text-muted-foreground mt-1">Total TILs</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">12</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default">
          <CardContent className="pt-6 text-center">
            <Lightbulb className="h-6 w-6 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">23</div>
            <p className="text-xs text-muted-foreground mt-1">Different topics</p>
          </CardContent>
        </Card>
      </div>

      {/* TIL Grid */}
      <div className="grid gap-6">
        {tils.map((til) => (
          <Card key={til.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2 group-hover:text-yellow-600 transition-colors">
                    <Lightbulb className="h-4 w-4 text-yellow-500 group-hover:animate-pulse" />
                    {til.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(til.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/til/${til.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {til.content}
              </p>
              
              {til.codeExample && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                    {til.codeExample}
                  </code>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {til.tags.map((tag) => (
                  <Link key={tag} href={`/tags/${tag}`}>
                    <Badge variant="outline" className="hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900 transition-colors text-xs cursor-pointer">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More TILs
        </Button>
      </div>
    </div>
  );
}
