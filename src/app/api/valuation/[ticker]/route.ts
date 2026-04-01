import { NextResponse } from "next/server";
import {
  getQuote,
  getProfile,
  getKeyMetrics,
  getIncomeStatement,
  getBalanceSheet,
  getCashFlowStatement,
} from "@/lib/api/yahoo";
import type { StockValuationParams } from "@/types/analysis";

// Industry median multiples by sector (reasonable defaults)
const SECTOR_MEDIANS: Record<
  string,
  { pe: number; pb: number; ps: number; evEbitda: number }
> = {
  Technology: { pe: 28, pb: 6, ps: 5, evEbitda: 18 },
  "Communication Services": { pe: 20, pb: 3, ps: 3, evEbitda: 12 },
  "Consumer Cyclical": { pe: 22, pb: 4, ps: 1.5, evEbitda: 14 },
  "Consumer Defensive": { pe: 22, pb: 4, ps: 1.8, evEbitda: 14 },
  Healthcare: { pe: 24, pb: 4, ps: 4, evEbitda: 15 },
  Industrials: { pe: 20, pb: 3, ps: 1.5, evEbitda: 12 },
  "Financial Services": { pe: 14, pb: 1.5, ps: 3, evEbitda: 10 },
  Energy: { pe: 12, pb: 1.5, ps: 1, evEbitda: 6 },
  Utilities: { pe: 18, pb: 1.8, ps: 2, evEbitda: 12 },
  "Real Estate": { pe: 30, pb: 2, ps: 6, evEbitda: 20 },
  "Basic Materials": { pe: 14, pb: 2, ps: 1.2, evEbitda: 8 },
};

const DEFAULT_MEDIANS = { pe: 20, pb: 3, ps: 2, evEbitda: 12 };

// ---------------------------------------------------------------------------
// Financial assumptions (configurable via env vars)
// ---------------------------------------------------------------------------

