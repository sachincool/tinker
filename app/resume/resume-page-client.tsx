"use client";

import Link from "next/link";

const experience = [
  {
    title: "Senior Site Reliability Engineer (SRE)",
    company: "TrueFoundry",
    location: "India",
    period: "Sep 2024 — Present",
    current: true,
    summary:
      "Own platform reliability, observability, incident response, and customer success for a multi-tenant SaaS platform serving enterprise ML workloads across AWS, GCP, Azure, and on-prem. Partner directly with global enterprise customers on onboarding and long-term operational health.",
    highlights: [
      "Built a modular Terraform framework that cut client onboarding time by 70% across AWS, Azure, GCP, and on-prem; complemented by AWS/GCP/Azure Marketplace listings that drove a 40% increase in self-service customer acquisition",
      "Migrated the platform's logging stack from Grafana Loki to VictoriaLogs — 94% lower query latency, ~40% smaller storage footprint, 3x ingestion throughput, ~50% lower CPU/RAM; published as a public engineering benchmark",
      "Led a platform-wide monitoring overhaul — bifurcated alerts into P0/P1 severity tiers and migrated critical components to New Relic after a successful PoC, improving signal quality with flat observability spend",
      "Architected a severity-tiered incident management and on-call system integrating Sentry, Grafana, and New Relic with Zenduty and Slack, with team-wise routing across five functional domains — materially reducing MTTR and on-call noise",
      "Drove infrastructure standardization across the fleet (security contacts, K8s labels/annotations, resource conventions) and hardened multi-tenant SaaS via tighter tenant isolation, namespace-scoped RBAC, and resource governance",
      "Escalation point for complex multi-cloud production debugging across EKS/GKE/AKS — Karpenter, EFS/CSI, GPU node scheduling, IAM/IRSA, networking, airgapped artifact registries — while keeping enterprise SLAs intact",
      "Routinely support late-IST and weekend windows for onboarding, cluster upgrades, and live debugging with global enterprise customers (e.g., Riot Games, Zscaler)",
    ],
    tech: ["kubernetes", "terraform", "aws", "gcp", "azure", "victorialogs", "new relic", "karpenter"],
  },
  {
    title: "Infrastructure Lead (Founding Engineer)",
    company: "Primetrace (Kutumb Crafto)",
    location: "India",
    period: "Feb 2021 — Sep 2024",
    current: false,
    summary:
      "Architected and operated AWS-based infrastructure on self-hosted Kubernetes supporting 4M DAU at 1M RPM peak. Built monitoring on RED/USE methodologies with Prometheus, Grafana, Elastic-APM, Pyroscope, Loki, and Robusta.",
    highlights: [
      "Reduced annual cloud spend by $200K via self-hosted services, efficient pod/node binpacking, spot-instance utilization, and trimming network flow logs and metrics volume",
      "Designed and maintained highly available multi-broker Apache Kafka clusters and a multi-node ELK Stack on spot instances, balancing data resilience with cost",
      "Hardened cluster security through comprehensive network policies and RBAC configurations, materially reducing the attack surface",
      "Cut deployment times to under one minute using self-hosted GitHub Runners on spot instances integrated with ArgoCD and Devtron",
      "Expanded global reach by rolling out IPv6 across the stack and integrating AWS Global Accelerator to reduce latency for international markets",
      "Achieved 99.99% uptime for stateless workloads on 95% spot instances via time-based scaling and node hibernation during low-traffic windows",
      "Led integration of a full observability stack: centralized monitoring, APM, distributed tracing, logging, profiling, and alerting",
    ],
    tech: ["aws", "kubernetes", "kafka", "elk", "prometheus", "grafana", "argocd", "spot instances"],
  },
  {
    title: "DevOps Engineer",
    company: "smallcase",
    location: "India",
    period: "Feb 2019 — Sep 2020",
    current: false,
    summary:
      "Managed core infrastructure (OpenVPN, Heartbeat, Elastalert, Grafana) and integrated developer tooling (Wiki.js, Sentry, JFrog Artifactory). Built Ansible automation for deployments, log rotation, backups, and monitoring agents; tuned CI/CD on Jenkins and AWS CodeDeploy.",
    highlights: [
      "Drove infrastructure cost optimization that delivered a 90% reduction in operational expenses while maintaining service quality",
      "Implemented HAProxy load balancing to improve network performance and reduce application response times",
      "Improved developer productivity by integrating open-source observability tools — Elastic-APM, Kafka-manager, Kafka-topics-ui",
      "Designed fault-tolerant data infrastructure on multi-broker Apache Kafka clusters and a distributed ELK Stack running on spot instances",
    ],
    tech: ["ansible", "jenkins", "aws", "haproxy", "kafka", "elk"],
  },
  {
    title: "Technical Mentor",
    company: "Udacity",
    location: "Remote",
    period: "Apr 2018 — Present",
    current: true,
    summary: "",
    highlights: [
      "Mentor students in Android and Python Development; review project submissions and provide feedback to improve technical depth and code quality",
    ],
    tech: [],
  },
  {
    title: "Open Source Contributor",
    company: "Utopian.io",
    location: "Remote",
    period: "Jun 2018 — Jan 2019",
    current: false,
    summary: "",
    highlights: [
      "Performed bug reviews and QA across multiple open-source projects, contributing to improved reliability and security alongside a global contributor community",
    ],
    tech: [],
  },
];

