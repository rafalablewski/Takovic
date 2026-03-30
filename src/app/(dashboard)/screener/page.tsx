import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { MarketEquityRow } from "@/lib/db/market-equities";
import { searchMarketEquities } from "@/lib/db/market-equities";
import { Download } from "lucide-react";
import { ScreenerFilterForm } from "@/components/screener/filter-form";
import { ScreenerPagination } from "@/components/screener/pagination";

/** Number of results per page */
const PAGE_SIZE = 20;

/** Market cap range boundaries in dollars */
const MARKET_CAP_RANGES: Record<string, { min?: string; max?: string }> = {
  mega: { min: "200000000000" },
  large: { min: "10000000000", max: "200000000000" },
  mid: { min: "2000000000", max: "10000000000" },
  small: { max: "2000000000" },
};

interface ScreenerSearchParams {
  search?: string;
  region?: string;
  sector?: string;
  marketCap?: string;
  peMin?: string;
  peMax?: string;
  roeMin?: string;
  dividendMin?: string;
  minScore?: string;
  page?: string;
}

function num(v: string | null): number {
  if (v === null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function scoreLabel(row: MarketEquityRow): string {
  const s = row.compositeScore;
  if (s === null || s === "") return "—";
  const n = Number(s);
  return Number.isFinite(n) ? n.toFixed(1) : "—";
}

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters: ScreenerSearchParams = {};
  for (const key of [
    "search",
    "region",
    "sector",
    "marketCap",
    "peMin",
    "peMax",
    "roeMin",
    "dividendMin",
    "minScore",
    "page",
  ] as const) {
    const val = params[key];
    if (typeof val === "string") filters[key] = val;
    else if (Array.isArray(val) && val.length > 0) filters[key] = val[0];
  }

  const currentPage = Math.max(1, parseInt(filters.page ?? "1", 10) || 1);

  const queryFilters: Parameters<typeof searchMarketEquities>[0] = {
    search: filters.search,
    sector: filters.sector,
    region: filters.region,
    peMin: filters.peMin,
    peMax: filters.peMax,
    roeMin: filters.roeMin,
    dividendMin: filters.dividendMin,
    minScore: filters.minScore,
  };

  if (filters.marketCap) {
    const range = MARKET_CAP_RANGES[filters.marketCap];
    if (range) {
      queryFilters.marketCapMin = range.min;
      queryFilters.marketCapMax = range.max;
    }
  }

  let paginatedStocks: MarketEquityRow[] = [];
  let totalMatching = 0;
  let fetchError = false;

  try {
    const { rows, total } = await searchMarketEquities(
      queryFilters,
      currentPage,
      PAGE_SIZE
    );
    paginatedStocks = rows;
    totalMatching = total;
  } catch (error) {
    console.error("Failed to fetch screener data:", error);
    fetchError = true;
  }

  const startIdx = (currentPage - 1) * PAGE_SIZE;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Stock Screener</h1>
          <p className="text-sm text-muted-foreground">
            Filter CSV-seeded listings (US, Canada, Europe). Update data in{" "}
            <span className="font-mono text-xs">data/market-equities/universe.csv</span>{" "}
            and run <span className="font-mono text-xs">npm run db:seed:market-equities</span>.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Suspense>
            <ScreenerFilterForm />
          </Suspense>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Results</CardTitle>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {totalMatching} stocks match
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
                      <th className="hidden px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                        Exch
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Price
                      </th>
                      <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Mkt Cap
                      </th>
                      <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                        Volume
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
                    {paginatedStocks.length > 0 ? (
                      paginatedStocks.map((stock, idx) => {
                        const change = num(stock.changePct);
                        const positive = change >= 0;
                        return (
                          <tr
                            key={`${stock.symbol}-${stock.exchange}`}
                            className="border-b border-border/50 transition-colors hover:bg-muted/50"
                          >
                            <td className="px-5 py-3 text-xs tabular-nums text-muted-foreground">
                              {startIdx + idx + 1}
                            </td>
                            <td className="px-5 py-3">
                              <span className="font-medium text-foreground">
                                {stock.symbol}
                              </span>
                              <p className="text-xs text-muted-foreground">{stock.name}</p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {stock.region} · {stock.country}
                              </p>
                            </td>
                            <td className="hidden px-5 py-3 text-xs text-muted-foreground sm:table-cell">
                              {stock.sector ?? "—"}
                            </td>
                            <td className="hidden px-5 py-3 text-xs text-muted-foreground md:table-cell">
                              {stock.exchange}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
                              {formatCurrency(num(stock.price), stock.currency)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                              {formatNumber(num(stock.marketCap), true)}
                            </td>
                            <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                              {formatNumber(num(stock.volume), true)}
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                              {scoreLabel(stock)}
                            </td>
                            <td className="hidden px-5 py-3 text-right lg:table-cell">
                              <Badge variant="secondary" className="text-[10px]">
                                {stock.changePct === null || stock.changePct === ""
                                  ? "—"
                                  : positive
                                    ? "Up"
                                    : "Down"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-8 text-center text-sm text-muted-foreground"
                        >
                          {fetchError
                            ? "Could not load screener data. Check DATABASE_URL and that migration 0001_market_equities.sql has been applied."
                            : totalMatching === 0
                              ? "No rows in market_equities yet. Run npm run db:seed:market-equities (see data/market-equities/README.md)."
                              : "No stocks match your filters. Try broadening your criteria."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {paginatedStocks.length > 0 && (
                <Suspense>
                  <ScreenerPagination
                    currentPage={currentPage}
                    pageRowCount={paginatedStocks.length}
                    pageSize={PAGE_SIZE}
                    totalMatching={totalMatching}
                  />
                </Suspense>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
