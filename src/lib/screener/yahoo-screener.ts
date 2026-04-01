/**
 * Yahoo Finance-backed screener.
 *
 * Replaces the CSV-seeded database approach. Uses Yahoo Finance's predefined
 * screener modules and batch quote API to provide real-time stock screening.
 */

import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

// ---------------------------------------------------------------------------
// Types (kept compatible with the old MarketEquityRow)
// ---------------------------------------------------------------------------

export interface MarketEquityRow {
  id: string;
  symbol: string;
  name: string | null;
  exchange: string;
  country: string;
  region: string;
  currency: string;
  sector: string | null;
  industry: string | null;
  price: string | null;
  changePct: string | null;
  volume: string | null;
  marketCap: string | null;
  peRatio: string | null;
  roe: string | null;
  dividendYield: string | null;
  compositeScore: string | null;
  updatedAt: Date | null;
}

export interface MarketEquitySearchFilters {
  search?: string;
  sector?: string;
  region?: string;
  marketCapMin?: string;
  marketCapMax?: string;
  peMin?: string;
  peMax?: string;
  roeMin?: string;
  dividendMin?: string;
  minScore?: string;
}

// ---------------------------------------------------------------------------
// Predefined screener → category mapping
// ---------------------------------------------------------------------------

type YahooScreenerId =
  | "most_actives"
  | "day_gainers"
  | "day_losers"
  | "undervalued_large_caps"
  | "growth_technology_stocks"
  | "aggressive_small_caps"
  | "small_cap_gainers"
  | "portfolio_anchors"
  | "undervalued_growth_stocks";

/**
 * Pick the best Yahoo predefined screener based on the user's filters.
 * Falls back to "most_actives" when no filter narrows the category.
 */
function pickScreenerId(filters: MarketEquitySearchFilters): YahooScreenerId {
  const mcMin = filters.marketCapMin ? Number(filters.marketCapMin) : 0;
  const mcMax = filters.marketCapMax ? Number(filters.marketCapMax) : Infinity;
  const sector = filters.sector?.toLowerCase() ?? "";

  // Small cap filters
  if (mcMax <= 2_000_000_000) return "aggressive_small_caps";
  // Large / mega cap value
  if (mcMin >= 10_000_000_000 && !sector) return "undervalued_large_caps";
  // Technology sector
  if (sector.includes("technology")) return "growth_technology_stocks";
  // Default
  return "most_actives";
}

// ---------------------------------------------------------------------------
// Convert Yahoo quote to MarketEquityRow
// ---------------------------------------------------------------------------

function quoteToRow(q: any): MarketEquityRow {
  const symbol = q.symbol ?? "";
  const exchange = q.exchange ?? q.fullExchangeName ?? "";
  const country = exchangeToCountry(exchange);
  return {
    id: symbol,
    symbol,
    name: q.shortName ?? q.longName ?? null,
    exchange,
    country,
    region: countryToRegion(country),
    currency: q.currency ?? "USD",
    sector: q.sector ?? null,
    industry: q.industry ?? null,
    price: q.regularMarketPrice?.toString() ?? null,
    changePct: q.regularMarketChangePercent?.toString() ?? null,
    volume: q.regularMarketVolume?.toString() ?? null,
    marketCap: q.marketCap?.toString() ?? null,
    peRatio: q.trailingPE?.toString() ?? null,
    roe: null, // Yahoo screener doesn't return ROE directly
    dividendYield: q.dividendYield?.toString() ?? (q.trailingAnnualDividendYield ? (q.trailingAnnualDividendYield * 100).toString() : null),
    compositeScore: null,
    updatedAt: new Date(),
  };
}

function exchangeToCountry(exchange: string): string {
  const e = exchange.toUpperCase();
  if (e.includes("TSX") || e.includes("TORONTO")) return "CA";
  if (e.includes("LSE") || e.includes("LONDON")) return "GB";
  if (e.includes("XETR") || e.includes("FRANKFURT")) return "DE";
  if (e.includes("EPA") || e.includes("PARIS")) return "FR";
  if (e.includes("AMS") || e.includes("AMSTERDAM")) return "NL";
  return "US";
}

function countryToRegion(country: string): string {
  if (country === "US") return "US";
  if (country === "CA") return "CA";
  return "EU";
}

// ---------------------------------------------------------------------------
// Client-side filtering (post-fetch)
// ---------------------------------------------------------------------------