const honors = [
  { year: "2024", title: "Winner, AWS GameDay: Security & Resilience (2x)", location: "Bangalore" },
  { year: "2023", title: "Runner-up, AWS GameDay: Microservices", location: "Bangalore" },
  { year: "2018", title: "Winner, MSHacks 2.0 — Microsoft Hackathon", location: "LPU, Jalandhar" },
  { year: "2018", title: "Runner-up, Octahacks", location: "Chandigarh" },
  { year: "2018", title: "Winner, Code Breakers", location: "CSI Chandigarh" },
  { year: "2018", title: "Runner-up, SAP Next-Gen Hackathon", location: "Chandigarh" },
  { year: "2017", title: "Runner-up, Codex C++", location: "CSI Punjab" },
];

const certifications = [
  {
    title: "CKS — Certified Kubernetes Security Specialist",
    issuer: "Linux Foundation",
    year: "2023",
    detail: "Credential LF-fty09fzmce",
  },
  {
    title: "CKA — Certified Kubernetes Administrator",
    issuer: "Linux Foundation",
    year: "2021 · renewed 2023",
    detail: "Credential LF-bl5pcg30qm",
  },
  {
    title: "AWS Certified Solutions Architect — Associate",
    issuer: "Amazon Web Services",
    year: "2019",
    detail: "Credential K71S1HB13NBEQT5N",
  },
  {
    title: "Udacity Nanodegrees",
    issuer: "Udacity",
    year: "2018",
    detail: "Android Development · Data Structures · Python Foundation · Programming Fundamentals",
  },
];

const skillCategories = [
  {
    label: "Cloud platforms",
    skills: ["AWS", "Azure", "GCP", "Terraform", "CloudFormation"],
  },
  {
    label: "Containerization",
    skills: ["Kubernetes", "Docker", "Helm", "Kustomize", "ArgoCD", "GitOps"],
  },
  {
    label: "Infrastructure",
    skills: ["IaC", "Linux", "Ansible", "Jenkins", "GitHub Actions"],
  },
  {
    label: "Networking",
    skills: ["Istio", "Traefik", "HAProxy", "Load Balancing", "RBAC", "Network Policies", "OpenVPN", "IPv6"],
  },
  {
    label: "Observability",
    skills: ["Prometheus", "Grafana", "Loki", "VictoriaLogs", "New Relic", "ELK Stack", "Elastic-APM", "Tempo", "Distributed Tracing"],
  },
  {
    label: "Data systems",
    skills: ["Apache Kafka", "Redpanda", "RabbitMQ", "PostgreSQL", "MySQL", "Redis", "Airbyte", "dbt", "Airflow", "Spark"],
  },
  {
    label: "Programming",
    skills: ["Python", "Go", "Bash", "Git", "CI/CD Pipelines"],
  },
];

const stats = [
  { label: "Years in production", value: "7+" },
  { label: "Daily active users", value: "4M+" },
  { label: "Uptime SLA held", value: "99.99%" },
  { label: "Cloud spend trimmed", value: "$200K" },
];

const contactLinks = [
  { label: "root@harshit.cloud", href: "mailto:root@harshit.cloud" },
  { label: "github.com/sachincool", href: "https://github.com/sachincool" },
  { label: "linkedin/harshit-luthra", href: "https://linkedin.com/in/harshit-luthra/" },
  { label: "sachin.cool", href: "https://sachin.cool" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </div>
  );
}

