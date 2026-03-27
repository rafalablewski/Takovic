export type Sentiment =
  | "bullish"
  | "somewhat_bullish"
  | "neutral"
  | "somewhat_bearish"
  | "bearish";

export interface SnowflakeScores {
  value: number; // 0-5
  growth: number; // 0-5
  profitability: number; // 0-5
  health: number; // 0-5
  dividend: number; // 0-5
  overall: number; // 0-5 (weighted average)
}

export interface StockAnalysis {
  id: string;
  stockId: string;
  ticker: string;
  scores: SnowflakeScores;
  aiSummary: string;
  aiSentiment: Sentiment;
  strengths: string[];
  weaknesses: string[];
  generatedAt: Date;
}

export interface ScreenerFilters {
  sectors?: string[];
  industries?: string[];
  marketCapMin?: number;
  marketCapMax?: number;
  peRatioMin?: number;
  peRatioMax?: number;
  dividendYieldMin?: number;
  dividendYieldMax?: number;
  roeMin?: number;
  roeMax?: number;
  valueScoreMin?: number;
  growthScoreMin?: number;
  profitabilityScoreMin?: number;
  healthScoreMin?: number;
  sentiments?: Sentiment[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Valuation Models
// ---------------------------------------------------------------------------

/** Inputs for the multi-stage DCF model */
export interface DCFInputs {
  currentFCF: number; // most recent annual FCF in dollars
  fcfGrowthRateHigh: number; // high-growth phase annual rate (e.g. 0.12 = 12%)
  highGrowthYears: number; // years of high growth (typically 5)
  fcfGrowthRateFade: number; // fade-phase annual rate
  fadeYears: number; // years of fade (typically 5)
  terminalGrowthRate: number; // perpetuity growth rate (e.g. 0.025 = 2.5%)
  discountRate: number; // WACC (e.g. 0.10 = 10%)
  sharesOutstanding: number; // total diluted shares
  netDebt: number; // total debt minus cash (negative = net cash)
}

/** Inputs for the Dividend Discount Model */
export interface DDMInputs {
  currentDividendPerShare: number;
  dividendGrowthRate: number; // e.g. 0.06 = 6%
  requiredReturn: number; // e.g. 0.10 = 10%
}

/** Inputs for comparable-company multiples valuation */
export interface MultiplesInputs {
  eps: number;
  bookValuePerShare: number;
  revenuePerShare: number;
  ebitdaPerShare: number;
  targetPE: number; // industry/peer median P/E
  targetPB: number;
  targetPS: number;
  targetEVEBITDA: number;
}

/** Inputs for Graham Number calculation */
export interface GrahamInputs {
  eps: number;
  bookValuePerShare: number;
}

/** Inputs for Peter Lynch (PEG-based) fair value */
export interface LynchInputs {
  eps: number;
  earningsGrowthRate: number; // percent (e.g. 15 = 15%)
  dividendYield: number; // percent (e.g. 1.5 = 1.5%)
}

/** Inputs for Earnings Power Value */
export interface EPVInputs {
  normalizedEarnings: number; // adjusted sustainable earnings
  wacc: number;
  sharesOutstanding: number;
  excessCash: number; // cash above operating needs
  totalDebt: number;
}

/** WACC calculation inputs */
export interface WACCInputs {
  marketCapEquity: number;
  totalDebt: number;
  costOfEquity: number; // e.g. 0.10 = 10%
  costOfDebt: number; // e.g. 0.04 = 4%
  taxRate: number; // e.g. 0.21 = 21%
}

/** Result from a single valuation model */
export interface ModelResult {
  name: string;
  fairValue: number; // per share
  description: string;
  confidence: "high" | "medium" | "low";
  applicable: boolean; // false if data insufficient
}

/** Composite valuation result combining all models */
export interface ValuationResult {
  ticker: string;
  currentPrice: number;
  models: ModelResult[];
  compositeFairValue: number; // weighted avg of applicable models
  upsidePercent: number;
  verdict: "Significantly Undervalued" | "Undervalued" | "Fairly Valued" | "Overvalued" | "Significantly Overvalued";
  sensitivityMatrix: {
    growthRates: number[];
    discountRates: number[];
    values: number[][]; // [growthIdx][discountIdx]
  };
}

/** Pre-filled stock parameters from API data */
export interface StockValuationParams {
  ticker: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  marketCap: number;
  // DCF params
  freeCashFlow: number;
  fcfGrowthRate3yr: number;
  revenueGrowthRate: number;
  sharesOutstanding: number;
  totalDebt: number;
  cashAndEquivalents: number;
  netDebt: number;
  // Multiples
  eps: number;
  bookValuePerShare: number;
  revenuePerShare: number;
  // Margins & profitability
  netMargin: number;
  grossMargin: number;
  operatingMargin: number;
  roe: number;
  roa: number;
  // Ratios
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  evToEbitda: number;
  currentRatio: number;
  debtToEquity: number;
  // Dividend
  dividendPerShare: number;
  dividendYield: number;
  payoutRatio: number;
  // Industry benchmarks (peer medians)
  industryPE: number;
  industryPB: number;
  industryPS: number;
  industryEVEBITDA: number;
  // Calculated
  wacc: number;
  betaOrRisk: number;
}

export interface ScreenerResult {
  stock: {
    ticker: string;
    name: string;
    sector: string;
    exchange: string;
    marketCap: number;
    logoUrl: string | null;
  };
  quote: {
    price: number;
    changePercent: number;
  };
  scores: SnowflakeScores;
  sentiment: Sentiment;
}
