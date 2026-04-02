"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { importCoverageTickerModule } from "@/lib/coverage/import-coverage-module";
import { CoverageSectionCollapsible } from "@/components/coverage/coverage-section-collapsible";
import type { ETHPurchase } from "@/data/coverage/bmnr-eth-purchases";
import { ShoppingCart, BarChart3, Table2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

/** Rows shown before “Show all” in the purchase log table. */
const INITIAL_PURCHASE_ROWS = 12;

/** Shape matches coverage modules that export ETH purchase blocks (e.g. bmnr). */
type EthPurchaseSummaryShape = {
  totalPurchases: number;
  lastReportedEthDisplay: string;
  totalCapitalDeployedDisplay: string;
  averagePriceDisplay: string;
  currentMnavDisplay: string;
  currentEthPriceDisplay: string;
  unrealizedPLDisplay: string;
  unrealizedPLPercentDisplay: string;
  navPerShareDisplay: string;
  stockPriceDisplay: string;
  totalEthAcquiredFromLog: number;
};

type EthMnavMethodologyShape = {
  intro: string;
  steps: Array<{
    label: string;
    title: string;
    formulaLabel: string;
    formula: string;
    example: string;
    exampleCalc: string;
    result: string;
  }>;
  interpretationHeading: string;
  interpretation: string[];
  dataSourcesHeading: string;
  dataSources: string;
  accuracyByPeriodHeading: string;
  accuracyByPeriod: string;
};

type EthPurchasesState =
  | { status: "loading" }
  | {
      status: "ready";
      purchases: ETHPurchase[];
      summary: EthPurchaseSummaryShape;
      historyDescription: string;
      overviewHeading: string;
      overviewSourceLine: string;
      logSubheading: string;
      tableHeaders: readonly string[];
      mnavMethodology: EthMnavMethodologyShape;
    }
  | { status: "empty" };

function isEthPurchaseArray(x: unknown): x is ETHPurchase[] {
  return (
    Array.isArray(x) &&
    x.length > 0 &&
    x.every(
      (p) =>
        p &&
        typeof p === "object" &&
        typeof (p as ETHPurchase).date === "string" &&
        typeof (p as ETHPurchase).ethAcquired === "number"
    )
  );
}

export function ETHPurchasesTab({ ticker }: { ticker: string }) {
  const [loadState, setLoadState] = useState<EthPurchasesState>({ status: "loading" });
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const lower = ticker.toLowerCase();
    setLoadState({ status: "loading" });
    importCoverageTickerModule(lower)
      .then((mod) => {
        if (cancelled) return;
        const purchases = mod.ETH_PURCHASES;
        if (!isEthPurchaseArray(purchases)) {
          setLoadState({ status: "empty" });
          return;
        }
        const summary = mod.ETH_PURCHASE_SUMMARY;
        if (!summary || typeof summary !== "object") {
          setLoadState({ status: "empty" });
          return;
        }
        const mnav = mod.ETH_MNAV_METHODOLOGY;
        if (!mnav || typeof mnav !== "object") {
          setLoadState({ status: "empty" });
          return;
        }
        setLoadState({
          status: "ready",
          purchases,
          summary: summary as EthPurchaseSummaryShape,
          historyDescription:
            typeof mod.ETH_PURCHASE_HISTORY_DESCRIPTION === "string"
              ? mod.ETH_PURCHASE_HISTORY_DESCRIPTION
              : "",
          overviewHeading:
            typeof mod.ETH_PURCHASE_OVERVIEW_HEADING === "string"
              ? mod.ETH_PURCHASE_OVERVIEW_HEADING
              : "",
          overviewSourceLine:
            typeof mod.ETH_PURCHASE_OVERVIEW_SOURCE_LINE === "string"
              ? mod.ETH_PURCHASE_OVERVIEW_SOURCE_LINE
              : "",
          logSubheading:
            typeof mod.ETH_PURCHASE_LOG_SUBHEADING === "string"
              ? mod.ETH_PURCHASE_LOG_SUBHEADING
              : "",
          tableHeaders: Array.isArray(mod.ETH_PURCHASE_TABLE_HEADERS)
            ? (mod.ETH_PURCHASE_TABLE_HEADERS as string[])
            : [],
          mnavMethodology: mnav as EthMnavMethodologyShape,
        });
      })
      .catch(() => {
        if (!cancelled) setLoadState({ status: "empty" });
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (loadState.status === "loading") {
    return <p className="text-sm text-muted-foreground">Loading ETH purchases…</p>;
  }
  if (loadState.status === "empty") {
    return <p className="text-sm text-muted-foreground">No ETH purchase data.</p>;
  }

  const {
    purchases,
    summary,
    historyDescription,
    overviewHeading,
    overviewSourceLine,
    logSubheading,
    tableHeaders,
    mnavMethodology: ETH_MNAV_METHODOLOGY,
  } = loadState;

  const visible = showAll ? purchases : purchases.slice(0, INITIAL_PURCHASE_ROWS);

  return (
    <div className="space-y-4">
      <CoverageSectionCollapsible
        title="Purchase history"
        icon={<ShoppingCart className="h-4 w-4 shrink-0 text-muted-foreground" />}
        defaultOpen
      >
        <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
          {historyDescription}
        </p>
      </CoverageSectionCollapsible>

      <CoverageSectionCollapsible
        title="Accumulation summary"
        icon={<BarChart3 className="h-4 w-4 shrink-0 text-muted-foreground" />}
        defaultOpen
      >
        <div className="space-y-4">
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {overviewHeading}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{overviewSourceLine}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <MetricCell label="LAST REPORTED ETH" value={summary.lastReportedEthDisplay} />
            <MetricCell label="TOTAL DEPLOYED" value={summary.totalCapitalDeployedDisplay} />
            <MetricCell label="AVG ETH PRICE" value={summary.averagePriceDisplay} />
            <MetricCell label="CURRENT MNAV" value={summary.currentMnavDisplay} />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MetricCell label="Current ETH Price" value={summary.currentEthPriceDisplay} />
            <MetricCell
              label="Unrealized P/L"
              value={summary.unrealizedPLDisplay}
              valueClassName="text-red-600 dark:text-red-400"
            />
            <MetricCell label="Unrealized P/L %" value={summary.unrealizedPLPercentDisplay} />
            <MetricCell label="NAV/Share" value={summary.navPerShareDisplay} />
            <MetricCell label="Stock Price" value={summary.stockPriceDisplay} />
            <MetricCell label="Purchase Events" value={String(summary.totalPurchases)} />
          </div>
        </div>
      </CoverageSectionCollapsible>

      <CoverageSectionCollapsible
        title="Purchase log"
        icon={<Table2 className="h-4 w-4 shrink-0 text-muted-foreground" />}
        badge={<Badge variant="secondary" className="text-[10px] tabular-nums">{summary.totalPurchases} events</Badge>}
        defaultOpen
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{logSubheading}</p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr>
                  {tableHeaders.map((h) => (
                    <th
                      key={h}
                      className="pb-2 pr-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {visible.map((p) => (
                  <tr key={p.date} className="hover:bg-muted/50">
                    <td className="py-2 pr-3 text-xs tabular-nums text-muted-foreground whitespace-nowrap">{p.date}</td>
                    <td className="py-2 pr-3 text-xs font-medium tabular-nums text-foreground">
                      {p.ethAcquired.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-xs tabular-nums text-foreground">{formatUsd(p.ethPriceUsd)}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums text-muted-foreground">
                      {formatCurrency(p.usdDeployed, "USD", true)}
                    </td>
                    <td className="py-2 pr-3 text-xs tabular-nums text-foreground">{formatUsd(p.stockPrevCloseUsd)}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{p.periodRange}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums text-muted-foreground">
                      {formatCurrency(p.marketCapUsd, "USD", true)}
                    </td>
                    <td className="py-2 pr-3 text-xs tabular-nums">
                      <span className={mnavClass(p.mnav)}>{p.mnav.toFixed(2)}x</span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{p.mnavRange}</td>
                    <td className="py-2 pr-3 text-xs font-medium tabular-nums text-foreground">{p.totalEthAfterDisplay}</td>
                    <td className="py-2 text-xs text-muted-foreground leading-relaxed max-w-[min(280px,40vw)]">
                      {p.notes}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-muted/30">
                  <td className="py-2 pr-3 text-xs font-medium text-foreground">Total</td>
                  <td className="py-2 pr-3 text-xs font-medium tabular-nums text-foreground">
                    {summary.totalEthAcquiredFromLog.toLocaleString()}
                  </td>
                  <td className="py-2 pr-3 text-xs tabular-nums text-foreground">avg {summary.averagePriceDisplay}</td>
                  <td className="py-2 pr-3 text-xs tabular-nums text-foreground">{summary.totalCapitalDeployedDisplay}</td>
                  <td className="py-2 pr-3" colSpan={7} />
                </tr>
              </tbody>
            </table>
          </div>

          {purchases.length > INITIAL_PURCHASE_ROWS && (
            <div className="flex justify-center pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show all ${purchases.length} purchases`}
                {showAll ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          )}
        </div>
      </CoverageSectionCollapsible>

      <CoverageSectionCollapsible
        title="mNAV methodology"
        icon={<BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />}
        defaultOpen
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{ETH_MNAV_METHODOLOGY.intro}</p>

          <div className="grid gap-4 md:grid-cols-2">
            {ETH_MNAV_METHODOLOGY.steps.map((s) => (
              <div key={s.label} className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{s.formulaLabel}</p>
                <div className="rounded-md bg-muted/30 px-3 py-2">
                  <code className="text-[10px] font-mono text-muted-foreground leading-relaxed">{s.formula}</code>
                </div>
                <p className="text-xs text-muted-foreground">{s.example}</p>
                <div className="rounded-md bg-muted/30 px-3 py-2">
                  <code className="text-[10px] font-mono text-muted-foreground leading-relaxed">{s.exampleCalc}</code>
                </div>
                <p className="text-sm font-semibold tabular-nums text-foreground">{s.result}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              {ETH_MNAV_METHODOLOGY.interpretationHeading}
            </p>
            <ul className="space-y-1.5">
              {ETH_MNAV_METHODOLOGY.interpretation.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              {ETH_MNAV_METHODOLOGY.dataSourcesHeading}
            </p>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {ETH_MNAV_METHODOLOGY.dataSources}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              {ETH_MNAV_METHODOLOGY.accuracyByPeriodHeading}
            </p>
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {ETH_MNAV_METHODOLOGY.accuracyByPeriod}
            </div>
          </div>
        </div>
      </CoverageSectionCollapsible>
    </div>
  );
}

function MetricCell({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-semibold tabular-nums text-foreground", valueClassName)}>{value}</p>
    </div>
  );
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function mnavClass(mnav: number) {
  if (mnav < 1) return "text-emerald-600 dark:text-emerald-400";
  if (mnav <= 1.35) return "text-foreground";
  if (mnav <= 2) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}
