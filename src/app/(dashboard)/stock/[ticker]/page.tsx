import { Suspense } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/utils";
import {
  getQuote,
  getProfile,
  getKeyMetrics,
  getIncomeStatement,
  getBalanceSheet,
  getStockNews,
} from "@/lib/api/fmp";
import { calculateSnowflakeScores } from "@/lib/analysis/scores";
import { StockDetailClient } from "@/components/research/stock-detail-client";
import type { FMPKeyMetrics } from "@/lib/api/fmp";

interface StockPageProps {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<{ tab?: string; period?: string }>;
}

export default async function StockPage({
  params,
  searchParams,
}: StockPageProps) {
  const { ticker } = await params;
  const { period: periodParam } = await searchParams;
  const financialPeriod =
    periodParam === "quarter" ? ("quarter" as const) : ("annual" as const);

  const upperTicker = ticker.toUpperCase();

  let quote,
    profile,
    metrics,
    incomeStatements,
    balanceSheets,
    news;

  try {
    [quote, profile, metrics, incomeStatements, balanceSheets, news] =
      await Promise.all([
        getQuote(upperTicker),
        getProfile(upperTicker),
        getKeyMetrics(upperTicker, "annual", 1),
        getIncomeStatement(upperTicker, financialPeriod, 12),
        getBalanceSheet(upperTicker, "annual", 1),
        getStockNews(upperTicker, 20),
      ]);
  } catch (error) {
    console.error(`Failed to fetch stock data for ${upperTicker}:`, error);
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-down" />
            <h2 className="text-lg font-semibold text-foreground">
              Error Loading Stock
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to fetch data for {upperTicker}. Check that FMP_API_KEY is
              configured.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Stock Not Found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No data available for ticker &quot;{upperTicker}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestMetrics: FMPKeyMetrics | null = metrics?.[0] ?? null;
  const latestBalanceSheet = balanceSheets?.[0] ?? null;
  const annualForScores = await getIncomeStatement(upperTicker, "annual", 5);

  let snowflakeScores = null;
  if (latestMetrics && latestBalanceSheet && annualForScores?.length) {
    try {
      snowflakeScores = calculateSnowflakeScores({
        metrics: latestMetrics,
        incomeStatements: annualForScores,
        balanceSheet: latestBalanceSheet,
      });
    } catch (error) {
      console.error("Failed to calculate snowflake scores:", error);
    }
  }

  const companyName = profile?.companyName ?? quote.name ?? upperTicker;
  const exchange = profile?.exchange ?? "";

  const metricChips = [
    {
      label: "P/E",
      value: latestMetrics?.peRatio ? latestMetrics.peRatio.toFixed(1) : "—",
      hint: "Price to earnings (TTM)",
    },
    {
      label: "Mkt cap",
      value: quote.marketCap
        ? formatCurrency(quote.marketCap, "USD", true)
        : "—",
      hint: "Market capitalization",
    },
    {
      label: "EPS",
      value: quote.eps ? `$${quote.eps.toFixed(2)}` : "—",
      hint: "Earnings per share",
    },
    {
      label: "Revenue (FY)",
      value: annualForScores?.[0]?.revenue
        ? formatCurrency(annualForScores[0].revenue, "USD", true)
        : "—",
      hint: "Latest annual revenue reported",
    },
    {
      label: "52W high",
      value: quote.yearHigh ? formatCurrency(quote.yearHigh) : "—",
      hint: "52-week high",
    },
    {
      label: "52W low",
      value: quote.yearLow ? formatCurrency(quote.yearLow) : "—",
      hint: "52-week low",
    },
    {
      label: "FCF yield",
      value: latestMetrics?.freeCashFlowYield
        ? `${(latestMetrics.freeCashFlowYield * 100).toFixed(2)}%`
        : "—",
      hint: "Free cash flow yield",
    },
    {
      label: "Div yield",
      value: latestMetrics?.dividendYield
        ? `${(latestMetrics.dividendYield * 100).toFixed(2)}%`
        : "—",
      hint: "Dividend yield",
    },
  ];

  const overviewMetrics = [
    { label: "P/E Ratio", value: metricChips[0].value },
    { label: "P/B Ratio", value: latestMetrics?.pbRatio ? latestMetrics.pbRatio.toFixed(1) : "—" },
    { label: "ROE", value: latestMetrics?.roe ? `${(latestMetrics.roe * 100).toFixed(1)}%` : "—" },
    { label: "D/E", value: latestMetrics?.debtToEquity != null ? latestMetrics.debtToEquity.toFixed(2) : "—" },
    { label: "Div yield", value: metricChips[7].value },
    { label: "Net margin", value: latestMetrics?.netProfitMargin ? `${(latestMetrics.netProfitMargin * 100).toFixed(1)}%` : "—" },
    { label: "Gross margin", value: latestMetrics?.grossProfitMargin ? `${(latestMetrics.grossProfitMargin * 100).toFixed(1)}%` : "—" },
    { label: "Market cap", value: metricChips[1].value },
    { label: "EPS", value: metricChips[2].value },
    { label: "Volume", value: quote.volume ? formatNumber(quote.volume, true) : "—" },
  ];

  let aiAnalysis: {
    summary: string;
    sentiment: string;
    strengths: string[];
    weaknesses: string[];
  } | null = null;
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/analysis/${upperTicker}`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.summary) {
        aiAnalysis = data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch AI analysis:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-lg bg-muted/40" aria-hidden />
      }
    >
      <StockDetailClient
        ticker={upperTicker}
        companyName={companyName}
        exchange={exchange}
        quote={quote}
        profile={profile}
        metricChips={metricChips}
        overviewMetrics={overviewMetrics}
        incomeStatements={incomeStatements ?? []}
        financialPeriod={financialPeriod}
        news={news ?? []}
        snowflakeScores={snowflakeScores}
        aiAnalysis={aiAnalysis}
      />
    </Suspense>
  );
}
