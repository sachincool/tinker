import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

// /til/new is a client component, so its metadata lives here. Without this it
// inherits the root layout's canonical (the homepage) — a wrong duplicate
// signal. It's a demo form with no backend, so keep it out of the index.
export const metadata: Metadata = {
  title: "New TIL",
  alternates: {
    canonical: `${siteConfig.siteUrl}/til/new`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function NewTILLayout({ children }: { children: React.ReactNode }) {
  return children;
}
