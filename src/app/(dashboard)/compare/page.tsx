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
  ArrowRightLeft,
  Sparkles,
  Plus,
  Search,
  Info,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock comparison data — AAPL vs MSFT
// ---------------------------------------------------------------------------

interface StockData {
  ticker: string;
  name: string;
  sector: string;
  marketCap: string;
  price: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  debtEquity: number;
  revenueGrowth: number;
  netMargin: number;
  dividendYield: number;
  snowflakeScore: number;
  sentiment: string;
}

const stockA: StockData = {
  ticker: "AAPL",
  name: "Apple Inc.",
  sector: "Technology",
  marketCap: "$2.98T",
  price: 192.53,
  peRatio: 28.5,
  pbRatio: 45.2,
  roe: 147.3,
  debtEquity: 1.87,
  revenueGrowth: 8.1,
  netMargin: 25.3,
  dividendYield: 0.55,
  snowflakeScore: 3.7,
  sentiment: "Somewhat Bullish",
};

const stockB: StockData = {
  ticker: "MSFT",
  name: "Microsoft Corp.",
  sector: "Technology",
  marketCap: "$3.12T",
  price: 422.86,
  peRatio: 35.2,
  pbRatio: 12.8,
  roe: 38.5,
  debtEquity: 0.42,
  revenueGrowth: 15.8,
  netMargin: 34.2,
  dividendYield: 0.74,
  snowflakeScore: 4.1,
  sentiment: "Bullish",
};

// ---------------------------------------------------------------------------
// Comparison metrics definition
// ---------------------------------------------------------------------------

type CompareDirection = "higher" | "lower";

interface CompareMetric {
  label: string;
  key: keyof StockData;
  format: (v: StockData[keyof StockData]) => string;
  better: CompareDirection;
}

const metrics: CompareMetric[] = [
  { label: "Company Name", key: "name", format: (v) => String(v), better: "higher" },
  { label: "Sector", key: "sector", format: (v) => String(v), better: "higher" },
  { label: "Market Cap", key: "marketCap", format: (v) => String(v), better: "higher" },
  { label: "Price", key: "price", format: (v) => formatCurrency(v as number), better: "higher" },
  { label: "P/E Ratio", key: "peRatio", format: (v) => (v as number).toFixed(1), better: "lower" },
  { label: "P/B Ratio", key: "pbRatio", format: (v) => (v as number).toFixed(1), better: "lower" },
  { label: "ROE", key: "roe", format: (v) => `${(v as number).toFixed(1)}%`, better: "higher" },
  { label: "Debt/Equity", key: "debtEquity", format: (v) => (v as number).toFixed(2), better: "lower" },
  { label: "Revenue Growth", key: "revenueGrowth", format: (v) => `${(v as number).toFixed(1)}%`, better: "higher" },
  { label: "Net Margin", key: "netMargin", format: (v) => `${(v as number).toFixed(1)}%`, better: "higher" },
  { label: "Dividend Yield", key: "dividendYield", format: (v) => `${(v as number).toFixed(2)}%`, better: "higher" },
  { label: "Snowflake Score", key: "snowflakeScore", format: (v) => `${(v as number).toFixed(1)} / 5.0`, better: "higher" },
  { label: "AI Sentiment", key: "sentiment", format: (v) => String(v), better: "higher" },
];

// Metrics where we skip winner highlighting (qualitative / always equal)
const skipHighlight = new Set(["Company Name", "Sector"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWinner(
  metric: CompareMetric,
  a: StockData,
  b: StockData
): "a" | "b" | "tie" {
  if (skipHighlight.has(metric.label)) return "tie";
  const va = a[metric.key];
  const vb = b[metric.key];
  if (typeof va !== "number" || typeof vb !== "number") return "tie";
  if (va === vb) return "tie";
  if (metric.better === "higher") return va > vb ? "a" : "b";
  return va < vb ? "a" : "b";
}

function sentimentBadgeVariant(
  sentiment: string
): "success" | "danger" | "warning" | "secondary" {
  const lower = sentiment.toLowerCase();
  if (lower.includes("bullish")) return "success";
  if (lower.includes("bearish")) return "danger";
  return "secondary";
}

const insights = [
  "MSFT leads on growth fundamentals with 15.8% revenue growth vs AAPL's 8.1%, reflecting strong cloud and AI tailwinds from Azure expansion.",
  "AAPL boasts an exceptional ROE of 147.3% driven by aggressive buybacks and capital-light services revenue, though this also reflects higher leverage (D/E 1.87 vs MSFT's 0.42).",
  "Both trade at premium valuations, but MSFT's higher P/E (35.2x vs 28.5x) is supported by superior top-line growth and margin expansion trajectory.",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ComparePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Compare Stocks
        </h1>
        <p className="text-sm text-muted-foreground">
          Side-by-side fundamental comparison
        </p>
      </div>

      {/* Stock Selectors */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            defaultValue="AAPL — Apple Inc."
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            defaultValue="MSFT — Microsoft Corp."
            className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Fundamental Comparison
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {stockA.ticker}
              </Badge>
              <span className="text-xs text-muted-foreground">vs</span>
              <Badge variant="outline" className="text-[10px]">
                {stockB.ticker}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <div>Metric</div>
            <div className="text-right">{stockA.ticker}</div>
            <div className="text-right">{stockB.ticker}</div>
          </div>
          <Separator />

          {/* Table Rows */}
          <div className="divide-y divide-border/50">
            {metrics.map((metric) => {
              const winner = getWinner(metric, stockA, stockB);
              const aVal = metric.format(stockA[metric.key]);
              const bVal = metric.format(stockB[metric.key]);

              const winnerClass = "text-emerald-600 dark:text-emerald-400 font-medium";
              const defaultClass = "text-foreground";

              const isSentiment = metric.key === "sentiment";

              return (
                <div
                  key={metric.label}
                  className="grid grid-cols-[1fr_1fr_1fr] items-center gap-4 py-3 transition-colors hover:bg-muted/50 rounded-md px-1 -mx-1"
                >
                  <span className="text-sm text-muted-foreground">
                    {metric.label}
                  </span>
                  <span
                    className={`text-right text-sm tabular-nums ${
                      winner === "a" ? winnerClass : defaultClass
                    }`}
                  >
                    {isSentiment ? (
                      <Badge
                        variant={sentimentBadgeVariant(aVal)}
                        className="text-[10px]"
                      >
                        {aVal}
                      </Badge>
                    ) : (
                      aVal
                    )}
                  </span>
                  <span
                    className={`text-right text-sm tabular-nums ${
                      winner === "b" ? winnerClass : defaultClass
                    }`}
                  >
                    {isSentiment ? (
                      <Badge
                        variant={sentimentBadgeVariant(bVal)}
                        className="text-[10px]"
                      >
                        {bVal}
                      </Badge>
                    ) : (
                      bVal
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border-primary/20">
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary/60" />
            <CardTitle className="text-sm font-medium">Key Insights</CardTitle>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              AI-Generated
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Comparative analysis of {stockA.ticker} vs {stockB.ticker}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed"
              >
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Add to Comparison */}
      <div className="flex justify-center">
        <div className="group relative">
          <Button variant="outline" disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Add Third Stock to Comparison
          </Button>
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
            <Info className="mr-1 inline h-3 w-3" />
            Coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
