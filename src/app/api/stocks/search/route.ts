import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/api/fmp";
import { getCached, setCache, cacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  // Try cache first, but don't let cache failure block the request
  try {
    const cached = await getCached(cacheKey.search(query));
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (cacheError) {
    console.warn("Cache read failed, falling through to FMP:", cacheError);
  }

  // Fetch from FMP
  try {
    const results = await searchStocks(query, 10);

    // Best-effort cache write — don't let it fail the response
    setCache(cacheKey.search(query), results, CACHE_TTL.SEARCH).catch(
      (err) => console.warn("Cache write failed:", err)
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    // Return empty array instead of 500 so the UI can still show
    // the "press Enter to add directly" fallback
    return NextResponse.json([]);
  }
}
