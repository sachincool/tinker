"use client";

import React from "react";
import { CodeBlock } from "./code-block";
import { ImageLightbox } from "./image-lightbox";
import { Info, AlertCircle } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

// Inline markdown renderer for paragraphs, list items, and table cells.
// Handles bold (**...**), italic (*...*), inline code (`...`), and links.
// Code spans and links are valid inside emphasis — the previous parser split
// on code first, which made every **strong with `code`** render as literal **.
function renderInlineRich(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;

  const pushLeafInto = (collector: React.ReactNode[], segment: string): void => {
    if (!segment) return;
    const parts = segment.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
    for (const part of parts) {
      if (!part) continue;
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        collector.push(
          <code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
            {part.slice(1, -1)}
          </code>
        );
        continue;
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        collector.push(
          <a
            key={key++}
            href={linkMatch[2]}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
        continue;
      }
      collector.push(<span key={key++}>{part}</span>);
    }
  };

  // Bold must tolerate single `*` inside the span (e.g. **`[a-zA-Z_]*`**) —
  // code spans frequently contain regex/glob characters. The old `[^*]+`
  // forbade any `*` and silently dropped the entire emphasis.
  const pattern = /(\*\*(?:[^*]|\*(?!\*))+?\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      pushLeafInto(nodes, text.slice(cursor, match.index));
    }
    if (match[1]) {
      const inner: React.ReactNode[] = [];
      pushLeafInto(inner, match[1].slice(2, -2));
      nodes.push(<strong key={key++} className="font-bold text-foreground">{inner}</strong>);
    } else if (match[2]) {
      const inner: React.ReactNode[] = [];
      pushLeafInto(inner, match[2].slice(1, -1));
      nodes.push(<em key={key++} className="italic">{inner}</em>);
    } else if (match[3]) {
      pushLeafInto(nodes, match[3]);
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    pushLeafInto(nodes, text.slice(cursor));
  }
  return nodes;
}

