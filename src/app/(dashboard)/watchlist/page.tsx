import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";

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

function WatchlistTable({ stocks }: { stocks: WatchlistStock[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stock</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Price</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Day Change</th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">52W Range</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Score</th>
            <th className="hidden px-4 py-3 text-center text-xs font-medium text-muted-foreground lg:table-cell">Sentiment</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr
              key={stock.ticker}
              className="border-b border-border/50 transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 text-xs font-bold text-blue-600">
                    {stock.ticker.substring(0, 2)}
                  </div>
                  <div>
                    <span className="font-semibold">{stock.ticker}</span>
                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {formatCurrency(stock.price)}
              </td>
              <td className={`px-4 py-3 text-right tabular-nums ${stock.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                <div className="flex items-center justify-end gap-1">
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  <span className="font-medium">{formatPercent(stock.change)}</span>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-xs tabular-nums text-muted-foreground md:table-cell">
                {stock.range52w}
              </td>
              <td className="px-4 py-3 text-center">
                <ScoreBadge score={stock.score} />
              </td>
              <td className="hidden px-4 py-3 text-center lg:table-cell">
                <SentimentBadge sentiment={stock.sentiment} />
              </td>
              <td className="px-4 py-3 text-center">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-500" />
            Watchlist
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your favorite stocks and monitor performance
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* Watchlist Tabs */}
      <Tabs defaultValue="my-stocks">
        <TabsList>
          <TabsTrigger value="my-stocks" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />
            My Stocks
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {myStocks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tech-giants" className="gap-1.5">
            Tech Giants
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {techGiants.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="dividend-kings" className="gap-1.5">
            Dividend Kings
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {dividendKings.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-stocks">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Stocks</CardTitle>
                  <CardDescription>Your primary watchlist</CardDescription>
                </div>
                <p className="text-sm text-muted-foreground">
                  {myStocks.length} stocks
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <WatchlistTable stocks={myStocks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech-giants">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tech Giants</CardTitle>
                  <CardDescription>Top technology companies by market cap</CardDescription>
                </div>
                <p className="text-sm text-muted-foreground">
                  {techGiants.length} stocks
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <WatchlistTable stocks={techGiants} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dividend-kings">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dividend Kings</CardTitle>
                  <CardDescription>Companies with 50+ years of consecutive dividend increases</CardDescription>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dividendKings.length} stocks
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <WatchlistTable stocks={dividendKings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
