import Link from "next/link";
import Image from "next/image";
import { type Post } from "@/lib/posts";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { CurrentlyStatus } from "@/components/blog/currently-status";
import ScrollReveal from "@/components/animations/scroll-reveal";

interface HomePageContentProps {
  latestPosts: Post[];
  tilCount: number;
  blogCount: number;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const TECH_STACK = ["kubernetes", "terraform", "aws", "next.js", "typescript", "postgres"];

const IMPACT = [
  { label: "Daily active users", value: "4M+" },
  { label: "Peak throughput", value: "1M/min" },
  { label: "Uptime on 95% spot", value: "99.99%" },
  { label: "Cloud spend trimmed", value: "$200K" },
];

const CURRENTLY = [
  "antenna building",
  "hardware hacking",
  "frequency scanning",
  "signal analysis",
  "tinkering",
  "configuring",
  "anime watching",
  "contemplating",
];

export default function HomePageContent({ latestPosts, tilCount, blogCount }: HomePageContentProps) {
  const [lead, ...rest] = latestPosts.slice(0, 4);
  const secondary = rest.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Hero */}
      <section className="grid md:grid-cols-[1fr_auto] md:gap-12 lg:gap-16 items-start">
        <div className="max-w-3xl space-y-6 md:space-y-8">
          <ScrollReveal direction="up" duration={0.5} delay={0}>
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Infrastructure notes
          </div>
          </ScrollReveal>

          <ScrollReveal direction="up" duration={0.5} delay={0.08}>
          <h1 className="text-5xl md:text-6xl leading-[1.05] tracking-tight">
            Production stories,
            <br />
            written in the calm after.
          </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" duration={0.5} delay={0.16}>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            I do platform work at a startup. This is where I write down the things
            I had to figure out the hard way, so future-me at 3am doesn&apos;t have to.
          </p>
          </ScrollReveal>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-base">
            <Link
              href="/blog"
              className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
            >
              Read the latest &rarr;
            </Link>
            <Link
              href="/til"
              className="text-foreground/80 underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
            >
              Browse TILs ({tilCount})
            </Link>
          </div>

          <CurrentlyStatus activities={CURRENTLY} />
        </div>

        {/* Avatar — small, framed, no glow */}
        <div className="hidden md:block">
          <div className="relative h-32 w-32 lg:h-40 lg:w-40 rounded-full overflow-hidden border border-border/60 bg-muted/40 shrink-0">
            <Image
              src="/logo/infra-magician-clean.webp"
              alt="Harshit"
              fill
              sizes="160px"
              className="object-cover scale-[1.55]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="my-12 md:my-16 border-border/60" />

      {/* The lair — teaser, links to /lair */}
      <section>
        <Link href="/lair" className="group flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
          <div className="relative w-full sm:w-64 md:w-72 aspect-[4/3] shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/40">
            <Image
              src="/images/workspace-setup.webp"
              alt="The workbench: SDR, Flipper Zero, Pwnagotchi, a Pi Zero, and an hourglass."
              fill
              sizes="(min-width: 1024px) 288px, (min-width: 640px) 256px, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex-1 space-y-2 sm:pt-1">
            <h3 className="font-serif text-2xl leading-tight tracking-tight group-hover:text-primary transition-colors">
              The workbench, in detail.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-prose">
              SDR, a Flipper, a Pwnagotchi, a few antennas I tuned in bad lighting, and an hourglass for measuring how long a deploy actually takes.
            </p>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary/80 pt-1 group-hover:text-primary">
              See the lair &rarr;
            </p>
          </div>
        </Link>
      </section>

      {/* Divider */}
      <hr className="my-12 md:my-16 border-border/60" />

      {/* Latest — newspaper-front layout: 1 lead + 3 secondary */}
      {lead && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Latest
            </div>
            <Link
              href="/blog"
              className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse all &rarr;
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Lead post */}
            <article className="group">
              <Link href={`/blog/${lead.slug}`} className="block space-y-4">
                {lead.heroImage && (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted/40 border border-border/60">
                    <Image
                      src={lead.heroImage}
                      alt={lead.heroAlt || lead.title}
                      fill
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {formatDate(lead.date).toLowerCase()}
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl leading-[1.1] tracking-tight group-hover:text-primary transition-colors">
                    {lead.title}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed line-clamp-3 max-w-prose">
                    {lead.excerpt}
                  </p>
                </div>
              </Link>
            </article>

            {/* Secondary posts — vertical stack on the right */}
            <div className="space-y-6 lg:border-l lg:border-border/60 lg:pl-10">
              {secondary.map((post) => (
                <article key={post.slug} className="group border-b border-border/60 pb-6 last:border-b-0 last:pb-0">
                  <Link href={`/blog/${post.slug}`} className="flex gap-4">
                    {post.heroImage && (
                      <div className="relative w-24 sm:w-28 aspect-square shrink-0 overflow-hidden rounded-md bg-muted/40 border border-border/60">
                        <Image
                          src={post.heroImage}
                          alt={post.heroAlt || post.title}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        {formatDate(post.date).toLowerCase()}
                      </p>
                      <h3 className="font-serif text-lg sm:text-xl leading-snug tracking-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <hr className="my-12 md:my-16 border-border/60" />

      {/* Newsletter — quiet, editorial */}
      <section className="max-w-3xl space-y-4">
        <NewsletterForm
          variant="default"
          title="The next post, in your inbox."
          description="Long-form infra writing, every few weeks. No tracking pixels, no marketing sequences, no LinkedIn-isms."
        />
      </section>

      {/* Divider */}
      <hr className="my-12 md:my-16 border-border/60" />

      {/* About + tech stack + honest numbers */}
      <section className="max-w-3xl space-y-4">
        <p className="text-base text-muted-foreground leading-relaxed">
          Harshit Luthra. Senior SRE, infrequent essayist, occasional
          source of production incidents.{" "}
          <Link
            href="/about"
            className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors"
          >
            More about me &rarr;
          </Link>
        </p>

        {/* Impact — real numbers, same set as the resume */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 pt-4">
          {IMPACT.map((stat) => (
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

        {/* What I work in */}
        <div className="pt-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">What I work in</p>
          <p className="font-mono text-sm text-foreground/80">
            {TECH_STACK.join(" · ")}
          </p>
        </div>

        {/* Honest numbers — real ones only */}
        <p className="font-mono text-xs text-muted-foreground pt-2">
          {blogCount} posts · {tilCount} TILs · writing here since 2018
        </p>
      </section>
    </div>
  );
}
