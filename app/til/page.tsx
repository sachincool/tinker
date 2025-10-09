import { getAllPosts } from "@/lib/posts";
import TILPageClient from "./til-page-client";

export default function TILPage() {
  // Fetch TILs on server side
  const tils = getAllPosts('til');

  // Pass to client component for interactivity
  return <TILPageClient initialTils={tils} />;
}
