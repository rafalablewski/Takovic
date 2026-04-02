"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatLargeNumber, formatPercent } from "@/lib/utils";
import { importCoverageTickerModule } from "@/lib/coverage/import-coverage-module";
import { applyBmnrLivePricesToOverviewMetrics } from "@/lib/coverage/bmnr-overview-live-metrics";
import { toNormalizedLiveQuotes } from "@/lib/coverage/normalize-live-quotes";
import type {
  CasePoint,
  CoverageOverview,
  LiveQuoteRow,
  LiveQuotesPayload,
  NormalizedLiveQuotesPayload,
  OverviewMetric,
} from "@/types/coverage";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Activity,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Metric formatting
// ---------------------------------------------------------------------------

function formatMetricValue(metric: OverviewMetric): string {
  const v = metric.value;
  if (typeof v === "string") return v;

  switch (metric.format) {
    case "currency":
      if (Math.abs(v) < 1) return `$${v.toFixed(4)}`;
      if (Math.abs(v) >= 1e3) return formatLargeNumber(v, { prefix: "$", decimals: Math.abs(v) >= 1e9 ? 2 : 1 });
      return formatCurrency(v);
    case "percent":
      return `${(v * 100).toFixed(v >= 0 ? 2 : 1)}%`;
    case "number":
      if (Math.abs(v) >= 1e3) return formatLargeNumber(v, { decimals: Math.abs(v) >= 1e9 ? 2 : 0 });
      return v.toLocaleString();
    case "eth":
      if (v >= 1e3) return formatLargeNumber(v, { decimals: v >= 1e6 ? 2 : 0 });
      return v.toLocaleString();
    case "multiplier":
      return `${v.toFixed(2)}x`;
    case "text":
      return String(v);
    default:
      return typeof v === "number" ? v.toLocaleString() : String(v);
  }
}

// ---------------------------------------------------------------------------
// Live quotes (BMNR + ETH spot via Yahoo; cached on server)
// ---------------------------------------------------------------------------

