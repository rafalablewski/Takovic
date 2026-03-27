import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
} from "lucide-react";

const portfolioStats = [
  {
    label: "Total Value",
    value: "$127,450.00",
    detail: null,
    icon: Wallet,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    label: "Day Change",
    value: "+$1,230.50",
    detail: "+0.97%",
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    label: "Total Return",
    value: "+$23,450.00",
    detail: "+22.5%",
    icon: ArrowUpRight,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    label: "Cash",
    value: "$5,200.00",
    detail: "4.1% of portfolio",
    icon: Banknote,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <PieChart className="h-6 w-6 text-blue-500" />
          Portfolio
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your holdings, performance, and asset allocation
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                    {stat.detail && (
                      <p className={`text-sm font-medium ${stat.color}`}>
                        {stat.detail}
                      </p>
                    )}
                  </div>
                  <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Holdings
              </CardTitle>
              <CardDescription>
                {holdings.length} positions across {sectorAllocation.length} sectors
              </CardDescription>
            </div>
            <Badge variant="secondary" className="tabular-nums">
              {holdings.length} holdings
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Stock
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground sm:table-cell">
                    Shares
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                    Avg Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Mkt Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Gain/Loss
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground lg:table-cell">
                    Return
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr
                    key={h.ticker}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-xs font-bold text-blue-600">
                          {h.ticker.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold">{h.ticker}</span>
                          <p className="text-xs text-muted-foreground">
                            {h.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">
                      {h.shares}
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                      {formatCurrency(h.avgCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatCurrency(h.currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatCurrency(h.marketValue)}
                    </td>
                    <td className={`px-4 py-3 text-right tabular-nums ${h.gainLoss >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      <div className="flex items-center justify-end gap-1">
                        {h.gainLoss >= 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        <span className="font-medium">
                          {formatCurrency(Math.abs(h.gainLoss))}
                        </span>
                      </div>
                    </td>
                    <td className={`hidden px-4 py-3 text-right font-medium tabular-nums lg:table-cell ${h.gainLossPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatPercent(h.gainLossPct)}
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                      {h.weight.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="px-4 py-3 font-semibold" colSpan={1}>
                    Total
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell" />
                  <td className="hidden px-4 py-3 md:table-cell" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-bold tabular-nums">
                    {formatCurrency(holdings.reduce((s, h) => s + h.marketValue, 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-emerald-600">
                    {formatCurrency(holdings.reduce((s, h) => s + h.gainLoss, 0))}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell" />
                  <td className="hidden px-4 py-3 md:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-violet-500" />
            Sector Allocation
          </CardTitle>
          <CardDescription>
            Portfolio distribution across market sectors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stacked bar */}
          <div className="mb-6 flex h-4 overflow-hidden rounded-full">
            {sectorAllocation.map((s) => (
              <div
                key={s.sector}
                className={`${s.color} transition-all`}
                style={{ width: `${s.weight}%` }}
                title={`${s.sector}: ${s.weight}%`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {sectorAllocation.map((s) => (
              <div
                key={s.sector}
                className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
              >
                <div className={`h-3 w-3 rounded-full ${s.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.sector}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.weight}% allocation
                  </p>
                </div>
                <span className="text-lg font-bold tabular-nums">
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
