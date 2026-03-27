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
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const marketIndices = [
  { name: "S&P 500", value: 5234.18, change: 32.64, changePct: 0.63 },
  { name: "NASDAQ", value: 16428.82, change: -48.2, changePct: -0.29 },
  { name: "DOW Jones", value: 39872.99, change: 66.22, changePct: 0.17 },
  { name: "Russell 2000", value: 2083.47, change: -11.35, changePct: -0.54 },
];

const watchlist = [
  { ticker: "AAPL", price: 189.84, changePct: 1.23 },
  { ticker: "MSFT", price: 422.86, changePct: 0.67 },
  { ticker: "NVDA", price: 924.79, changePct: -1.42 },
  { ticker: "GOOGL", price: 155.72, changePct: 0.34 },
  { ticker: "AMZN", price: 186.13, changePct: 2.18 },
  { ticker: "TSLA", price: 171.05, changePct: -3.25 },
];

const recentAnalyses = [
  {
    ticker: "AAPL",
    date: "Mar 27",
    sentiment: "bullish",
    summary: "Strong services revenue growth offsets iPhone plateau; buy thesis intact.",
  },
  {
    ticker: "TSLA",
    date: "Mar 26",
    sentiment: "bearish",
    summary: "Margin compression continues amid pricing war; delivery miss likely in Q1.",
  },
  {
    ticker: "NVDA",
    date: "Mar 25",
    sentiment: "somewhat_bullish",
    summary: "Blackwell ramp on track; supply constraints easing — upside to consensus.",
  },
];

const latestNews = [
  {
    headline: "Fed Signals Potential Rate Cut in June as Inflation Cools",
    source: "Reuters",
    timeAgo: "2h ago",
    sentiment: "bullish",
  },
  {
    headline: "Tech Layoffs Continue: 12,000 Jobs Cut Across Sector This Week",
    source: "Bloomberg",
    timeAgo: "4h ago",
    sentiment: "bearish",
  },
  {
    headline: "Oil Prices Steady as OPEC+ Maintains Production Targets",
    source: "CNBC",
    timeAgo: "6h ago",
    sentiment: "neutral",
  },
];

const aiDigestBullets = [
  "Market breadth improved overnight — advancing issues outpace decliners 3:1 on the NYSE.",
  "10-year Treasury yield dipped to 4.12%, lowest in six weeks, supporting growth equities.",
  "Earnings season kicks off next week with major banks; consensus expects +6% YoY EPS growth.",
  "Chinese PMI surprised to the upside at 51.2, boosting commodity-linked names pre-market.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function sentimentBadgeVariant(
  sentiment: string
): "success" | "danger" | "warning" | "secondary" {
  switch (sentiment) {
    case "bullish":
    case "somewhat_bullish":
      return "success";
    case "bearish":
    case "somewhat_bearish":
      return "danger";
    default:
      return "secondary";
  }
}

function sentimentLabel(sentiment: string): string {
  return sentiment
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {getGreeting()}, Rafal
        </h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Market Index Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {marketIndices.map((idx) => {
          const positive = idx.change >= 0;
          return (
            <Card key={idx.name}>
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {idx.name}
                </p>
                <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
                  {idx.value.toLocaleString("en-US", {
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
                    {idx.change.toFixed(2)} ({formatPercent(idx.changePct)})
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
              <span className="text-xs text-muted-foreground">Updated live</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {formatCurrency(284619.42)}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(1843.27)} ({formatPercent(0.65)}) today
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Holdings", value: "24" },
                {
                  label: "Best Today",
                  value: `AMZN ${formatPercent(2.18)}`,
                  color: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: "Worst Today",
                  value: `TSLA ${formatPercent(-3.25)}`,
                  color: "text-red-600 dark:text-red-400",
                },
                { label: "Cash", value: formatCurrency(18420, "USD", true) },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p
                    className={`mt-0.5 text-sm font-medium tabular-nums ${
                      stat.color ?? "text-foreground"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
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
            <ul className="space-y-3">
              {aiDigestBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="p-5 pt-0">
            <Button variant="outline" className="w-full" size="sm">
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
              {watchlist.map((stock) => {
                const positive = stock.changePct >= 0;
                return (
                  <div
                    key={stock.ticker}
                    className="grid grid-cols-3 items-center gap-2 py-2.5 transition-colors hover:bg-muted/50 rounded-md px-1 -mx-1"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {stock.ticker}
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
                      {formatPercent(stock.changePct)}
                    </span>
                  </div>
                );
              })}
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
            <div className="space-y-4">
              {recentAnalyses.map((analysis, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {analysis.ticker}
                        </span>
                        <Badge
                          variant={sentimentBadgeVariant(analysis.sentiment)}
                          className="text-[10px]"
                        >
                          {sentimentLabel(analysis.sentiment)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {analysis.summary}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {analysis.date}
                    </span>
                  </div>
                  {i < recentAnalyses.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest News */}
      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground">Latest News</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((news, i) => (
            <Card
              key={i}
              className="transition-colors hover:bg-muted/30"
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={sentimentBadgeVariant(news.sentiment)}
                    className="text-[10px]"
                  >
                    {sentimentLabel(news.sentiment)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {news.timeAgo}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug text-foreground">
                  {news.headline}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{news.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
