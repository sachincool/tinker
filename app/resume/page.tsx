import type { Metadata } from "next";
import { headers } from "next/headers";
import { siteConfig, getCurrentDomain } from "@/lib/site-config";
import ResumePageClient from "./resume-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  const baseUrl = getCurrentDomain(hostname);
  const resumeUrl = `${baseUrl}/resume`;

  const description =
    "Resume of Harshit Luthra, Senior SRE and infrastructure engineer specializing in Kubernetes, multi-cloud (AWS/GCP/Azure), observability, and cost optimization.";

  return {
    title: `Resume | ${siteConfig.author.name}`,
    description,
    alternates: {
      canonical: resumeUrl,
    },
    openGraph: {
      title: `Resume | ${siteConfig.author.name}`,
      description,
      type: "profile",
      url: resumeUrl,
      siteName: siteConfig.title,
      locale: "en_US",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Resume · ${siteConfig.author.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Resume | ${siteConfig.author.name}`,
      description,
      creator: "@exploit_sh",
      site: "@exploit_sh",
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export default function ResumePage() {
  return <ResumePageClient />;
}
