"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Briefcase,
  GraduationCap,
  Mail,
  Sparkles,
  ExternalLink,
  Terminal,
  Github,
  Linkedin,
  MapPin,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  Globe,
  Layers,
  Network,
  Activity,
  Database,
  Code2,
  User,
  BookOpen,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const experience = [
  {
    title: "Senior Site Reliability Engineer (SRE)",
    company: "TrueFoundry",
    location: "India",
    period: "Sept. 2024 - Present",
    current: true,
    highlights: [
      "Driving multi-cloud adoption strategy across AWS, GCP, Azure and on-prem",
      "Built a modular Terraform framework that slashed client onboarding time by 70%",
      "Created Marketplace listings for major cloud providers, 40% increase in self-service customer acquisition",
    ],
  },
  {
    title: "Infrastructure Lead (Founding Engineer)",
    company: "Primetrace (Kutumb Crafto)",
    location: "India",
    period: "Feb. 2021 - Sept. 2024",
    current: false,
    highlights: [
      "Architected scalable infra on AWS with self-hosted K8s supporting 4M DAU, 1M RPM peak",
      "Reduced annual cloud expenditure by $200K through self-hosted services, pod/node binpacking, spot instances",
      "Designed highly available multi-broker Apache Kafka clusters and multi-node ELK Stack on spot instances",
      "Accelerated deployments to under 1 minute with self-hosted GitHub-Runners + ArgoCD + Devtron",
      "Achieved 99.99% uptime running stateless workloads on 95% spot instances",
      "Led comprehensive observability stack (APM, distributed tracing, logging, profiling, alerting)",
    ],
  },
  {
    title: "DevOps Engineer",
    company: "smallcase",
    location: "India",
    period: "Feb. 2019 - Sep. 2020",
    current: false,
    highlights: [
      "Spearheaded infra cost optimization resulting in 90% reduction in operational expenses",
      "Implemented HAProxy load balancing for improved performance and reliability",
      "Integrated observability tools: Elastic-APM, Kafka-manager, Kafka-topics-ui",
      "Deployed fault-tolerant data processing with Apache Kafka clusters and ELK Stack on spot instances",
    ],
  },
  {
    title: "Technical Mentor",
    company: "Udacity",
    location: "Remote",
    period: "Apr. 2018 - Present",
    current: true,
    highlights: [
      "Expert guidance and project reviews for Android and Python Development courses",
    ],
  },
  {
    title: "Open Source Contributor",
    company: "Utopian.io",
    location: "Remote",
    period: "Jun. 2018 - Present",
    current: true,
    highlights: [
      "Bug reviews and QA for multiple open-source projects",
    ],
  },
];

const skillCategories = [
  {
    label: "Cloud Platforms",
    icon: Globe,
    color: "text-blue-500",
    skills: ["AWS", "Azure", "GCP", "Terraform", "CloudFormation", "Spot Instances"],
  },
  {
    label: "Containerization",
    icon: Layers,
    color: "text-purple-500",
    skills: ["Kubernetes", "Docker", "Helm", "Kustomize", "ArgoCD", "GitOps"],
  },
  {
    label: "Infrastructure",
    icon: Terminal,
    color: "text-green-500",
    skills: ["IaC", "Linux", "IPv6", "Ansible", "Jenkins", "GitHub Actions"],
  },
  {
    label: "Networking",
    icon: Network,
    color: "text-orange-500",
    skills: ["Istio", "Traefik", "HAProxy", "Load Balancing", "RBAC", "Network Policies", "OpenVPN"],
  },
  {
    label: "Observability",
    icon: Activity,
    color: "text-red-500",
    skills: ["Prometheus", "Grafana", "Loki", "ELK Stack", "Elastic-APM", "Tempo", "Distributed Tracing"],
  },
  {
    label: "Data Systems",
    icon: Database,
    color: "text-cyan-500",
    skills: ["Apache Kafka", "Redpanda", "RabbitMQ", "PostgreSQL", "MySQL", "Redis", "Airbyte"],
  },
  {
    label: "Programming",
    icon: Code2,
    color: "text-yellow-500",
    skills: ["Python", "Bash", "Go", "Git", "CI/CD Pipelines", "dbt", "Airflow", "Spark"],
  },
];

