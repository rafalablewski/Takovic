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
  Filter,
  Download,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

const mockStocks = [
  { rank: 1, ticker: "AAPL", name: "Apple Inc.", sector: "Technology", price: 192.53, change: 1.24, pe: 28.5, score: 4.2, sentiment: "bullish" },
  { rank: 2, ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", price: 417.88, change: 0.89, pe: 35.2, score: 4.5, sentiment: "bullish" },
  { rank: 3, ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", price: 875.30, change: 2.45, pe: 62.1, score: 4.7, sentiment: "bullish" },
  { rank: 4, ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", price: 156.42, change: -0.32, pe: 15.8, score: 3.8, sentiment: "neutral" },
  { rank: 5, ticker: "JPM", name: "JPMorgan Chase", sector: "Finance", price: 198.75, change: 0.56, pe: 11.9, score: 4.0, sentiment: "somewhat_bullish" },
  { rank: 6, ticker: "XOM", name: "Exxon Mobil Corp.", sector: "Energy", price: 105.23, change: -0.78, pe: 13.2, score: 3.5, sentiment: "neutral" },
  { rank: 7, ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", price: 527.90, change: 1.12, pe: 22.4, score: 4.1, sentiment: "somewhat_bullish" },
  { rank: 8, ticker: "PG", name: "Procter & Gamble", sector: "Consumer", price: 162.88, change: 0.15, pe: 25.7, score: 3.6, sentiment: "neutral" },
  { rank: 9, ticker: "V", name: "Visa Inc.", sector: "Finance", price: 281.45, change: 0.67, pe: 30.8, score: 4.3, sentiment: "bullish" },
  { rank: 10, ticker: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", price: 171.32, change: -0.45, pe: 18.9, score: 3.9, sentiment: "somewhat_bullish" },
];

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config: Record<string, { label: string; variant: "success" | "warning" | "danger" | "secondary" }> = {
    bullish: { label: "Bullish", variant: "success" },
    somewhat_bullish: { label: "Somewhat Bullish", variant: "success" },
    neutral: { label: "Neutral", variant: "secondary" },
    somewhat_bearish: { label: "Somewhat Bearish", variant: "warning" },
    bearish: { label: "Bearish", variant: "danger" },
  };
  const c = config[sentiment] ?? { label: "Neutral", variant: "secondary" };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function ScoreBadge({ score }: { score: number }) {
  let color = "text-red-600 bg-red-50 dark:bg-red-950/30";
  if (score >= 4.0) color = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
  else if (score >= 3.5) color = "text-blue-600 bg-blue-50 dark:bg-blue-950/30";
  else if (score >= 3.0) color = "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

export default function ScreenerPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Screener</h1>
          <p className="text-sm text-muted-foreground">
            Filter and discover stocks matching your investment criteria
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </CardTitle>
              <CardDescription>Narrow your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ticker or company..."
                    className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Sector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Sector
                </label>
                <div className="relative">
                  <select className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>All Sectors</option>
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Energy</option>
                    <option>Consumer Discretionary</option>
                    <option>Consumer Staples</option>
                    <option>Industrials</option>
                    <option>Utilities</option>
                    <option>Real Estate</option>
                    <option>Materials</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Market Cap */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Market Cap
                </label>
                <div className="relative">
                  <select className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>Any</option>
                    <option>Mega ($200B+)</option>
                    <option>Large ($10B-$200B)</option>
                    <option>Mid ($2B-$10B)</option>
                    <option>Small ($300M-$2B)</option>
                    <option>Micro (&lt;$300M)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* P/E Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  P/E Ratio Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* ROE Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  ROE Minimum (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Dividend Yield */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Dividend Yield Minimum (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2.0"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Snowflake Score */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Min Snowflake Score
                </label>
                <div className="relative">
                  <select className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>Any</option>
                    <option>4.0+ (Excellent)</option>
                    <option>3.5+ (Good)</option>
                    <option>3.0+ (Average)</option>
                    <option>2.5+ (Below Average)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Filter className="mr-1 h-3.5 w-3.5" />
                  Apply
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>
                    Showing <span className="font-semibold text-foreground">247</span> stocks matching filters
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="tabular-nums">
                  247 results
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Ticker
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                        Sector
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Change
                      </th>
                      <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                        P/E
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                        Score
                      </th>
                      <th className="hidden px-4 py-3 text-center text-xs font-medium text-muted-foreground lg:table-cell">
                        Sentiment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStocks.map((stock) => (
                      <tr
                        key={stock.ticker}
                        className="border-b border-border/50 transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                          {stock.rank}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-semibold">{stock.ticker}</span>
                            <p className="text-xs text-muted-foreground">
                              {stock.name}
                            </p>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <Badge variant="outline" className="text-xs font-normal">
                            {stock.sector}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {formatCurrency(stock.price)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium tabular-nums ${
                            stock.change >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPercent(stock.change)}
                        </td>
                        <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                          {stock.pe.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ScoreBadge score={stock.score} />
                        </td>
                        <td className="hidden px-4 py-3 text-center lg:table-cell">
                          <SentimentBadge sentiment={stock.sentiment} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Page 1 of 25
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
