"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { FMPQuote } from "@/lib/api/yahoo";

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  avgCostBasis: number;
  purchaseDate: string;
  notes?: string;
}

interface Portfolio {
  id: string;
  name: string;
  holdings: Holding[];
}

const STORAGE_KEY = "takovic-portfolio";

function loadPortfolios(): Portfolio[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

type QuoteMap = Record<string, FMPQuote>;

export function PortfolioSummary() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = loadPortfolios();
    setPortfolios(data);

    // Gather all tickers
    const allTickers = new Set<string>();
    for (const p of data) {
      for (const h of p.holdings) {
        allTickers.add(h.ticker);
      }
    }

    if (allTickers.size === 0) {
      setLoading(false);
      return;
    }

    fetch(`/api/stocks/batch?tickers=${Array.from(allTickers).join(",")}`)
      .then((res) => res.json())
      .then((data) => setQuotes(data.quotes ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Flatten all holdings across portfolios
  const allHoldings = portfolios.flatMap((p) => p.holdings);

  if (allHoldings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <AlertCircle className="mb-3 h-8 w-8 opacity-30" />
        <p className="text-sm font-medium">No portfolio holdings yet</p>
        <p className="mt-1 text-xs">
          Visit the Portfolio page to add holdings and track performance.
        </p>
        <a href="/portfolio">
          <Button variant="outline" size="sm" className="mt-3 gap-1 text-xs">
            Go to Portfolio
            <ChevronRight className="h-3 w-3" />
          </Button>
        </a>
      </div>
    );
  }

  // Compute totals
  let totalValue = 0;
  let totalCost = 0;
  let totalDayChange = 0;

  const holdingValues: {
    ticker: string;
    value: number;
    dayChange: number;
    dayChangePercent: number;
  }[] = [];

  for (const h of allHoldings) {
    const quote = quotes[h.ticker];
    const price = quote?.price ?? 0;
    const value = h.shares * price;
    totalValue += value;
    totalCost += h.shares * h.avgCostBasis;

    const dayChange = quote ? h.shares * quote.change : 0;
    totalDayChange += dayChange;

    holdingValues.push({
      ticker: h.ticker,
      value,
      dayChange,
      dayChangePercent: quote?.changesPercentage ?? 0,
    });
  }

  // Aggregate by ticker for top holdings display
  const byTicker: Record<string, { value: number; dayChangePercent: number }> = {};
  for (const hv of holdingValues) {
    if (!byTicker[hv.ticker]) {
      byTicker[hv.ticker] = { value: 0, dayChangePercent: hv.dayChangePercent };
    }
    byTicker[hv.ticker].value += hv.value;
  }

  const topHoldings = Object.entries(byTicker)
    .sort(([, a], [, b]) => b.value - a.value)
    .slice(0, 5);

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const dayPositive = totalDayChange >= 0;

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <Separator className="my-2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Portfolio value */}
      <p className="text-2xl font-semibold tabular-nums text-foreground">
        {formatCurrency(totalValue)}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {dayPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
          )}
          <span
            className={cn(
              "text-sm tabular-nums font-medium",
              dayPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {dayPositive ? "+" : ""}
            {formatCurrency(totalDayChange)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">today</span>
        <span className="text-muted-foreground">|</span>
        <span
          className={cn(
            "text-xs tabular-nums font-medium",
            totalGainLoss >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {formatPercent(totalGainLossPercent)} all time
        </span>
      </div>

      {/* Top holdings */}
      <Separator className="my-3" />
      <div className="space-y-0.5">
        <div className="grid grid-cols-3 gap-2 pb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <div>Ticker</div>
          <div className="text-right">Value</div>
          <div className="text-right">Today</div>
        </div>
        {topHoldings.map(([ticker, data]) => {
          const positive = data.dayChangePercent >= 0;
          return (
            <div
              key={ticker}
              className="grid grid-cols-3 items-center gap-2 rounded-md py-1.5 px-1 -mx-1 transition-colors hover:bg-muted/50"
            >
              <span className="text-sm font-medium text-foreground">
                {ticker}
              </span>
              <span className="text-right text-sm tabular-nums text-foreground">
                {formatCurrency(data.value)}
              </span>
              <span
                className={cn(
                  "text-right text-sm tabular-nums font-medium",
                  positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatPercent(data.dayChangePercent)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Link to portfolio */}
      <div className="mt-3 flex justify-end">
        <a href="/portfolio">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
            View Portfolio <ChevronRight className="ml-0.5 h-3 w-3" />
          </Button>
        </a>
      </div>
    </div>
  );
}
