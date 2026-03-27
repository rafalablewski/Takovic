import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  BarChart3,
  Hash,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const popularStocks = [
  { ticker: "AAPL", name: "Apple Inc.", price: 192.53, changePct: 1.24, score: 3.7 },
  { ticker: "MSFT", name: "Microsoft Corp.", price: 422.86, changePct: 0.67, score: 4.1 },
  { ticker: "GOOGL", name: "Alphabet Inc.", price: 155.72, changePct: 0.34, score: 3.9 },
  { ticker: "AMZN", name: "Amazon.com Inc.", price: 186.13, changePct: 2.18, score: 3.5 },
  { ticker: "NVDA", name: "NVIDIA Corp.", price: 924.79, changePct: -1.42, score: 4.4 },
  { ticker: "TSLA", name: "Tesla Inc.", price: 171.05, changePct: -3.25, score: 2.8 },
  { ticker: "META", name: "Meta Platforms Inc.", price: 503.28, changePct: 1.56, score: 3.6 },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", price: 198.47, changePct: 0.89, score: 3.8 },
];

const recentSearches = [
  { ticker: "NVDA", name: "NVIDIA Corp.", time: "2m ago" },
  { ticker: "AAPL", name: "Apple Inc.", time: "15m ago" },
  { ticker: "TSLA", name: "Tesla Inc.", time: "1h ago" },
  { ticker: "AMD", name: "Advanced Micro Devices", time: "3h ago" },
];

const trendingStocks = [
  { rank: 1, ticker: "SMCI", name: "Super Micro Computer", volume: "42.3M", changePct: 8.74 },
  { rank: 2, ticker: "NVDA", name: "NVIDIA Corp.", volume: "38.1M", changePct: -1.42 },
  { rank: 3, ticker: "PLTR", name: "Palantir Technologies", volume: "31.7M", changePct: 4.52 },
  { rank: 4, ticker: "SOFI", name: "SoFi Technologies", volume: "28.9M", changePct: -2.18 },
  { rank: 5, ticker: "MARA", name: "Marathon Digital", volume: "25.4M", changePct: 6.33 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 4.0) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 3.0) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LookupPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Stock Lookup</h1>
        <p className="text-sm text-muted-foreground">
          Search any stock for instant analysis
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Enter ticker or company name..."
          className="h-12 w-full rounded-lg border border-border bg-background pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      </div>

      {/* Popular Stocks */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">
          Popular Stocks
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularStocks.map((stock) => {
            const positive = stock.changePct >= 0;
            return (
              <Link key={stock.ticker} href={`/stock/${stock.ticker.toLowerCase()}`}>
                <Card className="transition-colors hover:bg-muted/30 cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {stock.ticker}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[140px]">
                          {stock.name}
                        </p>
                      </div>
                      <div className={`text-xs font-medium tabular-nums ${scoreColor(stock.score)}`}>
                        {stock.score.toFixed(1)}/5
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(stock.price)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        {positive ? (
                          <ArrowUpRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            positive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatPercent(stock.changePct)}
                        </span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Searches */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">
          Recent Searches
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {recentSearches.map((item) => (
            <Link key={item.ticker} href={`/stock/${item.ticker.toLowerCase()}`}>
              <Card className="transition-colors hover:bg-muted/30 cursor-pointer">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {item.ticker}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Today */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Trending Today</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          {/* Header */}
          <div className="grid grid-cols-[2rem_4rem_1fr_5rem_5rem] gap-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div>#</div>
            <div>Ticker</div>
            <div>Company</div>
            <div className="text-right">Volume</div>
            <div className="text-right">Change</div>
          </div>
          <Separator />
          <div className="divide-y divide-border/50">
            {trendingStocks.map((stock) => {
              const positive = stock.changePct >= 0;
              return (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker.toLowerCase()}`}
                  className="grid grid-cols-[2rem_4rem_1fr_5rem_5rem] items-center gap-2 py-3 transition-colors hover:bg-muted/50 rounded-md px-1 -mx-1"
                >
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {stock.rank}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {stock.ticker}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {stock.name}
                  </span>
                  <span className="text-right text-xs tabular-nums text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {stock.volume}
                    </span>
                  </span>
                  <span
                    className={`text-right text-sm tabular-nums font-medium ${
                      positive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatPercent(stock.changePct)}
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
