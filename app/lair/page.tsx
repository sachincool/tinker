import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Coffee } from "lucide-react";
import { CurrentlyStatus } from "@/components/blog/currently-status";
import ScrollReveal from "@/components/animations/scroll-reveal";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";

const CURRENTLY = [
  "antenna building",
  "hardware hacking",
  "frequency scanning",
  "signal analysis",
  "tinkering",
  "configuring",
];

const ON_THE_DESK = [
  {
    name: "RTL-SDR v3",
    spec: "rtl-sdr.com / 500 kHz – 1.7 GHz",
    desc: "for poking at the parts of the spectrum I'm not supposed to be on.",
  },
  {
    name: "Flipper Zero",
    spec: "stm32 / sub-1 GHz / nfc / ir",
    desc: "the multi-tool. the cat is mostly decorative.",
  },
  {
    name: "Pwnagotchi",
    spec: "pi zero w / e-ink / ai",
    desc: "trains itself by sniffing wifi handshakes. has feelings about it.",
  },
  {
    name: "LilyGO T-Dongle-S3",
    spec: "esp32-s3 / built-in display",
    desc: "the thing I keep meaning to write firmware for.",
  },
  {
    name: "RabbitLab antennas",
    spec: "custom dipoles & yagis",
    desc: "soldered in good lighting. tuned in bad lighting.",
  },
  {
    name: "Raspberry Pi Zero 2 W",
    spec: "arm cortex-a53 / 512 mb",
    desc: "the one that runs whatever I haven't moved to k8s yet.",
  },
  {
    name: "USB3.0 HDMI capture",
    spec: "ms2130 chipset",
    desc: "for grabbing footage off devices that pretend they don't have an output.",
  },
  {
    name: "Hourglass",
    spec: "approx. 3 minutes",
    desc: "for measuring how long a deploy actually takes.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);
  return {
    title: `The Lair | ${siteConfig.author.name}`,
    description:
      "What sits on the workbench: SDR, Flipper Zero, Pwnagotchi, antennas, and one hourglass.",
    alternates: { canonical: `${baseUrl}/lair` },
    openGraph: {
      title: `The Lair | ${siteConfig.author.name}`,
      description:
        "What sits on the workbench: SDR, Flipper Zero, Pwnagotchi, antennas, and one hourglass.",
      type: "website",
      url: `${baseUrl}/lair`,
      images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: `The Lair | ${siteConfig.title}` }],
    },
  };
}

export default function LairPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-10 md:space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          The lair
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight">
          The workbench, in detail.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Most of what I write here started somewhere on this desk. The hardware
          that pages me at 3am, the radios that scan a band I shouldn&apos;t,
          the pi zero that pretends it&apos;s a printer.
        </p>
        <div className="pt-1">
          <CurrentlyStatus activities={CURRENTLY} />
        </div>
      </header>

      {/* The photo */}
      <ScrollReveal direction="up" duration={0.5}>
      <figure className="space-y-3">
        <div className="relative aspect-[3/2] overflow-hidden rounded-md border border-border/60 bg-muted/40">
          <Image
            src="/images/workspace-setup.webp"
            alt="The workbench: SDR, Flipper Zero, Pwnagotchi, a Pi Zero, and an hourglass."
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
            className="object-cover"
          />
        </div>
        <figcaption className="font-serif italic text-sm text-muted-foreground text-center">
          The workbench, on a productive afternoon. The hourglass is for measuring how long a deploy actually takes.
        </figcaption>
      </figure>
      </ScrollReveal>

      {/* What's on the desk */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          On the desk
        </div>

        <ul className="divide-y divide-border/60">
          {ON_THE_DESK.map((item) => (
            <li key={item.name} className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 py-5">
              <div className="space-y-0.5">
                <p className="font-serif text-lg leading-tight">{item.name}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.spec}
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed sm:pt-1">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>
      </ScrollReveal>

      {/* Quote block — easter egg with binary footer */}
      <ScrollReveal direction="up" duration={0.5}>
      <section className="pt-2 space-y-6 text-center max-w-2xl mx-auto">
        <Coffee aria-hidden className="h-7 w-7 mx-auto text-primary/80" strokeWidth={1.5} />
        <blockquote className="font-serif italic text-xl md:text-2xl leading-snug text-foreground">
          &ldquo;Hope I die after I vanquish my thirst for more knowledge.&rdquo;
        </blockquote>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
          This nasty programmer never keeps away. He is never idle. He head-butts his way through problems to build his Webapps. A tech-savvy by nature and a professional programmer, this man is damn crazy.
        </p>
        <hr className="border-border/60 max-w-xs mx-auto" />
        <p
          className="font-mono text-[10px] sm:text-xs text-muted-foreground/70 break-all"
          aria-label="binary easter egg"
          title="one truth prevails"
        >
          01101111 01101110 01100101 00100000 01110100 01110010 01110101 01110100 01101000 00100000 01110000 01110010 01100101 01110110 01100001 01101001 01101100 01110011
        </p>
      </section>
      </ScrollReveal>

      {/* Back link */}
      <div className="pt-6">
        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
