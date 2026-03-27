"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { runAllModels } from "@/lib/analysis/valuation";
import { isCryptoTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { CryptoTreasuryValuation } from "@/components/stock/crypto-treasury-valuation";
import type { StockValuationParams, ValuationResult } from "@/types/analysis";
import {
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Search,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
  BarChart3,
  DollarSign,
  Building2,
  Percent,
  Scale,
  Target,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50";

const verdictColors: Record<string, string> = {
  "Significantly Undervalued": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Undervalued: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "Fairly Valued": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Overvalued: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "Significantly Overvalued": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const confidenceBadge: Record<string, string> = {
  high: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  low: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ValuationPage() {
  // Stock data from API
  const [stockParams, setStockParams] = useState<StockValuationParams | null>(null);
  const [tickerInput, setTickerInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cryptoTicker, setCryptoTicker] = useState<string | null>(null);

  // User-adjustable overrides
  const [dcfGrowthHigh, setDcfGrowthHigh] = useState<number | null>(null);
  const [dcfGrowthFade, setDcfGrowthFade] = useState<number | null>(null);
  const [highGrowthYears, setHighGrowthYears] = useState(5);
  const [fadeYears, setFadeYears] = useState(5);
  const [terminalGrowth, setTerminalGrowth] = useState(2.5);
  const [discountRate, setDiscountRate] = useState<number | null>(null);

  // Load stock data
  const loadStock = useCallback(async () => {
    const ticker = tickerInput.trim().toUpperCase();
    if (!ticker) return;

    setLoading(true);
    setError(null);
    setStockParams(null);
    setCryptoTicker(null);

    // Check if this is a crypto treasury company
    if (isCryptoTreasury(ticker)) {
      setCryptoTicker(ticker);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/valuation/${ticker}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Failed to load ${ticker}`);
      }
      const data: StockValuationParams = await res.json();
      setStockParams(data);

      // Pre-fill overrides with stock-specific values
      const highGrowth = Math.max(data.fcfGrowthRate3yr, data.revenueGrowthRate);
      setDcfGrowthHigh(Math.round(highGrowth * 1000) / 10);
      setDcfGrowthFade(Math.round(highGrowth * 0.4 * 1000) / 10);
      setDiscountRate(Math.round(data.wacc * 1000) / 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [tickerInput]);

  // Compute valuation results
  const results: ValuationResult | null = useMemo(() => {
    if (!stockParams) return null;

    return runAllModels(stockParams, {
      dcfGrowthHigh: dcfGrowthHigh != null ? dcfGrowthHigh / 100 : undefined,
      dcfGrowthFade: dcfGrowthFade != null ? dcfGrowthFade / 100 : undefined,
      highGrowthYears,
      fadeYears,
      terminalGrowth: terminalGrowth / 100,
      discountRate: discountRate != null ? discountRate / 100 : undefined,
    });
  }, [stockParams, dcfGrowthHigh, dcfGrowthFade, highGrowthYears, fadeYears, terminalGrowth, discountRate]);

  const applicableModels = results?.models.filter((m) => m.applicable) ?? [];
  const inapplicableModels = results?.models.filter((m) => !m.applicable) ?? [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Valuation Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Multi-model intrinsic value analysis with stock-specific parameters
        </p>
      </div>

      {/* Ticker Search */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Stock Ticker
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  className={`${inputClass} pl-9`}
                  placeholder="Enter ticker (e.g. AAPL, MSFT, GOOGL)"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && loadStock()}
                />
              </div>
            </div>
            <Button onClick={loadStock} disabled={loading || !tickerInput.trim()}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              {loading ? "Loading..." : "Analyze"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Crypto treasury company UI */}
      {cryptoTicker && <CryptoTreasuryValuation ticker={cryptoTicker} />}

      {/* Traditional stock parameters (shown after loading) */}
      {stockParams && !cryptoTicker && (
        <>
          {/* Company Overview Bar */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {stockParams.companyName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {stockParams.ticker}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {stockParams.sector} &middot; {stockParams.industry}
                    </span>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10 hidden sm:block" />
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(stockParams.currentPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Market Cap</p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(stockParams.marketCap, "USD", true)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">P/E</p>
                  <p className="text-sm font-medium tabular-nums">
                    {stockParams.peRatio > 0 ? stockParams.peRatio.toFixed(1) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROE</p>
                  <p className="text-sm font-medium tabular-nums">
                    {stockParams.roe ? (stockParams.roe * 100).toFixed(1) + "%" : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">FCF</p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(stockParams.freeCashFlow, "USD", true)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Fundamentals Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Financial Profile */}
            <Card>
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Financial Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="space-y-2.5">
                  <MetricRow label="EPS" value={`$${stockParams.eps.toFixed(2)}`} />
                  <MetricRow label="Book Value/Share" value={`$${stockParams.bookValuePerShare.toFixed(2)}`} />
                  <MetricRow label="Revenue/Share" value={`$${stockParams.revenuePerShare.toFixed(2)}`} />
                  <MetricRow label="Free Cash Flow" value={formatCurrency(stockParams.freeCashFlow, "USD", true)} />
                  <MetricRow label="Net Debt" value={formatCurrency(stockParams.netDebt, "USD", true)} />
                  <MetricRow label="Shares Outstanding" value={formatNumber(stockParams.sharesOutstanding)} />
                </div>
              </CardContent>
            </Card>

            {/* Margins & Returns */}
            <Card>
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Margins & Returns</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="space-y-2.5">
                  <MetricRow label="Gross Margin" value={pct(stockParams.grossMargin)} />
                  <MetricRow label="Operating Margin" value={pct(stockParams.operatingMargin)} />
                  <MetricRow label="Net Margin" value={pct(stockParams.netMargin)} />
                  <MetricRow label="ROE" value={pct(stockParams.roe)} />
                  <MetricRow label="ROA" value={pct(stockParams.roa)} />
                  <MetricRow label="FCF Growth (CAGR)" value={pct(stockParams.fcfGrowthRate3yr)} />
                </div>
              </CardContent>
            </Card>

            {/* Valuation Ratios & Dividend */}
            <Card>
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Ratios & Dividend</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="space-y-2.5">
                  <MetricRow label="P/E Ratio" value={stockParams.peRatio > 0 ? stockParams.peRatio.toFixed(1) : "N/A"} comparison={`Industry: ${stockParams.industryPE}`} />
                  <MetricRow label="P/B Ratio" value={stockParams.pbRatio > 0 ? stockParams.pbRatio.toFixed(1) : "N/A"} comparison={`Industry: ${stockParams.industryPB}`} />
                  <MetricRow label="D/E Ratio" value={stockParams.debtToEquity >= 0 ? stockParams.debtToEquity.toFixed(2) : "N/A"} />
                  <MetricRow label="Current Ratio" value={stockParams.currentRatio > 0 ? stockParams.currentRatio.toFixed(2) : "N/A"} />
                  <MetricRow label="Dividend/Share" value={stockParams.dividendPerShare > 0 ? `$${stockParams.dividendPerShare.toFixed(2)}` : "None"} />
                  <MetricRow label="Dividend Yield" value={stockParams.dividendYield > 0 ? pct(stockParams.dividendYield) : "N/A"} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DCF Assumptions (user-adjustable) + Results */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Adjustable Assumptions */}
            <Card>
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">
                    DCF Assumptions
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Pre-filled from {stockParams.ticker} financials — adjust to test scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="High Growth Rate"
                    value={dcfGrowthHigh ?? 0}
                    onChange={setDcfGrowthHigh}
                    suffix="%"
                    step={0.5}
                    hint={`From FCF CAGR: ${pct(stockParams.fcfGrowthRate3yr)}`}
                  />
                  <NumberInput
                    label="High Growth Years"
                    value={highGrowthYears}
                    onChange={setHighGrowthYears}
                    step={1}
                    min={1}
                    max={15}
                  />
                  <NumberInput
                    label="Fade Growth Rate"
                    value={dcfGrowthFade ?? 0}
                    onChange={setDcfGrowthFade}
                    suffix="%"
                    step={0.5}
                  />
                  <NumberInput
                    label="Fade Years"
                    value={fadeYears}
                    onChange={setFadeYears}
                    step={1}
                    min={0}
                    max={10}
                  />
                  <NumberInput
                    label="Terminal Growth"
                    value={terminalGrowth}
                    onChange={setTerminalGrowth}
                    suffix="%"
                    step={0.25}
                  />
                  <NumberInput
                    label="Discount Rate (WACC)"
                    value={discountRate ?? 0}
                    onChange={setDiscountRate}
                    suffix="%"
                    step={0.25}
                    hint={`Estimated WACC: ${(stockParams.wacc * 100).toFixed(1)}%`}
                  />
                </div>

                {/* WACC breakdown */}
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    WACC Components
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Equity Weight</span>
                    <span className="tabular-nums text-right">
                      {stockParams.marketCap > 0
                        ? ((stockParams.marketCap / (stockParams.marketCap + stockParams.totalDebt)) * 100).toFixed(1)
                        : "—"}%
                    </span>
                    <span className="text-muted-foreground">Debt Weight</span>
                    <span className="tabular-nums text-right">
                      {stockParams.totalDebt > 0
                        ? ((stockParams.totalDebt / (stockParams.marketCap + stockParams.totalDebt)) * 100).toFixed(1)
                        : "0.0"}%
                    </span>
                    <span className="text-muted-foreground">Risk Premium</span>
                    <span className="tabular-nums text-right">5.5%</span>
                    <span className="text-muted-foreground">Risk-Free Rate</span>
                    <span className="tabular-nums text-right">4.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Composite Results */}
            {results && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="p-5 pb-0">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm font-medium">
                        Composite Fair Value
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Weighted average of {applicableModels.length} applicable model{applicableModels.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-4 space-y-4">
                    <div className="text-center py-2">
                      <p className="text-3xl font-semibold tabular-nums text-foreground">
                        {formatCurrency(results.compositeFairValue)}
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Badge className={verdictColors[results.verdict] ?? ""}>
                          {results.verdict}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Current Price</p>
                        <p className="mt-0.5 text-sm font-medium tabular-nums">
                          {formatCurrency(results.currentPrice)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Upside/Downside</p>
                        <div className="mt-0.5 flex items-center justify-center gap-1">
                          {results.upsidePercent >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium tabular-nums",
                              results.upsidePercent >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            )}
                          >
                            {formatPercent(results.upsidePercent)}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Margin of Safety</p>
                        <p className="mt-0.5 text-sm font-medium tabular-nums">
                          {results.upsidePercent > 0
                            ? `${results.upsidePercent.toFixed(1)}%`
                            : "None"}
                        </p>
                      </div>
                    </div>

                    {/* Price-to-fair-value bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current vs Fair Value</span>
                        <span className="tabular-nums">
                          {results.currentPrice > 0
                            ? ((results.currentPrice / results.compositeFairValue) * 100).toFixed(0)
                            : 0}% of fair value
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            results.upsidePercent > 10
                              ? "bg-emerald-500"
                              : results.upsidePercent > -10
                                ? "bg-amber-500"
                                : "bg-red-500"
                          )}
                          style={{
                            width: `${Math.min(100, Math.max(5, (results.currentPrice / results.compositeFairValue) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Individual Model Results */}
          {results && (
            <Card>
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">
                    Model Breakdown
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Individual fair value estimates from each valuation model
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                {/* Applicable models */}
                <div className="space-y-3">
                  {applicableModels.map((model) => {
                    const upside =
                      results.currentPrice > 0
                        ? ((model.fairValue - results.currentPrice) / results.currentPrice) * 100
                        : 0;
                    return (
                      <div
                        key={model.name}
                        className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {model.name}
                            </p>
                            <Badge
                              variant="secondary"
                              className={cn("text-[10px]", confidenceBadge[model.confidence])}
                            >
                              {model.confidence}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">
                            {model.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold tabular-nums">
                            {formatCurrency(model.fairValue)}
                          </p>
                          <p
                            className={cn(
                              "text-xs tabular-nums",
                              upside >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            )}
                          >
                            {formatPercent(upside)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inapplicable models */}
                {inapplicableModels.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Not Applicable
                    </p>
                    {inapplicableModels.map((model) => (
                      <div
                        key={model.name}
                        className="flex items-center gap-4 rounded-lg border border-border/50 p-3 opacity-60"
                      >
                        <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground">
                            {model.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {model.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sensitivity Analysis */}
          {results && results.sensitivityMatrix.values.length > 0 && (
            <Card>
              <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">
                    DCF Sensitivity Analysis
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Intrinsic value per share at different growth and discount rate assumptions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="pb-2 pr-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Growth ↓ / WACC →
                        </th>
                        {results.sensitivityMatrix.discountRates.map((dr) => (
                          <th
                            key={dr}
                            className={cn(
                              "pb-2 text-right text-xs font-medium uppercase tracking-wider",
                              Math.abs(dr - (discountRate ?? 0) / 100) < 0.001
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {(dr * 100).toFixed(1)}%
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.sensitivityMatrix.growthRates.map(
                        (gr, rowIdx) => (
                          <tr
                            key={gr}
                            className="transition-colors hover:bg-muted/50"
                          >
                            <td
                              className={cn(
                                "py-2.5 pr-3 text-xs font-medium",
                                Math.abs(gr - (dcfGrowthHigh ?? 0) / 100) < 0.001
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {(gr * 100).toFixed(1)}%
                            </td>
                            {results.sensitivityMatrix.values[rowIdx].map(
                              (val, colIdx) => {
                                const isBase =
                                  Math.abs(gr - (dcfGrowthHigh ?? 0) / 100) < 0.001 &&
                                  Math.abs(
                                    results.sensitivityMatrix.discountRates[colIdx] -
                                      (discountRate ?? 0) / 100
                                  ) < 0.001;
                                const upside =
                                  results.currentPrice > 0
                                    ? ((val - results.currentPrice) / results.currentPrice) * 100
                                    : 0;
                                return (
                                  <td
                                    key={colIdx}
                                    className={cn(
                                      "py-2.5 text-right tabular-nums",
                                      isBase
                                        ? "font-semibold text-foreground bg-primary/5 rounded"
                                        : upside > 10
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : upside < -10
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-muted-foreground"
                                    )}
                                  >
                                    {formatCurrency(val)}
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>
                    Green cells indicate {">"}10% upside from current price ({formatCurrency(results.currentPrice)}).
                    Red cells indicate {">"}10% downside. Bold cell is your base case.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty state */}
      {!stockParams && !cryptoTicker && !loading && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Enter a stock ticker above to run a comprehensive multi-model valuation
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Combines DCF, Dividend Discount, Graham Number, Peter Lynch, Comparable Multiples, and Earnings Power Value
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Crypto treasury companies (BMNR, MSTR) use a specialized NAV-based model with staking yield and dilution analysis
            </p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        This multi-model valuation uses stock-specific financial data and should not
        be considered financial advice. Models are based on simplified assumptions —
        actual intrinsic value depends on competitive dynamics, management quality,
        macroeconomic conditions, and factors not captured here. Industry multiples
        are sector medians and may not reflect the company&apos;s specific peer group.
        Always conduct thorough due diligence before making investment decisions.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function NumberInput({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  min,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type="number"
          className={cn(inputClass, suffix && "pr-8")}
          value={value}
          onChange={(e) => {
            let v = parseFloat(e.target.value);
            if (isNaN(v)) v = 0;
            if (min != null) v = Math.max(min, v);
            if (max != null) v = Math.min(max, v);
            onChange(v);
          }}
          step={step}
          min={min}
          max={max}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function MetricRow({
  label,
  value,
  comparison,
}: {
  label: string;
  value: string;
  comparison?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium tabular-nums text-foreground">{value}</span>
        {comparison && (
          <span className="ml-2 text-[10px] text-muted-foreground">{comparison}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}
