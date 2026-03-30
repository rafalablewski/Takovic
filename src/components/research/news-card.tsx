import Link from "next/link";
import { cn, timeAgo } from "@/lib/utils";
import { SentimentBadge } from "@/components/research/sentiment-badge";

const SOURCE_TIER: Record<string, "wire" | "major" | "other"> = {
  Bloomberg: "wire",
  Reuters: "wire",
  "Wall Street Journal": "major",
  CNBC: "major",
  "Financial Times": "major",
};

function CredibilityDot({ site }: { site: string }) {
  const tier = SOURCE_TIER[site] ?? "other";
  const label =
    tier === "wire"
      ? "Wire / primary source"
      : tier === "major"
        ? "Major outlet"
        : "Other source";
  return (
    <span
      title={label}
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
        tier === "wire" && "bg-up/80",
        tier === "major" && "bg-foreground/35",
        tier === "other" && "bg-muted-foreground/45"
      )}
    />
  );
}

export function NewsCard({
  title,
  site,
  publishedAt,
  url,
  sentiment,
  className,
}: {
  title: string;
  site: string;
  publishedAt: Date;
  url: string;
  sentiment?: string | null;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "surface-panel surface-panel-hover p-3 transition-premium",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CredibilityDot site={site} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-medium leading-snug text-foreground hover:text-primary hover:underline"
          >
            {title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>{site}</span>
            <span className="text-border">·</span>
            <time dateTime={publishedAt.toISOString()}>
              {timeAgo(publishedAt)}
            </time>
            {sentiment && (
              <>
                <span className="text-border">·</span>
                <SentimentBadge sentiment={sentiment} />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
