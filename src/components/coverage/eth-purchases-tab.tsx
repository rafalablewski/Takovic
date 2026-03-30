"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import {
  ETH_PURCHASES,
  ETH_PURCHASE_SUMMARY,
  ETH_PURCHASE_HISTORY_TITLE,
  ETH_PURCHASE_HISTORY_DESCRIPTION,
  ETH_ACCUMULATION_SUMMARY_HEADING,
  ETH_PURCHASE_OVERVIEW_HEADING,
  ETH_PURCHASE_OVERVIEW_SOURCE_LINE,
  ETH_PURCHASE_LOG_HEADING,
  ETH_PURCHASE_LOG_SUBHEADING,
  ETH_PURCHASE_TABLE_HEADERS,
  ETH_MNAV_METHODOLOGY,
} from "@/data/coverage/bmnr";
import { ShoppingCart, ChevronDown, ChevronUp, Coins, BookOpen } from "lucide-react";

export function ETHPurchasesTab({ ticker }: { ticker: string }) {
  const [showAll, setShowAll] = useState(false);

  if (!isEthTreasury(ticker)) return <p className="text-sm text-muted-foreground">No ETH purchase data.</p>;

  const summary = ETH_PURCHASE_SUMMARY;
  const purchases = ETH_PURCHASES;
  const visible = showAll ? purchases : purchases.slice(0, 12);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold tracking-tight">{ETH_PURCHASE_HISTORY_TITLE}</CardTitle>
          </div>
          <CardDescription className="whitespace-pre-line text-sm leading-relaxed">
            {ETH_PURCHASE_HISTORY_DESCRIPTION}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">{ETH_ACCUMULATION_SUMMARY_HEADING}</h3>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{ETH_PURCHASE_OVERVIEW_HEADING}</p>
          <p className="text-xs text-muted-foreground">{ETH_PURCHASE_OVERVIEW_SOURCE_LINE}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewStat label="LAST REPORTED ETH" value={summary.lastReportedEthDisplay} />
          <OverviewStat label="TOTAL DEPLOYED" value={summary.totalCapitalDeployedDisplay} />
          <OverviewStat label="AVG ETH PRICE" value={summary.averagePriceDisplay} />
          <OverviewStat label="CURRENT MNAV" value={summary.currentMnavDisplay} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewStat label="Current ETH Price" value={summary.currentEthPriceDisplay} />
          <OverviewStat
            label="Unrealized P/L"
            value={summary.unrealizedPLDisplay}
            valueClassName="text-red-600 dark:text-red-400"
          />
          <OverviewStat label="Unrealized P/L %" value={summary.unrealizedPLPercentDisplay} />
          <OverviewStat label="NAV/Share" value={summary.navPerShareDisplay} />
          <OverviewStat label="Stock Price" value={summary.stockPriceDisplay} />
          <OverviewStat label="Purchase Events" value={String(summary.totalPurchases)} />
        </div>
      </div>

      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {ETH_PURCHASE_LOG_HEADING}
            </CardTitle>
          </div>
          <CardDescription className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {ETH_PURCHASE_LOG_SUBHEADING}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr>
                  {ETH_PURCHASE_TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="border-b border-border pb-2 pr-3 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {visible.map((p) => (
                  <tr key={p.date} className="align-top transition-colors hover:bg-muted/40">
                    <td className="py-2 pr-3 text-xs tabular-nums text-muted-foreground whitespace-nowrap">{p.date}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums font-medium">{p.ethAcquired.toLocaleString()}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums">{formatUsd(p.ethPriceUsd)}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums">{formatCurrency(p.usdDeployed, "USD", true)}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums">{formatUsd(p.stockPrevCloseUsd)}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{p.periodRange}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums">{formatCurrency(p.marketCapUsd, "USD", true)}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums">
                      <span className={mnavClass(p.mnav)}>{p.mnav.toFixed(2)}x</span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{p.mnavRange}</td>
                    <td className="py-2 pr-3 text-xs tabular-nums font-medium">{p.totalEthAfterDisplay}</td>
                    <td className="py-2 text-xs leading-relaxed text-muted-foreground max-w-[280px]">{p.notes}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-muted/30 font-medium">
                  <td className="py-2 pr-3 text-xs">Total</td>
                  <td className="py-2 pr-3 text-xs tabular-nums">{summary.totalEthAcquiredFromLog.toLocaleString()}</td>
                  <td className="py-2 pr-3 text-xs tabular-nums">avg {summary.averagePriceDisplay}</td>
                  <td className="py-2 pr-3 text-xs tabular-nums">{summary.totalCapitalDeployedDisplay}</td>
                  <td className="py-2 pr-3 text-xs" colSpan={7} />
                </tr>
              </tbody>
            </table>
          </div>

          {purchases.length > 12 && (
            <div className="flex justify-center pt-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide">{ETH_MNAV_METHODOLOGY.title}</CardTitle>
              <CardDescription className="text-xs">{ETH_MNAV_METHODOLOGY.subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 text-xs leading-relaxed text-muted-foreground">
            <p>{ETH_MNAV_METHODOLOGY.intro}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {ETH_MNAV_METHODOLOGY.steps.map((s) => (
                <div key={s.label} className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground">{s.label}</p>
                  <p className="font-medium text-foreground">{s.title}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground">{s.formulaLabel}</p>
                  <p className="font-mono text-[11px] text-foreground/90">{s.formula}</p>
                  <p className="text-[11px]">{s.example}</p>
                  <p className="font-mono text-[11px]">{s.exampleCalc}</p>
                  <p className="text-sm font-semibold tabular-nums text-foreground">{s.result}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                {ETH_MNAV_METHODOLOGY.interpretationHeading}
              </p>
              <ul className="list-inside list-disc space-y-1">
                {ETH_MNAV_METHODOLOGY.interpretation.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                {ETH_MNAV_METHODOLOGY.dataSourcesHeading}
              </p>
              <div className="whitespace-pre-wrap rounded-md border border-border bg-background p-4 font-mono text-[11px]">
                {ETH_MNAV_METHODOLOGY.dataSources}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                {ETH_MNAV_METHODOLOGY.accuracyByPeriodHeading}
              </p>
              <div className="whitespace-pre-wrap rounded-md border border-border bg-background p-4 font-mono text-[11px]">
                {ETH_MNAV_METHODOLOGY.accuracyByPeriod}
              </div>
            </div>
          </CardContent>
      </Card>
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

function OverviewStat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] font-medium tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-lg font-semibold tabular-nums tracking-tight text-foreground", valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  );
}