export default function ResumePageClient() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-16">
      {/* Header */}
      <header className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Resume
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight">
            Harshit Luthra
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            Infrastructure and reliability engineer. A tinkerer with a curious mind.
          </p>
        </div>

        {/* Contact line */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {contactLinks.map((link, i) => (
            <span key={link.label} className="inline-flex items-center gap-5">
              <a
                href={link.href}
                target={link.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </a>
              {i < contactLinks.length - 1 && (
                <span aria-hidden className="text-border">/</span>
              )}
            </span>
          ))}
        </div>

        {/* Action row — quiet outline buttons, no gradients */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-base">
          <a
            href="/Harshit_Resume.pdf"
            download
            className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          >
            Download PDF &darr;
          </a>
          <a
            href="/Harshit_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            View in browser &rarr;
          </a>
          <Link
            href="/about"
            className="text-foreground/80 underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            About me &rarr;
          </Link>
        </div>
      </header>

      {/* Numbers — flat, no cards, no gradients */}
      <section className="space-y-6">
        <Eyebrow>By the numbers</Eyebrow>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-serif text-3xl md:text-4xl leading-none text-foreground">
                {stat.value}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section className="space-y-4">
        <Eyebrow>Summary</Eyebrow>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-prose">
          Infrastructure and reliability engineer with 7+ years building and operating cloud-native
          platforms. Maintained 99.99% uptime for systems serving 4M+ daily active users while
          cutting infrastructure spend significantly. Strong background across Kubernetes,
          AWS/GCP/Azure, observability, and DevSecOps, with hands-on depth in networking,
          databases, storage, and multi-tenant SaaS operations. Comfortable owning incidents
          end-to-end and partnering with engineering and customer teams to ship reliable systems.
        </p>
      </section>

      {/* Experience */}
      <section className="space-y-8">
        <Eyebrow>Experience</Eyebrow>
        <div className="space-y-12">
          {experience.map((job, idx) => (
            <article key={`${job.company}-${idx}`} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground order-2 sm:order-1 shrink-0">
                  {job.period.toLowerCase()}
                  {job.current && (
                    <span className="ml-2 inline-flex items-center gap-1 text-primary">
                      <span className="inline-block h-1 w-1 rounded-full bg-primary" />
                      current
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl md:text-2xl leading-tight tracking-tight">
                  {job.title}
                </h3>
                <p className="text-sm text-foreground/80">
                  <span className="text-foreground">{job.company}</span>
                  <span className="text-muted-foreground/50"> · </span>
                  <span className="text-muted-foreground">{job.location}</span>
                </p>
              </div>

              {job.summary && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-prose">
                  {job.summary}
                </p>
              )}

              <ul className="space-y-2 pt-1">
                {job.highlights.map((highlight, hi) => (
                  <li
                    key={hi}
                    className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground leading-relaxed"
                  >
                    <span aria-hidden className="text-primary/70 mt-2 shrink-0">—</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              {job.tech.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2">
                  {job.tech.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-6">
        <Eyebrow>Skills</Eyebrow>
        <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
          {skillCategories.map((cat) => (
            <div key={cat.label} className="space-y-2">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {cat.label}
              </dt>
              <dd className="font-mono text-sm text-foreground/80 leading-relaxed">
                {cat.skills.join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Education */}
      <section className="space-y-6">
        <Eyebrow>Education</Eyebrow>
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            2016 — 2020
          </p>
          <div className="space-y-1">
            <h3 className="font-serif text-xl md:text-2xl leading-tight tracking-tight">
              B.E. in Computer Science and Engineering
            </h3>
            <p className="text-sm text-foreground/80">
              <span className="text-foreground">Chitkara University, Punjab, India</span>
              <span className="text-muted-foreground/50"> · </span>
              <span className="text-muted-foreground">9.29 CGPA (Distinction)</span>
              <span className="text-muted-foreground/50"> · </span>
              <span className="text-muted-foreground">Specialization: Cyber-Security</span>
            </p>
          </div>
          <div className="pt-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
              Relevant coursework
            </p>
            <p className="font-mono text-sm text-foreground/80">
              Distributed Systems · Network Security · Cloud Computing · Database Management · Operating Systems
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="space-y-6">
        <Eyebrow>Certifications</Eyebrow>
        <ul className="space-y-6">
          {certifications.map((cert) => (
            <li key={cert.title} className="space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {cert.year.toLowerCase()}
              </p>
              <h3 className="font-serif text-lg md:text-xl leading-tight tracking-tight">
                {cert.title}
              </h3>
              <p className="text-sm text-foreground/80">
                <span className="text-foreground">{cert.issuer}</span>
                <span className="text-muted-foreground/50"> · </span>
                <span className="text-muted-foreground">{cert.detail}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Honors */}
      <section className="space-y-6">
        <Eyebrow>Honors &amp; awards</Eyebrow>
        <ul className="divide-y divide-border/60">
          {honors.map((item) => (
            <li
              key={`${item.year}-${item.title}`}
              className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground shrink-0">
                  {item.year}
                </span>
                <span className="text-sm sm:text-base text-foreground/90">{item.title}</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:shrink-0 sm:text-right">
                {item.location}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Full PDF */}
      <section className="space-y-6">
        <Eyebrow>Full resume</Eyebrow>
        <div className="w-full h-[800px] md:h-[1000px] bg-muted/30 border border-border/60 rounded-md overflow-hidden">
          <iframe
            src="/Harshit_Resume.pdf"
            className="w-full h-full"
            title="Harshit Luthra Resume"
          />
        </div>
      </section>

      {/* Get in touch — quiet, editorial */}
      <section className="space-y-4">
        <Eyebrow>Get in touch</Eyebrow>
        <p className="text-base text-muted-foreground leading-relaxed max-w-prose">
          Open to discussing infrastructure work, collaborations, or just geeking
          out about Kubernetes and observability.{" "}
          <a
            href="mailto:root@harshit.cloud"
            className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          >
            root@harshit.cloud
          </a>
          {" · "}
          <a
            href="https://linkedin.com/in/harshit-luthra/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            LinkedIn &rarr;
          </a>
        </p>
      </section>
    </div>
  );
}
