import { NextResponse } from "next/server";
import { getQuote } from "@/lib/api/yahoo";
import { getCached, setCache, cacheKey, CACHE_TTL } from "@/lib/cache";
import { isCovered } from "@/data/coverage/registry";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import type { LiveQuotesPayload } from "@/types/coverage";

/** Yahoo Finance symbol for spot ETH/USD (used for ETH treasury coverage context). */
const ETH_SPOT_SYMBOL = "ETH-USD";

export async function GET(
  request: Request,
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

  const url = new URL(request.url);
  const bustCache = url.searchParams.get("refresh") === "1";
  const side = url.searchParams.get("side");

  const key = cacheKey.coverageLiveQuotes(upper);

  if (!bustCache) {
    try {
      const cached = await getCached<LiveQuotesPayload>(key);
      if (cached) {
        return NextResponse.json(cached);
      }
    } catch {
      /* Redis optional in dev — continue uncached */
    }
  }

  const includeEthSpot = isEthTreasury(upper);

  const fetchStock = () => getQuote(upper).catch(() => null);
  const fetchEth = () =>
    includeEthSpot ? getQuote(ETH_SPOT_SYMBOL).catch(() => null) : Promise.resolve(null);

  let stockQuote: Awaited<ReturnType<typeof getQuote>>;
  let ethQuote: Awaited<ReturnType<typeof fetchEth>>;

  if (!bustCache || !side) {
    [stockQuote, ethQuote] = await Promise.all([fetchStock(), fetchEth()]);
  } else if (side === "stock") {
    stockQuote = await fetchStock();
    try {
      const cached = await getCached<LiveQuotesPayload>(key);
      ethQuote = cached?.eth ?? (await fetchEth());
    } catch {
      ethQuote = await fetchEth();
    }
  } else if (side === "eth") {
    ethQuote = await fetchEth();
    try {
      const cached = await getCached<LiveQuotesPayload>(key);
      stockQuote = cached?.stock ?? (await fetchStock());
    } catch {
      stockQuote = await fetchStock();
    }
  } else {
    [stockQuote, ethQuote] = await Promise.all([fetchStock(), fetchEth()]);
  }

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
