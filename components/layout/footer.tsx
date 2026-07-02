import Link from "next/link";
import { Github, Twitter, Linkedin, Rss } from "lucide-react";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { siteConfig } from "@/lib/site-config";

const eyebrow =
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground";

const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/til", label: "TIL" },
  { href: "/tags", label: "Tags" },
  { href: "/about", label: "About" },
  { href: "/lab", label: "Lab" },
  { href: "https://k8s.org.in", label: "Infra & AI consulting" },
];

const socialLinks = [
  { href: "https://github.com/sachincool", label: "GitHub", Icon: Github },
  { href: "https://twitter.com/exploit_sh", label: "Twitter", Icon: Twitter },
  {
    href: "https://linkedin.com/in/harshit-luthra/",
    label: "LinkedIn",
    Icon: Linkedin,
  },
  { href: "/rss.xml", label: "RSS", Icon: Rss },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
          {/* Brand */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block font-serif text-2xl text-foreground transition-colors hover:text-primary"
            >
              harshit.cloud{" "}
              <span className="text-muted-foreground" aria-hidden="true">ツ</span>
            </Link>
            <p className="text-sm text-muted-foreground">Senior SRE</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className={eyebrow}>Read</h3>
            <ul className="space-y-2 text-sm">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener" : undefined}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className={eyebrow}>Connect</h3>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                  aria-label={label}
                  className="text-muted-foreground transition-[color,transform] duration-200 hover:text-primary hover:scale-110"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <div className="pt-2">
              <NewsletterForm variant="compact" />
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-16 flex flex-col items-start gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Harshit Luthra</p>
          <p className="font-mono">
            also on the dark web:{" "}
            <a
              href={`http://${siteConfig.onion}`}
              rel="noopener noreferrer"
              title={siteConfig.onion}
              className="underline underline-offset-4 decoration-border transition-colors hover:text-foreground hover:decoration-foreground"
            >
              .onion mirror
            </a>
            {" "}· best opened in Tor Browser
          </p>
          <p>
            Built with{" "}
            <Link
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Next.js
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
