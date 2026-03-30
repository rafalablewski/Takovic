"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  cn,
} from "@/lib/utils";
import type { FMPQuote } from "@/lib/api/fmp";
import { Tag } from "@/components/research/tag";
import { MetricChip } from "@/components/research/metric-chip";
import { PriceFlash, ChangePill } from "@/components/research/price-flash";
import { Star, Share2, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

const HEADER_OFFSET = "3.5rem"; /* h-14 */

export function QuoteStrip({
  ticker,
  companyName,
  exchange,
  initialQuote,
  metricChips,
}: {
  ticker: string;
  companyName: string;
  exchange: string;
  initialQuote: FMPQuote;
  metricChips: { label: string; value: string; hint?: string }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quote, setQuote] = React.useState(initialQuote);

  React.useEffect(() => {
    setQuote(initialQuote);
  }, [initialQuote]);

  React.useEffect(() => {
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/stocks/${encodeURIComponent(ticker)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.quote) setQuote(data.quote);
      } catch {
        /* ignore */
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, [ticker]);

  const positive = quote.changesPercentage >= 0;
  const rangeStr =
    quote.dayLow != null && quote.dayHigh != null
      ? `${formatCurrency(quote.dayLow)} – ${formatCurrency(quote.dayHigh)}`
      : "—";

  function tabHref(tab: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", tab);
    return `${pathname}?${p.toString()}`;
  }

  const activeTab = searchParams.get("tab") ?? "overview";

  return (
    <div
      className="glass-panel sticky z-40 border-b border-white/[0.07]"
      style={{ top: HEADER_OFFSET }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
            <span className="font-mono text-lg font-medium tracking-tight text-foreground">
              {ticker}
            </span>
            {exchange ? <Tag>{exchange}</Tag> : null}
            <span className="truncate text-sm text-muted-foreground">
              {companyName}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <PriceFlash
              value={quote.price}
              formatted={formatCurrency(quote.price)}
              className="tabular-hero text-3xl font-medium tracking-tight text-foreground sm:text-[1.75rem]"
            />
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-mono text-sm font-medium tabular-nums",
                positive ? "text-up" : "text-down"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {formatPercent(quote.changesPercentage)}
            </span>
            <ChangePill
              pct={quote.changesPercentage}
              changeAbs={quote.change}
              formatPct={formatPercent}
              formatChange={(n) =>
                `${n >= 0 ? "+" : "−"}${formatCurrency(Math.abs(n))}`
              }
            />
          </div>
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span>Day range {rangeStr}</span>
            <span>
              Vol {formatNumber(quote.volume, true)}
              {quote.avgVolume ? ` · Avg ${formatNumber(quote.avgVolume, true)}` : ""}
            </span>
            <span className="tabular-nums">
              {new Date(quote.timestamp * 1000).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
              })}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" className="min-h-9 gap-1.5 text-xs" asChild>
            <Link href="/watchlist">
              <Star className="h-3.5 w-3.5 stroke-[1.5]" />
              Watchlist
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="min-h-9 gap-1.5 text-xs" type="button" disabled>
            <Share2 className="h-3.5 w-3.5 stroke-[1.5]" />
            Share
          </Button>
          <Button size="sm" className="min-h-9 gap-1.5 text-xs" asChild>
            <Link href={tabHref("analysis")}>
              <BarChart3 className="h-3.5 w-3.5 stroke-[1.5]" />
              Analysis
            </Link>
          </Button>
        </div>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto border-t border-white/[0.06] py-2.5">
        {metricChips.map((m) => (
          <MetricChip key={m.label} {...m} />
        ))}
      </div>

      <nav
        className="flex gap-0 border-t border-white/[0.06]"
        aria-label="Stock sections"
        role="tablist"
      >
        {(
          [
            ["overview", "Overview"],
            ["financials", "Financials"],
            ["news", "News"],
            ["analysis", "Analysis"],
            ["filings", "Filings"],
          ] as const
        ).map(([id, label]) => {
          const active = activeTab === id;
          return (
            <Link
              key={id}
              href={tabHref(id)}
              scroll={false}
              role="tab"
              aria-selected={active}
              className={cn(
                "min-h-11 border-b-2 px-3 py-3 text-xs font-medium tracking-wide transition-colors sm:py-2.5",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
