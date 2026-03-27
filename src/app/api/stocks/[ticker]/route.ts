import { NextRequest, NextResponse } from "next/server";
import { getQuote, getProfile, getKeyMetrics } from "@/lib/api/fmp";
import { getCached, setCache, cacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    // Try cache first
    const cached = await getCached(cacheKey.quote(upperTicker));
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch fresh data in parallel
    const [quote, profile, metrics] = await Promise.all([
      getQuote(upperTicker),
      getProfile(upperTicker),
      getKeyMetrics(upperTicker, "annual", 1),
    ]);

    if (!quote) {
      return NextResponse.json(
        { error: "Stock not found" },
        { status: 404 }
      );
    }

    const data = {
      quote,
      profile,
      metrics: metrics[0] ?? null,
    };

    // Cache the response
    await setCache(cacheKey.quote(upperTicker), data, CACHE_TTL.QUOTE);

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching stock ${upperTicker}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
