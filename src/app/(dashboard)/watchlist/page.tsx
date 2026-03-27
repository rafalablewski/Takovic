import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface WatchlistStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  range52w: string;
  score: number;
  sentiment: string;
}

const myStocks: WatchlistStock[] = [
  { ticker: "AAPL", name: "Apple Inc.", price: 192.53, change: 1.24, range52w: "$142.00 - $199.62", score: 4.2, sentiment: "bullish" },
  { ticker: "MSFT", name: "Microsoft Corp.", price: 417.88, change: 0.89, range52w: "$309.45 - $430.82", score: 4.5, sentiment: "bullish" },
  { ticker: "GOOGL", name: "Alphabet Inc.", price: 155.72, change: -0.34, range52w: "$120.21 - $160.45", score: 4.0, sentiment: "somewhat_bullish" },
  { ticker: "AMZN", name: "Amazon.com Inc.", price: 185.60, change: 1.67, range52w: "$118.35 - $191.70", score: 4.3, sentiment: "bullish" },
  { ticker: "TSLA", name: "Tesla Inc.", price: 248.42, change: -2.15, range52w: "$138.80 - $299.29", score: 3.2, sentiment: "neutral" },
  { ticker: "META", name: "Meta Platforms", price: 505.75, change: 0.52, range52w: "$280.50 - $531.49", score: 4.1, sentiment: "somewhat_bullish" },
];

const techGiants: WatchlistStock[] = [
  { ticker: "NVDA", name: "NVIDIA Corp.", price: 875.30, change: 2.45, range52w: "$373.56 - $974.00", score: 4.7, sentiment: "bullish" },
  { ticker: "AVGO", name: "Broadcom Inc.", price: 1342.50, change: 1.08, range52w: "$795.00 - $1410.00", score: 4.4, sentiment: "bullish" },
  { ticker: "CRM", name: "Salesforce Inc.", price: 272.35, change: -0.62, range52w: "$195.00 - $295.50", score: 3.8, sentiment: "somewhat_bullish" },
  { ticker: "ADBE", name: "Adobe Inc.", price: 485.90, change: 0.28, range52w: "$420.00 - $620.00", score: 3.9, sentiment: "neutral" },
  { ticker: "ORCL", name: "Oracle Corp.", price: 125.80, change: 0.95, range52w: "$99.00 - $132.77", score: 3.7, sentiment: "somewhat_bullish" },
];

const dividendKings: WatchlistStock[] = [
  { ticker: "JNJ", name: "Johnson & Johnson", price: 156.42, change: -0.32, range52w: "$144.00 - $175.50", score: 3.8, sentiment: "neutral" },
  { ticker: "PG", name: "Procter & Gamble", price: 162.88, change: 0.15, range52w: "$141.00 - $170.95", score: 3.6, sentiment: "neutral" },
  { ticker: "KO", name: "Coca-Cola Co.", price: 61.25, change: 0.08, range52w: "$52.00 - $64.99", score: 3.4, sentiment: "neutral" },
  { ticker: "PEP", name: "PepsiCo Inc.", price: 172.40, change: -0.21, range52w: "$155.00 - $192.00", score: 3.5, sentiment: "somewhat_bearish" },
  { ticker: "MMM", name: "3M Company", price: 104.55, change: 1.32, range52w: "$85.00 - $115.00", score: 3.1, sentiment: "neutral" },
  { ticker: "ABT", name: "Abbott Labs", price: 112.80, change: 0.45, range52w: "$95.00 - $120.00", score: 3.9, sentiment: "somewhat_bullish" },
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

function WatchlistTable({ stocks }: { stocks: WatchlistStock[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stock
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Price
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Change
            </th>
            <th className="hidden px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
              52W Range
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Score
            </th>
            <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
              Signal
            </th>
            <th className="px-5 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground w-12">
            </th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr
              key={stock.ticker}
              className="border-b border-border/50 transition-colors hover:bg-muted/50"
            >
              <td className="px-5 py-3">
                <span className="font-medium text-foreground">{stock.ticker}</span>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
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
              <td className="hidden px-5 py-3 text-xs tabular-nums text-muted-foreground md:table-cell">
                {stock.range52w}
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
              <td className="px-5 py-3 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            Track stocks and monitor performance
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-stocks">
        <TabsList>
          <TabsTrigger value="my-stocks">
            My Stocks
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
              {myStocks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tech-giants">
            Tech Giants
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
              {techGiants.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="dividend-kings">
            Dividend Kings
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
              {dividendKings.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-stocks">
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">My Stocks</CardTitle>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {myStocks.length} stocks
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <WatchlistTable stocks={myStocks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech-giants">
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Tech Giants</CardTitle>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {techGiants.length} stocks
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <WatchlistTable stocks={techGiants} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dividend-kings">
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Dividend Kings</CardTitle>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {dividendKings.length} stocks
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-3">
              <WatchlistTable stocks={dividendKings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
