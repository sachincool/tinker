"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Award,
  Mail,
  Sparkles,
  ExternalLink,
  Terminal
} from "lucide-react";
import Link from "next/link";

export default function ResumePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const experience = [
    {
      title: "Senior DevOps Engineer",
      company: "Tech Company",
      period: "2022 - Present",
      description: "Leading infrastructure initiatives, managing Kubernetes clusters, and breaking things (then fixing them).",
      highlights: [
        "Orchestrated 100+ microservices on Kubernetes",
        "Reduced deployment time by 60% with CI/CD automation",
        "Survived multiple production incidents without crying"
      ]
    },
    {
      title: "DevOps Engineer",
      company: "Previous Company",
      period: "2020 - 2022",
      description: "Building and maintaining cloud infrastructure, automating all the things.",
      highlights: [
        "Implemented Infrastructure as Code with Terraform",
        "Managed AWS infrastructure at scale",
        "Learned why 'It works on my machine' is never acceptable"
      ]
    }
  ];

  const skills = {
    "Infrastructure & Cloud": ["Kubernetes", "Docker", "AWS", "GCP", "Azure", "Terraform"],
    "Programming": ["Python", "Go", "Bash", "TypeScript", "JavaScript"],
    "DevOps Tools": ["Jenkins", "GitLab CI", "GitHub Actions", "ArgoCD", "Helm"],
    "Monitoring": ["Prometheus", "Grafana", "ELK Stack", "Datadog"],
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-3xl"></div>
        
        <div className={`text-center space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
            <Terminal className="h-4 w-4" />
            <span>$ cat resume.txt</span>
          </div>

          <FileText className="h-20 w-20 mx-auto text-blue-500" />

          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Resume
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Harshit Luthra — Infrastructure Engineer & Professional Chaos Wrangler
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" asChild className="group">
              <a href="/Harshit_Resume.pdf" download>
                <Download className="mr-2 h-5 w-5" />
                Download PDF
                <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/Harshit_Resume.pdf" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                View PDF
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">
                <FileText className="mr-2 h-5 w-5" />
                About Me
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PDF Embed */}
      <section className="max-w-6xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="w-full h-[1200px] bg-muted/10">
              <iframe
                src="/Harshit_Resume.pdf"
                className="w-full h-full"
                title="Harshit Luthra Resume"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Summary */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Quick Overview</h2>

        {/* Experience */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-500" />
            Professional Experience
          </h3>
          <div className="space-y-6">
            {experience.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge variant="secondary">{job.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{job.description}</p>
                  <ul className="space-y-2">
                    {job.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-purple-500" />
            Technical Skills
          </h3>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Education */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-green-500" />
            Education & Certifications
          </h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">Bachelor of Technology</h4>
                  <p className="text-muted-foreground">Computer Science • University Name • 2016-2020</p>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Certifications</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Certified Kubernetes Administrator (CKA)</li>
                    <li>• AWS Solutions Architect</li>
                    <li>• Professional Chaos Engineer (Self-Certified)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Interested in Working Together?</h3>
            <p className="text-muted-foreground mb-6">
              I&apos;m always open to discussing new opportunities, collaborations, or just geeking out about infrastructure.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg">
                <a href="mailto:contact@sachin.cool">
                  <Mail className="mr-2 h-5 w-5" />
                  Get in Touch
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="https://linkedin.com/in/harshit-luthra/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  LinkedIn Profile
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

