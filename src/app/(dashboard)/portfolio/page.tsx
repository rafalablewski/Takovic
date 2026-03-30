"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Download,
} from "lucide-react";
import { exportPortfolioCSV } from "@/lib/export";
import { usePortfolio, type Holding } from "@/hooks/use-portfolio";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import type { FMPQuote } from "@/lib/api/fmp";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QuoteMap = Record<string, FMPQuote>;

interface HoldingFormData {
  ticker: string;
  shares: string;
  avgCostBasis: string;
  purchaseDate: string;
  notes: string;
}

const EMPTY_FORM: HoldingFormData = {
  ticker: "",
  shares: "",
  avgCostBasis: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function gainColor(value: number): string {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

function gainBg(value: number): string {
  if (value > 0) return "bg-emerald-50 dark:bg-emerald-950/30";
  if (value < 0) return "bg-red-50 dark:bg-red-950/30";
  return "bg-muted/50";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCards({
  totalValue,
  totalCost,
  gainLoss,
  gainLossPercent,
  holdingCount,
}: {
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  holdingCount: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Value
            </p>
          </div>
          <p className="mt-3 text-lg font-semibold tabular-nums text-foreground">
            {formatCurrency(totalValue)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {holdingCount} holding{holdingCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Cost
            </p>
          </div>
          <p className="mt-3 text-lg font-semibold tabular-nums text-foreground">
            {formatCurrency(totalCost)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", gainBg(gainLoss))}>
              <TrendingUp className={cn("h-4 w-4", gainColor(gainLoss))} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Gain / Loss
            </p>
          </div>
          <p className={cn("mt-3 text-lg font-semibold tabular-nums", gainColor(gainLoss))}>
            {gainLoss >= 0 ? "+" : ""}
            {formatCurrency(gainLoss)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", gainBg(gainLossPercent))}>
              <PieChart className={cn("h-4 w-4", gainColor(gainLossPercent))} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Return
            </p>
          </div>
          <p className={cn("mt-3 text-lg font-semibold tabular-nums", gainColor(gainLossPercent))}>
            {formatPercent(gainLossPercent)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function HoldingForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: HoldingFormData;
  onSubmit: (data: HoldingFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<HoldingFormData>(initial);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const ticker = form.ticker.trim().toUpperCase();
    const shares = parseFloat(form.shares);
    const cost = parseFloat(form.avgCostBasis);

    if (!ticker) {
      setError("Ticker is required");
      return;
    }
    if (isNaN(shares) || shares <= 0) {
      setError("Shares must be a positive number");
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      setError("Cost per share must be a positive number");
      return;
    }
    if (!form.purchaseDate) {
      setError("Purchase date is required");
      return;
    }

    onSubmit({ ...form, ticker });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Ticker
          </label>
          <input
            type="text"
            value={form.ticker}
            onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value }))}
            placeholder="AAPL"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Shares
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.shares}
            onChange={(e) => setForm((f) => ({ ...f, shares: e.target.value }))}
            placeholder="10"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Cost per Share
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.avgCostBasis}
            onChange={(e) =>
              setForm((f) => ({ ...f, avgCostBasis: e.target.value }))
            }
            placeholder="150.00"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Purchase Date
          </label>
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, purchaseDate: e.target.value }))
            }
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Notes (optional)
        </label>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="e.g. Long-term hold"
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" className="gap-1.5">
          <Check className="h-3.5 w-3.5" />
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function HoldingsTable({
  holdings,
  quotes,
  quotesLoading,
  portfolioId,
  onEdit,
  onRemove,
}: {
  holdings: Holding[];
  quotes: QuoteMap;
  quotesLoading: boolean;
  portfolioId: string;
  onEdit: (holdingId: string) => void;
  onRemove: (portfolioId: string, holdingId: string) => void;
}) {
  // Compute totals for weight calculation
  const totalMarketValue = holdings.reduce((sum, h) => {
    const quote = quotes[h.ticker];
    const price = quote?.price ?? 0;
    return sum + h.shares * price;
  }, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 pr-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stock
            </th>
            <th className="pb-2 px-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Shares
            </th>
            <th className="pb-2 px-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Avg Cost
            </th>
            <th className="pb-2 px-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Price
            </th>
            <th className="pb-2 px-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Mkt Value
            </th>
            <th className="pb-2 px-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Gain/Loss
            </th>
            <th className="pb-2 px-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Return
            </th>
            <th className="pb-2 px-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Weight
            </th>
            <th className="pb-2 pl-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {holdings.map((holding) => {
            const quote = quotes[holding.ticker];
            const currentPrice = quote?.price ?? 0;
            const marketValue = holding.shares * currentPrice;
            const costBasis = holding.shares * holding.avgCostBasis;
            const gainLoss = marketValue - costBasis;
            const gainLossPercent =
              costBasis > 0 ? ((marketValue - costBasis) / costBasis) * 100 : 0;
            const weight =
              totalMarketValue > 0
                ? (marketValue / totalMarketValue) * 100
                : 0;
            const positive = gainLoss >= 0;

            return (
              <tr
                key={holding.id}
                className="transition-colors hover:bg-muted/50"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {holding.ticker}
                    </span>
                    {quote && (
                      <span
                        className={cn(
                          "flex items-center gap-0.5 text-xs tabular-nums font-medium",
                          quote.changesPercentage >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {quote.changesPercentage >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {formatPercent(quote.changesPercentage)}
                      </span>
                    )}
                  </div>
                  {holding.notes && (
                    <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[200px]">
                      {holding.notes}
                    </p>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-sm tabular-nums text-foreground">
                  {holding.shares.toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}
                </td>
                <td className="py-3 px-2 text-right text-sm tabular-nums text-foreground">
                  {formatCurrency(holding.avgCostBasis)}
                </td>
                <td className="py-3 px-2 text-right text-sm tabular-nums text-foreground">
                  {quotesLoading ? (
                    <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted" />
                  ) : quote ? (
                    formatCurrency(currentPrice)
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-sm tabular-nums text-foreground">
                  {quotesLoading ? (
                    <span className="inline-block h-4 w-20 animate-pulse rounded bg-muted" />
                  ) : quote ? (
                    formatCurrency(marketValue)
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </td>
                <td
                  className={cn(
                    "py-3 px-2 text-right text-sm tabular-nums font-medium",
                    quote ? gainColor(gainLoss) : "text-muted-foreground"
                  )}
                >
                  {quotesLoading ? (
                    <span className="inline-block h-4 w-20 animate-pulse rounded bg-muted" />
                  ) : quote ? (
                    <>
                      {positive ? "+" : ""}
                      {formatCurrency(gainLoss)}
                    </>
                  ) : (
                    "--"
                  )}
                </td>
                <td
                  className={cn(
                    "py-3 px-2 text-right text-sm tabular-nums font-medium",
                    quote ? gainColor(gainLossPercent) : "text-muted-foreground"
                  )}
                >
                  {quotesLoading ? (
                    <span className="inline-block h-4 w-14 animate-pulse rounded bg-muted" />
                  ) : quote ? (
                    formatPercent(gainLossPercent)
                  ) : (
                    "--"
                  )}
                </td>
                <td className="py-3 px-2 text-right text-sm tabular-nums text-muted-foreground">
                  {quotesLoading ? (
                    <span className="inline-block h-4 w-12 animate-pulse rounded bg-muted" />
                  ) : quote ? (
                    `${weight.toFixed(1)}%`
                  ) : (
                    "--"
                  )}
                </td>
                <td className="py-3 pl-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onEdit(holding.id)}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:text-red-600"
                      onClick={() => onRemove(portfolioId, holding.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PortfolioPage() {
  const {
    portfolios,
    isLoaded,
    addPortfolio,
    removePortfolio,
    addHolding,
    updateHolding,
    removeHolding,
  } = usePortfolio();

  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoldingId, setEditingHoldingId] = useState<string | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
    null
  );
  const [showNewPortfolioInput, setShowNewPortfolioInput] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");

  // Set initial active portfolio
  useEffect(() => {
    if (isLoaded && portfolios.length > 0 && !activePortfolioId) {
      setActivePortfolioId(portfolios[0].id);
    }
  }, [isLoaded, portfolios, activePortfolioId]);

  // Fetch quotes for all holdings across all portfolios
  const fetchQuotes = useCallback(async () => {
    const allTickers = new Set<string>();
    for (const p of portfolios) {
      for (const h of p.holdings) {
        allTickers.add(h.ticker);
      }
    }

    if (allTickers.size === 0) {
      setQuotes({});
      return;
    }

    setQuotesLoading(true);
    try {
      const res = await fetch(
        `/api/stocks/batch?tickers=${Array.from(allTickers).join(",")}`
      );
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes ?? {});
      }
    } catch {
      // Quotes unavailable — table will show dashes
    } finally {
      setQuotesLoading(false);
    }
  }, [portfolios]);

  useEffect(() => {
    if (isLoaded) {
      fetchQuotes();
    }
  }, [isLoaded, fetchQuotes]);

  // Refresh quotes every 60 seconds
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(fetchQuotes, 60_000);
    return () => clearInterval(interval);
  }, [isLoaded, fetchQuotes]);

  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);

  // Compute totals for active portfolio
  const computeTotals = (holdings: Holding[]) => {
    let totalValue = 0;
    let totalCost = 0;
    for (const h of holdings) {
      const price = quotes[h.ticker]?.price ?? 0;
      totalValue += h.shares * price;
      totalCost += h.shares * h.avgCostBasis;
    }
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
    return { totalValue, totalCost, gainLoss, gainLossPercent };
  };

  const handleAddHolding = (data: HoldingFormData) => {
    if (!activePortfolioId) return;
    addHolding(activePortfolioId, {
      ticker: data.ticker,
      shares: parseFloat(data.shares),
      avgCostBasis: parseFloat(data.avgCostBasis),
      purchaseDate: data.purchaseDate,
      notes: data.notes || undefined,
    });
    setShowAddForm(false);
  };

  const handleUpdateHolding = (data: HoldingFormData) => {
    if (!activePortfolioId || !editingHoldingId) return;
    updateHolding(activePortfolioId, editingHoldingId, {
      ticker: data.ticker,
      shares: parseFloat(data.shares),
      avgCostBasis: parseFloat(data.avgCostBasis),
      purchaseDate: data.purchaseDate,
      notes: data.notes || undefined,
    });
    setEditingHoldingId(null);
  };

  const handleCreatePortfolio = () => {
    const name = newPortfolioName.trim();
    if (!name) return;
    const id = addPortfolio(name);
    setActivePortfolioId(id);
    setNewPortfolioName("");
    setShowNewPortfolioInput(false);
  };

  const handleDeletePortfolio = (id: string) => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    removePortfolio(id);
    if (activePortfolioId === id) {
      setActivePortfolioId(portfolios.find((p) => p.id !== id)?.id ?? null);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Holdings, performance, and allocation
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Holdings, performance, and allocation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quotesLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Updating prices...
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              if (!activePortfolio) return;
              const totalMarketValue = activePortfolio.holdings.reduce(
                (sum, h) => sum + h.shares * (quotes[h.ticker]?.price ?? 0),
                0
              );
              exportPortfolioCSV(
                activePortfolio.holdings.map((h) => {
                  const price = quotes[h.ticker]?.price ?? 0;
                  const marketValue = h.shares * price;
                  const costBasis = h.shares * h.avgCostBasis;
                  const gainLoss = marketValue - costBasis;
                  const gainLossPercent =
                    costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
                  const weight =
                    totalMarketValue > 0
                      ? (marketValue / totalMarketValue) * 100
                      : 0;
                  return {
                    ticker: h.ticker,
                    shares: h.shares,
                    avgCost: h.avgCostBasis,
                    currentPrice: price,
                    marketValue,
                    gainLoss,
                    gainLossPercent,
                    weight,
                  };
                })
              );
            }}
            disabled={!activePortfolio || activePortfolio.holdings.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Portfolio Tabs */}
      {portfolios.length > 0 ? (
        <Tabs
          value={activePortfolioId ?? undefined}
          onValueChange={setActivePortfolioId}
        >
          <div className="flex items-center gap-2">
            <TabsList>
              {portfolios.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="gap-1.5">
                  {p.name}
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {p.holdings.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {showNewPortfolioInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreatePortfolio();
                    if (e.key === "Escape") setShowNewPortfolioInput(false);
                  }}
                  placeholder="Portfolio name..."
                  className="h-8 w-40 rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleCreatePortfolio}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowNewPortfolioInput(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-muted-foreground"
                onClick={() => setShowNewPortfolioInput(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </Button>
            )}
          </div>

          {portfolios.map((portfolio) => {
            const totals = computeTotals(portfolio.holdings);
            const editingHolding = portfolio.holdings.find(
              (h) => h.id === editingHoldingId
            );

            return (
              <TabsContent key={portfolio.id} value={portfolio.id}>
                <div className="space-y-6">
                  {/* Summary Cards */}
                  {portfolio.holdings.length > 0 && (
                    <SummaryCards
                      totalValue={totals.totalValue}
                      totalCost={totals.totalCost}
                      gainLoss={totals.gainLoss}
                      gainLossPercent={totals.gainLossPercent}
                      holdingCount={portfolio.holdings.length}
                    />
                  )}

                  {/* Holdings Card */}
                  <Card>
                    <CardHeader className="p-5 pb-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          Holdings
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {portfolios.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-muted-foreground hover:text-red-600"
                              onClick={() =>
                                handleDeletePortfolio(portfolio.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete Portfolio
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => {
                              setShowAddForm(true);
                              setEditingHoldingId(null);
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Holding
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-4">
                      {/* Add Holding Form */}
                      {showAddForm && portfolio.id === activePortfolioId && (
                        <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Add New Holding
                          </p>
                          <HoldingForm
                            initial={EMPTY_FORM}
                            onSubmit={handleAddHolding}
                            onCancel={() => setShowAddForm(false)}
                            submitLabel="Add Holding"
                          />
                        </div>
                      )}

                      {/* Edit Holding Form */}
                      {editingHolding &&
                        portfolio.id === activePortfolioId && (
                          <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Edit Holding &mdash; {editingHolding.ticker}
                            </p>
                            <HoldingForm
                              initial={{
                                ticker: editingHolding.ticker,
                                shares: editingHolding.shares.toString(),
                                avgCostBasis:
                                  editingHolding.avgCostBasis.toString(),
                                purchaseDate: editingHolding.purchaseDate,
                                notes: editingHolding.notes ?? "",
                              }}
                              onSubmit={handleUpdateHolding}
                              onCancel={() => setEditingHoldingId(null)}
                              submitLabel="Save Changes"
                            />
                          </div>
                        )}

                      {portfolio.holdings.length > 0 ? (
                        <HoldingsTable
                          holdings={portfolio.holdings}
                          quotes={quotes}
                          quotesLoading={quotesLoading}
                          portfolioId={portfolio.id}
                          onEdit={(holdingId) => {
                            setEditingHoldingId(holdingId);
                            setShowAddForm(false);
                          }}
                          onRemove={removeHolding}
                        />
                      ) : (
                        !showAddForm && (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                              <Briefcase className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <h2 className="text-lg font-semibold text-foreground">
                              No holdings yet
                            </h2>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                              Add your first holding to start tracking your
                              portfolio performance, allocation, and gain/loss.
                            </p>
                            <Button
                              className="mt-6 gap-1.5"
                              size="sm"
                              onClick={() => setShowAddForm(true)}
                            >
                              <Plus className="h-4 w-4" />
                              Add Your First Holding
                            </Button>
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Briefcase className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              No portfolios
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Create a portfolio to start tracking your holdings.
            </p>
            <Button
              className="mt-6 gap-1.5"
              size="sm"
              onClick={() => addPortfolio("My Portfolio")}
            >
              <Plus className="h-4 w-4" />
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
