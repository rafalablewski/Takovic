import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "./index";
import { marketEquities } from "./schema";

export type MarketEquityRow = typeof marketEquities.$inferSelect;

export interface MarketEquitySearchFilters {
  search?: string;
  sector?: string;
  /** US | CA | EU — omit or "all" for every region */
  region?: string;
  marketCapMin?: string;
  marketCapMax?: string;
  peMin?: string;
  peMax?: string;
  roeMin?: string;
  dividendMin?: string;
  minScore?: string;
}

function buildWhere(filters: MarketEquitySearchFilters) {
  const conditions = [];

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim().replace(/%/g, "\\%")}%`;
    conditions.push(
      or(
        ilike(marketEquities.symbol, term),
        ilike(marketEquities.name, term)
      )
    );
  }

  if (filters.sector && filters.sector !== "All Sectors") {
    conditions.push(eq(marketEquities.sector, filters.sector));
  }

  if (
    filters.region &&
    filters.region !== "all" &&
    filters.region !== "All Regions"
  ) {
    conditions.push(eq(marketEquities.region, filters.region));
  }

  if (filters.marketCapMin !== undefined) {
    conditions.push(
      gte(marketEquities.marketCap, filters.marketCapMin)
    );
  }
  if (filters.marketCapMax !== undefined) {
    conditions.push(
      lte(marketEquities.marketCap, filters.marketCapMax)
    );
  }

  if (filters.peMin?.trim()) {
    conditions.push(gte(marketEquities.peRatio, filters.peMin));
  }
  if (filters.peMax?.trim()) {
    conditions.push(lte(marketEquities.peRatio, filters.peMax));
  }

  if (filters.roeMin?.trim()) {
    conditions.push(gte(marketEquities.roe, filters.roeMin));
  }

  if (filters.dividendMin?.trim()) {
    conditions.push(
      gte(marketEquities.dividendYield, filters.dividendMin)
    );
  }

  if (filters.minScore?.trim()) {
    conditions.push(
      gte(marketEquities.compositeScore, filters.minScore)
    );
  }

  return conditions.length ? and(...conditions) : undefined;
}

export async function searchMarketEquities(
  filters: MarketEquitySearchFilters,
  page: number,
  pageSize: number
): Promise<{ rows: MarketEquityRow[]; total: number }> {
  const where = buildWhere(filters);
  const offset = Math.max(0, (page - 1) * pageSize);

  const [countRow] = await db
    .select({ c: count() })
    .from(marketEquities)
    .where(where);

  const total = Number(countRow?.c ?? 0);

  const rows = await db
    .select()
    .from(marketEquities)
    .where(where)
    .orderBy(
      desc(sql`coalesce(${marketEquities.volume}::numeric, 0)`),
      asc(marketEquities.symbol)
    )
    .limit(pageSize)
    .offset(offset);

  return { rows, total };
}

/** Trending = highest volume in seed data */
export async function getTrendingMarketEquities(
  limit: number
): Promise<MarketEquityRow[]> {
  return db
    .select()
    .from(marketEquities)
    .orderBy(
      desc(sql`coalesce(${marketEquities.volume}::numeric, 0)`),
      asc(marketEquities.symbol)
    )
    .limit(limit);
}

/**
 * One row per ticker: prefer US listing, then most recently updated.
 */
export async function getMarketEquitiesBySymbols(
  symbols: string[]
): Promise<MarketEquityRow[]> {
  if (symbols.length === 0) return [];
  const upper = [...new Set(symbols.map((s) => s.trim().toUpperCase()))];
  const rows = await db
    .select()
    .from(marketEquities)
    .where(inArray(marketEquities.symbol, upper))
    .orderBy(
      sql`CASE WHEN ${marketEquities.region} = 'US' THEN 0 WHEN ${marketEquities.region} = 'CA' THEN 1 ELSE 2 END`,
      desc(marketEquities.updatedAt)
    );

  const bySymbol = new Map<string, MarketEquityRow>();
  for (const r of rows) {
    if (!bySymbol.has(r.symbol)) {
      bySymbol.set(r.symbol, r);
    }
  }
  return upper
    .map((s) => bySymbol.get(s))
    .filter((r): r is MarketEquityRow => r !== undefined);
}
