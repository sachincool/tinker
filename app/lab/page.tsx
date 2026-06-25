import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowUpRight, Terminal } from "lucide-react";
import { SplitFlap } from "@/components/lab/split-flap";
import { RelayMap } from "@/components/lab/relay-map";
import { CommitTicker } from "@/components/lab/commit-ticker";
import { CodeBlock } from "@/components/blog/code-block";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";

const CURRENTLY = [
  "compressing",
  "tunneling",
  "scaling",
  "bypassing",
  "rebasing",
  "not sleeping",
];

const BUILDING = [
  {
    name: "Middle-out compression",
    spec: "weissman score: climbing",
    desc: "a lossless codec that does the impossible thing in the obvious order. legally distinct from anything that aired on HBO.",
  },
  {
    name: "TOR relays + signal-TLS-proxy",
    spec: "3 relays / 1 proxy",
    desc: "a handful of relays and a proxy that makes my TLS look aggressively boring to anyone watching the wire.",
  },
  {
    name: "Captive-portal bypass",
    spec: "dns tunnel / 53 over everything",
    desc: "hotel wifi has opinions about my MAC address. I have a DNS tunnel and no patience.",
  },
  {
    name: "Scaling systems with k8s magic",
    spec: "yaml / prayer / a little hpa",
    desc: "the magic is mostly indentation. the scaling is mostly waiting for the node pool to feel like it.",
  },
];

const TOOLS = [
  {
    name: "paywall.harshit.cloud",
    href: "https://paywall.harshit.cloud",
    spec: "reader / archive",
    desc: "the paywall remover. ironic, given how few of my own posts have one.",
  },
  {
    name: "meet.harshit.cloud/book",
    href: "https://meet.harshit.cloud/book/15min",
    spec: "self-hosted cal.com / 15 min",
    desc: "grab 15 minutes on my calendar. self-hosted cal.com, so the only thing booking the slot is you, not a sales tool counting leads.",
  },
  {
    name: "proxy.sachin.cool",
    href: "https://proxy.sachin.cool",
    spec: "signal-tls-proxy front end",
    desc: "the proxy the homepage keeps telling curl to use. pipe your requests through here and the wire stops being interesting.",
  },
];

// The nerdy properties of the stack. status is honest on purpose: "live" means
// you can run the command right now and get something back; "wiring" means the
// switch exists and isn't flipped yet; "planned" means it's a weekend away.
const STACK = [
  {
    cmd: "curl -s harshit.cloud",
    status: "live",
    desc: "403s you on sight. the only request this site refuses by user-agent. you've met it already.",
  },
  {
    cmd: "dig AAAA harshit.cloud",
    status: "live",
    desc: "IPv6, dual-stack, answering now. orange-clouded through Cloudflare so the AAAA finally resolves; the 6 in v6 stopped meaning 'soon'.",
  },
  {
    cmd: "ssh proxy.harshit.cloud",
    status: "live",
    desc: "a banner greets you before the password prompt does. no shell unless the box knows your key, but you do get a poem.",
  },
  {
    cmd: "dig NS harshit.cloud",
    status: "planned",
    desc: "today it answers cloudflare. the plan is my own nameservers on my own metal. (that one's its own blog post.)",
  },
  {
    cmd: "harshitnia7nl7zgl42ezm656our7pfxqlviokkt7yhusich5wghxeid.onion",
    status: "live",
    desc: "a v3 hidden-service mirror of this site, served off the tor relay in the closet. open it in tor browser. v2 is dead; this one isn't. (tor browser also auto-suggests it via the Onion-Location header.)",
  },
  {
    cmd: "harshitnr4iv2ay32yg2y6kz77sudcfzsbcwr2bg6bwudqxry3v7xbid.onion",
    status: "live",
    desc: "the web proxy, on its own v3 onion. reach the blocked web from inside tor, no exit node in the path. it lives on the same relay as the site mirror.",
  },
  {
    cmd: "harshitobxiym2gimbx5iozpw7twwyfi5dzvpc3hliwntjc62ucakuqd.onion",
    status: "live",
    desc: "the paywall remover (ladder), on its own v3 onion. read the walled web from inside tor, where nobody's counting your free articles.",
  },
];

