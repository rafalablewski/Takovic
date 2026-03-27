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
  Sparkles,
  ChevronRight,
  ArrowUpRight,
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
  },
  {
    title: "Analysts Raise Price Targets Following Product Launch Event",
    source: "Bloomberg",
    time: "5h ago",
    sentiment: "somewhat_bullish" as const,
  },
  {
    title: "Regulatory Scrutiny Intensifies Amid Antitrust Investigation",
    source: "Financial Times",
    time: "1d ago",
    sentiment: "somewhat_bearish" as const,
  },
];

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

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

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {upperTicker}
            </h1>
            <Badge variant="outline" className="text-[10px]">
              NASDAQ
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">Apple Inc.</p>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums text-foreground">
              {formatCurrency(192.53)}
            </span>
            <span className="flex items-center gap-0.5 text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {formatPercent(1.24)}
            </span>
            <span className="text-xs text-muted-foreground">
              (+$2.36 today)
            </span>
          </div>

          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated Mar 27, 2026 4:00 PM EST
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Star className="h-4 w-4" />
            Watchlist
          </Button>
          <Button size="sm" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Full Analysis
          </Button>
        </div>
      </div>

      <Separator />

      {/* Snowflake + AI Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Snowflake Scores */}
        <Card>
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Snowflake Analysis</CardTitle>
              <div className="text-right">
                <span className="text-lg font-semibold tabular-nums text-foreground">3.7</span>
                <span className="text-xs text-muted-foreground"> / 5.0</span>
              </div>
            </div>
            <CardDescription className="text-xs">
              Multi-factor scoring across 5 dimensions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-4 space-y-3.5">
            {snowflakeScores.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="tabular-nums font-medium text-foreground">
                    {item.score.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary">
                  <div
                    className={`h-1.5 rounded-full ${item.color} transition-all`}
                    style={{ width: `${(item.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="border-primary/20">
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Sparkles className="h-3 w-3" />
                Claude
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-4 space-y-4">
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                This large-cap technology company demonstrates strong competitive
                positioning within its core markets, supported by a robust
                ecosystem of hardware, software, and services. Revenue
                diversification into higher-margin segments has strengthened the
                financial profile over recent quarters.
              </p>
              <p>
                Exceptional profitability metrics with an ROE of 147.3% and net
                margins of 25.3% reflect operational efficiency and strong pricing
                power. However, the elevated P/E of 28.5x suggests the market has
                priced in significant growth expectations.
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Strengths
                </h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    Industry-leading profit margins
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    Strong ecosystem with 2B+ active devices
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    Accelerating services revenue
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-400">
                  Risks
                </h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                    Premium valuation with limited margin of safety
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                    Geographic concentration risk
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                    Regulatory headwinds
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Sentiment:</span>
              <Badge variant="success" className="text-[10px]">Somewhat Bullish</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-5">
            {keyMetrics.map((metric) => (
              <div key={metric.label}>
                <p className="text-xs text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-medium">Price Chart</CardTitle>
            <div className="flex gap-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={tf === "1Y" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">Interactive chart placeholder</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent News */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent News</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              View All <ChevronRight className="ml-0.5 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="divide-y divide-border/50">
            {newsItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-sm font-medium leading-snug text-foreground">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span className="text-border">|</span>
                    <span>{item.time}</span>
                  </div>
                </div>
                <Badge
                  variant={sentimentBadgeVariant(item.sentiment)}
                  className="shrink-0 text-[10px]"
                >
                  {sentimentLabel(item.sentiment)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
