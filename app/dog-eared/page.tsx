import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import { headers } from "next/headers";

// ponytail: plain array in the page file. Move to data/ if this outgrows one screen.
const rereads = [
  {
    title: "Building a Production-Grade ECR Pipeline for EKS",
    url: "https://timderzhavets.com/blog/building-a-production-grade-ecr-pipeline-for-eks/",
    author: "Tim Derzhavets",
    source: "timderzhavets.com",
    tags: ["aws", "ecr", "eks"],
    why: "Every ECR question I've ever fielded, answered in one place. IRSA instead of token-refresh cron hacks, lifecycle policies before the storage bill grows teeth, scan-on-push wired into admission control. I reopen it before touching any registry work.",
  },
  {
    title: "What I Look For When Interviewing Senior Engineers",
    url: "https://aniljaiswal.com/blog/what-i-look-for-when-interviewing-senior-engineers",
    author: "Anil Jaiswal",
    source: "aniljaiswal.com",
    tags: ["hiring", "engineering-leadership"],
    why: "Seniority as blast radius, not years. Opens with a candidate who nails the system design in eight minutes and still doesn't get the offer, then explains exactly why. I reread it before every interview loop I run.",
  },
  {
    title: "How We Cut Our AWS Bill ~45% Without Slowing Anyone Down",
    url: "https://aniljaiswal.com/blog/how-we-cut-aws-bill-45-percent",
    author: "Anil Jaiswal",
    source: "aniljaiswal.com",
    tags: ["aws", "cost-optimization", "platform"],
    why: "$30k/month down to $16.5k with receipts. The money hides three levels deep in Cost Explorer usage types: cross-AZ NAT traffic, orphaned Secrets Manager entries, idle IPv4. Cost as a platform default, not a cleanup sprint.",
  },
  {
    title:
      "OpenAI Already Told Us the Kubernetes Scaling Story, Most People Just Did Not Read It Closely",
    url: "https://www.dheeth.blog/openai-kubernetes-scaling-llm-teardown/",
    author: "Pawan Kumar",
    source: "dheeth.blog",
    tags: ["kubernetes", "llm-infra"],
    why: "Reads OpenAI's decade of scaling posts closer than most of us read our own runbooks, then lands the right conclusion: copy the questions, not the 7,500-node architecture. “Can a node be Ready but still unsafe for GPU work?” lives in my head now.",
  },
  {
    title: "The Request Is the Wrong Unit of Scale for LLMs on Kubernetes",
    url: "https://www.dheeth.blog/real-unit-of-llm-infrastructure-is-the-token/",
    author: "Pawan Kumar",
    source: "dheeth.blog",
    tags: ["llm-infra", "observability"],
    why: "Your dashboard says traffic is flat while users watch the model think forever. The framing that fixes it: the HTTP request is only the envelope, the GPU sees token work. I quote this whenever someone proposes autoscaling inference on request count.",
  },
  {
    title: "ndots: The Hidden DNS Logic Behind Resolving Kubernetes Service Names",
    url: "https://blogs.kratik.dev/what-is-ndots-in-dns",
    author: "Kratik Jain",
    source: "blogs.kratik.dev",
    tags: ["kubernetes", "dns"],
    why: "Why does a pod resolving api.github.com fire five DNS queries? ndots:5 plus search domains, demonstrated in live CoreDNS logs instead of asserted. The trailing-dot trick at the end is the bit I keep re-explaining to people.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);
  const description =
    "The short shelf of engineering writing I keep rereading, and why each piece earned its folded corner.";

  return {
    title: `Dog-eared | ${siteConfig.author.name}`,
    description,
    openGraph: {
      title: `Dog-eared | ${siteConfig.author.name}`,
      description,
      type: "website",
      url: `${baseUrl}/dog-eared`,
      siteName: siteConfig.title,
    },
    twitter: {
      card: "summary_large_image",
      title: `Dog-eared | ${siteConfig.author.name}`,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/dog-eared`,
    },
  };
}

export default async function DogEaredPage() {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteConfig.title} · Dog-eared`,
    description:
      "The short shelf of engineering writing I keep rereading, and why each piece earned its folded corner.",
    url: `${baseUrl}/dog-eared`,
    isPartOf: { "@type": "WebSite", name: siteConfig.title, url: baseUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: rereads.length,
      itemListElement: rereads.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: item.url,
        name: item.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-10 md:space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Dog-eared
          </div>
          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight">
            Corners folded on purpose.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Most saved links die in the bookmarks bar. These didn&apos;t. I&apos;ve
            read each of them enough times to quote them in arguments, and they
            still hand me something new on every pass. Short list by design; if
            it&apos;s here, it earned it.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            The shelf
          </div>

          <ul className="divide-y divide-border/60">
            {rereads.map((item) => (
              <li key={item.url} className="py-6 first:pt-2">
                <article className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {item.author} · {item.source}
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl leading-[1.2] tracking-tight">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {item.title}
                      <span className="text-muted-foreground text-base ml-1.5" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[62ch]">
                    {item.why}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-2">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
