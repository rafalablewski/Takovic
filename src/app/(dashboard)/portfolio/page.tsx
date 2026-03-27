import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const portfolioStats = [
  { label: "Total Value", value: 127450.0, formatted: "$127,450.00" },
  { label: "Day Change", value: 1230.5, formatted: "+$1,230.50", detail: "+0.97%", positive: true },
  { label: "Total Return", value: 23450.0, formatted: "+$23,450.00", detail: "+22.5%", positive: true },
  { label: "Cash", value: 5200.0, formatted: "$5,200.00", detail: "4.1% of portfolio", positive: null },
];

const holdings = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    shares: 150,
    avgCost: 145.2,
    currentPrice: 192.53,
    marketValue: 28879.5,
    gainLoss: 7099.5,
    gainLossPct: 32.58,
    weight: 22.66,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    shares: 60,
    avgCost: 320.0,
    currentPrice: 417.88,
    marketValue: 25072.8,
    gainLoss: 5872.8,
    gainLossPct: 30.59,
    weight: 19.67,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    shares: 25,
    avgCost: 650.0,
    currentPrice: 875.3,
    marketValue: 21882.5,
    gainLoss: 5632.5,
    gainLossPct: 34.66,
    weight: 17.17,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    shares: 100,
    avgCost: 128.5,
    currentPrice: 155.72,
    marketValue: 15572.0,
    gainLoss: 2722.0,
    gainLossPct: 21.18,
    weight: 12.22,
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    shares: 80,
    avgCost: 160.0,
    currentPrice: 156.42,
    marketValue: 12513.6,
    gainLoss: -286.4,
    gainLossPct: -2.24,
    weight: 9.82,
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    shares: 45,
    avgCost: 155.0,
    currentPrice: 198.75,
    marketValue: 8943.75,
    gainLoss: 1968.75,
    gainLossPct: 28.27,
    weight: 7.02,
  },
];

const sectorAllocation = [
  { sector: "Technology", weight: 45, color: "bg-blue-500" },
  { sector: "Healthcare", weight: 20, color: "bg-emerald-500" },
  { sector: "Finance", weight: 15, color: "bg-violet-500" },
  { sector: "Energy", weight: 10, color: "bg-amber-500" },
  { sector: "Consumer", weight: 10, color: "bg-rose-500" },
];

export default function PortfolioPage() {
  const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalGainLoss = holdings.reduce((s, h) => s + h.gainLoss, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Holdings, performance, and allocation
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {stat.formatted}
              </p>
              {stat.detail && (
                <p
                  className={`mt-0.5 text-sm tabular-nums font-medium ${
                    stat.positive === true
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stat.positive === false
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {stat.detail}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <span className="text-xs text-muted-foreground tabular-nums">
              {holdings.length} positions
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stock
                  </th>
                  <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                    Shares
                  </th>
                  <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    Avg Cost
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Mkt Value
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Gain/Loss
                  </th>
                  <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Return
                  </th>
                  <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr
                    key={h.ticker}
                    className="border-b border-border/50 transition-colors hover:bg-muted/50"
                  >
                    <td className="px-5 py-3">
                      <span className="font-medium text-foreground">{h.ticker}</span>
                      <p className="text-xs text-muted-foreground">{h.name}</p>
                    </td>
                    <td className="hidden px-5 py-3 text-right tabular-nums text-foreground sm:table-cell">
                      {h.shares}
                    </td>
                    <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                      {formatCurrency(h.avgCost)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
                      {formatCurrency(h.currentPrice)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
                      {formatCurrency(h.marketValue)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right tabular-nums font-medium ${
                        h.gainLoss >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {h.gainLoss >= 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {formatCurrency(Math.abs(h.gainLoss))}
                      </div>
                    </td>
                    <td
                      className={`hidden px-5 py-3 text-right tabular-nums font-medium lg:table-cell ${
                        h.gainLossPct >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercent(h.gainLossPct)}
                    </td>
                    <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                      {h.weight.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">
                    Total
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell" />
                  <td className="hidden px-5 py-3 md:table-cell" />
                  <td className="px-5 py-3" />
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-foreground">
                    {formatCurrency(totalMarketValue)}
                  </td>
                  <td
                    className={`px-5 py-3 text-right tabular-nums font-semibold ${
                      totalGainLoss >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(totalGainLoss)}
                  </td>
                  <td className="hidden px-5 py-3 lg:table-cell" />
                  <td className="hidden px-5 py-3 md:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Sector Allocation</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          {/* Stacked bar */}
          <div className="mb-5 flex h-2 overflow-hidden rounded-full">
            {sectorAllocation.map((s) => (
              <div
                key={s.sector}
                className={`${s.color} transition-all`}
                style={{ width: `${s.weight}%` }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {sectorAllocation.map((s) => (
              <div
                key={s.sector}
                className="flex items-center gap-3"
              >
                <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{s.sector}</p>
                </div>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {s.weight}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
