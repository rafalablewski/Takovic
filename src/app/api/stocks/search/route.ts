import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/api/fmp";
import { getCached, setCache, cacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const cached = await getCached(cacheKey.search(query));
    if (cached) {
      return NextResponse.json(cached);
    }

    const results = await searchStocks(query, 10);

    await setCache(cacheKey.search(query), results, CACHE_TTL.SEARCH);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
