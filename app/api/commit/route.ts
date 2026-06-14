import { NextResponse } from "next/server";

// Proxy whatthecommit.com so the browser doesn't trip over CORS. Live and
// raw — whatever the wheel of bad commit messages lands on is what you get.
export const dynamic = "force-dynamic";

const FALLBACKS = [
  "it works on my machine",
  "final final FINAL v2 (real)",
  "fixed the thing that fixed the other thing",
  "I'll remember what this does. I won't.",
  "remove debug code (left the debug code)",
];

export async function GET() {
  try {
    const res = await fetch("https://whatthecommit.com/index.txt", {
      cache: "no-store",
      headers: { "user-agent": "harshit.cloud/lab" },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`upstream ${res.status}`);

    const message = (await res.text()).trim();
    if (!message) throw new Error("empty");

    return NextResponse.json(
      { message },
      { headers: { "cache-control": "no-store" } }
    );
  } catch {
    const message = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    return NextResponse.json(
      { message, fallback: true },
      { headers: { "cache-control": "no-store" } }
    );
  }
}
