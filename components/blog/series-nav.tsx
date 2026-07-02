import Link from "next/link";

interface SeriesNavProps {
  series: string;
  currentPart: number;
  totalParts: number;
  /** Array of { part, slug } for each published part — pass only the parts that exist */
  parts: Array<{ part: number; slug: string; title: string }>;
}

export function SeriesNav({ series, currentPart, totalParts, parts }: SeriesNavProps) {
  return (
    <aside className="my-8 border border-border rounded-lg p-5 bg-muted/30 space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        Series · {series}
      </p>
      <ol className="space-y-1.5">
        {parts.map(({ part, slug, title }) => {
          const isCurrent = part === currentPart;
          return (
            <li key={part} className="flex items-baseline gap-2 text-sm">
              <span className="font-mono text-[11px] text-muted-foreground w-5 shrink-0">
                {String(part).padStart(2, "0")}
              </span>
              {isCurrent ? (
                <span className="font-medium text-foreground">{title}</span>
              ) : (
                <Link
                  href={`/blog/${slug}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {title}
                </Link>
              )}
              {isCurrent && (
                <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-primary shrink-0">
                  you are here
                </span>
              )}
            </li>
          );
        })}
        {parts.length < totalParts && (
          <li className="text-[11px] text-muted-foreground/60 italic pl-7">
            {totalParts - parts.length} more part{totalParts - parts.length > 1 ? "s" : ""} coming soon
          </li>
        )}
      </ol>
    </aside>
  );
}
