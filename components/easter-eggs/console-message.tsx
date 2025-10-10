"use client";

import { useEffect } from "react";

export function ConsoleMessage() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const styles = {
      title: 'font-size: 24px; font-weight: bold; color: #6366f1; text-shadow: 2px 2px 4px rgba(99, 102, 241, 0.3);',
      subtitle: 'font-size: 16px; color: #8b5cf6; font-weight: bold;',
      text: 'font-size: 14px; color: #64748b;',
      link: 'font-size: 14px; color: #ec4899; font-weight: bold;',
      code: 'font-size: 12px; color: #10b981; font-family: monospace; background: #1e293b; padding: 2px 6px; border-radius: 3px;',
      warning: 'font-size: 14px; color: #f59e0b; font-weight: bold;',
    };

    console.log('%cWelcome to the vault', styles.title);
    console.log('%c═══════════════════════════════════════', 'color: #6366f1;');
    console.log('%cYou found the console. Nice.', styles.subtitle);
    console.log('');
    console.log('%cKonami Code works here.', styles.text);
    console.log('%c↑ ↑ ↓ ↓ ← → ← → B A', styles.code);
    console.log('');
    console.log('%cBuilt with Next.js, Tailwind, and late nights.', styles.text);
    console.log('');
    console.log('%cWarning:', styles.warning);
    console.log('%cDon\'t paste random code here. Self-XSS is real.', styles.text);
    console.log('');
    console.log('%ccontact@sachin.cool', styles.code);
    console.log('');
    console.log('%c═══════════════════════════════════════', 'color: #6366f1;');
    console.log('%c01001001 01110100 01011111 01001000 01100101 01110010 01110100 01111010 01011111 01010111 01000001 01001110 01011111 01001001 01010000', styles.code);
  }, []);

  return null;
}

