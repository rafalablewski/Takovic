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
} from "@/lib/utils";
import {
  getQuote,
  getProfile,
  getKeyMetrics,
} from "@/lib/api/fmp";
import type { FMPQuote, FMPProfile, FMPKeyMetrics } from "@/lib/api/fmp";
import {
  ArrowRightLeft,
  Sparkles,
  Plus,
  Search,
  Info,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
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
  { label: "Net Margin", key: "netMargin", format: (v) => `${(v as number).toFixed(1)}%`, better: "higher" },
  { label: "Dividend Yield", key: "dividendYield", format: (v) => `${(v as number).toFixed(2)}%`, better: "higher" },
];

const skipHighlight = new Set(["Company Name", "Sector"]);

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

function buildStockData(
  ticker: string,
  quote: FMPQuote | null,
  profile: FMPProfile | null,
  keyMetrics: FMPKeyMetrics[] | null
): StockData | null {
  if (!quote) return null;
  const km = keyMetrics?.[0];
  return {
    ticker,
    name: profile?.companyName ?? quote.name ?? ticker,
    sector: profile?.sector ?? "—",
    marketCap: quote.marketCap
      ? formatNumber(quote.marketCap, true)
      : "—",
    price: quote.price,
    peRatio: km?.peRatio ?? quote.pe ?? 0,
    pbRatio: km?.pbRatio ?? 0,
    roe: km?.roe ? km.roe * 100 : 0,
    debtEquity: km?.debtToEquity ?? 0,
    revenueGrowth: 0, // Would need income statements for this
    netMargin: km?.netProfitMargin ? km.netProfitMargin * 100 : 0,
    dividendYield: km?.dividendYield ? km.dividendYield * 100 : 0,
    snowflakeScore: 0,
    sentiment: "—",
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface ComparePageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const sp = await searchParams;
  const tickerA = (sp.a ?? "AAPL").toUpperCase();
  const tickerB = (sp.b ?? "MSFT").toUpperCase();

  let stockA: StockData | null = null;
  let stockB: StockData | null = null;

  try {
    const [quoteA, profileA, metricsA, quoteB, profileB, metricsB] =
      await Promise.all([
        getQuote(tickerA),
        getProfile(tickerA),
        getKeyMetrics(tickerA, "annual", 1),
        getQuote(tickerB),
        getProfile(tickerB),
        getKeyMetrics(tickerB, "annual", 1),
      ]);

    stockA = buildStockData(tickerA, quoteA, profileA, metricsA);
    stockB = buildStockData(tickerB, quoteB, profileB, metricsB);
  } catch {
    // Data unavailable
  }

  if (!stockA || !stockB) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Compare Stocks
          </h1>
          <p className="text-sm text-muted-foreground">
            Side-by-side fundamental comparison
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Unable to load comparison data for {tickerA} vs {tickerB}.
              Check FMP_API_KEY configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            defaultValue={`${stockA.ticker} — ${stockA.name}`}
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
            defaultValue={`${stockB.ticker} — ${stockB.name}`}
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
                    {aVal}
                  </span>
                  <span
                    className={`text-right text-sm tabular-nums ${
                      winner === "b" ? winnerClass : defaultClass
                    }`}
                  >
                    {bVal}
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
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Sparkles className="mb-3 h-6 w-6 opacity-30" />
            <p className="text-sm">AI insights require ANTHROPIC_API_KEY</p>
            <p className="mt-1 text-xs">Configure your API key to enable AI-powered comparison insights.</p>
          </div>
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
