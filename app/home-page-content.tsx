"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Terminal,
  Coffee,
  BookOpen,
  Lightbulb,
  Rocket,
  Code2,
  TrendingUp,
  Calendar
} from "lucide-react";
import { type Post } from "@/lib/posts";
import ResendCube from "@/components/blog/resend-cube";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import ScrollReveal from "@/components/animations/scroll-reveal";
import AnimatedCounter from "@/components/animations/animated-counter";

interface HomePageContentProps {
  latestPosts: Post[];
  tilCount: number;
}

export default function HomePageContent({ latestPosts, tilCount }: HomePageContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const techStack = [
    { name: "Kubernetes", icon: "☸️", color: "text-blue-500" },
    { name: "Next.js", icon: "▲", color: "text-purple-500" },
    { name: "TypeScript", icon: "TS", color: "text-cyan-500" },
    { name: "Docker", icon: "🐳", color: "text-blue-600" },
    { name: "Terraform", icon: "🏗️", color: "text-purple-600" },
    { name: "AWS", icon: "☁️", color: "text-orange-500" },
  ];

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section with Animations */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 animate-gradient-xy"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20 animate-float hidden lg:block">
          <Terminal className="h-12 w-12 text-blue-500" />
        </div>
        <div className="absolute top-40 right-20 opacity-20 animate-float-delayed hidden lg:block">
          <Code2 className="h-16 w-16 text-purple-500" />
        </div>
        <div className="absolute bottom-20 right-40 opacity-20 animate-float hidden lg:block">
          <Sparkles className="h-10 w-10 text-pink-500" />
        </div>

        <div className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto px-4">
          <div className={`space-y-4 md:space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Welcome to the chaos</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="inline-block animate-wave">🧙‍♂️</span>
              {" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                Infra Magician&apos;s
              </span>
              <br />
              <span className="text-foreground">Digital Spellbook</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Level 99 Infrastructure Wizard, Dota2 Scrub, and Professional Chaos Engineer
            </p>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              I make servers cry, Kubernetes pods CrashLoopBackOff, and occasionally something works in production. 
              Welcome to my digital garden of infrastructure spells, epic fails, and rare victories. ✨
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button asChild size="lg" className="group">
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Read My Chaos
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group">
                <Link href="/til">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Browse TILs
                  <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="group">
                <a href="https://meet.harshit.cloud" target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule a Meeting
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* 3D Cube - Centered below text */}
        <div className="mt-12 flex justify-center px-4">
          <div className="w-full max-w-[450px] aspect-square relative" style={{ mixBlendMode: "lighten" }}>
            <ResendCube />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <ScrollReveal>
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Servers Crashed", value: "∞", color: "from-red-500 to-orange-500", icon: Zap },
              { label: "TILs Written", value: `${tilCount}`, color: "from-green-500 to-emerald-500", icon: Lightbulb },
              { label: "Dota MMR", value: "5k", color: "from-purple-500 to-pink-500", icon: TrendingUp },
              { label: "Coffee Mugs", value: "9001", color: "from-orange-500 to-yellow-500", icon: Coffee },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <CardContent className="pt-6 text-center">
                    <stat.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:scale-110 transition-transform" />
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      <AnimatedCounter value={stat.value} duration={2} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Latest Posts */}
      <ScrollReveal delay={0.1}>
        <section className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Rocket className="h-8 w-8 text-blue-500" />
                Latest Adventures
              </h2>
              <p className="text-muted-foreground mt-2">Fresh chaos from the trenches</p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/blog">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Card
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500 overflow-hidden h-full"
                >
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg sm:text-xl group-hover:text-blue-600 transition-colors break-words">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button asChild variant="ghost" size="sm" className="group/btn">
                      <Link href={`/blog/${post.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Tech Stack */}
      <ScrollReveal delay={0.1}>
        <section className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">My Arsenal</h2>
            <p className="text-muted-foreground">Tools I use to summon infrastructure magic</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <Card
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default text-center"
                >
                  <CardContent className="pt-6 pb-6">
                    <div className={`text-4xl mb-2 group-hover:scale-125 transition-transform ${tech.color}`}>
                      {tech.icon}
                    </div>
                    <p className="text-sm font-medium">{tech.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal delay={0.2}>
        <section className="max-w-4xl mx-auto px-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
            <CardContent className="pt-12 pb-12 text-center relative">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-pulse" />
              <h2 className="text-3xl font-bold mb-4">Ready to Dive In?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join me on this chaotic journey through infrastructure, code, and the occasional rage quit.
                No infrastructure was permanently harmed in the making of this blog.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/blog">
                    Start Reading
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/about">
                    About Me
                  </Link>
                </Button>
              </div>
              <div className="mt-8">
                <NewsletterForm
                  variant="card"
                  title="Join the Chaos Newsletter"
                  description="Weekly infrastructure spells, TILs, and tales from production. No spam, just chaos."
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </ScrollReveal>
    </div>
  );
}

