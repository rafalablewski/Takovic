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
  Search,
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

function scoreColor(score: number): string {
  if (score >= 4.0) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 3.5) return "text-blue-600 dark:text-blue-400";
  if (score >= 3.0) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export default function ScreenerPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Stock Screener</h1>
          <p className="text-sm text-muted-foreground">
            Filter and discover stocks matching your criteria
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm font-medium">Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
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
                  <select className={selectClass}>
                    <option>All Sectors</option>
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Energy</option>
                    <option>Consumer</option>
                    <option>Industrials</option>
                    <option>Utilities</option>
                    <option>Real Estate</option>
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
                  <select className={selectClass}>
                    <option>Any</option>
                    <option>Mega ($200B+)</option>
                    <option>Large ($10B-$200B)</option>
                    <option>Mid ($2B-$10B)</option>
                    <option>Small (&lt;$2B)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* P/E Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  P/E Range
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className={inputClass} />
                  <span className="text-xs text-muted-foreground">-</span>
                  <input type="number" placeholder="Max" className={inputClass} />
                </div>
              </div>

              {/* ROE Min */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  ROE Min (%)
                </label>
                <input type="number" placeholder="e.g. 15" className={inputClass} />
              </div>

              {/* Dividend Yield */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Div Yield Min (%)
                </label>
                <input type="number" placeholder="e.g. 2.0" className={inputClass} />
              </div>

              {/* Min Score */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Min Score
                </label>
                <div className="relative">
                  <select className={selectClass}>
                    <option>Any</option>
                    <option>4.0+ (Excellent)</option>
                    <option>3.5+ (Good)</option>
                    <option>3.0+ (Average)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
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
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Results</CardTitle>
                <span className="text-xs text-muted-foreground tabular-nums">
                  247 stocks
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        #
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Stock
                      </th>
                      <th className="hidden px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                        Sector
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Price
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Change
                      </th>
                      <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                        P/E
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Score
                      </th>
                      <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                        Signal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStocks.map((stock) => (
                      <tr
                        key={stock.ticker}
                        className="border-b border-border/50 transition-colors hover:bg-muted/50"
                      >
                        <td className="px-5 py-3 text-xs tabular-nums text-muted-foreground">
                          {stock.rank}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-medium text-foreground">{stock.ticker}</span>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </td>
                        <td className="hidden px-5 py-3 text-xs text-muted-foreground sm:table-cell">
                          {stock.sector}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
                          {formatCurrency(stock.price)}
                        </td>
                        <td
                          className={`px-5 py-3 text-right tabular-nums font-medium ${
                            stock.change >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatPercent(stock.change)}
                        </td>
                        <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                          {stock.pe.toFixed(1)}
                        </td>
                        <td className={`px-5 py-3 text-right tabular-nums font-semibold ${scoreColor(stock.score)}`}>
                          {stock.score.toFixed(1)}
                        </td>
                        <td className="hidden px-5 py-3 text-right lg:table-cell">
                          <Badge
                            variant={sentimentBadgeVariant(stock.sentiment)}
                            className="text-[10px]"
                          >
                            {sentimentLabel(stock.sentiment)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <p className="text-xs text-muted-foreground tabular-nums">
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
