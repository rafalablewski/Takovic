"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { CoverageSectionCollapsible } from "@/components/coverage/coverage-section-collapsible";
import {
  ETH_PURCHASES,
  ETH_PURCHASE_SUMMARY,
  ETH_PURCHASE_HISTORY_DESCRIPTION,
  ETH_PURCHASE_OVERVIEW_HEADING,
  ETH_PURCHASE_OVERVIEW_SOURCE_LINE,
  ETH_PURCHASE_LOG_SUBHEADING,
  ETH_PURCHASE_TABLE_HEADERS,
  ETH_MNAV_METHODOLOGY,
} from "@/data/coverage/bmnr";
import { ShoppingCart, BarChart3, Table2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export function ETHPurchasesTab({ ticker }: { ticker: string }) {
  const [showAll, setShowAll] = useState(false);

  if (!isEthTreasury(ticker)) return <p className="text-sm text-muted-foreground">No ETH purchase data.</p>;

  const summary = ETH_PURCHASE_SUMMARY;
  const purchases = ETH_PURCHASES;
  const visible = showAll ? purchases : purchases.slice(0, 12);

  return (
    <div className="space-y-4">
      <CoverageSectionCollapsible
        title="Purchase history"
        icon={<ShoppingCart className="h-4 w-4 shrink-0 text-muted-foreground" />}
        defaultOpen
      >
        <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
          {ETH_PURCHASE_HISTORY_DESCRIPTION}
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
              {ETH_PURCHASE_OVERVIEW_HEADING}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ETH_PURCHASE_OVERVIEW_SOURCE_LINE}</p>
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
          <p className="text-xs text-muted-foreground">{ETH_PURCHASE_LOG_SUBHEADING}</p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr>
                  {ETH_PURCHASE_TABLE_HEADERS.map((h) => (
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

          {purchases.length > 12 && (
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

/** Same rhythm as Ethereum tab → BMNR ↔ ETH Correlation metric cells */
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
