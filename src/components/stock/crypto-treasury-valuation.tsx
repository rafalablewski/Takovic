"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { formatCurrency, formatPercent, formatLargeNumber, cn } from "@/lib/utils";
import { runCryptoTreasuryValuation } from "@/lib/analysis/crypto-treasury-valuation";
import {
  getCryptoTreasuryProfile,
  getDefaultInputs,
  getSliderParams,
} from "@/lib/analysis/crypto-treasury-registry";
import { isCovered } from "@/data/coverage/registry";
import type {
  CryptoTreasuryProfile,
  CryptoTreasuryInputs,
  CryptoTreasuryResult,
  SliderParam,
} from "@/types/analysis";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Info,
  Coins,
  Shield,
  Target,
  Table2,
  Layers,
  RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const verdictColors: Record<string, string> = {
  "Significantly Undervalued": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Undervalued: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "Fairly Valued": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Overvalued: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "Significantly Overvalued": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

type PriceSourceMode = "live" | "custom";

// ---------------------------------------------------------------------------
// Live Yahoo prices (coverage bundle or generic stock + spot)
// ---------------------------------------------------------------------------

function useTreasuryLivePrices(ticker: string, profile: CryptoTreasuryProfile) {
  const upper = ticker.toUpperCase();
  const spotSymbol = profile.asset === "ETH" ? "ETH-USD" : "BTC-USD";
  const [liveStock, setLiveStock] = useState<number | null>(null);
  const [liveAsset, setLiveAsset] = useState<number | null>(null);
  const [stockRefreshing, setStockRefreshing] = useState(false);
  const [assetRefreshing, setAssetRefreshing] = useState(false);

  const fetchSpotQuote = useCallback(async (): Promise<number | null> => {
    const r = await fetch(`/api/stocks/${encodeURIComponent(spotSymbol)}`, {
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { quote?: { price?: number } };
    const p = j.quote?.price;
    return typeof p === "number" && Number.isFinite(p) ? p : null;
  }, [spotSymbol]);

  const loadBoth = useCallback(async () => {
    try {
      if (isCovered(upper)) {
        const r = await fetch(
          `/api/coverage/${encodeURIComponent(upper)}/live-quotes`,
          { cache: "no-store" }
        );
        if (!r.ok) throw new Error("coverage");
        const j = (await r.json()) as {
          stock?: { price?: number } | null;
          eth?: { price?: number } | null;
          includeEthSpot?: boolean;
        };
        const sp =
          typeof j.stock?.price === "number" && Number.isFinite(j.stock.price)
            ? j.stock.price
            : null;
        setLiveStock(sp);
        let ap: number | null =
          profile.asset === "ETH" && j.includeEthSpot && j.eth
            ? typeof j.eth.price === "number" && Number.isFinite(j.eth.price)
              ? j.eth.price
              : null
            : null;
        if (ap == null) ap = await fetchSpotQuote();
        setLiveAsset(ap);
        return;
      }
      const [sr, apVal] = await Promise.all([
        fetch(`/api/stocks/${encodeURIComponent(upper)}`, { cache: "no-store" }).then(
          async (res) => {
            if (!res.ok) return null;
            const d = (await res.json()) as { quote?: { price?: number } };
            const p = d.quote?.price;
            return typeof p === "number" && Number.isFinite(p) ? p : null;
          }
        ),
        fetchSpotQuote(),
      ]);
      setLiveStock(sr);
      setLiveAsset(apVal);
    } catch {
      /* keep prior values */
    }
  }, [upper, profile.asset, fetchSpotQuote]);

  const refreshStock = useCallback(async () => {
    setStockRefreshing(true);
    try {
      if (isCovered(upper)) {
        const r = await fetch(
          `/api/coverage/${encodeURIComponent(upper)}/live-quotes?refresh=1&side=stock`,
          { cache: "no-store" }
        );
        if (r.ok) {
          const j = (await r.json()) as { stock?: { price?: number } | null };
          const p = j.stock?.price;
          if (typeof p === "number" && Number.isFinite(p)) setLiveStock(p);
        }
      } else {
        const r = await fetch(`/api/stocks/${encodeURIComponent(upper)}`, {
          cache: "no-store",
        });
        if (r.ok) {
          const d = (await r.json()) as { quote?: { price?: number } };
          const p = d.quote?.price;
          if (typeof p === "number" && Number.isFinite(p)) setLiveStock(p);
        }
      }
    } finally {
      setStockRefreshing(false);
    }
  }, [upper]);

  const refreshAsset = useCallback(async () => {
    setAssetRefreshing(true);
    try {
      if (isCovered(upper) && profile.asset === "ETH") {
        const r = await fetch(
          `/api/coverage/${encodeURIComponent(upper)}/live-quotes?refresh=1&side=eth`,
          { cache: "no-store" }
        );
        if (r.ok) {
          const j = (await r.json()) as { eth?: { price?: number } | null };
          const p = j.eth?.price;
          if (typeof p === "number" && Number.isFinite(p)) setLiveAsset(p);
        }
      } else {
        const p = await fetchSpotQuote();
        if (p != null) setLiveAsset(p);
      }
    } finally {
      setAssetRefreshing(false);
    }
  }, [upper, profile.asset, fetchSpotQuote]);

  useEffect(() => {
    void loadBoth();
    const id = window.setInterval(() => void loadBoth(), 60_000);
    return () => window.clearInterval(id);
  }, [loadBoth]);

  return {
    liveStock,
    liveAsset,
    refreshStock,
    refreshAsset,
    stockRefreshing,
    assetRefreshing,
  };
}

// ---------------------------------------------------------------------------
// Model header — uniform metric cells
// ---------------------------------------------------------------------------

function ModeToggle({
  mode,
  onChange,
}: {
  mode: PriceSourceMode;
  onChange: (m: PriceSourceMode) => void;
}) {
  return (
    <div className="flex rounded-md border border-border bg-muted/40 p-0.5">
      <button
        type="button"
        onClick={() => onChange("live")}
        className={cn(
          "flex-1 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors",
          mode === "live"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Live
      </button>
      <button
        type="button"
        onClick={() => onChange("custom")}
        className={cn(
          "flex-1 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors",
          mode === "custom"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Custom
      </button>
    </div>
  );
}

function ModelPriceCell({
  label,
  mode,
  onModeChange,
  liveDisplay,
  customValue,
  onCustomChange,
  onRefresh,
  refreshing,
  footnote,
}: {
  label: string;
  mode: PriceSourceMode;
  onModeChange: (m: PriceSourceMode) => void;
  liveDisplay: number;
  customValue: number;
  onCustomChange: (n: number) => void;
  onRefresh: () => void;
  refreshing: boolean;
  footnote?: string;
}) {
  return (
    <div className="flex min-w-[10rem] flex-1 flex-col rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {mode === "live" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => void onRefresh()}
            disabled={refreshing}
            aria-label={`Refresh ${label}`}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </Button>
        ) : (
          <span className="inline-block h-7 w-7 shrink-0" aria-hidden />
        )}
      </div>
      <div className="mt-2">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
      {mode === "live" ? (
        <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
          {formatCurrency(liveDisplay)}
        </p>
      ) : (
        <input
          type="number"
          min={0}
          step={0.01}
          value={Number.isFinite(customValue) ? customValue : 0}
          onChange={(e) => onCustomChange(parseFloat(e.target.value) || 0)}
          className="mt-2 h-9 w-full rounded-md border border-border bg-background px-2 text-lg font-semibold tabular-nums text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      )}
      {footnote ? (
        <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground/80">{footnote}</p>
      ) : null}
    </div>
  );
}

function ModelHoldingsCell({
  mode,
  onModeChange,
  reportedDisplay,
  customValue,
  onCustomChange,
  assetSymbol,
}: {
  mode: PriceSourceMode;
  onModeChange: (m: PriceSourceMode) => void;
  reportedDisplay: number;
  customValue: number;
  onCustomChange: (n: number) => void;
  assetSymbol: string;
}) {
  return (
    <div className="flex min-w-[10rem] flex-1 flex-col rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {assetSymbol} Holdings
        </p>
        <span className="inline-block h-7 w-7 shrink-0" aria-hidden />
      </div>
      <div className="mt-2">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
      {mode === "live" ? (
        <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
          {reportedDisplay.toLocaleString()}
        </p>
      ) : (
        <input
          type="number"
          min={0}
          step={1}
          value={Number.isFinite(customValue) ? customValue : 0}
          onChange={(e) => onCustomChange(parseFloat(e.target.value) || 0)}
          className="mt-2 h-9 w-full rounded-md border border-border bg-background px-2 text-lg font-semibold tabular-nums text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      )}
      <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground/80">
        Live = reported snapshot; custom for what-if holdings.
      </p>
    </div>
  );
}

function ModelMarketCapCell({ marketCap }: { marketCap: number }) {
  return (
    <div className="flex min-w-[10rem] flex-1 flex-col rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Market Cap
        </p>
        <span className="inline-block h-7 w-7 shrink-0" aria-hidden />
      </div>
      <div className="mt-2">
        <div className="flex h-[30px] items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/30 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Derived
        </div>
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
        {formatCurrency(marketCap, "USD", true)}
      </p>
      <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground/80">
        Stock price × shares outstanding.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CryptoTreasuryValuation({ ticker }: { ticker: string }) {
  const profile = getCryptoTreasuryProfile(ticker);
  if (!profile) return null;

  return <CryptoTreasuryInner profile={profile} />;
}

function CryptoTreasuryInner({ profile }: { profile: CryptoTreasuryProfile }) {
  const defaultInputs = getDefaultInputs(profile.asset);
  const sliderParams = getSliderParams(profile.asset);

  const {
    liveStock,
    liveAsset,
    refreshStock,
    refreshAsset,
    stockRefreshing,
    assetRefreshing,
  } = useTreasuryLivePrices(profile.ticker, profile);

  const [stockMode, setStockMode] = useState<PriceSourceMode>("live");
  const [assetMode, setAssetMode] = useState<PriceSourceMode>("live");
  const [holdingsMode, setHoldingsMode] = useState<PriceSourceMode>("live");
  const [customStock, setCustomStock] = useState(profile.currentStockPrice);
  const [customAsset, setCustomAsset] = useState(profile.assetPrice);
  const [customHoldings, setCustomHoldings] = useState(profile.assetHoldings);

  useEffect(() => {
    setCustomStock(profile.currentStockPrice);
    setCustomAsset(profile.assetPrice);
    setCustomHoldings(profile.assetHoldings);
  }, [
    profile.ticker,
    profile.currentStockPrice,
    profile.assetPrice,
    profile.assetHoldings,
  ]);

  const stockLiveDisplay = liveStock ?? profile.currentStockPrice;
  const assetLiveDisplay = liveAsset ?? profile.assetPrice;

  const effectiveStock =
    stockMode === "live" ? stockLiveDisplay : Math.max(0, customStock);
  const effectiveAsset =
    assetMode === "live" ? assetLiveDisplay : Math.max(0, customAsset);
  const effectiveHoldings =
    holdingsMode === "live"
      ? profile.assetHoldings
      : Math.max(0, customHoldings);

  const effectiveProfile: CryptoTreasuryProfile = useMemo(() => {
    const shares = profile.sharesOutstanding;
    const marketCap = effectiveStock * shares;
    return {
      ...profile,
      currentStockPrice: effectiveStock,
      assetPrice: effectiveAsset,
      assetHoldings: effectiveHoldings,
      marketCap,
    };
  }, [profile, effectiveStock, effectiveAsset, effectiveHoldings]);

  // State: one value per slider key, initialized from default preset index
  const [inputs, setInputs] = useState<CryptoTreasuryInputs>(defaultInputs);

  const updateInput = (key: string, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const results: CryptoTreasuryResult = useMemo(
    () => runCryptoTreasuryValuation(effectiveProfile, inputs),
    [effectiveProfile, inputs]
  );

  const assetSymbol = profile.asset;
  const currentNAV = effectiveProfile.assetHoldings * effectiveProfile.assetPrice;
  const currentNAVPerShare =
    effectiveProfile.sharesOutstanding > 0
      ? currentNAV / effectiveProfile.sharesOutstanding
      : 0;
  const currentPremiumDiscount =
    currentNAVPerShare > 0
      ? effectiveProfile.currentStockPrice / currentNAVPerShare
      : 0;

  const setStockModeSeed = (m: PriceSourceMode) => {
    if (m === "custom") setCustomStock(stockLiveDisplay);
    setStockMode(m);
  };
  const setAssetModeSeed = (m: PriceSourceMode) => {
    if (m === "custom") setCustomAsset(assetLiveDisplay);
    setAssetMode(m);
  };
  const setHoldingsModeSeed = (m: PriceSourceMode) => {
    if (m === "custom") setCustomHoldings(profile.assetHoldings);
    setHoldingsMode(m);
  };

  return (
    <div className="space-y-6">
      {/* Company overview + model inputs */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
            <div className="shrink-0 lg:max-w-[14rem]">
              <p className="text-lg font-semibold text-foreground">
                {profile.companyName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {profile.ticker}
                </Badge>
                <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 text-[10px]">
                  {assetSymbol} Treasury
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Fair value, projections, and sensitivities use the inputs on the right.
              </p>
            </div>
            <Separator orientation="vertical" className="hidden h-auto lg:block" />
            <div className="flex flex-1 flex-wrap gap-3">
              <ModelPriceCell
                label="Stock Price"
                mode={stockMode}
                onModeChange={setStockModeSeed}
                liveDisplay={stockLiveDisplay}
                customValue={customStock}
                onCustomChange={setCustomStock}
                onRefresh={refreshStock}
                refreshing={stockRefreshing}
                footnote="Live pulls Yahoo via API; custom for scenarios."
              />
              <ModelPriceCell
                label={`${assetSymbol} Price`}
                mode={assetMode}
                onModeChange={setAssetModeSeed}
                liveDisplay={assetLiveDisplay}
                customValue={customAsset}
                onCustomChange={setCustomAsset}
                onRefresh={refreshAsset}
                refreshing={assetRefreshing}
                footnote={`Spot (${profile.asset === "ETH" ? "ETH-USD" : "BTC-USD"}).`}
              />
              <ModelHoldingsCell
                mode={holdingsMode}
                onModeChange={setHoldingsModeSeed}
                reportedDisplay={profile.assetHoldings}
                customValue={customHoldings}
                onCustomChange={setCustomHoldings}
                assetSymbol={assetSymbol}
              />
              <ModelMarketCapCell marketCap={effectiveProfile.marketCap} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treasury snapshot */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SnapshotCard
          label="Total NAV"
          value={formatCurrency(currentNAV, "USD", true)}
          icon={<Coins className="h-4 w-4" />}
        />
        <SnapshotCard
          label="NAV / Share"
          value={formatCurrency(currentNAVPerShare)}
          icon={<Layers className="h-4 w-4" />}
        />
        <SnapshotCard
          label="Current Premium"
          value={`${currentPremiumDiscount.toFixed(2)}x`}
          icon={<Target className="h-4 w-4" />}
          accent={currentPremiumDiscount >= 1 ? "emerald" : "red"}
        />
        <SnapshotCard
          label="Staking Ratio"
          value={`${(profile.stakingRatio * 100).toFixed(0)}%`}
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Slider parameters + results side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Sliders — 3 cols */}
        <div className="lg:col-span-3 space-y-5">
          {sliderParams.map((param) => (
            <SliderPresetRow
              key={param.key}
              param={param}
              value={inputs[param.key as keyof CryptoTreasuryInputs] as number}
              onChange={(v) => updateInput(param.key, v)}
              assetSymbol={assetSymbol}
              inputs={inputs}
              profile={effectiveProfile}
            />
          ))}
        </div>

        {/* Fair value result — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Big result card */}
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  NAV-Based Fair Value
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Discounted terminal NAV/share over {inputs.projectionYears} years
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
              <div className="text-center py-2">
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(results.fairValuePerShare)}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Badge className={verdictColors[results.verdict] ?? ""}>
                    {results.verdict}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Terminal projections */}
              <div className="rounded-md bg-muted/40 p-3 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Year {inputs.projectionYears} Terminal Values
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">{assetSymbol} Price</span>
                  <span className="tabular-nums text-right font-medium">
                    {formatCurrency(results.terminalAssetPrice)}
                  </span>
                  <span className="text-muted-foreground">NAV/Share</span>
                  <span className="tabular-nums text-right font-medium">
                    {formatCurrency(results.terminalNAVPerShare)}
                  </span>
                  <span className="text-muted-foreground">Implied Price</span>
                  <span className="tabular-nums text-right font-medium">
                    {formatCurrency(results.terminalNAVPerShare * inputs.navPremium)}
                  </span>
                </div>
              </div>

              {/* Price-to-fair-value bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current vs Fair Value</span>
                  <span className="tabular-nums">
                    {results.fairValuePerShare > 0
                      ? ((results.currentPrice / results.fairValuePerShare) * 100).toFixed(0)
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
                      width: `${Math.min(100, Math.max(5, results.fairValuePerShare > 0 ? (results.currentPrice / results.fairValuePerShare) * 100 : 100))}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Year-by-year projection table */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Table2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Year-by-Year Projection
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {assetSymbol} holdings, NAV, and implied share price over {inputs.projectionYears} years
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["Year", `${assetSymbol} Price`, `${assetSymbol} Holdings`, "Staking +", "Ops Cost -", "Dilution +", "Total Shares", "NAV", "NAV/Share", "Stock Price"].map((h) => (
                    <th
                      key={h}
                      className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground first:text-left"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {/* Year 0 = current */}
                <tr className="text-muted-foreground">
                  <td className="py-2 text-xs font-medium">Now</td>
                  <td className="py-2 text-right tabular-nums">{formatCurrency(effectiveProfile.assetPrice)}</td>
                  <td className="py-2 text-right tabular-nums">{effectiveProfile.assetHoldings.toLocaleString()}</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right tabular-nums">{fmtShares(profile.sharesOutstanding)}</td>
                  <td className="py-2 text-right tabular-nums">{formatCurrency(currentNAV, "USD", true)}</td>
                  <td className="py-2 text-right tabular-nums">{formatCurrency(currentNAVPerShare)}</td>
                  <td className="py-2 text-right tabular-nums">{formatCurrency(effectiveProfile.currentStockPrice)}</td>
                </tr>
                {results.projections.map((row) => (
                  <tr key={row.year} className="transition-colors hover:bg-muted/50">
                    <td className="py-2 text-xs font-medium text-muted-foreground">Y{row.year}</td>
                    <td className="py-2 text-right tabular-nums">{formatCurrency(row.assetPrice)}</td>
                    <td className="py-2 text-right tabular-nums">{Math.round(row.assetHoldings).toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">+{row.stakingIncome.toFixed(1)}</td>
                    <td className="py-2 text-right tabular-nums text-red-600 dark:text-red-400">-{row.operatingCostAssets.toFixed(1)}</td>
                    <td className="py-2 text-right tabular-nums text-blue-600 dark:text-blue-400">+{Math.round(row.assetsFromDilution).toLocaleString()}</td>
                    <td className="py-2 text-right tabular-nums">{fmtShares(row.totalShares)}</td>
                    <td className="py-2 text-right tabular-nums">{formatCurrency(row.nav, "USD", true)}</td>
                    <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(row.navPerShare)}</td>
                    <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(row.impliedStockPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity: Asset Growth × Discount Rate */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Sensitivity: {assetSymbol} Growth vs Discount Rate
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Fair value per share at different {assetSymbol} growth and discount rate assumptions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <SensitivityTable
            rowLabel={`${assetSymbol} Growth ↓ / WACC →`}
            rowValues={results.sensitivityMatrix.assetGrowthRates}
            colValues={results.sensitivityMatrix.discountRates}
            matrix={results.sensitivityMatrix.values}
            baseRow={inputs.assetGrowthRate}
            baseCol={inputs.discountRate}
            currentPrice={results.currentPrice}
            formatRow={(v) => `${(v * 100).toFixed(0)}%`}
            formatCol={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </CardContent>
      </Card>

      {/* Sensitivity: NAV Premium × Asset Growth */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Sensitivity: NAV Premium vs {assetSymbol} Growth
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Fair value per share at different premium and growth assumptions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <SensitivityTable
            rowLabel={`Premium ↓ / ${assetSymbol} Growth →`}
            rowValues={results.premiumSensitivity.navPremiums}
            colValues={results.premiumSensitivity.assetGrowthRates}
            matrix={results.premiumSensitivity.values}
            baseRow={inputs.navPremium}
            baseCol={inputs.assetGrowthRate}
            currentPrice={results.currentPrice}
            formatRow={(v) => `${v.toFixed(2)}x`}
            formatCol={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        This crypto treasury valuation projects NAV based on asset price appreciation,
        staking yield, operating costs, and share dilution assumptions. It does not
        constitute financial advice. Cryptocurrency prices are highly volatile and
        past performance does not guarantee future results. Company-specific risks
        include regulatory changes, custody risk, smart contract risk, and management
        execution. Always conduct thorough due diligence.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider Preset Row
// ---------------------------------------------------------------------------

function SliderPresetRow({
  param,
  value,
  onChange,
  assetSymbol,
  inputs,
  profile,
}: {
  param: SliderParam;
  value: number;
  onChange: (v: number) => void;
  assetSymbol: string;
  inputs: CryptoTreasuryInputs;
  profile: CryptoTreasuryProfile;
}) {
  // Compute contextual hint
  const hint = getParamHint(param.key, value, inputs, profile, assetSymbol);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Label + description */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{param.label}</p>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {formatSliderValue(value, param.suffix)}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              {param.description}
            </p>
          </div>

          {/* Preset buttons */}
          <div className="flex items-center gap-1.5">
            {param.presets.map((preset, idx) => {
              const isActive = Math.abs(preset.value - value) < 0.0001;
              return (
                <button
                  key={idx}
                  onClick={() => onChange(preset.value)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium tabular-nums transition-all",
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Bearish → Bullish labels */}
          <div className="flex justify-between text-[10px] text-muted-foreground/60">
            <span>Bearish</span>
            <span>Bullish</span>
          </div>

          {/* Contextual hint */}
          {hint && (
            <div className="flex items-start gap-1.5 rounded-md bg-muted/40 px-3 py-2">
              <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{hint}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sensitivity Table (reusable)
// ---------------------------------------------------------------------------

function SensitivityTable({
  rowLabel,
  rowValues,
  colValues,
  matrix,
  baseRow,
  baseCol,
  currentPrice,
  formatRow,
  formatCol,
}: {
  rowLabel: string;
  rowValues: number[];
  colValues: number[];
  matrix: number[][];
  baseRow: number;
  baseCol: number;
  currentPrice: number;
  formatRow: (v: number) => string;
  formatCol: (v: number) => string;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="pb-2 pr-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {rowLabel}
              </th>
              {colValues.map((c) => (
                <th
                  key={c}
                  className={cn(
                    "pb-2 text-right text-xs font-medium uppercase tracking-wider",
                    Math.abs(c - baseCol) < 0.001 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {formatCol(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rowValues.map((r, rowIdx) => (
              <tr key={r} className="transition-colors hover:bg-muted/50">
                <td
                  className={cn(
                    "py-2.5 pr-3 text-xs font-medium",
                    Math.abs(r - baseRow) < 0.001 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {formatRow(r)}
                </td>
                {matrix[rowIdx]?.map((val, colIdx) => {
                  const isBase =
                    Math.abs(r - baseRow) < 0.001 &&
                    Math.abs(colValues[colIdx] - baseCol) < 0.001;
                  const upside =
                    currentPrice > 0
                      ? ((val - currentPrice) / currentPrice) * 100
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
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>
          Green cells indicate {">"}10% upside from current price ({formatCurrency(currentPrice)}).
          Red cells indicate {">"}10% downside. Bold cell is your base case.
        </span>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Snapshot Card
// ---------------------------------------------------------------------------

function SnapshotCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "emerald" | "red";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p
          className={cn(
            "mt-1.5 text-lg font-semibold tabular-nums",
            accent === "emerald"
              ? "text-emerald-600 dark:text-emerald-400"
              : accent === "red"
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSliderValue(value: number, suffix: string): string {
  if (suffix === "x") return `${value.toFixed(2)}x`;
  if (suffix === "%") return `${(value * 100).toFixed(1)}%`;
  return `${value}`;
}

function fmtShares(n: number): string {
  if (n >= 1e3) return formatLargeNumber(n, { decimals: n >= 1e9 ? 2 : 1 });
  return n.toFixed(0);
}

function getParamHint(
  key: string,
  value: number,
  inputs: CryptoTreasuryInputs,
  profile: CryptoTreasuryProfile,
  asset: string
): string | null {
  switch (key) {
    case "assetGrowthRate": {
      const terminalPrice = profile.assetPrice * Math.pow(1 + value, inputs.projectionYears);
      const sign = value >= 0 ? "+" : "";
      return `Terminal ${asset}: ${formatCurrency(terminalPrice)} (${sign}${(value * 100).toFixed(0)}%/yr x ${inputs.projectionYears}yr from ${formatCurrency(profile.assetPrice)})`;
    }
    case "stakingYield": {
      const annualETH = profile.assetHoldings * profile.stakingRatio * value;
      return `Earning ~${annualETH.toFixed(1)} ${asset}/year from ${(profile.stakingRatio * 100).toFixed(0)}% staked at ${(value * 100).toFixed(1)}% APY`;
    }
    case "navPremium": {
      const currentNAVps = profile.sharesOutstanding > 0
        ? (profile.assetHoldings * profile.assetPrice) / profile.sharesOutstanding
        : 0;
      const impliedPrice = currentNAVps * value;
      return `At current NAV/share of ${formatCurrency(currentNAVps)}, implies stock price of ${formatCurrency(impliedPrice)}`;
    }
    case "operatingCostRate": {
      const annualCostUSD = profile.assetHoldings * profile.assetPrice * value;
      return `~${formatCurrency(annualCostUSD, "USD", true)}/year in operating expenses at current ${asset} price`;
    }
    case "dilutionRate": {
      const newShares = profile.sharesOutstanding * value;
      return `~${fmtShares(newShares)} new shares/year. After ${inputs.projectionYears}yr: ${fmtShares(profile.sharesOutstanding * Math.pow(1 + value, inputs.projectionYears))} total (from ${fmtShares(profile.sharesOutstanding)})`;
    }
    case "discountRate":
      return `Higher discount rate = more conservative fair value. At ${(value * 100).toFixed(0)}%, a dollar in ${inputs.projectionYears} years is worth ${formatCurrency(1 / Math.pow(1 + value, inputs.projectionYears))} today`;
    default:
      return null;
  }
}
