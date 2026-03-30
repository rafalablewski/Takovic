"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import type {
  FMPPriceTargetConsensus,
  FMPAnalystRecommendation,
  FMPAnalystEstimate,
  FMPUpgradeDowngrade,
} from "@/lib/api/fmp";

export type AnalystsTabProps = {
  ticker: string;
  currentPrice: number;
  consensus: FMPPriceTargetConsensus | null;
  recommendations: FMPAnalystRecommendation[];
  estimates: FMPAnalystEstimate[];
  upgrades: FMPUpgradeDowngrade[];
};

export function AnalystsTab({
  ticker,
  currentPrice,
  consensus,
  recommendations,
  estimates,
  upgrades,
}: AnalystsTabProps) {
  const latestRec = recommendations?.[0] ?? null;

  const totalAnalysts = latestRec
    ? latestRec.analystRatingsStrongBuy +
      latestRec.analystRatingsbuy +
      latestRec.analystRatingsHold +
      latestRec.analystRatingsSell +
      latestRec.analystRatingsStrongSell
    : 0;

  const buyCount = latestRec
    ? latestRec.analystRatingsStrongBuy + latestRec.analystRatingsbuy
    : 0;
  const holdCount = latestRec ? latestRec.analystRatingsHold : 0;
  const sellCount = latestRec
    ? latestRec.analystRatingsSell + latestRec.analystRatingsStrongSell
    : 0;

  const recentEstimates = estimates.slice(0, 6);
  const recentUpgrades = upgrades.slice(0, 10);

  return (
    <div className="space-y-5 pt-1">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Price Target Card */}
        <Card>
          <CardHeader className="space-y-1 p-4 pb-0">
            <CardTitle className="text-sm font-medium">
              Price Target Consensus
            </CardTitle>
            <CardDescription className="text-xs">
              Analyst consensus price target vs current price
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-3">
            {consensus ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Consensus target
                    </span>
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {formatCurrency(consensus.targetConsensus)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      Current
                    </span>
                    <p className="text-lg tabular-nums text-muted-foreground">
                      {formatCurrency(currentPrice)}
                    </p>
                  </div>
                </div>
                {(() => {
                  const upside =
                    ((consensus.targetConsensus - currentPrice) / currentPrice) *
                    100;
                  const positive = upside >= 0;
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Implied
                      </span>
                      <Badge
                        variant={positive ? "success" : "danger"}
                        className="text-[10px]"
                      >
                        {positive ? "+" : ""}
                        {upside.toFixed(1)}% {positive ? "upside" : "downside"}
                      </Badge>
                    </div>
                  );
                })()}

                {/* Range bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Low: {formatCurrency(consensus.targetLow)}</span>
                    <span>
                      Median: {formatCurrency(consensus.targetMedian)}
                    </span>
                    <span>High: {formatCurrency(consensus.targetHigh)}</span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-muted">
                    {/* Range fill */}
                    <div className="absolute inset-y-0 rounded-full bg-foreground/20" />
                    {/* Current price marker */}
                    {(() => {
                      const range =
                        consensus.targetHigh - consensus.targetLow;
                      if (range <= 0) return null;
                      const pct = Math.min(
                        Math.max(
                          ((currentPrice - consensus.targetLow) / range) * 100,
                          0
                        ),
                        100
                      );
                      return (
                        <div
                          className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary"
                          style={{ left: `${pct}%` }}
                          title={`Current: ${formatCurrency(currentPrice)}`}
                        />
                      );
                    })()}
                    {/* Consensus marker */}
                    {(() => {
                      const range =
                        consensus.targetHigh - consensus.targetLow;
                      if (range <= 0) return null;
                      const pct = Math.min(
                        Math.max(
                          ((consensus.targetConsensus - consensus.targetLow) /
                            range) *
                            100,
                          0
                        ),
                        100
                      );
                      return (
                        <div
                          className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-foreground/60"
                          style={{ left: `${pct}%` }}
                          title={`Consensus: ${formatCurrency(consensus.targetConsensus)}`}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                      Current price
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full bg-foreground/60" />
                      Consensus target
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No price target data available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Analyst Ratings Card */}
        <Card>
          <CardHeader className="space-y-1 p-4 pb-0">
            <CardTitle className="text-sm font-medium">
              Analyst Ratings
            </CardTitle>
            <CardDescription className="text-xs">
              Buy / Hold / Sell distribution
              {totalAnalysts > 0 && ` from ${totalAnalysts} analysts`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-3">
            {latestRec && totalAnalysts > 0 ? (
              <>
                {/* Stacked bar */}
                <div className="flex h-6 w-full overflow-hidden rounded-full">
                  {buyCount > 0 && (
                    <div
                      className="flex items-center justify-center bg-emerald-500/80 text-[10px] font-medium text-white"
                      style={{
                        width: `${(buyCount / totalAnalysts) * 100}%`,
                      }}
                    >
                      {buyCount}
                    </div>
                  )}
                  {holdCount > 0 && (
                    <div
                      className="flex items-center justify-center bg-muted-foreground/30 text-[10px] font-medium text-foreground"
                      style={{
                        width: `${(holdCount / totalAnalysts) * 100}%`,
                      }}
                    >
                      {holdCount}
                    </div>
                  )}
                  {sellCount > 0 && (
                    <div
                      className="flex items-center justify-center bg-red-500/80 text-[10px] font-medium text-white"
                      style={{
                        width: `${(sellCount / totalAnalysts) * 100}%`,
                      }}
                    >
                      {sellCount}
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500/80" />
                    <span className="text-muted-foreground">Buy</span>
                    <span className="font-medium tabular-nums">{buyCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-muted-foreground/30" />
                    <span className="text-muted-foreground">Hold</span>
                    <span className="font-medium tabular-nums">
                      {holdCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-red-500/80" />
                    <span className="text-muted-foreground">Sell</span>
                    <span className="font-medium tabular-nums">
                      {sellCount}
                    </span>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {[
                    ["Strong Buy", latestRec.analystRatingsStrongBuy],
                    ["Buy", latestRec.analystRatingsbuy],
                    ["Hold", latestRec.analystRatingsHold],
                    ["Sell", latestRec.analystRatingsSell],
                    ["Strong Sell", latestRec.analystRatingsStrongSell],
                  ].map(([label, count]) => (
                    <div key={label as string}>
                      <p className="text-muted-foreground">{label as string}</p>
                      <p className="mt-0.5 font-medium tabular-nums">
                        {count as number}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No analyst ratings available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* EPS Estimates */}
      <Card>
        <CardHeader className="space-y-1 p-4 pb-0">
          <CardTitle className="text-sm font-medium">EPS Estimates</CardTitle>
          <CardDescription className="text-xs">
            Analyst consensus earnings per share estimates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          {recentEstimates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Period
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      EPS Low
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      EPS Avg
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      EPS High
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Analysts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentEstimates.map((est) => (
                    <tr
                      key={est.date}
                      className="border-b border-white/[0.04] transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-2.5 font-mono text-xs">
                        {est.date}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        ${est.estimatedEpsLow.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                        ${est.estimatedEpsAvg.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        ${est.estimatedEpsHigh.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {est.numberAnalystsEstimatedEps}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              No EPS estimates available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Upgrades / Downgrades */}
      <Card>
        <CardHeader className="space-y-1 p-4 pb-0">
          <CardTitle className="text-sm font-medium">
            Recent Upgrades & Downgrades
          </CardTitle>
          <CardDescription className="text-xs">
            Latest analyst rating changes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          {recentUpgrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Firm
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Rating Change
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentUpgrades.map((ug, idx) => {
                    const isUpgrade =
                      ug.action.toLowerCase().includes("upgrade");
                    const isDowngrade =
                      ug.action.toLowerCase().includes("downgrade");
                    return (
                      <tr
                        key={`${ug.publishedDate}-${ug.gradingCompany}-${idx}`}
                        className="border-b border-white/[0.04] transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs">
                          {ug.publishedDate.slice(0, 10)}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-2.5 text-xs">
                          {ug.gradingCompany}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant={
                              isUpgrade
                                ? "success"
                                : isDowngrade
                                  ? "danger"
                                  : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {ug.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          {ug.previousGrade ? (
                            <span>
                              <span className="text-muted-foreground">
                                {ug.previousGrade}
                              </span>
                              <span className="mx-1 text-muted-foreground/50">
                                →
                              </span>
                              <span className="font-medium">{ug.newGrade}</span>
                            </span>
                          ) : (
                            <span className="font-medium">{ug.newGrade}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {ug.priceWhenPosted
                            ? formatCurrency(ug.priceWhenPosted)
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
              No recent upgrades or downgrades.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
