import Link from "next/link";
import { cn, formatPercent } from "@/lib/utils";

export function StockRow({
  ticker,
  name,
  price,
  changesPercentage,
  href,
  sparkline,
  volumeLabel,
  className,
}: {
  ticker: string;
  name?: string;
  price: number;
  changesPercentage: number;
  href: string;
  sparkline?: React.ReactNode;
  volumeLabel?: string;
  className?: string;
}) {
  const up = changesPercentage >= 0;

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/40",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            {ticker}
          </span>
          {name && (
            <span className="truncate text-xs text-muted-foreground">
              {name}
            </span>
          )}
        </div>
        {volumeLabel && (
          <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
            Vol {volumeLabel}
          </p>
        )}
      </div>
      {sparkline && (
        <div className="hidden h-8 w-20 shrink-0 sm:block">{sparkline}</div>
      )}
      <div className="shrink-0 text-right">
        <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p
          className={cn(
            "text-xs font-medium tabular-nums",
            up ? "text-up" : "text-down"
          )}
        >
          {formatPercent(changesPercentage)}
        </p>
      </div>
    </Link>
  );
}
