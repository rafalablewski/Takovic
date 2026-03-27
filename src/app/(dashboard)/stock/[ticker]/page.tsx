import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  Star,
  TrendingUp,
  BarChart3,
  Clock,
  ExternalLink,
  Sparkles,
  Newspaper,
  ChevronRight,
  Building2,
  CircleDot,
} from "lucide-react";

interface StockPageProps {
  params: Promise<{ ticker: string }>;
}

const snowflakeScores = [
  { label: "Value", score: 3.8, color: "bg-blue-500" },
  { label: "Growth", score: 4.2, color: "bg-emerald-500" },
  { label: "Profitability", score: 4.5, color: "bg-violet-500" },
  { label: "Health", score: 3.9, color: "bg-amber-500" },
  { label: "Dividend", score: 2.1, color: "bg-rose-500" },
];

const keyMetrics = [
  { label: "P/E Ratio", value: "28.5" },
  { label: "P/B Ratio", value: "45.2" },
  { label: "ROE", value: "147.3%" },
  { label: "D/E Ratio", value: "1.87" },
  { label: "Div Yield", value: "0.55%" },
  { label: "Rev Growth", value: "8.1%" },
  { label: "Net Margin", value: "25.3%" },
  { label: "FCF", value: "$99.6B" },
  { label: "Market Cap", value: "$2.98T" },
  { label: "EPS", value: "$6.73" },
];

const newsItems = [
  {
    title: "Company Reports Strong Q4 Earnings, Beating Analyst Expectations",
    source: "Reuters",
    time: "2h ago",
    sentiment: "bullish" as const,
    summary:
      "Revenue surged 11% year-over-year, driven by cloud services and AI product adoption across enterprise customers.",
  },
  {
    title: "Analysts Raise Price Targets Following Product Launch Event",
    source: "Bloomberg",
    time: "5h ago",
    sentiment: "somewhat_bullish" as const,
    summary:
      "Multiple Wall Street firms upgraded their outlook after the company unveiled its next-generation AI platform.",
  },
  {
    title: "Regulatory Scrutiny Intensifies Amid Antitrust Investigation",
    source: "Financial Times",
    time: "1d ago",
    sentiment: "somewhat_bearish" as const,
    summary:
      "The DOJ is expanding its review of competitive practices in the cloud computing and digital advertising markets.",
  },
];

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config: Record<
    string,
    { label: string; variant: "success" | "warning" | "danger" | "secondary" }
  > = {
    bullish: { label: "Bullish", variant: "success" },
    somewhat_bullish: { label: "Somewhat Bullish", variant: "success" },
    neutral: { label: "Neutral", variant: "secondary" },
    somewhat_bearish: { label: "Somewhat Bearish", variant: "warning" },
    bearish: { label: "Bearish", variant: "danger" },
  };
  const c = config[sentiment] ?? { label: "Neutral", variant: "secondary" };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white shadow-md">
              {upperTicker.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {upperTicker}
                </h1>
                <Badge variant="outline" className="text-xs">
                  NASDAQ
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Apple Inc.
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight">
              {formatCurrency(192.53)}
            </span>
            <span className="text-lg font-semibold text-emerald-600">
              {formatPercent(1.24)}
            </span>
            <span className="text-sm text-muted-foreground">
              (+$2.36 today)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            <Clock className="mr-1 inline h-3 w-3" />
            Last updated Mar 27, 2026 4:00 PM EST
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Star className="h-4 w-4" />
            Add to Watchlist
          </Button>
          <Button className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Full Analysis
          </Button>
        </div>
      </div>

      <Separator />

      {/* Snowflake + AI Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Snowflake Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CircleDot className="h-5 w-5 text-blue-500" />
                  Snowflake Analysis
                </CardTitle>
                <CardDescription>
                  Multi-factor scoring across 5 dimensions
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">3.7</div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {snowflakeScores.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.score.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary">
                  <div
                    className={`h-2.5 rounded-full ${item.color} transition-all`}
                    style={{ width: `${(item.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                AI Analysis
              </CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Powered by Claude
              </Badge>
            </div>
            <CardDescription>
              AI-generated fundamental analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                This large-cap technology company demonstrates strong competitive
                positioning within its core markets, supported by a robust
                ecosystem of hardware, software, and services. Revenue
                diversification into higher-margin segments like cloud services
                and digital advertising has strengthened the company&apos;s financial
                profile over recent quarters.
              </p>
              <p>
                The company maintains exceptional profitability metrics with an
                ROE of 147.3% and net margins of 25.3%, reflecting operational
                efficiency and strong pricing power. However, the elevated P/E of
                28.5x and P/B of 45.2x suggest the market has priced in
                significant growth expectations that must be met to justify
                current valuations.
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-emerald-600">
                  Strengths
                </h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Industry-leading profit margins and cash generation
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Strong ecosystem lock-in with 2B+ active devices
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Accelerating services revenue with 45% gross margin
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-red-600">
                  Weaknesses
                </h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                    Premium valuation leaves limited margin of safety
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                    Geographic concentration risk in key markets
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                    Regulatory headwinds across multiple jurisdictions
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm font-medium">Sentiment:</span>
              <SentimentBadge sentiment="somewhat_bullish" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
          <CardDescription>
            Fundamental data and financial ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 md:grid-cols-5">
            {keyMetrics.map((metric) => (
              <div
                key={metric.label}
                className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="text-lg font-bold tabular-nums">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>Historical price performance</CardDescription>
            </div>
            <div className="flex gap-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={tf === "1Y" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">Interactive Price Chart</p>
              <p className="text-xs">
                TradingView Lightweight Charts integration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent News */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-blue-500" />
                Recent News
              </CardTitle>
              <CardDescription>
                Latest news with AI-powered sentiment analysis for {upperTicker}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Newspaper className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold leading-snug">
                      {item.title}
                    </h4>
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>{item.source}</span>
                    <span className="text-border">|</span>
                    <Clock className="h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
