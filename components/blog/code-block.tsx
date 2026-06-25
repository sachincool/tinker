"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

// million-ignore
export function CodeBlock({ code, language = "bash", className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const escapeHtml = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const highlight = async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, {
          lang: language || 'bash',
          theme: isDark ? 'github-dark' : 'github-light',
        });
        if (!cancelled) setHighlightedCode(html);
      } catch (error) {
        console.error('Syntax highlighting error:', error);
        // Fallback to plain code (escaped — this string is rendered via dangerouslySetInnerHTML)
        if (!cancelled) setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
      }
    };

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, language, isDark]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group my-8 max-w-full overflow-hidden", className)}>
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-full">
        {language && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted border-b border-border/50">
            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
              {language}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-7 text-xs hover:bg-background/50 transition-colors duration-200"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}
        <div className="relative bg-muted/40 max-w-full">
          {highlightedCode ? (
            <div 
              className={cn(
                "overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:p-4 [&>pre]:text-sm [&>pre]:leading-relaxed [&>pre]:overflow-x-auto",
                "[&_code]:!bg-transparent [&_code]:text-sm [&_code]:font-mono",
                "[-webkit-overflow-scrolling:touch] max-w-full"
              )}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          ) : (
            <pre className="p-4 overflow-x-auto [-webkit-overflow-scrolling:touch] max-w-full">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          )}
          {!language && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-7 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

