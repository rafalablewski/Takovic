import { NextResponse } from "next/server";
import { getQuote } from "@/lib/api/yahoo";
import { getCached, setCache, cacheKey, CACHE_TTL } from "@/lib/cache";
import { isCovered } from "@/data/coverage/registry";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";

/** Yahoo Finance symbol for spot ETH/USD (used for ETH treasury coverage context). */
const ETH_SPOT_SYMBOL = "ETH-USD";

export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await context.params;
  const upper = ticker.toUpperCase();

  if (!isCovered(upper)) {
    return NextResponse.json(
      { error: "Ticker not in coverage registry" },
      { status: 404 }
    );
  }

  const key = cacheKey.coverageLiveQuotes(upper);
  try {
    const cached = await getCached<LiveQuotesPayload>(key);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch {
    /* Redis optional in dev — continue uncached */
  }

  const stockQuote = await getQuote(upper);
  const ethQuote = isEthTreasury(upper)
    ? await getQuote(ETH_SPOT_SYMBOL)
    : null;

  const includeEthSpot = isEthTreasury(upper);

  const payload: LiveQuotesPayload = {
    stock: stockQuote,
    eth: ethQuote,
    ethSymbol: ETH_SPOT_SYMBOL,
    includeEthSpot,
    updatedAt: Date.now(),
  };

  try {
    await setCache(key, payload, CACHE_TTL.QUOTE);
  } catch {
    /* ignore cache write failures */
  }

  return NextResponse.json(payload);
}

export type LiveQuotesPayload = {
  stock: Awaited<ReturnType<typeof getQuote>>;
  eth: Awaited<ReturnType<typeof getQuote>>;
  ethSymbol: string;
  /** When true, UI should show an Ethereum spot column (may be null if fetch failed). */
  includeEthSpot: boolean;
  updatedAt: number;
};
