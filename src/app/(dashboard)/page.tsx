import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Newspaper,
  Eye,
  BarChart3,
  DollarSign,
  Briefcase,
  Sparkles,
  Clock,
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
  { ticker: "AAPL", name: "Apple Inc.", price: 189.84, changePct: 1.23, sentiment: "bullish" },
  { ticker: "MSFT", name: "Microsoft Corp.", price: 422.86, changePct: 0.67, sentiment: "bullish" },
  { ticker: "NVDA", name: "NVIDIA Corp.", price: 924.79, changePct: -1.42, sentiment: "somewhat_bearish" },
  { ticker: "GOOGL", name: "Alphabet Inc.", price: 155.72, changePct: 0.34, sentiment: "neutral" },
  { ticker: "AMZN", name: "Amazon.com Inc.", price: 186.13, changePct: 2.18, sentiment: "bullish" },
  { ticker: "TSLA", name: "Tesla Inc.", price: 171.05, changePct: -3.25, sentiment: "bearish" },
];

const recentAnalyses = [
  {
    ticker: "AAPL",
    date: "Mar 27, 2026",
    sentiment: "bullish",
    summary: "Strong services revenue growth offsets iPhone plateau; buy thesis intact.",
  },
  {
    ticker: "TSLA",
    date: "Mar 26, 2026",
    sentiment: "bearish",
    summary: "Margin compression continues amid pricing war; delivery miss likely in Q1.",
  },
  {
    ticker: "NVDA",
    date: "Mar 25, 2026",
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
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* Greeting                                                          */}
      {/* ----------------------------------------------------------------- */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {getGreeting()}, Rafal
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {today} &mdash; Here&apos;s your market command center.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Top Row — Market Overview Cards                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {marketIndices.map((idx) => {
          const positive = idx.change >= 0;
          return (
            <Card key={idx.name}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  {idx.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {idx.value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  {positive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={
                      positive
                        ? "text-sm font-medium text-green-600"
                        : "text-sm font-medium text-red-600"
                    }
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

      {/* ----------------------------------------------------------------- */}
      {/* Second Row — Portfolio Summary + AI Digest                        */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Portfolio Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-zinc-500" />
                <CardTitle>Portfolio Summary</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main value */}
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Portfolio Value
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(284619.42)}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{formatCurrency(1843.27)} ({formatPercent(0.65)}) today
                </span>
              </div>
            </div>

            <Separator />

            {/* Mini stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-zinc-400" />
                  <p className="text-xs text-zinc-500">Holdings</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  24
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  <p className="text-xs text-zinc-500">Best Today</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  AMZN {formatPercent(2.18)}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-xs text-zinc-500">Worst Today</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-red-600">
                  TSLA {formatPercent(-3.25)}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
                  <p className="text-xs text-zinc-500">Cash</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(18420, "USD", true)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Market Digest */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-violet-500" />
              <CardTitle>AI Market Digest</CardTitle>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="default">AI Digest</Badge>
              <span className="text-xs text-zinc-400">{today}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2.5">
              {aiDigestBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="sm">
              <Bot className="h-4 w-4" />
              Generate Full Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Third Row — Watchlist + Recent Analysis                           */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Watchlist Quick View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-zinc-500" />
                <CardTitle>Watchlist</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {watchlist.length} stocks
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 px-2 pb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
                <div className="col-span-2">Ticker</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Change</div>
                <div className="col-span-2 text-right">Signal</div>
              </div>
              <Separator />
              {watchlist.map((stock) => {
                const positive = stock.changePct >= 0;
                return (
                  <div
                    key={stock.ticker}
                    className="grid grid-cols-12 items-center gap-2 rounded-md px-2 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="col-span-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {stock.ticker}
                      </span>
                    </div>
                    <div className="col-span-4 truncate text-sm text-zinc-500">
                      {stock.name}
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(stock.price)}
                    </div>
                    <div
                      className={`col-span-2 text-right text-sm font-medium ${
                        positive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercent(stock.changePct)}
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Badge
                        variant={sentimentBadgeVariant(stock.sentiment)}
                        className="text-[10px]"
                      >
                        {sentimentLabel(stock.sentiment)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="ml-auto text-xs">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-zinc-500" />
                <CardTitle>Recent Analysis</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                AI-Powered
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnalyses.map((analysis, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {analysis.ticker}
                        </span>
                        <Badge
                          variant={sentimentBadgeVariant(analysis.sentiment)}
                          className="text-[10px]"
                        >
                          {sentimentLabel(analysis.sentiment)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {analysis.summary}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-400">
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
          <CardFooter>
            <Button variant="ghost" size="sm" className="ml-auto text-xs">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom Row — Latest News                                          */}
      {/* ----------------------------------------------------------------- */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-zinc-500" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Latest News
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((news, i) => (
            <Card
              key={i}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Image placeholder */}
              <div className="flex h-36 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                <Newspaper className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={sentimentBadgeVariant(news.sentiment)}
                    className="text-[10px]"
                  >
                    {sentimentLabel(news.sentiment)}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {news.timeAgo}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                  {news.headline}
                </p>
                <p className="mt-1.5 text-xs text-zinc-400">{news.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
