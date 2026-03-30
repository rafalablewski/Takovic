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
import { getQuote } from "@/lib/api/fmp";
import type { FMPQuote } from "@/lib/api/fmp";
import { Plus, Trash2 } from "lucide-react";

interface WatchlistStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  range52w: string;
}

async function fetchWatchlistGroup(tickers: string[]): Promise<WatchlistStock[]> {
  try {
    const quotes = await Promise.all(tickers.map((t) => getQuote(t)));
    return quotes
      .filter((q): q is FMPQuote => q !== null)
      .map((q) => ({
        ticker: q.symbol,
        name: q.name,
        price: q.price,
        change: q.changesPercentage,
        range52w: `$${q.yearLow.toFixed(2)} - $${q.yearHigh.toFixed(2)}`,
      }));
  } catch {
    return [];
  }
}

function WatchlistTable({ stocks }: { stocks: WatchlistStock[] }) {
  if (stocks.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-muted-foreground">
        Unable to load stock data. Check FMP_API_KEY configuration.
      </div>
    );
  }

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
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                —
              </td>
              <td className="hidden px-5 py-3 text-right lg:table-cell">
                <Badge variant="secondary" className="text-[10px]">
                  —
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

export default async function WatchlistPage() {
  const myStockTickers =
    process.env.DEFAULT_WATCHLIST_TICKERS?.split(",").map((t) => t.trim()) || [
      "AAPL",
      "MSFT",
      "GOOGL",
      "AMZN",
      "TSLA",
      "META",
    ];
  const techGiantTickers = ["NVDA", "AVGO", "CRM", "ADBE", "ORCL"];
  const dividendKingTickers = ["JNJ", "PG", "KO", "PEP", "MMM", "ABT"];

  const [myStocks, techGiants, dividendKings] = await Promise.all([
    fetchWatchlistGroup(myStockTickers),
    fetchWatchlistGroup(techGiantTickers),
    fetchWatchlistGroup(dividendKingTickers),
  ]);

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
