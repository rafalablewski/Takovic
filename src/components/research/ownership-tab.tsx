"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatCurrency, cn } from "@/lib/utils";
import type {
  FMPInstitutionalHolder,
  FMPInsiderTrade,
} from "@/lib/api/fmp";

export type OwnershipTabProps = {
  ticker: string;
  institutionalHolders: FMPInstitutionalHolder[];
  insiderTrades: FMPInsiderTrade[];
};

export function OwnershipTab({
  ticker,
  institutionalHolders,
  insiderTrades,
}: OwnershipTabProps) {
  const top15Holders = institutionalHolders.slice(0, 15);
  const recent20Trades = insiderTrades.slice(0, 20);

  const totalInstitutionalShares = institutionalHolders.reduce(
    (sum, h) => sum + (h.shares ?? 0),
    0
  );
  const holderCount = institutionalHolders.length;

  // Net insider activity last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentInsider = insiderTrades.filter(
    (t) => new Date(t.transactionDate) >= sixMonthsAgo
  );
  const purchases = recentInsider.filter(
    (t) =>
      t.transactionType.toLowerCase().includes("purchase") ||
      t.transactionType.toLowerCase().includes("buy") ||
      t.transactionType === "P-Purchase"
  ).length;
  const sales = recentInsider.filter(
    (t) =>
      t.transactionType.toLowerCase().includes("sale") ||
      t.transactionType.toLowerCase().includes("sell") ||
      t.transactionType === "S-Sale"
  ).length;
  const netInsider = purchases - sales;

  return (
    <div className="space-y-5 pt-1">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Institutional Shares
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
              {formatNumber(totalInstitutionalShares, true)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Institutional Holders
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
              {formatNumber(holderCount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Net Insider Activity (6mo)
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "text-xl font-semibold tabular-nums",
                  netInsider > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : netInsider < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                )}
              >
                {netInsider > 0 ? "+" : ""}
                {netInsider}
              </span>
              <span className="text-xs text-muted-foreground">
                ({purchases} buys, {sales} sales)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institutional Holders Table */}
      <Card>
        <CardHeader className="space-y-1 p-4 pb-0">
          <CardTitle className="text-sm font-medium">
            Top Institutional Holders
          </CardTitle>
          <CardDescription className="text-xs">
            Largest institutional positions by shares held
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          {top15Holders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Holder
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Shares
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date Reported
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Change
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Change %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {top15Holders.map((h, idx) => {
                    const positive = h.change > 0;
                    const negative = h.change < 0;
                    return (
                      <tr
                        key={`${h.holder}-${idx}`}
                        className="border-b border-white/[0.04] transition-colors hover:bg-muted/30"
                      >
                        <td className="max-w-[240px] truncate px-4 py-2.5 text-xs font-medium">
                          {h.holder}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {formatNumber(h.shares)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                          {h.dateReported?.slice(0, 10) ?? "—"}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right tabular-nums",
                            positive && "text-emerald-600 dark:text-emerald-400",
                            negative && "text-red-600 dark:text-red-400"
                          )}
                        >
                          {positive ? "+" : ""}
                          {formatNumber(h.change)}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right tabular-nums",
                            positive && "text-emerald-600 dark:text-emerald-400",
                            negative && "text-red-600 dark:text-red-400"
                          )}
                        >
                          {h.changePercentage != null
                            ? `${h.changePercentage > 0 ? "+" : ""}${h.changePercentage.toFixed(2)}%`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              No institutional holder data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Insider Transactions Table */}
      <Card>
        <CardHeader className="space-y-1 p-4 pb-0">
          <CardTitle className="text-sm font-medium">
            Recent Insider Transactions
          </CardTitle>
          <CardDescription className="text-xs">
            Latest insider buying and selling activity
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          {recent20Trades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Shares
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Owned After
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent20Trades.map((t, idx) => {
                    const isPurchase =
                      t.transactionType.toLowerCase().includes("purchase") ||
                      t.transactionType.toLowerCase().includes("buy") ||
                      t.transactionType === "P-Purchase";
                    const isSale =
                      t.transactionType.toLowerCase().includes("sale") ||
                      t.transactionType.toLowerCase().includes("sell") ||
                      t.transactionType === "S-Sale";

                    return (
                      <tr
                        key={`${t.transactionDate}-${t.reportingName}-${idx}`}
                        className="border-b border-white/[0.04] transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs">
                          {t.transactionDate?.slice(0, 10) ?? "—"}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-2.5 text-xs">
                          {t.reportingName}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant={
                              isPurchase
                                ? "success"
                                : isSale
                                  ? "danger"
                                  : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {isPurchase
                              ? "Purchase"
                              : isSale
                                ? "Sale"
                                : t.transactionType}
                          </Badge>
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right tabular-nums",
                            isPurchase &&
                              "text-emerald-600 dark:text-emerald-400",
                            isSale && "text-red-600 dark:text-red-400"
                          )}
                        >
                          {formatNumber(t.securitiesTransacted)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {t.price ? formatCurrency(t.price) : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          {t.securitiesOwned
                            ? formatNumber(t.securitiesOwned)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              No insider trading data available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