// Self-sizing iframe embed for blog widgets.
// Widget pages can postMessage({type:'iframe-height', height:N}) to resize.
function EmbedFrame({ src, title, initialHeight, caption }: { src: string; title: string; initialHeight: number; caption?: string }) {
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(initialHeight);

  React.useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (!ref.current || ev.source !== ref.current.contentWindow) return;
      const data = ev.data as { type?: string; height?: number };
      if (data?.type === "iframe-height" && typeof data.height === "number") {
        setHeight(Math.max(120, Math.ceil(data.height)));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <figure className="my-12">
      <div className="relative overflow-hidden border border-border/40 bg-background">
        <iframe
          ref={ref}
          src={src}
          title={title}
          loading="lazy"
          className="block w-full"
          style={{ height: `${height}px`, border: 0 }}
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-4 italic max-w-[60ch] mx-auto px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// million-ignore
export function MarkdownContent({ content }: MarkdownContentProps) {
  const renderMarkdown = () => {
    const elements: React.ReactElement[] = [];
    // Split by code blocks first to preserve them, then by double newlines for text
    const parts = content.split(/(```[\s\S]*?```)/g);
    const paragraphs = parts.flatMap(part => 
      part.startsWith('```') 
        ? [part] 
        : part.split('\n\n').filter(p => p.trim())
    );
    let firstParagraphRendered = false;

    paragraphs.forEach((paragraph, index) => {
      // H1 - Main heading (skip if duplicate)
      if (paragraph.startsWith('# ') && index > 0) {
        const text = paragraph.substring(2);
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        elements.push(
          <h2 key={index} id={id} className="text-3xl font-bold mt-12 mb-4 scroll-mt-24 break-words [overflow-wrap:anywhere]">
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
            className="text-2xl md:text-3xl font-semibold mt-16 mb-6 scroll-mt-24 tracking-tight text-foreground break-words [overflow-wrap:anywhere]"
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
            className="text-xl font-semibold mt-12 mb-6 scroll-mt-24 text-foreground break-words [overflow-wrap:anywhere]"
          >
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

      // Blockquotes - Enhanced with special styling for Key Insights
      if (paragraph.startsWith('> ')) {
        const content = paragraph.substring(2);
        const isKeyInsight = content.includes('**Key Insight:**') || content.includes('**Cost Impact:**');

        if (isKeyInsight) {
          // Editorial sidebar for key insights — no emoji, no gradient.
          const parts = content.split(/(\*\*[^*]+:\*\*)/);
          elements.push(
            <blockquote key={index} className="border-l-2 border-primary pl-5 my-8 md:my-10 text-base md:text-lg leading-relaxed">
              {parts.map((part, idx) => {
                if (part?.match(/^\*\*[^*]+:\*\*$/)) {
                  return <strong key={idx} className="font-semibold text-primary text-xs uppercase tracking-[0.18em] block mb-2 font-mono">{part.slice(2, -2)}</strong>;
                }
                return <span key={idx} className="text-foreground/90">{part}</span>;
              })}
            </blockquote>
          );
        } else {
          // Regular pull-quote — flat, editorial.
          elements.push(
            <blockquote key={index} className="border-l-2 border-border pl-5 my-6 md:my-8 italic text-base md:text-lg text-muted-foreground leading-relaxed">
              {content}
            </blockquote>
          );
        }
        return;
      }

      // Tables (markdown table format)
      if (paragraph.includes('|') && paragraph.split('\n').length > 1) {
        const lines = paragraph.split('\n').filter(line => line.trim());
        // Check if it's a valid table (has separator row)
        if (lines.length > 1 && lines[1]?.match(/^\|?[\s:-]+\|/)) {
          // Splitter that respects escaped pipes (\|) inside cells.
          const PIPE = ' ';
          const splitRow = (row: string) =>
            row
              .replace(/\\\|/g, PIPE)
              .split('|')
              .map(cell => cell.trim().replace(new RegExp(PIPE, 'g'), '|'))
              .filter(cell => cell);

          const headers = splitRow(lines[0]!);

          // Per-column alignment from the separator row: ":---", "---:", ":---:".
          const sepCells = lines[1]!.replace(/\\\|/g, PIPE).split('|').map(c => c.trim()).filter(c => c);
          const alignments = headers.map((_, i) => {
            const sep = sepCells[i] || '';
            const l = sep.startsWith(':');
            const r = sep.endsWith(':');
            if (l && r) return 'center';
            if (r) return 'right';
            return 'left';
          });

          const rows = lines.slice(2).map(splitRow);

          const alignClass = (a: string) =>
            a === 'right' ? 'text-right tabular-nums' : a === 'center' ? 'text-center' : 'text-left';

          elements.push(
            <figure key={index} className="my-10 not-prose">
              <div className="overflow-x-auto">
                <table className="border-collapse text-sm md:text-base">
                  <thead>
                    <tr className="border-y-2 border-foreground/80">
                      {headers.map((header, i) => (
                        <th
                          key={i}
                          scope="col"
                          className={`py-3 px-4 md:px-5 text-[11px] md:text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground font-medium whitespace-nowrap ${alignClass(alignments[i] || 'left')}`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-border/40 last:border-b-0">
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`py-3 px-4 md:px-5 align-top ${j === 0 ? 'text-foreground font-medium' : 'text-foreground/85'} ${alignClass(alignments[j] || 'left')}`}
                          >
                            {cell.split(/(\*\*(?:[^*]|\*(?!\*))+?\*\*|`[^`]+`)/).map((part, k) => {
                              if (part?.match(/^\*\*(?:[^*]|\*(?!\*))+?\*\*$/)) {
                                return <strong key={k} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                              } else if (part?.match(/^`[^`]+`$/)) {
                                return <code key={k} className="bg-muted/60 px-1.5 py-0.5 rounded text-xs font-mono text-foreground">{part.slice(1, -1)}</code>;
                              }
                              return <span key={k}>{part}</span>;
                            })}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
          );
          return;
        }
      }

      // Iframe embeds (a standalone <iframe ...></iframe> paragraph)
      if (paragraph.trim().startsWith('<iframe') && paragraph.trim().endsWith('</iframe>')) {
        const raw = paragraph.trim();
        const srcMatch = raw.match(/\bsrc="([^"]+)"/);
        const titleMatch = raw.match(/\btitle="([^"]+)"/);
        const heightMatch = raw.match(/\bheight="([^"]+)"/);
        const captionMatch = raw.match(/\bdata-caption="([^"]+)"/);
        if (srcMatch) {
          const src = srcMatch[1]!;
          const title = titleMatch?.[1] || 'Embedded figure';
          const initialHeight = parseInt(heightMatch?.[1] || '760', 10);
          const caption = captionMatch?.[1];
          elements.push(
            <EmbedFrame
              key={index}
              src={src}
              title={title}
              initialHeight={initialHeight}
              caption={caption}
            />
          );
          return;
        }
      }

      // Images
      if (paragraph.match(/^!\[.*\]\(.*\)$/)) {
        const match = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [, alt, src] = match;
          elements.push(
            <figure key={index} className="my-12">
              <div className="relative overflow-hidden">
                <ImageLightbox
                  src={src}
                  alt={alt}
                  className="w-full"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-4 italic max-w-[60ch] mx-auto px-4">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
          return;
        }
      }

      // List items (unordered and ordered).
      // Require whitespace after the marker so "**bold**" paragraphs don't match.
      if (paragraph.match(/^\d+\.\s/m) || paragraph.match(/^[-*]\s/m)) {
        const items = paragraph.split('\n').filter(line => line.trim());
        const isOrdered = items[0]?.match(/^\d+\.\s/);
        const ListTag = isOrdered ? 'ol' : 'ul';

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
              const cleanedItem = item.replace(/^\d+\.\s+|^[-*]\s+/, '');
              return (
                <li 
                  key={i} 
                  className={
                    isOrdered
                      ? "text-lg leading-relaxed pl-2 text-foreground/90"
                      : "text-lg leading-relaxed pl-2 text-foreground/90 relative before:content-['—'] before:absolute before:-left-6 before:text-primary/70"
                  }
                >
                  {renderInlineRich(cleanedItem)}
                </li>
              );
            })}
          </ListTag>
        );
        return;
      }

      // Regular paragraphs
      if (paragraph.trim()) {
        // Check if it's a special "lead" paragraph (first substantial paragraph OR starts with bold)
        const isLeadParagraph = !firstParagraphRendered && (paragraph.length > 100 || paragraph.match(/^\*\*/));
        if (isLeadParagraph && paragraph.trim()) {
          firstParagraphRendered = true;
          elements.push(
            <p key={index} className="text-xl md:text-2xl leading-relaxed text-foreground font-semibold first-letter:text-3xl first-letter:font-bold first-letter:text-primary mb-8 pb-6 border-b border-border/30">
              {renderInlineRich(paragraph)}
            </p>
          );
        } else {
          elements.push(
            <p key={index} className="text-lg leading-relaxed text-foreground/90">
              {renderInlineRich(paragraph)}
            </p>
          );
        }
      }
    });

    return elements;
  };

  return (
    <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2 overflow-x-hidden">
      <div className="space-y-8 max-w-full">
        {renderMarkdown()}
      </div>
    </article>
  );
}


