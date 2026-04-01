import { NextRequest, NextResponse } from "next/server";
import {
  getQuote,
  getProfile,
  getKeyMetrics,
  getIncomeStatement,
  getBalanceSheet,
  getStockNews,
} from "@/lib/api/yahoo";
import { calculateSnowflakeScores } from "@/lib/analysis/scores";
import { generateStockSummary } from "@/lib/ai/claude";
import { getCached, setCache, cacheKey, CACHE_TTL } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    // Check cache for AI summary
    const cached = await getCached(cacheKey.aiSummary(upperTicker));
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch all required data in parallel
    const [profile, metrics, incomeStatements, balanceSheets, news] =
      await Promise.all([
        getProfile(upperTicker),
        getKeyMetrics(upperTicker, "annual", 1),
        getIncomeStatement(upperTicker, "annual", 5),
        getBalanceSheet(upperTicker, "annual", 1),
        getStockNews(upperTicker, 5),
      ]);

    if (!profile || !metrics[0] || !balanceSheets[0]) {
      return NextResponse.json(
        { error: "Insufficient data for analysis" },
        { status: 404 }
      );
    }

    // Calculate snowflake scores
    const scores = calculateSnowflakeScores({
      metrics: metrics[0],
      incomeStatements,
      balanceSheet: balanceSheets[0],
    });

    // Generate AI summary
    const aiAnalysis = await generateStockSummary(
      upperTicker,
      profile.companyName,
      {
        sector: profile.sector,
        marketCap: profile.mktCap,
        peRatio: metrics[0].peRatio,
        roe: metrics[0].roe,
        revenueGrowth: null, // TODO: calculate from income statements
        debtToEquity: metrics[0].debtToEquity,
        dividendYield: metrics[0].dividendYield,
        recentNews: news.map((n) => n.title),
      }
    );

    const analysis = {
      ticker: upperTicker,
      scores,
      ...aiAnalysis,
      generatedAt: new Date().toISOString(),
    };

    // Cache for 7 days
    await setCache(
      cacheKey.aiSummary(upperTicker),
      analysis,
      CACHE_TTL.AI_SUMMARY
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error(`Analysis error for ${upperTicker}:`, error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
