"use client";

import React from "react";
import { CodeBlock } from "./code-block";
import { Zap, Info, AlertCircle } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

// million-ignore
export function MarkdownContent({ content }: MarkdownContentProps) {
  const renderMarkdown = () => {
    const elements: React.ReactElement[] = [];
    const paragraphs = content.split('\n\n');
    let firstParagraphRendered = false;

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
          <h2 
            key={index} 
            id={id} 
            className="text-2xl md:text-3xl font-bold mt-16 mb-8 scroll-mt-24 border-l-4 border-blue-500 pl-4 py-2 bg-gradient-to-r from-blue-500/5 to-transparent"
          >
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
          <h3 
            key={index} 
            id={id} 
            className="text-xl font-semibold mt-12 mb-6 scroll-mt-24 text-blue-600 dark:text-blue-400 flex items-center gap-2"
          >
            <Zap className="h-5 w-5" />
            {text}
          </h3>
        );
        return;
      }

      // Code blocks (multi-line code) - USE CodeBlock component
      if (paragraph.includes('```')) {
        const lines = paragraph.split('\n');
        const language = lines[0]?.replace('```', '').trim() || 'bash';
        const codeLines = lines.slice(1);
        const lastLineIndex = codeLines.findIndex(line => line.includes('```'));
        const code = codeLines.slice(0, lastLineIndex >= 0 ? lastLineIndex : undefined).join('\n');

        elements.push(
          <CodeBlock
            key={index}
            code={code}
            language={language}
            className="my-8"
          />
        );
        return;
      }

      // Horizontal rules
      if (paragraph.match(/^---+$|^\*\*\*+$|^___+$/)) {
        elements.push(
          <hr key={index} className="my-12 border-t-2 border-border/50" />
        );
        return;
      }

      // Blockquotes
      if (paragraph.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="relative border-l-4 border-blue-500 pl-6 pr-4 py-4 my-8 italic text-lg text-muted-foreground bg-gradient-to-r from-blue-500/10 to-transparent rounded-r-lg shadow-sm">
            <span className="absolute left-3 top-3 text-blue-500/30 text-4xl font-serif">"</span>
            <div className="relative z-10">{paragraph.substring(2)}</div>
          </blockquote>
        );
        return;
      }

      // Images
      if (paragraph.match(/^!\[.*\]\(.*\)$/)) {
        const match = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [, alt, src] = match;
          elements.push(
            <figure key={index} className="my-12 group">
              <div className="relative overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:shadow-2xl hover:ring-blue-500/50">
                <img 
                  src={src} 
                  alt={alt} 
                  className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-4 font-medium">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
          return;
        }
      }

      // List items (unordered and ordered)
      if (paragraph.match(/^[\d]+\./m) || paragraph.match(/^[-*]/m)) {
        const items = paragraph.split('\n').filter(line => line.trim());
        const isOrdered = items[0]?.match(/^\d+\./);
        const ListTag = isOrdered ? 'ol' : 'ul';
        
        // Helper function to parse inline formatting in list items
        const parseListItemContent = (text: string) => {
          const parts: React.ReactElement[] = [];
          let keyCounter = 0;
          const codeSplit = text.split(/(`[^`]+`)/g);
          
          codeSplit.forEach((segment) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              parts.push(
                <code key={keyCounter++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
                  {segment.slice(1, -1)}
                </code>
              );
            } else {
              const formatted = segment.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g);
              formatted.forEach((part) => {
                if (part?.match(/^\*\*[^*]+\*\*$/)) {
                  parts.push(
                    <strong key={keyCounter++} className="font-bold text-foreground">
                      {part.slice(2, -2)}
                    </strong>
                  );
                } else if (part?.match(/^\*[^*]+\*$/)) {
                  parts.push(
                    <em key={keyCounter++} className="italic">
                      {part.slice(1, -1)}
                    </em>
                  );
                } else if (part?.match(/^\[([^\]]+)\]\(([^)]+)\)$/)) {
                  const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                  if (linkMatch) {
                    parts.push(
                      <a
                        key={keyCounter++}
                        href={linkMatch[2]}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {linkMatch[1]}
                      </a>
                    );
                  }
                } else if (part) {
                  parts.push(<span key={keyCounter++}>{part}</span>);
                }
              });
            }
          });
          return parts;
        };
        
        elements.push(
          <ListTag 
            key={index} 
            className={
              isOrdered 
                ? "list-decimal list-inside space-y-3 my-8 ml-4" 
                : "space-y-3 my-8 ml-6"
            }
          >
            {items.map((item, i) => {
              const cleanedItem = item.replace(/^[\d]+\.\s*|^[-*]\s*/, '');
              return (
                <li 
                  key={i} 
                  className={
                    isOrdered
                      ? "text-lg leading-relaxed pl-2 text-foreground/90 hover:text-foreground transition-colors"
                      : "text-lg leading-relaxed pl-2 text-foreground/90 hover:text-foreground transition-colors relative before:content-['→'] before:absolute before:-left-6 before:text-blue-500 before:font-bold"
                  }
                >
                  {parseListItemContent(cleanedItem)}
                </li>
              );
            })}
          </ListTag>
        );
        return;
      }

      // Regular paragraphs
      if (paragraph.trim()) {
        // Parse inline formatting: bold, italic, inline code, links
        const renderInlineContent = (text: string) => {
          const parts: React.ReactElement[] = [];
          let currentText = text;
          let keyCounter = 0;

          // Split by inline code first
          const codeSplit = currentText.split(/(`[^`]+`)/g);
          
          codeSplit.forEach((segment) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              // Inline code
              parts.push(
                <code key={keyCounter++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
                  {segment.slice(1, -1)}
                </code>
              );
            } else {
              // Handle bold, italic, links
              const formatted = segment.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g);
              
              formatted.forEach((part, idx) => {
                if (part?.match(/^\*\*[^*]+\*\*$/)) {
                  // Bold text
                  parts.push(
                    <strong key={keyCounter++} className="font-bold text-foreground">
                      {part.slice(2, -2)}
                    </strong>
                  );
                } else if (part?.match(/^\*[^*]+\*$/)) {
                  // Italic text
                  parts.push(
                    <em key={keyCounter++} className="italic">
                      {part.slice(1, -1)}
                    </em>
                  );
                } else if (part?.match(/^\[([^\]]+)\]\(([^)]+)\)$/)) {
                  // Link
                  const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                  if (linkMatch) {
                    parts.push(
                      <a
                        key={keyCounter++}
                        href={linkMatch[2]}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {linkMatch[1]}
                      </a>
                    );
                  }
                } else if (part) {
                  // Regular text
                  parts.push(<span key={keyCounter++}>{part}</span>);
                }
              });
            }
          });

          return parts;
        };

        // Check if it's a special "lead" paragraph (starts with bold)
        const isLeadParagraph = !firstParagraphRendered && paragraph.match(/^\*\*/);
        if (isLeadParagraph) {
          firstParagraphRendered = true;
          elements.push(
            <p key={index} className="text-xl leading-relaxed text-foreground font-medium first-letter:text-2xl first-letter:font-bold">
              {renderInlineContent(paragraph)}
            </p>
          );
        } else {
          elements.push(
            <p key={index} className="text-lg leading-relaxed text-foreground/90">
              {renderInlineContent(paragraph)}
            </p>
          );
        }
      }
    });

    return elements;
  };

  return (
    <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2">
      <div className="space-y-8">
        {renderMarkdown()}
      </div>
    </article>
  );
}


