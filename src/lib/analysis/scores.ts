/**
 * Snowflake score calculations.
 * Inspired by Simply Wall St's open-source analysis model.
 * Each dimension scores 0-5 based on financial metrics.
 */

import type { SnowflakeScores } from "@/types/analysis";
import type { FMPKeyMetrics, FMPIncomeStatement, FMPBalanceSheet } from "@/lib/api/yahoo";

interface ScoreInput {
  metrics: FMPKeyMetrics;
  incomeStatements: FMPIncomeStatement[];
  balanceSheet: FMPBalanceSheet;
}

// ---------------------------------------------------------------------------
// Scoring thresholds (higher index = higher score)
// ---------------------------------------------------------------------------

/** P/E ratio thresholds — lower P/E is better (score is inverted) */
const PE_THRESHOLDS: [number, number, number, number, number] = [10, 15, 20, 30, 50];

/** P/B ratio thresholds — lower P/B is better (score is inverted) */
const PB_THRESHOLDS: [number, number, number, number, number] = [1, 2, 3, 5, 10];

/** Free cash flow yield thresholds (%) — higher is better */
const FCF_YIELD_THRESHOLDS: [number, number, number, number, number] = [1, 3, 5, 7, 10];

/** Revenue CAGR thresholds (%) */
const REVENUE_CAGR_THRESHOLDS: [number, number, number, number, number] = [0, 5, 10, 20, 30];

/** EPS growth thresholds (%) */
const EPS_GROWTH_THRESHOLDS: [number, number, number, number, number] = [0, 5, 10, 20, 30];

/** Return on Equity thresholds (%) */
const ROE_THRESHOLDS: [number, number, number, number, number] = [0, 5, 10, 15, 25];

/** Return on Assets thresholds (%) */
const ROA_THRESHOLDS: [number, number, number, number, number] = [0, 2, 5, 8, 15];

/** Net profit margin thresholds (%) */
const NET_MARGIN_THRESHOLDS: [number, number, number, number, number] = [0, 5, 10, 15, 25];

/** Gross profit margin thresholds (%) */
const GROSS_MARGIN_THRESHOLDS: [number, number, number, number, number] = [20, 30, 40, 50, 60];

/** Debt/Equity ratio thresholds — lower is better (score inverted) */
const DEBT_TO_EQUITY_THRESHOLDS: [number, number, number, number, number] = [0.3, 0.5, 1, 2, 3];

/** Current ratio thresholds — higher is better */
const CURRENT_RATIO_THRESHOLDS: [number, number, number, number, number] = [0.5, 1, 1.5, 2, 3];

/** Cash-to-assets ratio thresholds (%) */
const CASH_RATIO_THRESHOLDS: [number, number, number, number, number] = [2, 5, 10, 15, 25];

/** Dividend yield thresholds (%) */
const DIVIDEND_YIELD_THRESHOLDS: [number, number, number, number, number] = [0.5, 1, 2, 3, 5];

/** Default score when insufficient data is available */
const DEFAULT_SCORE = 2.5;

// ---------------------------------------------------------------------------
// Snowflake dimension weights (must sum to 1.0)
// ---------------------------------------------------------------------------

const SCORE_WEIGHTS = {
  value: 0.20,
  growth: 0.25,
  profitability: 0.25,
  health: 0.20,
  dividend: 0.10,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreRange(value: number, thresholds: [number, number, number, number, number]): number {
  const [t1, t2, t3, t4, t5] = thresholds;
  if (value >= t5) return 5;
  if (value >= t4) return 4;
  if (value >= t3) return 3;
  if (value >= t2) return 2;
  if (value >= t1) return 1;
  return 0;
}

/**
 * Value Score (0-5)
 * Based on: P/E ratio, P/B ratio, P/S ratio, FCF yield
 * Lower P/E, P/B, P/S = higher value. Higher FCF yield = higher value.
 */
function calculateValueScore(metrics: FMPKeyMetrics): number {
  const scores: number[] = [];

  if (metrics.peRatio > 0) {
    // Lower P/E is better: <10 = 5, 10-15 = 4, 15-20 = 3, 20-30 = 2, 30-50 = 1, >50 = 0
    scores.push(5 - scoreRange(metrics.peRatio, PE_THRESHOLDS));
  }

  if (metrics.pbRatio > 0) {
    scores.push(5 - scoreRange(metrics.pbRatio, PB_THRESHOLDS));
  }

  if (metrics.freeCashFlowYield) {
    scores.push(scoreRange(metrics.freeCashFlowYield * 100, FCF_YIELD_THRESHOLDS));
  }

  if (scores.length === 0) return DEFAULT_SCORE;
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length, 0, 5);
}

