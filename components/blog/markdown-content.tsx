"use client";

import { useEffect } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
import json from "highlight.js/lib/languages/json";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import { CodeBlock } from "./code-block";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("dockerfile", dockerfile);
// Note: HCL/Terraform will fall back to plaintext (highlight.js doesn't have native HCL support)

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  useEffect(() => {
    // Highlight all code blocks after render
    hljs.highlightAll();
  }, []);

  const renderMarkdown = () => {
    const elements: JSX.Element[] = [];
    const paragraphs = content.split('\n\n');

    paragraphs.forEach((paragraph, index) => {
      // H1 - Main heading (skip if duplicate)
      if (paragraph.startsWith('# ') && index > 0) {
        const text = paragraph.substring(2);
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        elements.push(
          <h2 key={index} id={id} className="text-3xl font-bold mt-12 mb-4 scroll-mt-24">
            {text}
          </h2>
        );
        return;
      }

      // H2 - Section heading
      if (paragraph.startsWith('## ')) {
        const text = paragraph.substring(3);
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        elements.push(
          <h2 key={index} id={id} className="text-2xl font-bold mt-10 mb-4 scroll-mt-24">
            {text}
          </h2>
        );
        return;
      }

      // H3 - Sub-section heading
      if (paragraph.startsWith('### ')) {
        const text = paragraph.substring(4);
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        elements.push(
          <h3 key={index} id={id} className="text-xl font-semibold mt-8 mb-3 scroll-mt-24">
            {text}
          </h3>
        );
        return;
      }

      // Code blocks (multi-line code) - USE CodeBlock component with syntax highlighting
      if (paragraph.includes('```')) {
        const lines = paragraph.split('\n');
        const language = lines[0]?.replace('```', '').trim() || 'plaintext';
        const codeLines = lines.slice(1);
        const lastLineIndex = codeLines.findIndex(line => line.includes('```'));
        const code = codeLines.slice(0, lastLineIndex >= 0 ? lastLineIndex : undefined).join('\n');

        // Highlight the code
        let highlightedCode = code;
        try {
          if (language && language !== 'plaintext' && hljs.getLanguage(language)) {
            highlightedCode = hljs.highlight(code, { language }).value;
          }
        } catch (e) {
          console.warn(`Failed to highlight ${language}:`, e);
        }

        elements.push(
          <div key={index} className="my-6 relative group">
            {language && (
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border rounded-t-lg">
                <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
              </div>
            )}
            <div className="relative">
              <pre className={`bg-muted/30 p-4 overflow-x-auto ${!language && 'rounded-lg'} ${language && 'rounded-b-lg'}`}>
                <code 
                  className={`text-sm font-mono ${language ? `language-${language}` : ''}`}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
              >
                Copy
              </button>
            </div>
          </div>
        );
        return;
      }

      // Blockquotes
      if (paragraph.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-muted-foreground bg-muted/30 rounded-r">
            {paragraph.substring(2)}
          </blockquote>
        );
        return;
      }

      // List items (unordered and ordered)
      if (paragraph.match(/^[\d]+\./m) || paragraph.match(/^[-*]/m)) {
        const items = paragraph.split('\n').filter(line => line.trim());
        const isOrdered = items[0]?.match(/^\d+\./);
        const ListTag = isOrdered ? 'ol' : 'ul';
        elements.push(
          <ListTag key={index} className={isOrdered ? "list-decimal list-inside space-y-2 my-6" : "list-disc list-inside space-y-2 my-6"}>
            {items.map((item, i) => (
              <li key={i} className="text-lg leading-relaxed">
                {item.replace(/^[\d]+\.\s*|^[-*]\s*/, '')}
              </li>
            ))}
          </ListTag>
        );
        return;
      }

      // Regular paragraphs
      if (paragraph.trim()) {
        // Handle inline code
        const parts = paragraph.split(/(`[^`]+`)/g);
        elements.push(
          <p key={index} className="text-lg leading-relaxed text-foreground/90">
            {parts.map((part, i) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              return part;
            })}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2">
      <div className="space-y-6">
        {renderMarkdown()}
      </div>
    </article>
  );
}