// The actual banner sshd hands you before the password prompt on the relay box.
const SSH_BANNER = `$ ssh proxy.harshit.cloud

  harshit.cloud  --  the box

  you found the ssh port. respect.
  this machine runs a tor relay (pewpew), a couple of
  proxies, and exactly zero shells for keys it doesn't know.

  got a key?  welcome back.
  don't?      the logs already said hello.   -> harshit.cloud/lab`;

const STATUS_STYLES: Record<string, string> = {
  live: "text-green-600 dark:text-green-400 border-green-600/40",
  wiring: "text-amber-600 dark:text-amber-400 border-amber-600/40",
  planned: "text-muted-foreground border-border/60",
};

const MIDDLEWARE_SNIPPET = `// middleware.ts — the gate you just (probably) didn't trip
const ua = request.headers.get('user-agent') || '';
if (/\\bcurl\\//i.test(ua)) {
  return new NextResponse("403 — nice try.", { status: 403 });
}
// feeds stay exempt via the matcher, so RSS readers live on.`;

const COMPRESSION_SNIPPET = `def middle_out(data: bytes) -> bytes:
    """Compress from the middle outward. Don't ask which middle."""
    mid = len(data) // 2
    left, right = data[:mid], data[mid:]
    # the trick is doing both halves at once and pretending
    # the seam was never there. weissman score does the rest.
    return interleave(deflate(left[::-1]), deflate(right))`;

const PROXY_SNIPPET = `# what the 403 wants you to do instead
curl -x https://proxy.sachin.cool:8443 \\
     --tlsv1.3 --ciphers TLS_AES_256_GCM_SHA384 \\
     https://harshit.cloud/lab
# now your handshake looks like everyone else's. that's the point.`;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);
  return {
    title: `The Lab | ${siteConfig.author.name}`,
    description:
      "Things I'm probably not supposed to be building: middle-out compression, TOR relays, captive-portal bypasses, and a few self-hosted tools.",
    alternates: { canonical: `${baseUrl}/lab` },
    openGraph: {
      title: `The Lab | ${siteConfig.author.name}`,
      description:
        "Things I'm probably not supposed to be building: middle-out compression, TOR relays, captive-portal bypasses, and a few self-hosted tools.",
      type: "website",
      url: `${baseUrl}/lab`,
      images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630, alt: `The Lab | ${siteConfig.title}` }],
    },
  };
}

const sectionLabel =
  "flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2";

