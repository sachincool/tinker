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

  const pattern = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
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
      <div className="relative overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-zinc-950">
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
        <figcaption className="text-center text-sm text-muted-foreground mt-5 italic font-medium border-t border-border/30 pt-3 px-4">
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
            className="text-2xl md:text-3xl font-bold mt-16 mb-8 scroll-mt-24 border-l-4 border-blue-500 pl-4 py-2 bg-gradient-to-r from-blue-500/5 to-transparent break-words [overflow-wrap:anywhere]"
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
          // Special styling for key insights/important callouts
          const parts = content.split(/(\*\*[^*]+:\*\*)/);
          elements.push(
            <blockquote key={index} className="relative border-l-4 border-purple-500 pl-4 pr-3 md:pl-8 md:pr-6 py-4 md:py-6 my-6 md:my-10 bg-gradient-to-r from-purple-500/15 via-blue-500/10 to-transparent rounded-r-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute left-2 top-2 text-purple-500/40 text-3xl">💡</div>
              <div className="relative z-10 text-base md:text-lg leading-relaxed">
                {parts.map((part, idx) => {
                  if (part?.match(/^\*\*[^*]+:\*\*$/)) {
                    return <strong key={idx} className="font-bold text-purple-700 dark:text-purple-300 text-lg block mb-2">{part.slice(2, -2)}</strong>;
                  }
                  return <span key={idx} className="text-foreground/90">{part}</span>;
                })}
              </div>
            </blockquote>
          );
        } else {
          // Regular blockquote
          elements.push(
            <blockquote key={index} className="relative border-l-4 border-blue-500 pl-4 pr-2 md:pl-6 md:pr-4 py-3 md:py-4 my-6 md:my-8 italic text-base md:text-lg text-muted-foreground bg-gradient-to-r from-blue-500/10 to-transparent rounded-r-lg shadow-sm">
              <span className="absolute left-1 md:left-3 top-2 md:top-3 text-blue-500/30 text-2xl md:text-4xl font-serif">"</span>
              <div className="relative z-10">{content}</div>
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
            <div key={index} className="my-10 overflow-x-auto rounded-xl border border-border/50 shadow-xl">
              <table className="w-full border-collapse min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b-2 border-blue-500/30">
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        scope="col"
                        className={`px-4 md:px-6 py-4 text-sm font-bold text-foreground uppercase tracking-wider ${alignClass(alignments[i] || 'left')}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 bg-card">
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-muted/40 transition-colors duration-200"
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`px-4 md:px-6 py-4 text-sm text-foreground/90 ${j === 0 ? 'font-medium' : ''} ${alignClass(alignments[j] || 'left')} align-top`}
                        >
                          {/* Parse inline formatting in table cells */}
                          {cell.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, k) => {
                            if (part?.match(/^\*\*[^*]+\*\*$/)) {
                              return <strong key={k} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
                            } else if (part?.match(/^`[^`]+`$/)) {
                              return <code key={k} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">{part.slice(1, -1)}</code>;
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
              <div className="relative overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                <ImageLightbox
                  src={src}
                  alt={alt}
                  className="w-full"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-sm text-muted-foreground mt-5 italic font-medium border-t border-border/30 pt-3 px-4">
                  <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 flex-shrink-0">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <circle cx="9" cy="9" r="2"></circle>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                    </svg>
                    {alt}
                  </span>
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
                      ? "text-lg leading-relaxed pl-2 text-foreground/90 hover:text-foreground transition-colors"
                      : "text-lg leading-relaxed pl-2 text-foreground/90 hover:text-foreground transition-colors relative before:content-['→'] before:absolute before:-left-6 before:text-blue-500 before:font-bold"
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