const RISK_FREE_RATE = Number(process.env.RISK_FREE_RATE) || 0.043;
const EQUITY_RISK_PREMIUM = Number(process.env.EQUITY_RISK_PREMIUM) || 0.055;
const DEFAULT_BETA = Number(process.env.DEFAULT_BETA) || 1.0;
const COST_OF_DEBT = Number(process.env.COST_OF_DEBT) || 0.05;
const CORPORATE_TAX_RATE = Number(process.env.CORPORATE_TAX_RATE) || 0.21;
const DEFAULT_FCF_GROWTH_RATE = 0.08;
const DEFAULT_REVENUE_GROWTH_RATE = 0.05;
const DEFAULT_WACC_FALLBACK = 0.1;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    const [quote, profile, metricsArr, incomeArr, balanceArr, cashFlowArr] =
      await Promise.all([
        getQuote(upperTicker),
        getProfile(upperTicker),
        getKeyMetrics(upperTicker, "annual", 5),
        getIncomeStatement(upperTicker, "annual", 5),
        getBalanceSheet(upperTicker, "annual", 3),
        getCashFlowStatement(upperTicker, "annual", 5),
      ]);

    if (!quote || !profile) {
      return NextResponse.json(
        { error: `Stock ${upperTicker} not found` },
        { status: 404 }
      );
    }

    const metrics = metricsArr[0];
    const latestBalance = balanceArr[0];
    const latestCashFlow = cashFlowArr[0];

    // Calculate FCF growth rate (3-year CAGR from cash flow statements)
    let fcfGrowthRate3yr = DEFAULT_FCF_GROWTH_RATE; // default
    if (cashFlowArr.length >= 3) {
      const oldest = cashFlowArr[cashFlowArr.length - 1];
      const newest = cashFlowArr[0];
      if (oldest.freeCashFlow > 0 && newest.freeCashFlow > 0) {
        const years = cashFlowArr.length - 1;
        fcfGrowthRate3yr =
          Math.pow(newest.freeCashFlow / oldest.freeCashFlow, 1 / years) - 1;
      }
    }

    // Revenue growth rate from income statements
    let revenueGrowthRate = DEFAULT_REVENUE_GROWTH_RATE;
    if (incomeArr.length >= 2) {
      const oldest = incomeArr[incomeArr.length - 1];
      const newest = incomeArr[0];
      if (oldest.revenue > 0 && newest.revenue > 0) {
        const years = incomeArr.length - 1;
        revenueGrowthRate =
          Math.pow(newest.revenue / oldest.revenue, 1 / years) - 1;
      }
    }

    // Shares outstanding (from market cap / price)
    const sharesOutstanding =
      quote.price > 0 ? quote.marketCap / quote.price : 0;

    // Net debt
    const totalDebt = latestBalance?.totalDebt ?? 0;
    const cashAndEquivalents =
      latestBalance?.cashAndCashEquivalents ?? 0;
    const netDebt = totalDebt - cashAndEquivalents;

    // EPS and per-share values
    const eps = quote.eps ?? 0;
    const bookValuePerShare =
      sharesOutstanding > 0 && latestBalance
        ? latestBalance.totalStockholdersEquity / sharesOutstanding
        : 0;
    const revenuePerShare =
      sharesOutstanding > 0 && incomeArr[0]
        ? incomeArr[0].revenue / sharesOutstanding
        : 0;

    // Dividend per share
    const dividendPerShare =
      latestCashFlow && sharesOutstanding > 0
        ? Math.abs(latestCashFlow.dividendsPaid) / sharesOutstanding
        : 0;

    // Payout ratio
    const payoutRatio =
      incomeArr[0]?.netIncome > 0 && latestCashFlow
        ? Math.abs(latestCashFlow.dividendsPaid) / incomeArr[0].netIncome
        : 0;

    // WACC estimate (simplified CAPM)
    const costOfEquity = RISK_FREE_RATE + DEFAULT_BETA * EQUITY_RISK_PREMIUM;
    const totalCapital = quote.marketCap + totalDebt;
    const wacc =
      totalCapital > 0
        ? (quote.marketCap / totalCapital) * costOfEquity +
          (totalDebt / totalCapital) * COST_OF_DEBT * (1 - CORPORATE_TAX_RATE)
        : DEFAULT_WACC_FALLBACK;

    // Sector medians
    const sectorMedians =
      SECTOR_MEDIANS[profile.sector] ?? DEFAULT_MEDIANS;

    const result: StockValuationParams = {
      ticker: upperTicker,
      companyName: profile.companyName,
      sector: profile.sector,
      industry: profile.industry,
      currentPrice: quote.price,
      marketCap: quote.marketCap,
      // DCF
      freeCashFlow: latestCashFlow?.freeCashFlow ?? 0,
      fcfGrowthRate3yr: Math.round(fcfGrowthRate3yr * 1000) / 1000,
      revenueGrowthRate: Math.round(revenueGrowthRate * 1000) / 1000,
      sharesOutstanding,
      totalDebt,
      cashAndEquivalents,
      netDebt,
      // Per-share
      eps,
      bookValuePerShare: Math.round(bookValuePerShare * 100) / 100,
      revenuePerShare: Math.round(revenuePerShare * 100) / 100,
      // Margins
      netMargin: metrics?.netProfitMargin ?? 0,
      grossMargin: metrics?.grossProfitMargin ?? 0,
      operatingMargin: metrics?.operatingProfitMargin ?? 0,
      roe: metrics?.roe ?? 0,
      roa: metrics?.roa ?? 0,
      // Ratios
      peRatio: metrics?.peRatio ?? 0,
      pbRatio: metrics?.pbRatio ?? 0,
      psRatio: metrics?.psRatio ?? 0,
      evToEbitda: 0, // needs dedicated endpoint
      currentRatio: metrics?.currentRatio ?? 0,
      debtToEquity: metrics?.debtToEquity ?? 0,
      // Dividend
      dividendPerShare: Math.round(dividendPerShare * 100) / 100,
      dividendYield: metrics?.dividendYield ?? 0,
      payoutRatio: Math.round(payoutRatio * 1000) / 1000,
      // Industry benchmarks
      industryPE: sectorMedians.pe,
      industryPB: sectorMedians.pb,
      industryPS: sectorMedians.ps,
      industryEVEBITDA: sectorMedians.evEbitda,
      // Calculated
      wacc: Math.round(wacc * 1000) / 1000,
      betaOrRisk: DEFAULT_BETA,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Valuation API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch valuation data" },
      { status: 500 }
    );
  }
}
