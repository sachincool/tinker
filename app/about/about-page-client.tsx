import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Github, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { CurrentlyStatus } from "@/components/blog/currently-status";
import ScrollReveal from "@/components/animations/scroll-reveal";

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

const WEIRD_FACTS = [
  "I study best if I act like I am teaching an imaginary group of students the material using a chalkboard.",
  "The more I think about getting asleep, the harder it gets to be asleep.",
  "I always lose erasers before finishing them.",
  "Even thinking about incomplete chalkboard erasures makes me uncomfortable.",
  "Every time I walk by a window or mirror I check myself out but pretend I'm just looking around.",
];

const SOCIAL_LINKS = [
  { icon: Github, label: "GitHub", href: "https://github.com/sachincool" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/exploit_sh" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/in/harshit-luthra/" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/exploit.sh" },
  { icon: Mail, label: "Email", href: "mailto:root@harshit.cloud" },
  { icon: CalendarClock, label: "Book a call", href: "https://meet.harshit.cloud/book/15min" },
];

export default function AboutPageClient() {
  // pick a single weird fact per render — keeps it static, no client motion
  const fact = WEIRD_FACTS[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-10 md:space-y-12">
      {/* Editorial header */}
      <header className="space-y-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          About
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] tracking-tight">
          Harshit Luthra.
        </h1>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          aka sachincool
        </p>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Senior SRE. Infrequent essayist. Occasional source of production
          incidents. This page is the long version of the bio.
        </p>
        <div className="pt-1">
          <CurrentlyStatus activities={CURRENTLY} />
        </div>
      </header>

      {/* Profile image — clean circular portrait, hairline border */}
      <ScrollReveal direction="up" duration={0.5}>
      <figure className="flex justify-center">
        <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden border border-border/60 bg-muted/40">
          <Image
            src="/logo/infra-magician-clean.webp"
            alt="Harshit Luthra"
            fill
            sizes="192px"
            className="object-cover scale-[1.55]"
            priority
          />
        </div>
      </figure>
      </ScrollReveal>

      {/* Bio prose */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="space-y-5 text-base md:text-lg leading-relaxed text-foreground/90">
        <p>
          I&apos;m a passionate infrastructure engineer who spends most days
          playing with servers, orchestrating Kubernetes clusters, and
          occasionally making production environments cry, then fixing
          them, of course.
        </p>
        <p>
          The journey started with C in college, moved to Python for scripts,
          spent a long stretch in love with Kotlin and Android, and somehow
          ended up in the beautiful chaos of DevOps and infrastructure. These
          days I tame containers, write Infrastructure as Code, and pretend to
          understand distributed systems.
        </p>
        <p>
          When I&apos;m not debugging why a pod is in CrashLoopBackOff, you&apos;ll
          find me poking at radio frequencies with SDR, hacking hardware with a
          Flipper Zero, training a Pwnagotchi, watching anime, grinding to 5k
          MMR in Dota 2 (Meepo, Tinker, Timbersaw), reliving the glory days of
          A3 India, or contemplating the meaning of life over pizza and coffee
          at 3am.
        </p>
      </section>
      </ScrollReveal>

      {/* Weird fact — quiet pull quote */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          One weird fact
        </div>
        <blockquote className="font-serif italic text-xl md:text-2xl leading-snug text-foreground border-l border-border/60 pl-5">
          &ldquo;{fact}&rdquo;
        </blockquote>
      </section>
      </ScrollReveal>

      {/* The lair pointer — workbench lives there now */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          The lair
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          The desk, the SDR, the Flipper, the Pwnagotchi, and the hourglass for
          measuring how long a deploy actually takes:{" "}
          <Link
            href="/lair"
            className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          >
            see the workbench &rarr;
          </Link>
        </p>
      </section>
      </ScrollReveal>

      {/* Quick links — small mono row */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Elsewhere on the site
        </div>
        <p className="font-mono text-sm text-foreground/80 leading-relaxed">
          <Link href="/blog" className="hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary">
            Read the blog
          </Link>
          <span className="text-muted-foreground/60 mx-2">·</span>
          <Link href="/til" className="hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary">
            Browse TILs
          </Link>
          <span className="text-muted-foreground/60 mx-2">·</span>
          <Link href="/lair" className="hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary">
            See the lair
          </Link>
          <span className="text-muted-foreground/60 mx-2">·</span>
          <a
            href="/Harshit_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-4 decoration-border hover:decoration-primary"
          >
            CV
          </a>
        </p>
      </section>
      </ScrollReveal>

      {/* Open to — the connect CTA */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Open to
        </div>
        <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
          IoT, hardware hacking, security, CTFs, DevOps and SRE war stories,
          or a 1v1 in Dota 2 (Meepo, if you&apos;re feeling brave). I also hate
          watching teams burn VC money on unoptimized infra so Jeff Bezos can buy
          another yacht. If any of that sounds like your kind of conversation,{" "}
          <a
            href="mailto:root@harshit.cloud"
            className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
          >
            let&apos;s talk
          </a>
          .
        </p>
      </section>
      </ScrollReveal>

      {/* Social — minimal icon row */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Find me
        </div>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <link.icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="font-mono text-xs uppercase tracking-[0.16em]">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      </ScrollReveal>
    </div>
  );
}