const stats = [
  { label: "Years Experience", value: "6+", icon: Clock, color: "from-blue-500 to-cyan-500" },
  { label: "Daily Active Users", value: "4M+", icon: Users, color: "from-purple-500 to-pink-500" },
  { label: "Uptime SLA", value: "99.99%", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
  { label: "Cloud Costs Saved", value: "$200K", icon: DollarSign, color: "from-orange-500 to-amber-500" },
];

export default function ResumePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <motion.div
          className="absolute inset-0 -z-10 rounded-3xl"
          animate={{
            background: [
              "linear-gradient(to bottom right, oklch(0.95 0.05 250), oklch(0.95 0.05 300), oklch(0.95 0.05 350))",
              "linear-gradient(to bottom right, oklch(0.95 0.05 260), oklch(0.95 0.05 310), oklch(0.95 0.05 340))",
              "linear-gradient(to bottom right, oklch(0.95 0.05 250), oklch(0.95 0.05 300), oklch(0.95 0.05 350))",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(to bottom right, oklch(0.95 0.05 250), oklch(0.95 0.05 300), oklch(0.95 0.05 350))",
          }}
        />
        <div className="absolute inset-0 -z-10 rounded-3xl dark:bg-gradient-to-br dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Terminal className="h-4 w-4" />
            <span>$ cat resume.txt</span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Harshit Luthra
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Infrastructure Lead &middot; Security Analyst
          </motion.p>

          <motion.p
            className="text-base text-muted-foreground/80 italic max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            &ldquo;A tinkerer with a curious mind&rdquo;
          </motion.p>

          {/* Contact Links */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[
              { icon: Mail, label: "root@harshit.cloud", href: "mailto:root@harshit.cloud" },
              { icon: Github, label: "sachincool", href: "https://github.com/sachincool" },
              { icon: Linkedin, label: "harshit-luthra", href: "https://linkedin.com/in/harshit-luthra/" },
              { icon: Globe, label: "sachin.cool", href: "https://sachin.cool" },
            ].map((link, index) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.08, duration: 0.4 }}
              >
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-primary/5"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button size="lg" asChild className="group relative overflow-hidden">
              <a href="/Harshit_Resume.pdf" download>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 pointer-events-none"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <Download className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">Download PDF</span>
                <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform relative z-10" />
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
                <User className="mr-2 h-5 w-5" />
                About Me
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1 group cursor-default relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
                <CardContent className="pt-6 pb-4 relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Summary Section */}
      <motion.section
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ transformOrigin: "left" }}
          />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6 text-blue-500" />
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Results-driven Infrastructure Engineer with 6+ years of experience architecting and
              implementing scalable cloud solutions. Demonstrated expertise in optimizing infrastructure
              costs while maintaining 99.99% SLA for systems supporting 4M+ daily active users.
              Proficient in Kubernetes, AWS, and modern DevOps practices with a strong focus on
              automation, security, and performance optimization.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Experience Section */}
      <motion.section
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Briefcase className="h-7 w-7 text-blue-500" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Experience
          </span>
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500/30 hidden md:block" />

          <div className="space-y-8">
            {experience.map((job, index) => (
              <motion.div
                key={index}
                className="relative pl-0 md:pl-14"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Timeline dot */}
                <div className="absolute left-[11px] top-8 hidden md:flex items-center justify-center">
                  <div className={`w-[18px] h-[18px] rounded-full border-[3px] ${
                    job.current
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-purple-500/60 bg-purple-500/10"
                  }`} />
                  {job.current && (
                    <motion.div
                      className="absolute w-[18px] h-[18px] rounded-full border-2 border-blue-500/50"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>

                <Card className="hover:shadow-lg transition-all hover:-translate-y-0.5 group overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  />
                  <CardHeader className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                          <span className="font-medium text-foreground/80">{job.company}</span>
                          <span className="text-muted-foreground/40">&middot;</span>
                          <span className="inline-flex items-center gap-1 text-sm">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={job.current ? "default" : "secondary"}
                        className={job.current ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shrink-0" : "shrink-0"}
                      >
                        {job.period}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <ul className="space-y-2.5">
                      {job.highlights.map((highlight, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-start gap-2.5 text-muted-foreground"
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + idx * 0.06, duration: 0.4 }}
                        >
                          <ChevronRight className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                          <span>{highlight}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Layers className="h-7 w-7 text-purple-500" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Technical Skills
          </span>
        </h2>

        <motion.div
          className="grid md:grid-cols-2 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {skillCategories.map((category) => (
            <motion.div key={category.label} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5 group overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <category.icon className={`h-5 w-5 ${category.color}`} />
                    <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      {category.label}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Education Section */}
      <motion.section
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-green-500" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Education
          </span>
        </h2>

        <Card className="hover:shadow-lg transition-all overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ transformOrigin: "left" }}
          />
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">B.E. in Computer Science and Engineering</h3>
                <p className="text-muted-foreground font-medium">
                  Chitkara University, Punjab, India
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Badge variant="secondary" className="text-sm">
                    9.29 CGPA (Distinction)
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Specialization: Cyber-Security
                  </Badge>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 text-sm">
                2016 - 2020
              </Badge>
            </div>

            <Separator className="my-5" />

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Relevant Coursework
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Distributed Systems",
                  "Network Security",
                  "Cloud Computing",
                  "Database Management",
                  "Operating Systems",
                ].map((course) => (
                  <Badge
                    key={course}
                    variant="outline"
                    className="text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                  >
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* PDF Embed Section */}
      <motion.section
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <FileText className="h-7 w-7 text-orange-500" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Full Resume
          </span>
        </h2>

        <Card className="overflow-hidden relative">
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ transformOrigin: "left" }}
          />
          <CardContent className="p-2 md:p-4">
            <div className="w-full h-[1000px] md:h-[1200px] bg-muted/10 rounded-lg overflow-hidden">
              <iframe
                src="/Harshit_Resume.pdf"
                className="w-full h-full rounded-lg"
                title="Harshit Luthra Resume"
              />
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 relative overflow-hidden">
          {/* Floating decorative elements */}
          <motion.div
            className="absolute top-6 right-8 text-5xl text-purple-500/10 font-serif pointer-events-none"
            animate={{ y: [0, -8, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            &gt;_
          </motion.div>

          <CardContent className="pt-10 pb-10 text-center relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-purple-500" />
            </motion.div>
            <motion.h3
              className="text-2xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Interested in Working Together?
            </motion.h3>
            <motion.p
              className="text-muted-foreground mb-8 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              I&apos;m always open to discussing new opportunities, collaborations, or just
              geeking out about infrastructure and cloud architecture.
            </motion.p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Button asChild size="lg" className="relative overflow-hidden group">
                  <a href="mailto:root@harshit.cloud">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 pointer-events-none"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <Mail className="mr-2 h-5 w-5 relative z-10" />
                    <span className="relative z-10">Get in Touch</span>
                  </a>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Button asChild size="lg" variant="outline">
                  <a href="https://linkedin.com/in/harshit-luthra/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="mr-2 h-5 w-5" />
                    LinkedIn Profile
                  </a>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Button asChild size="lg" variant="outline">
                  <Link href="/about">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Read About Me
                  </Link>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