function applyFilters(rows: MarketEquityRow[], filters: MarketEquitySearchFilters): MarketEquityRow[] {
  return rows.filter((r) => {
    // Text search
    if (filters.search?.trim()) {
      const term = filters.search.trim().toLowerCase();
      const matchesSymbol = r.symbol.toLowerCase().includes(term);
      const matchesName = r.name?.toLowerCase().includes(term);
      if (!matchesSymbol && !matchesName) return false;
    }

    // Sector
    if (filters.sector && filters.sector !== "All Sectors") {
      if (r.sector !== filters.sector) return false;
    }

    // Region
    if (filters.region && filters.region !== "all" && filters.region !== "All Regions") {
      if (r.region !== filters.region) return false;
    }

    // Market cap
    if (filters.marketCapMin) {
      const mc = Number(r.marketCap ?? 0);
      if (mc < Number(filters.marketCapMin)) return false;
    }
    if (filters.marketCapMax) {
      const mc = Number(r.marketCap ?? 0);
      if (mc > Number(filters.marketCapMax)) return false;
    }

    // P/E
    if (filters.peMin?.trim()) {
      const pe = Number(r.peRatio ?? 0);
      if (pe < Number(filters.peMin)) return false;
    }
    if (filters.peMax?.trim()) {
      const pe = Number(r.peRatio ?? 0);
      if (pe > Number(filters.peMax)) return false;
    }

    // Dividend yield
    if (filters.dividendMin?.trim()) {
      const dy = Number(r.dividendYield ?? 0);
      if (dy < Number(filters.dividendMin)) return false;
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Main screener function
// ---------------------------------------------------------------------------

export async function searchMarketEquities(
  filters: MarketEquitySearchFilters,
  page: number,
  pageSize: number
): Promise<{ rows: MarketEquityRow[]; total: number }> {
  try {
    // If searching by name/ticker specifically, use Yahoo search + quote
    if (filters.search?.trim() && filters.search.trim().length >= 2) {
      return await searchByQuery(filters, page, pageSize);
    }

    // Use predefined screener
    const scrId = pickScreenerId(filters);
    const result = await yf.screener({ scrIds: scrId, count: 250 });
    const quotes: any[] = (result as any)?.quotes ?? [];
    let rows = quotes.map(quoteToRow);

    // Apply client-side filters
    rows = applyFilters(rows, filters);

    // Sort by volume descending
    rows.sort((a, b) => Number(b.volume ?? 0) - Number(a.volume ?? 0));

    const total = rows.length;
    const offset = (page - 1) * pageSize;
    return { rows: rows.slice(offset, offset + pageSize), total };
  } catch (err) {
    console.error("Yahoo screener error:", err);
    return { rows: [], total: 0 };
  }
}

async function searchByQuery(
  filters: MarketEquitySearchFilters,
  page: number,
  pageSize: number
): Promise<{ rows: MarketEquityRow[]; total: number }> {
  const query = filters.search!.trim();
  const searchResults = await yf.search(query, { quotesCount: 20 });
  const symbols = (searchResults.quotes ?? [])
    .filter((q: any) => q.symbol && q.quoteType !== "OPTION" && q.quoteType !== "FUTURE")
    .map((q: any) => q.symbol)
    .slice(0, 20);

  if (symbols.length === 0) return { rows: [], total: 0 };

  // Get full quote data for all results
  const quotes = await yf.quote(symbols, { return: "array" });
  const arr = Array.isArray(quotes) ? quotes : [quotes];
  let rows = arr.filter(Boolean).map(quoteToRow);

  // Apply remaining filters
  rows = applyFilters(rows, { ...filters, search: undefined }); // don't re-apply text search

  const total = rows.length;
  const offset = (page - 1) * pageSize;
  return { rows: rows.slice(offset, offset + pageSize), total };
}

// ---------------------------------------------------------------------------
// Trending (for dashboard / lookup)
// ---------------------------------------------------------------------------

export async function getTrendingMarketEquities(limit: number): Promise<MarketEquityRow[]> {
  try {
    const result = await yf.screener({ scrIds: "most_actives", count: limit });
    const quotes: any[] = (result as any)?.quotes ?? [];
    return quotes.slice(0, limit).map(quoteToRow);
  } catch (err) {
    console.error("Yahoo trending error:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// By symbols (for watchlist enrichment)
// ---------------------------------------------------------------------------

export async function getMarketEquitiesBySymbols(symbols: string[]): Promise<MarketEquityRow[]> {
  if (symbols.length === 0) return [];
  try {
    const quotes = await yf.quote(symbols, { return: "array" });
    const arr = Array.isArray(quotes) ? quotes : [quotes];
    return arr.filter(Boolean).map(quoteToRow);
  } catch (err) {
    console.error("Yahoo batch quote error:", err);
    return [];
  }
}
