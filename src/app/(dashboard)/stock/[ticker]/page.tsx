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
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  sentimentBadgeVariant,
  sentimentLabel,
  timeAgo,
} from "@/lib/utils";
import { Intelligence } from "@/components/stock/intelligence";
import {
  getQuote,
  getProfile,
  getKeyMetrics,
  getIncomeStatement,
  getBalanceSheet,
  getStockNews,
} from "@/lib/api/fmp";
import { calculateSnowflakeScores } from "@/lib/analysis/scores";
import {
  Star,
  TrendingUp,
  BarChart3,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";

interface StockPageProps {
  params: Promise<{ ticker: string }>;
}

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "5Y"];
const scoreColors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];
const scoreLabels = ["Value", "Growth", "Profitability", "Health", "Dividend"];

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  let quote, profile, metrics, incomeStatements, balanceSheets, news;

  try {
    [quote, profile, metrics, incomeStatements, balanceSheets, news] = await Promise.all([
      getQuote(upperTicker),
      getProfile(upperTicker),
      getKeyMetrics(upperTicker, "annual", 1),
      getIncomeStatement(upperTicker, "annual", 5),
      getBalanceSheet(upperTicker, "annual", 1),
      getStockNews(upperTicker, 3),
    ]);
  } catch {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <h2 className="text-lg font-semibold text-foreground">Error Loading Stock</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to fetch data for {upperTicker}. Please check that FMP_API_KEY is configured.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Stock Not Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No data available for ticker &quot;{upperTicker}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate snowflake scores
  const latestMetrics = metrics?.[0] ?? null;
  const latestBalanceSheet = balanceSheets?.[0] ?? null;

  let snowflakeScores = null;
  if (latestMetrics && latestBalanceSheet && incomeStatements?.length) {
    try {
      snowflakeScores = calculateSnowflakeScores({
        metrics: latestMetrics,
        incomeStatements,
        balanceSheet: latestBalanceSheet,
      });
    } catch {
      // Scores unavailable
    }
  }

  const positive = quote.changesPercentage >= 0;
  const companyName = profile?.companyName ?? quote.name ?? upperTicker;
  const exchange = profile?.exchange ?? "";

  // Build key metrics dynamically
  const keyMetricsDisplay = [
    { label: "P/E Ratio", value: latestMetrics?.peRatio ? latestMetrics.peRatio.toFixed(1) : "—" },
    { label: "P/B Ratio", value: latestMetrics?.pbRatio ? latestMetrics.pbRatio.toFixed(1) : "—" },
    { label: "ROE", value: latestMetrics?.roe ? `${(latestMetrics.roe * 100).toFixed(1)}%` : "—" },
    { label: "D/E Ratio", value: latestMetrics?.debtToEquity != null ? latestMetrics.debtToEquity.toFixed(2) : "—" },
    { label: "Div Yield", value: latestMetrics?.dividendYield ? `${(latestMetrics.dividendYield * 100).toFixed(2)}%` : "—" },
    { label: "Net Margin", value: latestMetrics?.netProfitMargin ? `${(latestMetrics.netProfitMargin * 100).toFixed(1)}%` : "—" },
    { label: "Gross Margin", value: latestMetrics?.grossProfitMargin ? `${(latestMetrics.grossProfitMargin * 100).toFixed(1)}%` : "—" },
    { label: "Market Cap", value: quote.marketCap ? formatCurrency(quote.marketCap, "USD", true) : "—" },
    { label: "EPS", value: quote.eps ? `$${quote.eps.toFixed(2)}` : "—" },
    { label: "Volume", value: quote.volume ? formatNumber(quote.volume, true) : "—" },
  ];

  // Build snowflake score items for display
  const snowflakeItems = snowflakeScores
    ? scoreLabels.map((label, i) => ({
        label,
        score: [snowflakeScores.value, snowflakeScores.growth, snowflakeScores.profitability, snowflakeScores.health, snowflakeScores.dividend][i],
        color: scoreColors[i],
      }))
    : null;

  // AI Analysis — try to call the analysis API route
  let aiAnalysis: { summary: string; sentiment: string; strengths: string[]; weaknesses: string[] } | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/analysis/${upperTicker}`, { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = await res.json();
      if (data.summary) {
        aiAnalysis = data;
      }
    }
  } catch {
    // AI analysis unavailable
  }

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {upperTicker}
            </h1>
            {exchange && (
              <Badge variant="outline" className="text-[10px]">
                {exchange}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{companyName}</p>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tabular-nums text-foreground">
              {formatCurrency(quote.price)}
            </span>
            <span className={`flex items-center gap-0.5 text-sm font-medium tabular-nums ${
              positive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}>
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {formatPercent(quote.changesPercentage)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({positive ? "+" : ""}{formatCurrency(quote.change)} today)
            </span>
          </div>

          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated {new Date(quote.timestamp * 1000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
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
                <span className="text-lg font-semibold tabular-nums text-foreground">
                  {snowflakeScores ? snowflakeScores.overall.toFixed(1) : "—"}
                </span>
                <span className="text-xs text-muted-foreground"> / 5.0</span>
              </div>
            </div>
            <CardDescription className="text-xs">
              Multi-factor scoring across 5 dimensions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-4 space-y-3.5">
            {snowflakeItems ? (
              snowflakeItems.map((item) => (
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Insufficient data to calculate scores. Requires key metrics, income statements, and balance sheet data.
              </p>
            )}
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
            {aiAnalysis ? (
              <>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>{aiAnalysis.summary}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Strengths
                    </h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {aiAnalysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-400">
                      Risks
                    </h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {aiAnalysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Sentiment:</span>
                  <Badge variant={sentimentBadgeVariant(aiAnalysis.sentiment)} className="text-[10px]">
                    {sentimentLabel(aiAnalysis.sentiment)}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>AI analysis unavailable — configure ANTHROPIC_API_KEY to enable.</p>
              </div>
            )}
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
            {keyMetricsDisplay.map((metric) => (
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

      {/* Intelligence — SEC Filings + Press Wire */}
      <Intelligence ticker={upperTicker} />

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
            {news && news.length > 0 ? (
              news.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium leading-snug text-foreground hover:underline"
                    >
                      {item.title}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.site}</span>
                      <span className="text-border">|</span>
                      <span>{timeAgo(new Date(item.publishedDate))}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-muted-foreground">No recent news available.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