function LivePricesStrip({
  ticker,
  onQuotesChange,
}: {
  ticker: string;
  onQuotesChange?: (data: NormalizedLiveQuotesPayload) => void;
}) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; data: NormalizedLiveQuotesPayload }
    | { status: "error" }
  >({ status: "loading" });
  const [stockRefreshing, setStockRefreshing] = useState(false);
  const [ethRefreshing, setEthRefreshing] = useState(false);

  const upper = ticker.toUpperCase();

  const fetchQuotes = useCallback(
    async (opts?: { refresh?: boolean; side?: "stock" | "eth" }) => {
      const params = new URLSearchParams();
      if (opts?.refresh) params.set("refresh", "1");
      if (opts?.side) params.set("side", opts.side);
      const q = params.toString();
      const url = `/api/coverage/${encodeURIComponent(upper)}/live-quotes${q ? `?${q}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as LiveQuotesPayload;
      return toNormalizedLiveQuotes(json, upper);
    },
    [upper]
  );

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    async function load() {
      try {
        const data = await fetchQuotes();
        if (!cancelled) setState({ status: "ready", data });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    load();
    const id = window.setInterval(() => {
      void fetchQuotes()
        .then((data) => {
          if (!cancelled) setState({ status: "ready", data });
        })
        .catch(() => {
          if (!cancelled) setState({ status: "error" });
        });
    }, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [ticker, fetchQuotes]);

  useEffect(() => {
    if (state.status === "ready") onQuotesChange?.(state.data);
  }, [state, onQuotesChange]);

  const refreshStock = useCallback(async () => {
    setStockRefreshing(true);
    try {
      const data = await fetchQuotes({ refresh: true, side: "stock" });
      setState({ status: "ready", data });
    } catch {
      setState({ status: "error" });
    } finally {
      setStockRefreshing(false);
    }
  }, [fetchQuotes]);

  const refreshEth = useCallback(async () => {
    setEthRefreshing(true);
    try {
      const data = await fetchQuotes({ refresh: true, side: "eth" });
      setState({ status: "ready", data });
    } catch {
      setState({ status: "error" });
    } finally {
      setEthRefreshing(false);
    }
  }, [fetchQuotes]);

  if (state.status === "loading") {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">Loading live prices…</p>
        </CardContent>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">
            Live prices unavailable. Key metrics below use the PR snapshot only.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { data } = state;
  const cols = data.includeEthSpot ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Live prices</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          {data.stock || (data.includeEthSpot && data.eth)
            ? "Market data via Yahoo Finance · auto-refresh every minute · use ↻ for an immediate pull"
            : "No live quote returned · check symbol or data provider"}
        </p>
      </CardHeader>
      <CardContent className={`p-5 pt-4 grid grid-cols-1 gap-6 ${cols}`}>
        <QuoteCell
          title={`${upper} (stock)`}
          row={data.stock}
          onRefresh={refreshStock}
          refreshing={stockRefreshing}
          refreshLabel={`Refresh ${upper} quote`}
        />
        {data.includeEthSpot ? (
          <QuoteCell
            title={`Ethereum (${data.ethSymbol})`}
            row={data.eth}
            onRefresh={refreshEth}
            refreshing={ethRefreshing}
            refreshLabel={`Refresh ${data.ethSymbol} quote`}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuoteCell({
  title,
  row,
  onRefresh,
  refreshing,
  refreshLabel,
}: {
  title: string;
  row: LiveQuoteRow | null;
  onRefresh: () => void | Promise<void>;
  refreshing: boolean;
  refreshLabel: string;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground min-w-0">
          {title}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => void onRefresh()}
          disabled={refreshing}
          aria-label={refreshLabel}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        </Button>
      </div>
      {!row ? (
        <p className="mt-1 text-sm text-muted-foreground">—</p>
      ) : (
        <>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {formatCurrency(row.price)}
          </p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium tabular-nums",
              row.changesPercentage >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {formatPercent(row.changesPercentage)}
          </p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

type OverviewState =
  | { status: "loading" }
  | { status: "ready"; data: CoverageOverview }
  | { status: "empty" };

function isCoverageOverview(x: unknown): x is CoverageOverview {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.thesis === "string" &&
    Array.isArray(o.bullCase) &&
    Array.isArray(o.bearCase) &&
    Array.isArray(o.metrics)
  );
}

export function OverviewTab({ ticker }: { ticker: string }) {
  const [state, setState] = useState<OverviewState>({ status: "loading" });
  const [liveQuotes, setLiveQuotes] = useState<NormalizedLiveQuotesPayload | null>(null);

  const onLiveQuotesChange = useCallback((data: NormalizedLiveQuotesPayload) => {
    setLiveQuotes(data);
  }, []);

  useEffect(() => {
    setLiveQuotes(null);
  }, [ticker]);

  useEffect(() => {
    let cancelled = false;
    const lower = ticker.toLowerCase();
    setState({ status: "loading" });
    importCoverageTickerModule(lower)
      .then((mod) => {
        if (cancelled) return;
        const raw = mod.OVERVIEW;
        if (isCoverageOverview(raw)) {
          setState({ status: "ready", data: raw });
        } else {
          setState({ status: "empty" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "empty" });
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const displayMetrics = useMemo((): OverviewMetric[] | null => {
    if (state.status !== "ready") return null;
    const { data } = state;
    if (ticker.toUpperCase() !== "BMNR" || !liveQuotes) return data.metrics;
    return applyBmnrLivePricesToOverviewMetrics(
      data.metrics,
      liveQuotes.stock?.price ?? null,
      liveQuotes.eth?.price ?? null
    );
  }, [ticker, state, liveQuotes]);

  if (state.status === "loading") {
    return <p className="text-sm text-muted-foreground">Loading overview…</p>;
  }
  if (state.status === "empty") {
    return <p className="text-sm text-muted-foreground">No overview data.</p>;
  }

  const data = state.data;
  const metrics = displayMetrics ?? data.metrics;

  return (
    <div className="space-y-4">
      <LivePricesStrip ticker={ticker} onQuotesChange={onLiveQuotesChange} />

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.thesis}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CaseSection title="Bull Case" points={data.bullCase} variant="bull" />
        <CaseSection title="Bear Case" points={data.bearCase} variant="bear" />
      </div>

      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
          {ticker.toUpperCase() === "BMNR" ? (
            <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
              NAV, premium, market cap, ETH book, and dividend yield follow live stock and ETH prices
              above when available; holdings, staking, and per-share dividend amounts use the latest PR
              snapshot.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
            {metrics.map((metric) => {
              const isNegative =
                typeof metric.value === "number" && metric.value < 0;
              const isPercent = metric.format === "percent";
              return (
                <div key={metric.label}>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {metric.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-sm font-semibold tabular-nums",
                      isPercent && isNegative
                        ? "text-red-600 dark:text-red-400"
                        : isPercent && !isNegative
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                    )}
                  >
                    {formatMetricValue(metric)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {metric.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CaseSection({
  title,
  points,
  variant,
}: {
  title: string;
  points: CasePoint[];
  variant: "bull" | "bear";
}) {
  const isBull = variant === "bull";

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          {isBull ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <CardTitle
            className={cn(
              "text-sm font-medium",
              isBull
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            )}
          >
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3">
        <div className="space-y-2.5">
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  isBull
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                )}
              >
                {isBull ? (
                  <Plus className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Minus className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  {p.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {" — "}
                  {p.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
