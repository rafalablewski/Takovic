import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  getSectorPerformance,
  getStockMarketGainers,
  getStockMarketLosers,
  getStockMarketActives,
  getQuote,
  fmpMoverSymbol,
  type FMPSectorPerformance,
  type FMPMoverQuote,
  type FMPQuote,
} from "@/lib/api/yahoo";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface IndexQuote {
  ticker: string;
  label: string;
  quote: FMPQuote | null;
}

const INDEX_CONFIG: { ticker: string; label: string }[] = [
  { ticker: "SPY", label: "S&P 500" },
  { ticker: "QQQ", label: "Nasdaq 100" },
  { ticker: "DIA", label: "Dow Jones" },
  { ticker: "IWM", label: "Russell 2000" },
];

export default async function MarketsPage() {
  let sectors: FMPSectorPerformance[] = [];
  let gainers: FMPMoverQuote[] = [];
  let losers: FMPMoverQuote[] = [];
  let actives: FMPMoverQuote[] = [];
  let indices: IndexQuote[] = [];
  let fetchError: string | null = null;

  try {
    const [sectorsData, gainersData, losersData, activesData, ...indexQuotes] =
      await Promise.all([
        getSectorPerformance(),
        getStockMarketGainers(),
        getStockMarketLosers(),
        getStockMarketActives(),
        ...INDEX_CONFIG.map((idx) => getQuote(idx.ticker)),
      ]);

    sectors = sectorsData;
    gainers = gainersData;
    losers = losersData;
    actives = activesData;
    indices = INDEX_CONFIG.map((cfg, i) => ({
      ...cfg,
      quote: indexQuotes[i] as FMPQuote | null,
    }));
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to fetch market data";
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Markets</h2>
          <p className="text-sm text-muted-foreground">
            Broad market overview, sector performance, and top movers.
          </p>
        </div>
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium">Unable to load market data</p>
              <p className="text-xs text-muted-foreground">{fetchError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort sectors by performance descending
  const sortedSectors = [...sectors].sort((a, b) => {
    const aVal = parseFloat(a.changesPercentage);
    const bVal = parseFloat(b.changesPercentage);
    return bVal - aVal;
  });

  // Find the max absolute sector change for bar scaling
  const maxAbsSectorChange = Math.max(
    ...sortedSectors.map((s) => Math.abs(parseFloat(s.changesPercentage))),
    0.01
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Markets</h2>
        <p className="text-sm text-muted-foreground">
          Broad market overview, sector performance, and top movers.
        </p>
      </div>

      {/* Major Indices Strip */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {indices.map((idx) => {
          if (!idx.quote) return null;
          const isUp = idx.quote.changesPercentage >= 0;
          return (
            <Card key={idx.ticker}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {idx.label}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatCurrency(idx.quote.price)}
                    </p>
                  </div>
                  <div className={`text-right ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    <div className="flex items-center justify-end gap-1">
                      {isUp ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPercent(idx.quote.changesPercentage)}
                      </span>
                    </div>
                    <p className="text-xs tabular-nums">
                      {isUp ? "+" : ""}
                      {idx.quote.change.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sector Performance */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              Sector Performance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedSectors.map((sector) => {
              const pct = parseFloat(sector.changesPercentage);
              const isUp = pct >= 0;
              const barWidth = Math.max(
                (Math.abs(pct) / maxAbsSectorChange) * 100,
                2
              );
              return (
                <div key={sector.sector} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 truncate text-xs font-medium">
                    {sector.sector}
                  </span>
                  <div className="relative flex-1 h-5 rounded bg-muted/50">
                    <div
                      className={`absolute inset-y-0 rounded ${
                        isUp
                          ? "bg-emerald-500/20 dark:bg-emerald-500/30 left-1/2"
                          : "bg-red-500/20 dark:bg-red-500/30 right-1/2"
                      }`}
                      style={{
                        width: `${barWidth / 2}%`,
                      }}
                    />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                  </div>
                  <span
                    className={`w-16 shrink-0 text-right text-xs font-semibold tabular-nums ${
                      isUp
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatPercent(pct)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Market Movers Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Gainers */}
        <MoverCard
          title="Top Gainers"
          icon={<TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          items={gainers.slice(0, 10)}
          colorClass="text-emerald-600 dark:text-emerald-400"
        />

        {/* Top Losers */}
        <MoverCard
          title="Top Losers"
          icon={<TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
          items={losers.slice(0, 10)}
          colorClass="text-red-600 dark:text-red-400"
        />

        {/* Most Active */}
        <MoverCard
          title="Most Active"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          items={actives.slice(0, 10)}
        />
      </div>
    </div>
  );
}

function MoverCard({
  title,
  icon,
  items,
  colorClass,
}: {
  title: string;
  icon: React.ReactNode;
  items: FMPMoverQuote[];
  colorClass?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No data available.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Symbol
                </th>
                <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Price
                </th>
                <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, i) => {
                const symbol = fmpMoverSymbol(item);
                const isUp = item.changesPercentage >= 0;
                return (
                  <tr key={`${symbol}-${i}`} className="hover:bg-muted/50">
                    <td className="py-1.5">
                      <Link
                        href={`/stock/${symbol}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {symbol}
                      </Link>
                      <p className="max-w-[140px] truncate text-[11px] text-muted-foreground">
                        {item.companyName}
                      </p>
                    </td>
                    <td className="py-1.5 text-right text-xs tabular-nums">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-1.5 text-right">
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          colorClass ??
                          (isUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400")
                        }`}
                      >
                        {formatPercent(item.changesPercentage)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
