import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/api/fmp";
import type { FMPQuote } from "@/lib/api/fmp";

/** Maximum tickers allowed per batch request */
const MAX_TICKERS = 20;

export async function GET(request: NextRequest) {
  const tickersParam = request.nextUrl.searchParams.get("tickers");

  if (!tickersParam) {
    return NextResponse.json(
      { error: "Missing 'tickers' query parameter" },
      { status: 400 }
    );
  }

  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json({ quotes: {} });
  }

  if (tickers.length > MAX_TICKERS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_TICKERS} tickers per request` },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.allSettled(
      tickers.map((ticker) => getQuote(ticker))
    );

    const quotes: Record<string, FMPQuote> = {};
    for (let i = 0; i < tickers.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled" && result.value) {
        quotes[tickers[i]] = result.value;
      }
    }

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Batch quote error:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch quotes" },
      { status: 500 }
    );
  }
}
