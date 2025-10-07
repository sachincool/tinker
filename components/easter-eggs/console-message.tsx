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

    console.log('%c🧙‍♂️ Welcome to the Digital Spellbook! 🧙‍♂️', styles.title);
    console.log('%c═══════════════════════════════════════', 'color: #6366f1;');
    console.log('%c✨ Hey there, fellow code wizard!', styles.subtitle);
    console.log('%cYou\'ve stumbled upon the developer console. Here are some secrets:', styles.text);
    console.log('');
    console.log('%c🎮 Easter Egg #1:', styles.link);
    console.log('%cTry the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A', styles.code);
    console.log('');
    console.log('%c🔍 Easter Egg #2:', styles.link);
    console.log('%cClick the "Secret" link in the footer for a surprise!', styles.text);
    console.log('');
    console.log('%c💡 Fun Fact:', styles.link);
    console.log('%cThis entire site was built with Next.js, Tailwind, and an unhealthy amount of coffee.', styles.text);
    console.log('');
    console.log('%c⚠️ Warning:', styles.warning);
    console.log('%cDon\'t paste anything here that you don\'t understand. Self-XSS is not cool.', styles.text);
    console.log('');
    console.log('%c📧 Want to chat?', styles.link);
    console.log('%cReach out: contact@sachin.cool', styles.code);
    console.log('');
    console.log('%c═══════════════════════════════════════', 'color: #6366f1;');
    console.log('%c01000100 01000011 00100000 01010011 01110101 01100011 01101011 01110011', styles.code);
    console.log('%c(That\'s binary for "DC Sucks" - a developer\'s truth)', 'font-size: 10px; color: #64748b; font-style: italic;');
  }, []);

  return null;
}

