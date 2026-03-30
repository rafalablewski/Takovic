import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import {
  getMarketEquitiesBySymbols,
  getTrendingMarketEquities,
} from "@/lib/db/market-equities";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";

const popularTickers = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
  "JPM",
];

function num(v: string | null): number {
  if (v === null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function LookupPage() {
  let loadError = false;
  let popularStocks: Awaited<ReturnType<typeof getMarketEquitiesBySymbols>> =
    [];
  let trendingStocks: Awaited<ReturnType<typeof getTrendingMarketEquities>> =
    [];

  try {
    const [popular, trending] = await Promise.all([
      getMarketEquitiesBySymbols(popularTickers),
      getTrendingMarketEquities(5),
    ]);
    popularStocks = popular;
    trendingStocks = trending;
  } catch (error) {
    console.error("Failed to fetch lookup page data:", error);
    loadError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Stock Lookup</h1>
        <p className="text-sm text-muted-foreground">
          Search any stock for instant analysis · Popular list uses CSV-backed market data
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Enter ticker or company name..."
          className="h-12 w-full rounded-lg border border-border bg-background pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      </div>

      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">
          Popular Stocks
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularStocks.length > 0 ? (
            popularStocks.map((stock) => {
              const change = num(stock.changePct);
              const positive = change >= 0;
              return (
                <Link key={`${stock.symbol}-${stock.exchange}`} href={`/stock/${stock.symbol.toLowerCase()}`}>
                  <Card className="transition-colors hover:bg-muted/30 cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {stock.symbol}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[160px]">
                            {stock.name}
                          </p>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {stock.exchange}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(num(stock.price), stock.currency)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          {stock.changePct === null || stock.changePct === "" ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <>
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
                                {formatPercent(change)}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  {loadError
                    ? "Unable to load market data. Check DATABASE_URL and migrations."
                    : "No seed data for popular tickers. Run npm run db:seed:market-equities."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">
          Recent Searches
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="col-span-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No recent searches</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Trending Today</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            By volume in your seeded universe (not live exchange feed)
          </p>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="grid grid-cols-[2rem_4rem_1fr_5rem_5rem] gap-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div>#</div>
            <div>Ticker</div>
            <div>Company</div>
            <div className="text-right">Volume</div>
            <div className="text-right">Price</div>
          </div>
          <Separator />
          <div className="divide-y divide-border/50">
            {trendingStocks.length > 0 ? (
              trendingStocks.map((stock, idx) => (
                <Link
                  key={`${stock.symbol}-${stock.exchange}`}
                  href={`/stock/${stock.symbol.toLowerCase()}`}
                  className="grid grid-cols-[2rem_4rem_1fr_5rem_5rem] items-center gap-2 py-3 transition-colors hover:bg-muted/50 rounded-md px-1 -mx-1"
                >
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {stock.symbol}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {stock.name}
                  </span>
                  <span className="text-right text-xs tabular-nums text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {formatNumber(num(stock.volume), true)}
                    </span>
                  </span>
                  <span className="text-right text-sm tabular-nums font-medium text-foreground">
                    {formatCurrency(num(stock.price), stock.currency)}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {loadError
                  ? "Data unavailable."
                  : "Seed market_equities to see trending by volume."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