export default function LabPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-10 md:space-y-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          The lab
        </div>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight">
          Things I&apos;m probably not supposed to be building.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          If the{" "}
          <Link href="/lair" className="text-foreground underline-offset-4 hover:underline">
            lair
          </Link>{" "}
          is the hardware, this is the software it ends up running. Mostly
          experiments that work right up until someone asks how. If you reached
          this page with <span className="font-mono text-foreground">curl</span>,
          you didn&apos;t — that&apos;s the joke, scroll down for it.
        </p>
        <div className="pt-2">
          <SplitFlap words={CURRENTLY} />
        </div>
      </header>

      {/* Currently building */}
      <section className="space-y-6">
        <div className={sectionLabel}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Currently building
        </div>
        <ul className="divide-y divide-border/60">
          {BUILDING.map((item) => (
            <li key={item.name} className="grid sm:grid-cols-[220px_1fr] gap-2 sm:gap-6 py-5">
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

      {/* Poke at the stack */}
      <section className="space-y-6">
        <div className={sectionLabel}>
          <Terminal aria-hidden className="h-3.5 w-3.5" />
          Poke at the stack
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          The site has opinions you can interrogate from a terminal. Status is
          honest: <span className="font-mono text-green-600 dark:text-green-400">live</span> works
          today, <span className="font-mono text-amber-600 dark:text-amber-400">wiring</span> is a
          flipped switch away, <span className="font-mono">planned</span> is a weekend I haven&apos;t
          spent yet.
        </p>
        <ul className="divide-y divide-border/60">
          {STACK.map((item) => (
            <li key={item.cmd} className="grid sm:grid-cols-[260px_1fr] gap-2 sm:gap-6 py-5">
              <div className="space-y-1.5">
                <code className="block font-mono text-[13px] text-foreground break-all">
                  {item.cmd}
                </code>
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${STATUS_STYLES[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed sm:pt-1">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>

        {/* SSH banner — the nerdy bit you only see if you actually try the port */}
        <figure className="space-y-2 pt-2">
          <pre className="overflow-x-auto rounded-md border border-border/60 bg-muted/40 p-4 font-mono text-[12px] leading-relaxed text-muted-foreground">
            <code>{SSH_BANNER}</code>
          </pre>
          <figcaption className="font-serif italic text-sm text-muted-foreground">
            What sshd hands you before the password prompt. The box logs every
            attempt; the banner is the only part it shares back.
          </figcaption>
        </figure>
      </section>

      {/* Where the boxes live */}
      <section className="space-y-6">
        <div className={sectionLabel}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Where the boxes live
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          The stack isn&apos;t in one place. I&apos;m in Bengaluru, the box that
          runs the relay and the onion sits in New York, and the Hetzner box
          runs out of Helsinki. The arcs are the traffic that bounces between
          them, so the wire stays boring.
        </p>
        <RelayMap />
      </section>

      {/* Commit ticker */}
      <section className="space-y-6">
        <div className={sectionLabel}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Commit messages, live and honest
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Pulled fresh from{" "}
          <Link
            href="https://whatthecommit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-4 hover:underline"
          >
            whatthecommit.com
          </Link>{" "}
          on every refresh. Statistically indistinguishable from my actual git history.
        </p>
        <CommitTicker />
      </section>

      {/* Code snippets */}
      <section className="space-y-6">
        <div className={sectionLabel}>
          <Terminal aria-hidden className="h-3.5 w-3.5" />
          The relevant code
        </div>
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            the curl gate
          </p>
          <CodeBlock code={MIDDLEWARE_SNIPPET} language="typescript" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            middle-out, abridged
          </p>
          <CodeBlock code={COMPRESSION_SNIPPET} language="python" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            what the 403 wanted
          </p>
          <CodeBlock code={PROXY_SNIPPET} language="bash" />
        </div>
      </section>

      {/* Tools & sites */}
      <section className="space-y-6">
        <div className={sectionLabel}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Tools &amp; sites
        </div>
        <ul className="divide-y divide-border/60">
          {TOOLS.map((item) => (
            <li key={item.name} className="grid sm:grid-cols-[220px_1fr] gap-2 sm:gap-6 py-5">
              <div className="space-y-0.5">
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 font-serif text-lg leading-tight hover:text-primary transition-colors"
                >
                  {item.name}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
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

      {/* QR */}
      <section className="space-y-6">
        <div className={sectionLabel}>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Scan, if you must
        </div>
        <figure className="flex flex-col items-center gap-3">
          <div className="rounded-md border border-border/60 bg-white p-4">
            <Image
              src="/images/lab-qr.png"
              alt="Rust QR code with the ツ mark in the center, linking back to harshit.cloud/lab"
              width={176}
              height={176}
              className="h-44 w-44"
            />
          </div>
          <figcaption className="font-serif italic text-sm text-muted-foreground text-center max-w-sm">
            The ツ in the middle is the site shrugging at you. It points back to
            this page anyway; the recursion is intentional, the disappointment
            is yours to manage.
          </figcaption>
        </figure>
      </section>

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
