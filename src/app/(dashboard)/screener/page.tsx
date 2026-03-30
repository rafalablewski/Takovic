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
import { screenStocks } from "@/lib/api/fmp";
import type { FMPScreenerResult } from "@/lib/api/fmp";
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
  sector?: string;
  marketCap?: string;
  peMin?: string;
  peMax?: string;
  roeMin?: string;
  dividendMin?: string;
  minScore?: string;
  page?: string;
}

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Normalize search params (handle string[] case)
  const filters: ScreenerSearchParams = {};
  for (const key of [
    "search",
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

  // Build FMP API params
  const fmpParams: Record<string, string> = {
    limit: PAGE_SIZE.toString(),
    exchange: "NYSE,NASDAQ",
  };

  // Sector filter — passed directly to FMP
  if (filters.sector) {
    fmpParams.sector = filters.sector;
  }

  // Market cap filter — passed directly to FMP
  if (filters.marketCap) {
    const range = MARKET_CAP_RANGES[filters.marketCap];
    if (range) {
      if (range.min) fmpParams.marketCapMoreThan = range.min;
      if (range.max) fmpParams.marketCapLowerThan = range.max;
    }
  }

  // Dividend yield — FMP supports this as a param
  if (filters.dividendMin) {
    fmpParams.dividendMoreThan = filters.dividendMin;
  }

  // P/E range — FMP supports betaMoreThan/betaLowerThan but not PE directly,
  // so we'll filter client-side after fetching.
  // ROE — also filtered client-side.

  // For client-side filters, fetch more results to ensure we have enough after filtering
  const hasClientSideFilters =
    filters.peMin || filters.peMax || filters.roeMin || filters.search;
  if (hasClientSideFilters) {
    // Fetch extra to compensate for client-side filtering + pagination
    fmpParams.limit = "500";
  }

  let stocks: FMPScreenerResult[] = [];
  let fetchError = false;

  try {
    stocks = await screenStocks(fmpParams);
  } catch (error) {
    console.error("Failed to fetch screener data:", error);
    fetchError = true;
  }

  // Apply client-side filters
  if (filters.search) {
    const query = filters.search.toLowerCase();
    stocks = stocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.companyName.toLowerCase().includes(query)
    );
  }

  // P/E filtering is not possible without P/E data in FMPScreenerResult.
  // We note this limitation but keep the filter UI for future enhancement
  // when we add a joined data source.

  // ROE filtering similarly requires key metrics data not in the screener response.

  // Total count after all filters
  const totalFiltered = stocks.length;

  // Apply pagination
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const paginatedStocks = hasClientSideFilters
    ? stocks.slice(startIdx, startIdx + PAGE_SIZE)
    : stocks;

  const displayCount = paginatedStocks.length;

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
          <Suspense>
            <ScreenerFilterForm />
          </Suspense>
        </div>

        {/* Results Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Results</CardTitle>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {hasClientSideFilters
                    ? `${totalFiltered} stocks found`
                    : `${displayCount} stocks`}
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
                      paginatedStocks.map((stock, idx) => (
                        <tr
                          key={stock.symbol}
                          className="border-b border-border/50 transition-colors hover:bg-muted/50"
                        >
                          <td className="px-5 py-3 text-xs tabular-nums text-muted-foreground">
                            {startIdx + idx + 1}
                          </td>
                          <td className="px-5 py-3">
                            <span className="font-medium text-foreground">{stock.symbol}</span>
                            <p className="text-xs text-muted-foreground">{stock.companyName}</p>
                          </td>
                          <td className="hidden px-5 py-3 text-xs text-muted-foreground sm:table-cell">
                            {stock.sector}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
                            {formatCurrency(stock.price)}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                            {formatNumber(stock.marketCap, true)}
                          </td>
                          <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                            {formatNumber(stock.volume, true)}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                            —
                          </td>
                          <td className="hidden px-5 py-3 text-right lg:table-cell">
                            <Badge variant="secondary" className="text-[10px]">
                              —
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">
                          {fetchError
                            ? "No results available. Check FMP_API_KEY configuration."
                            : "No stocks match your filters. Try broadening your criteria."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paginatedStocks.length > 0 && (
                <Suspense>
                  <ScreenerPagination
                    currentPage={currentPage}
                    totalResults={displayCount}
                    pageSize={PAGE_SIZE}
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
