import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  BarChart3,
  Globe,
  Layers,
} from "lucide-react";
import {
  getProfile,
  getQuote,
  getETFHoldings,
  getETFSectorWeightings,
  getETFCountryWeightings,
} from "@/lib/api/fmp";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";

interface ETFPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function ETFPage({ params }: ETFPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  let profile, quote, holdings, sectors, countries;

  try {
    [profile, quote, holdings, sectors, countries] = await Promise.all([
      getProfile(upperTicker),
      getQuote(upperTicker),
      getETFHoldings(upperTicker),
      getETFSectorWeightings(upperTicker),
      getETFCountryWeightings(upperTicker),
    ]);
  } catch (error) {
    console.error(`Failed to fetch ETF data for ${upperTicker}:`, error);
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-down" />
            <h2 className="text-lg font-semibold text-foreground">
              Error Loading ETF
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to fetch data for {upperTicker}. Check that FMP_API_KEY is
              configured.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              ETF Not Found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No data available for ticker &quot;{upperTicker}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const etfName = profile?.companyName ?? quote.name ?? upperTicker;
  const exchange = profile?.exchange ?? "";
  const isPositive = quote.changesPercentage >= 0;

  const top20 = (holdings ?? []).slice(0, 20);
  const top20TotalWeight = top20.reduce((sum, h) => sum + h.weightPercentage, 0);

  // Parse sector weights (API returns string percentages)
  const parsedSectors = (sectors ?? [])
    .map((s) => ({
      sector: s.sector,
      weight: parseFloat(s.weightPercentage) || 0,
    }))
    .filter((s) => s.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const maxSectorWeight = parsedSectors.length > 0 ? parsedSectors[0].weight : 100;

  // Parse country weights
  const parsedCountries = (countries ?? [])
    .map((c) => ({
      country: c.country,
      weight: parseFloat(c.weightPercentage) || 0,
    }))
    .filter((c) => c.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const maxCountryWeight = parsedCountries.length > 0 ? parsedCountries[0].weight : 100;

  return (
    <div className="space-y-6">
      {/* ETF Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{etfName}</h2>
          <Badge variant="secondary" className="text-[10px]">
            ETF
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{upperTicker}</span>
          {exchange && <span>{exchange}</span>}
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {formatCurrency(quote.price)}
          </span>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositive ? "+" : ""}
            {quote.change.toFixed(2)} ({isPositive ? "+" : ""}
            {quote.changesPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">AUM</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {quote.marketCap
                ? formatCurrency(quote.marketCap, "USD", true)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Holdings
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {holdings ? formatNumber(holdings.length) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Avg Volume
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {quote.avgVolume
                ? formatNumber(quote.avgVolume, true)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              52W Range
            </p>
            <p className="mt-1 text-sm font-medium tabular-nums">
              {quote.yearLow ? formatCurrency(quote.yearLow) : "—"} –{" "}
              {quote.yearHigh ? formatCurrency(quote.yearHigh) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Top {top20.length} Holdings
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Total weight: {top20TotalWeight.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {top20.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No holdings data available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      #
                    </th>
                    <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ticker
                    </th>
                    <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Name
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Weight
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Market Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {top20.map((holding, idx) => (
                    <tr
                      key={`${holding.asset}-${idx}`}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2.5 text-xs text-muted-foreground tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5">
                        <Link
                          href={`/stock/${holding.asset}`}
                          className="font-medium tabular-nums text-primary hover:underline"
                        >
                          {holding.asset}
                        </Link>
                      </td>
                      <td className="max-w-[200px] truncate py-2.5 text-muted-foreground">
                        {holding.name}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {holding.weightPercentage.toFixed(2)}%
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {holding.marketValue
                          ? formatCurrency(holding.marketValue, "USD", true)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sector & Country Allocation side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sector Allocation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Sector Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parsedSectors.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No sector data available.
              </p>
            ) : (
              <div className="space-y-3">
                {parsedSectors.map((s) => (
                  <div key={s.sector} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">
                        {s.sector}
                      </span>
                      <span className="ml-2 shrink-0 font-medium tabular-nums">
                        {s.weight.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-primary/20">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-[width] duration-150 ease-out"
                        style={{
                          width: `${(s.weight / maxSectorWeight) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Allocation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Country Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parsedCountries.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No country data available.
              </p>
            ) : (
              <div className="space-y-3">
                {parsedCountries.map((c) => (
                  <div key={c.country} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">
                        {c.country}
                      </span>
                      <span className="ml-2 shrink-0 font-medium tabular-nums">
                        {c.weight.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-primary/20">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-[width] duration-150 ease-out"
                        style={{
                          width: `${(c.weight / maxCountryWeight) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
