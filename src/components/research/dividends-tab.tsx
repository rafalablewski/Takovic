"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FMPDividendRecord } from "@/lib/api/yahoo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DividendsTabProps = {
  ticker: string;
  currentPrice: number;
  dividendHistory: FMPDividendRecord[];
  latestEps: number | null;
  dividendYield: number | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sum of the most recent 4 quarterly (or 1 annual) dividends. */
function computeAnnualDividend(history: FMPDividendRecord[]): number {
  if (history.length === 0) return 0;
  // Take last 4 entries as a proxy for the trailing twelve months
  const recent = history.slice(0, Math.min(4, history.length));
  return recent.reduce((sum, d) => sum + d.adjDividend, 0);
}

/** Group dividends by calendar year and sum them. */
function annualTotals(
  history: FMPDividendRecord[]
): { year: number; total: number }[] {
  const map = new Map<number, number>();
  for (const d of history) {
    const year = new Date(d.date).getFullYear();
    map.set(year, (map.get(year) ?? 0) + d.adjDividend);
  }
  return Array.from(map.entries())
    .map(([year, total]) => ({ year, total }))
    .sort((a, b) => b.year - a.year);
}

/** CAGR between two values over n years. */
function cagr(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/** Count of consecutive years where dividend increased year-over-year, starting from the most recent. */
function consecutiveGrowthYears(
  totals: { year: number; total: number }[]
): number {
  // totals is sorted newest-first
  let count = 0;
  for (let i = 0; i < totals.length - 1; i++) {
    if (totals[i].total > totals[i + 1].total) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/** Payout ratio color class. */
function payoutRatioColor(ratio: number): string {
  if (ratio < 60) return "text-emerald-600 dark:text-emerald-400";
  if (ratio < 80) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DividendsTab({
  ticker,
  currentPrice,
  dividendHistory,
  latestEps,
  dividendYield,
}: DividendsTabProps) {
  const annualDiv = computeAnnualDividend(dividendHistory);
  const payoutRatio =
    latestEps && latestEps > 0 ? (annualDiv / latestEps) * 100 : null;

  const totals = annualTotals(dividendHistory);

  // 5-year CAGR: compare the oldest available (up to 5 years back) with the most recent full year
  const recentFiveYears = totals.slice(0, 6); // need 6 entries to get 5 years of growth
  const fiveYearGrowth =
    recentFiveYears.length >= 2
      ? cagr(
          recentFiveYears[recentFiveYears.length - 1].total,
          recentFiveYears[0].total,
          recentFiveYears.length - 1
        )
      : null;

  const growthStreak = consecutiveGrowthYears(totals);

  const historySlice = dividendHistory.slice(0, 20);
  const annualSlice = totals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current Yield */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Yield
            </p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
              {dividendYield !== null && dividendYield !== undefined
                ? `${(dividendYield * 100).toFixed(2)}%`
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        {/* Annual Dividend */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Annual Dividend
            </p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
              {annualDiv > 0 ? formatCurrency(annualDiv) : "N/A"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              TTM (last {Math.min(4, dividendHistory.length)} payments)
            </p>
          </CardContent>
        </Card>

        {/* Payout Ratio */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Payout Ratio
            </p>
            <p
              className={`mt-2 text-lg font-semibold tabular-nums ${
                payoutRatio !== null
                  ? payoutRatioColor(payoutRatio)
                  : "text-foreground"
              }`}
            >
              {payoutRatio !== null ? `${payoutRatio.toFixed(1)}%` : "N/A"}
            </p>
            {payoutRatio !== null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {payoutRatio < 60
                  ? "Healthy"
                  : payoutRatio < 80
                    ? "Elevated"
                    : "High"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 5-Year Growth */}
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              5-Year Growth (CAGR)
            </p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
              {fiveYearGrowth !== null
                ? `${fiveYearGrowth >= 0 ? "+" : ""}${fiveYearGrowth.toFixed(1)}%`
                : "N/A"}
            </p>
            {growthStreak > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {growthStreak} consecutive year{growthStreak !== 1 ? "s" : ""} of
                growth
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dividend History Table */}
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 text-sm font-medium text-foreground">
            Dividend History
          </h3>
          {historySlice.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 text-left font-medium uppercase tracking-wider text-muted-foreground">
                      Ex-Dividend Date
                    </th>
                    <th className="pb-2 px-4 text-left font-medium uppercase tracking-wider text-muted-foreground">
                      Payment Date
                    </th>
                    <th className="pb-2 px-4 text-right font-medium uppercase tracking-wider text-muted-foreground">
                      Amount / Share
                    </th>
                    <th className="pb-2 pl-4 text-right font-medium uppercase tracking-wider text-muted-foreground">
                      Yield on Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {historySlice.map((d, i) => {
                    // Annualized yield on cost: (quarterly dividend * 4) / current price * 100
                    const yieldOnCost =
                      currentPrice > 0
                        ? (d.adjDividend / currentPrice) * 100 * 4
                        : 0;

                    return (
                      <tr
                        key={`${d.date}-${i}`}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="py-2.5 pr-4 tabular-nums text-foreground">
                          {d.date}
                        </td>
                        <td className="py-2.5 px-4 tabular-nums text-muted-foreground">
                          {d.paymentDate || "—"}
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums font-medium text-foreground">
                          {formatCurrency(d.adjDividend)}
                        </td>
                        <td className="py-2.5 pl-4 text-right tabular-nums text-muted-foreground">
                          {yieldOnCost > 0 ? `${yieldOnCost.toFixed(2)}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No dividend history available for {ticker}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Growth Trend */}
      {annualSlice.length >= 2 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Annual Dividend Growth
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 text-left font-medium uppercase tracking-wider text-muted-foreground">
                      Year
                    </th>
                    <th className="pb-2 px-4 text-right font-medium uppercase tracking-wider text-muted-foreground">
                      Total Dividend
                    </th>
                    <th className="pb-2 pl-4 text-right font-medium uppercase tracking-wider text-muted-foreground">
                      YoY Growth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {annualSlice.map((row, i) => {
                    const prev = annualSlice[i + 1];
                    const yoy =
                      prev && prev.total > 0
                        ? ((row.total - prev.total) / prev.total) * 100
                        : null;

                    return (
                      <tr
                        key={row.year}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="py-2.5 pr-4 tabular-nums font-medium text-foreground">
                          {row.year}
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-foreground">
                          {formatCurrency(row.total)}
                        </td>
                        <td
                          className={`py-2.5 pl-4 text-right tabular-nums font-medium ${
                            yoy !== null
                              ? yoy >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {yoy !== null
                            ? `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {growthStreak > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {ticker} has increased its dividend for{" "}
                <span className="font-medium text-foreground">
                  {growthStreak} consecutive year{growthStreak !== 1 ? "s" : ""}
                </span>
                .
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
