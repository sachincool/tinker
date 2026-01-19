"use client";

import React from "react";
import { CodeBlock } from "./code-block";
import { ImageLightbox } from "./image-lightbox";
import { Zap, Info, AlertCircle } from "lucide-react";

interface MarkdownContentProps {
  content: string;
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
            className="text-xl font-semibold mt-12 mb-6 scroll-mt-24 text-blue-600 dark:text-blue-400 flex items-center gap-2 break-words [overflow-wrap:anywhere]"
          >
            <Zap className="h-5 w-5 flex-shrink-0" />
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
          const headers = lines[0]!.split('|').map(h => h.trim()).filter(h => h);
          const rows = lines.slice(2).map(row =>
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
          );

          // Detect numeric columns for right alignment
          const isNumericColumn = headers.map((_, colIndex) => {
            const samples = rows.slice(0, 3).map(row => row[colIndex] || '');
            return samples.some(cell =>
              cell.match(/^\d+(\.\d+)?[%xsX]?$/) ||
              cell.match(/^\d+/) ||
              cell.includes('MB') ||
              cell.includes('GB') ||
              cell.includes('vCPU') ||
              cell.includes('faster') ||
              cell.includes('higher') ||
              cell.includes('lower') ||
              cell.includes('reduction') ||
              cell.includes('smaller')
            );
          });

          elements.push(
            <div key={index} className="my-10 overflow-x-auto rounded-xl border border-border/50 shadow-xl">
              <table className="w-full border-collapse min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b-2 border-blue-500/30">
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        scope="col"
                        className={`px-4 md:px-6 py-4 text-sm font-bold text-foreground uppercase tracking-wider ${
                          isNumericColumn[i] ? 'text-right' : 'text-left'
                        }`}
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
                          className={`px-4 md:px-6 py-4 text-sm text-foreground/90 ${
                            j === 0 ? 'font-medium' : ''
                          } ${isNumericColumn[j] ? 'text-right tabular-nums' : 'text-left'}`}
                        >
                          {/* Parse inline formatting in table cells */}
                          {cell.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, k) => {
                            if (part?.match(/^\*\*[^*]+\*\*$/)) {
                              return <strong key={k} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
                            } else if (part?.match(/^`[^`]+`$/)) {
                              return <code key={k} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400">{part.slice(1, -1)}</code>;
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

      // Images
      if (paragraph.match(/^!\[.*\]\(.*\)$/)) {
        const match = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [, alt, src] = match;
          elements.push(
            <figure key={index} className="my-12 group">
              <div className="relative overflow-hidden rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 hover:shadow-2xl hover:ring-blue-500/50">
                <ImageLightbox
                  src={src}
                  alt={alt}
                  className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
              const formatted = segment.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[(?:[^\]]+)\]\((?:[^)]+)\))/g);
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
              const formatted = segment.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[(?:[^\]]+)\]\((?:[^)]+)\))/g);
              
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

        // Check if it's a special "lead" paragraph (first substantial paragraph OR starts with bold)
        const isLeadParagraph = !firstParagraphRendered && (paragraph.length > 100 || paragraph.match(/^\*\*/));
        if (isLeadParagraph && paragraph.trim()) {
          firstParagraphRendered = true;
          elements.push(
            <p key={index} className="text-xl md:text-2xl leading-relaxed text-foreground font-semibold first-letter:text-3xl first-letter:font-bold first-letter:text-blue-600 dark:first-letter:text-blue-400 mb-8 pb-6 border-b border-border/30">
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
    <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2 overflow-x-hidden">
      <div className="space-y-8 max-w-full">
        {renderMarkdown()}
      </div>
    </article>
  );
}


