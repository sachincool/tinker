"use client";

import dynamic from "next/dynamic";

const KonamiCode = dynamic(
  () => import("@/components/easter-eggs/konami-code").then((m) => m.KonamiCode),
  { ssr: false }
);
const ConsoleMessage = dynamic(
  () => import("@/components/easter-eggs/console-message").then((m) => m.ConsoleMessage),
  { ssr: false }
);
const ScrollToTop = dynamic(
  () => import("@/components/ui/scroll-to-top").then((m) => m.ScrollToTop),
  { ssr: false }
);
const KeyboardShortcuts = dynamic(
  () => import("@/components/keyboard-shortcuts").then((m) => m.KeyboardShortcuts),
  { ssr: false }
);

export function ClientExtras() {
  return (
    <>
      <KonamiCode />
      <ConsoleMessage />
      <ScrollToTop />
      <KeyboardShortcuts />
    </>
  );
}
