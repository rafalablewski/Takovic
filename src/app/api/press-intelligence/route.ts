import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pressReleases } from "@/lib/db/schema";
import {
  getPressIntelligenceForTicker,
} from "@/lib/api/press-intelligence";
import { requireIntelligenceAuth } from "@/lib/api/intelligence-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get("ticker") || "").trim().toUpperCase();
  const mode = (searchParams.get("mode") || "db").trim().toLowerCase();
  const limitParam = Number.parseInt(searchParams.get("limit") || "100", 10);
  const limit = Math.min(Math.max(limitParam, 1), 200);

  if (!ticker) {
    return NextResponse.json({ error: "Missing ticker" }, { status: 400 });
  }

  if (mode === "refresh") {
    const unauthorized = await requireIntelligenceAuth(request);
    if (unauthorized) return unauthorized;
  }

  if (mode === "methodology") {
    let dbCount = 0;
    let minDate: string | null = null;
    let maxDate: string | null = null;
    let distinctSources = 0;
    let topSources: Array<{ source: string; count: number }> = [];
    try {
      const [dbCountRow] = await db
        .select({ n: count() })
        .from(pressReleases)
        .where(eq(pressReleases.ticker, ticker));
      dbCount = dbCountRow?.n ?? 0;

      const allRows = await db
        .select({
          source: pressReleases.source,
          publishedAt: pressReleases.publishedAt,
        })
        .from(pressReleases)
        .where(eq(pressReleases.ticker, ticker));

      if (allRows.length > 0) {
        const dates = allRows
          .map((r) => r.publishedAt)
          .filter((d): d is Date => d instanceof Date)
          .map((d) => d.toISOString());
        if (dates.length > 0) {
          dates.sort((a, b) => a.localeCompare(b));
          minDate = dates[0] ?? null;
          maxDate = dates[dates.length - 1] ?? null;
        }

        const sourceCounts = new Map<string, number>();
        for (const row of allRows) {
          sourceCounts.set(row.source, (sourceCounts.get(row.source) ?? 0) + 1);
        }
        distinctSources = sourceCounts.size;
        topSources = Array.from(sourceCounts.entries())
          .map(([source, sourceCount]) => ({ source, count: sourceCount }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }
    } catch (error) {
      console.warn("[press-intelligence] Methodology DB count skipped:", error);
    }
    return NextResponse.json({
      ticker,
      mode,
      grade: "A",
      type: "hybrid",
      sources: [
        {
          name: "QuoteMedia / AccessWire",
          type: "primary",
          enabled: false,
          detail: "Adapter scaffolded, awaiting credentials.",
        },
        {
          name: "GlobeNewswire",
          type: "secondary",
          enabled: true,
          detail: "Public feed discovery via RSS/news aggregation.",
        },
        {
          name: "Newswire filtered feed",
          type: "tertiary",
          enabled: true,
          detail:
            "Source-filtered public news feed for PR Newswire, Business Wire, AccessWire, GlobeNewswire.",
        },
      ],
      dbStats: {
        count: dbCount,
        minDate,
        maxDate,
        distinctSources,
        topSources,
      },
    });
  }

  if (mode === "refresh") {
    const fetched = await getPressIntelligenceForTicker(ticker, limit, {
      refresh: true,
    });
    const rows = fetched.items;
    return NextResponse.json({
      ticker,
      mode,
      items: rows,
      totalCount: rows.length,
      sourceStatus: fetched.sourceStatus,
      fetchedAt: new Date().toISOString(),
    });
  }

  const dbOrRefresh = await getPressIntelligenceForTicker(ticker, limit);
  const rows = dbOrRefresh.items;
  const responseMode = dbOrRefresh.sourceStatus.length > 0 ? "refresh" : "db";

  return NextResponse.json({
    ticker,
    mode: responseMode,
    items: rows,
    totalCount: rows.length,
    sourceStatus:
      dbOrRefresh.sourceStatus.length > 0 ? dbOrRefresh.sourceStatus : undefined,
    fetchedAt: new Date().toISOString(),
  });
}

