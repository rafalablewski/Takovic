import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  formatPercent,
  sentimentBadgeVariant,
  sentimentLabel,
  timeAgo,
} from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { getQuote, getMarketNews } from "@/lib/api/fmp";
import type { FMPQuote, FMPNews } from "@/lib/api/fmp";
import { PortfolioSummary } from "@/components/shared/portfolio-summary";
import { getCurrentUser } from "@/lib/auth/user";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const displayName = user.name?.trim() || "there";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Configurable default watchlist tickers
  const watchlistTickers =
    process.env.DEFAULT_WATCHLIST_TICKERS?.split(",") || [
      "AAPL",
      "MSFT",
      "NVDA",
      "GOOGL",
      "AMZN",
      "TSLA",
    ];
  const watchlistForNews = watchlistTickers
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");

  // Market index proxies
  const indexTickers = [
    { ticker: "SPY", name: "S&P 500" },
    { ticker: "QQQ", name: "NASDAQ" },
    { ticker: "DIA", name: "DOW Jones" },
    { ticker: "IWM", name: "Russell 2000" },
  ];

  let marketIndices: { name: string; quote: FMPQuote | null }[] = [];
  let watchlistQuotes: FMPQuote[] = [];
  let latestNews: FMPNews[] = [];

  try {
    const [indexQuotes, wlQuotes, newsData] = await Promise.all([
      Promise.all(indexTickers.map((idx) => getQuote(idx.ticker))),
      Promise.all(watchlistTickers.map((t) => getQuote(t.trim()))),
      getMarketNews(5, watchlistForNews || undefined),
    ]);

    marketIndices = indexTickers.map((idx, i) => ({
      name: idx.name,
      quote: indexQuotes[i],
    }));
    watchlistQuotes = wlQuotes.filter(Boolean) as FMPQuote[];
    latestNews = newsData ?? [];
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    // Partial failure is fine — sections will show empty states
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Market Index Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {marketIndices.map((idx) => {
          if (!idx.quote) {
            return (
              <Card key={idx.name}>
                <CardContent className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {idx.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Unavailable</p>
                </CardContent>
              </Card>
            );
          }
          const positive = idx.quote.change >= 0;
          return (
            <Card key={idx.name}>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {idx.name}
                </p>
                <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
                  {idx.quote.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {positive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                  <span
                    className={`text-sm tabular-nums font-medium ${
                      positive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {idx.quote.change.toFixed(2)} ({formatPercent(idx.quote.changesPercentage)})
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Summary + AI Digest */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Portfolio Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Portfolio Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            <PortfolioSummary />
          </CardContent>
        </Card>

        {/* AI Market Digest */}
        <Card className="border-primary/20">
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">AI Market Digest</CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {today}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
              <Sparkles className="mb-3 h-6 w-6 opacity-30" />
              <p className="text-sm">AI digest requires ANTHROPIC_API_KEY</p>
              <p className="mt-1 text-xs">Configure your API key to enable AI-powered market summaries.</p>
            </div>
          </CardContent>
          <CardFooter className="p-5 pt-0">
            <Button variant="outline" className="w-full" size="sm" disabled>
              Generate Full Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Watchlist + Recent Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Watchlist */}
        <Card>
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                View All <ChevronRight className="ml-0.5 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div>Ticker</div>
              <div className="text-right">Price</div>
              <div className="text-right">Change</div>
            </div>
            <Separator />
            <div className="divide-y divide-border/50">
              {watchlistQuotes.length > 0 ? (
                watchlistQuotes.map((stock) => {
                  const positive = stock.changesPercentage >= 0;
                  return (
                    <div
                      key={stock.symbol}
                      className="grid grid-cols-3 items-center gap-2 py-2.5 transition-colors hover:bg-muted/50 rounded-md px-1 -mx-1"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {stock.symbol}
                      </span>
                      <span className="text-right text-sm tabular-nums text-foreground">
                        {formatCurrency(stock.price)}
                      </span>
                      <span
                        className={`text-right text-sm tabular-nums font-medium ${
                          positive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPercent(stock.changesPercentage)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  No watchlist data available. Check FMP_API_KEY configuration.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Analysis */}
        <Card>
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Analysis</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                View All <ChevronRight className="ml-0.5 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <AlertCircle className="mb-3 h-8 w-8 opacity-30" />
              <p className="text-sm font-medium">Run analysis on a stock to see results</p>
              <p className="mt-1 text-xs">
                Visit a stock page and run AI analysis to populate this section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest News */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">Latest News</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.length > 0 ? (
            latestNews.slice(0, 3).map((news, i) => (
              <a
                key={i}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="transition-colors hover:bg-muted/30">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {news.symbol || "Market"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(new Date(news.publishedDate))}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                      {news.title}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{news.site}</p>
                  </CardContent>
                </Card>
              </a>
            ))
          ) : (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  No headlines returned for your watchlist symbols. If quotes load but this stays empty,
                  try again later. After adding{" "}
                  <span className="font-mono text-xs">FMP_API_KEY</span> in Vercel, redeploy so the
                  server sees it.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
