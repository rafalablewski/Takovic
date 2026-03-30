import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatLargeNumber } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { QUARTERLY_FINANCIALS, FINANCIALS_DESCRIPTION } from "@/data/coverage/bmnr";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export function FinancialsTab({ ticker }: { ticker: string }) {
  if (!isEthTreasury(ticker)) return <p className="text-sm text-muted-foreground">No financial data.</p>;

  const quarters = QUARTERLY_FINANCIALS;
  const latest = quarters[quarters.length - 1];
  const prev = quarters.length > 1 ? quarters[quarters.length - 2] : null;

  return (
    <div className="space-y-4">
      {/* Description */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{FINANCIALS_DESCRIPTION}</p>
        </CardContent>
      </Card>

      {/* Highlight metrics */}
      {latest && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <HighlightCard
            label="ETH Holdings"
            value={latest.ethHoldings.toLocaleString()}
            prev={prev?.ethHoldings}
            current={latest.ethHoldings}
            suffix=" ETH"
          />
          <HighlightCard
            label="Staking Revenue"
            value={fmtCurrency(latest.stakingRevenue)}
            prev={prev?.stakingRevenue}
            current={latest.stakingRevenue}
          />
          <HighlightCard
            label="Net Income"
            value={fmtCurrency(latest.netIncome)}
            prev={prev?.netIncome}
            current={latest.netIncome}
          />
          <HighlightCard
            label="Cash Position"
            value={fmtCurrency(latest.cashPosition)}
            prev={prev?.cashPosition}
            current={latest.cashPosition}
          />
        </div>
      )}

      {/* Income Statement */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Income Statement</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Metric</th>
                  {quarters.map((q) => (
                    <th key={q.period} className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">{q.period}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <FinRow label="Revenue" values={quarters.map((q) => q.revenue)} />
                <FinRow label="Staking Revenue" values={quarters.map((q) => q.stakingRevenue)} />
                <FinRow label="Operating Expenses" values={quarters.map((q) => q.operatingExpenses)} negative />
                <FinRow label="Net Income" values={quarters.map((q) => q.netIncome)} highlight />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Metric</th>
                  {quarters.map((q) => (
                    <th key={q.period} className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">{q.period}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <FinRow label="Total Assets" values={quarters.map((q) => q.totalAssets)} />
                <FinRow label="Total Liabilities" values={quarters.map((q) => q.totalLiabilities)} />
                <FinRow label="Shareholders' Equity" values={quarters.map((q) => q.shareholdersEquity)} highlight />
                <FinRow label="Cash Position" values={quarters.map((q) => q.cashPosition)} />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Evolution */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Key Metrics Evolution</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Metric</th>
                  {quarters.map((q) => (
                    <th key={q.period} className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">{q.period}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr className="hover:bg-muted/50">
                  <td className="py-2.5 text-xs font-medium text-foreground">ETH Holdings</td>
                  {quarters.map((q) => (
                    <td key={q.period} className="py-2.5 text-right text-xs tabular-nums font-medium text-foreground">{q.ethHoldings.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-2.5 text-xs font-medium text-foreground">ETH Price</td>
                  {quarters.map((q) => (
                    <td key={q.period} className="py-2.5 text-right text-xs tabular-nums text-muted-foreground">{formatCurrency(q.ethPrice)}</td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-2.5 text-xs font-medium text-foreground">ETH Holdings Value</td>
                  {quarters.map((q) => (
                    <td key={q.period} className="py-2.5 text-right text-xs tabular-nums font-medium text-foreground">{fmtCurrency(q.ethHoldings * q.ethPrice)}</td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-2.5 text-xs font-medium text-foreground">Staking % of Revenue</td>
                  {quarters.map((q) => (
                    <td key={q.period} className="py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {q.revenue > 0 ? `${((q.stakingRevenue / q.revenue) * 100).toFixed(0)}%` : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HighlightCard({
  label,
  value,
  prev,
  current,
  suffix = "",
}: {
  label: string;
  value: string;
  prev?: number;
  current: number;
  suffix?: string;
}) {
  const delta = prev != null && prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : null;
  const isPositive = delta != null && delta > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}{suffix}</p>
        {delta != null && (
          <div className="mt-0.5 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={cn("text-[10px] tabular-nums font-medium", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
              {isPositive ? "+" : ""}{delta.toFixed(0)}% QoQ
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FinRow({
  label,
  values,
  negative = false,
  highlight = false,
}: {
  label: string;
  values: number[];
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className="hover:bg-muted/50">
      <td className={cn("py-2.5 text-xs", highlight ? "font-semibold text-foreground" : "font-medium text-foreground")}>{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={cn(
            "py-2.5 text-right text-xs tabular-nums",
            highlight ? "font-semibold" : "",
            v < 0 ? "text-red-600 dark:text-red-400" : negative ? "text-muted-foreground" : "text-muted-foreground"
          )}
        >
          {fmtCurrency(v)}
        </td>
      ))}
    </tr>
  );
}

function fmtCurrency(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e9) return formatLargeNumber(v, { prefix: "$", decimals: 2 });
  if (abs >= 1e6) return formatLargeNumber(v, { prefix: "$", decimals: 1 });
  if (abs >= 1e3) return formatLargeNumber(v, { prefix: "$", decimals: 0 });
  const sign = v < 0 ? "-" : "";
  return `${sign}$${abs.toLocaleString()}`;
}
