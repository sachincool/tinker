"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { codeToHtml } from "shiki";

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
    const highlight = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: language || 'bash',
          theme: isDark ? 'github-dark' : 'github-light',
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error('Syntax highlighting error:', error);
        // Fallback to plain code
        setHighlightedCode(`<pre><code>${code}</code></pre>`);
      }
    };

    highlight();
  }, [code, language, isDark]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group my-8", className)}>
      <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {language && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-muted to-muted/50 border-b border-border/50">
            <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {language}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-7 text-xs hover:bg-background/50 transition-all"
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
        <div className="relative bg-gradient-to-br from-muted/30 to-muted/50">
          {highlightedCode ? (
            <div 
              className={cn(
                "overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!m-0 [&>pre]:p-4 [&>pre]:text-sm [&>pre]:leading-relaxed",
                "[&_code]:!bg-transparent [&_code]:text-sm [&_code]:font-mono"
              )}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          ) : (
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          )}
          {!language && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
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