/**
 * Growth Score (0-5)
 * Based on: Revenue growth trend, EPS growth trend
 */
function calculateGrowthScore(incomeStatements: FMPIncomeStatement[]): number {
  if (incomeStatements.length < 2) return DEFAULT_SCORE;

  const sorted = [...incomeStatements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Revenue CAGR
  const firstRevenue = sorted[0].revenue;
  const lastRevenue = sorted[sorted.length - 1].revenue;
  const years = sorted.length - 1;

  if (firstRevenue <= 0 || lastRevenue <= 0) return DEFAULT_SCORE;

  const revenueCagr = (Math.pow(lastRevenue / firstRevenue, 1 / years) - 1) * 100;

  // EPS growth
  const firstEps = sorted[0].epsdiluted;
  const lastEps = sorted[sorted.length - 1].epsdiluted;
  const epsGrowth = firstEps > 0 ? ((lastEps - firstEps) / firstEps) * 100 / years : 0;

  const revenueScore = scoreRange(revenueCagr, REVENUE_CAGR_THRESHOLDS);
  const epsScore = scoreRange(epsGrowth, EPS_GROWTH_THRESHOLDS);

  return clamp((revenueScore + epsScore) / 2, 0, 5);
}

/**
 * Profitability Score (0-5)
 * Based on: ROE, ROA, net margin, gross margin
 */
function calculateProfitabilityScore(metrics: FMPKeyMetrics): number {
  const scores: number[] = [];

  if (metrics.roe) {
    scores.push(scoreRange(metrics.roe * 100, ROE_THRESHOLDS));
  }
  if (metrics.roa) {
    scores.push(scoreRange(metrics.roa * 100, ROA_THRESHOLDS));
  }
  if (metrics.netProfitMargin) {
    scores.push(scoreRange(metrics.netProfitMargin * 100, NET_MARGIN_THRESHOLDS));
  }
  if (metrics.grossProfitMargin) {
    scores.push(scoreRange(metrics.grossProfitMargin * 100, GROSS_MARGIN_THRESHOLDS));
  }

  if (scores.length === 0) return DEFAULT_SCORE;
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length, 0, 5);
}

/**
 * Health Score (0-5)
 * Based on: Debt/equity, current ratio, cash position
 */
function calculateHealthScore(
  metrics: FMPKeyMetrics,
  balanceSheet: FMPBalanceSheet
): number {
  const scores: number[] = [];

  if (metrics.debtToEquity >= 0) {
    // Lower D/E is healthier
    scores.push(5 - scoreRange(metrics.debtToEquity, DEBT_TO_EQUITY_THRESHOLDS));
  }
  if (metrics.currentRatio > 0) {
    scores.push(scoreRange(metrics.currentRatio, CURRENT_RATIO_THRESHOLDS));
  }
  if (balanceSheet.totalAssets > 0) {
    const cashRatio =
      balanceSheet.cashAndCashEquivalents / balanceSheet.totalAssets;
    scores.push(scoreRange(cashRatio * 100, CASH_RATIO_THRESHOLDS));
  }

  if (scores.length === 0) return DEFAULT_SCORE;
  return clamp(scores.reduce((a, b) => a + b, 0) / scores.length, 0, 5);
}

/**
 * Dividend Score (0-5)
 * Based on: Dividend yield, payout consistency
 */
function calculateDividendScore(metrics: FMPKeyMetrics): number {
  if (!metrics.dividendYield || metrics.dividendYield === 0) return 0;

  return scoreRange(metrics.dividendYield * 100, DIVIDEND_YIELD_THRESHOLDS);
}

/**
 * Calculate all snowflake scores for a stock.
 */
export function calculateSnowflakeScores(input: ScoreInput): SnowflakeScores {
  const value = calculateValueScore(input.metrics);
  const growth = calculateGrowthScore(input.incomeStatements);
  const profitability = calculateProfitabilityScore(input.metrics);
  const health = calculateHealthScore(input.metrics, input.balanceSheet);
  const dividend = calculateDividendScore(input.metrics);

  // Weighted average: growth and profitability weighted more
  const overall =
    value * SCORE_WEIGHTS.value +
    growth * SCORE_WEIGHTS.growth +
    profitability * SCORE_WEIGHTS.profitability +
    health * SCORE_WEIGHTS.health +
    dividend * SCORE_WEIGHTS.dividend;

  return {
    value: Math.round(value * 10) / 10,
    growth: Math.round(growth * 10) / 10,
    profitability: Math.round(profitability * 10) / 10,
    health: Math.round(health * 10) / 10,
    dividend: Math.round(dividend * 10) / 10,
    overall: Math.round(overall * 10) / 10,
  };
}
