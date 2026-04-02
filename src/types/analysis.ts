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
  fadeYears: number; // years of fade to terminal (typically 5)
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
  earningsGrowthRate: number; // decimal (e.g. 0.15 = 15%)
  dividendYield: number; // decimal (e.g. 0.015 = 1.5%)
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

// ---------------------------------------------------------------------------
// Crypto Treasury Valuation (BMNR, MSTR-style companies)
// ---------------------------------------------------------------------------

/** Underlying crypto asset held by the treasury company */
export type CryptoAsset = "ETH" | "BTC";

/** Static profile data for a known crypto treasury company */
export interface CryptoTreasuryProfile {
  ticker: string;
  companyName: string;
  asset: CryptoAsset;
  /** Current asset holdings (e.g. ETH count) */
  assetHoldings: number;
  /** Current asset price in USD */
  assetPrice: number;
  /** Total diluted shares outstanding */
  sharesOutstanding: number;
  /** Current stock price */
  currentStockPrice: number;
  /** Fraction of holdings currently staked (0-1) */
  stakingRatio: number;
  /** Market cap in USD */
  marketCap: number;
}

/** User-adjustable parameters for crypto treasury valuation */
export interface CryptoTreasuryInputs {
  /**
   * Annual **spot** growth rate on the crypto price to the terminal year (CAGR).
   * ETH NAV model: use 0 for “flat spot to terminal” (treasury-style walkthrough).
   * BTC legacy model: primary BTC price appreciation path.
   */
  assetGrowthRate: number;
  /** Staking yield APY — decimal (0.035 = 3.5%). Used only for BTC treasury path. */
  stakingYield: number;
  /** NAV premium/discount multiplier (1.0 = at NAV) */
  navPremium: number;
  /** Annual operating costs as fraction of AUM. Used only for BTC treasury path. */
  operatingCostRate: number;
  /**
   * Annual share count growth (dilution). ETH NAV model: proceeds do **not** buy more ETH.
   * BTC path: dilution raises cash and buys more BTC at the modeled price.
   */
  dilutionRate: number;
  /** Discount rate — decimal (0.12 = 12%). Captures time value + risk in one number. */
  discountRate: number;
  /** Projection horizon in years */
  projectionYears: number;
  /**
   * ETH NAV model only: net annual compound on ETH **holdings** (staking − operating drag, etc.).
   * Ignored for BTC (use 0).
   */
  netEthHoldingsGrowthRate: number;
}

/**
 * BMNR model quick scenario: pairs terminal ETH spot CAGR with terminal NAV multiple.
 * Used only by the crypto treasury UI for ticker BMNR.
 */
export interface CryptoTreasuryBmnrScenario {
  id: string;
  label: string;
  /** Annual spot CAGR to terminal year (decimal), e.g. -0.3 = −30%. */
  assetGrowthRate: number;
  /** Terminal implied price ÷ NAV per share. */
  navPremium: number;
}

/** Single year in the projection table */
export interface CryptoTreasuryYearProjection {
  year: number;
  assetPrice: number;
  assetHoldings: number;
  stakingIncome: number; // assets earned from staking
  operatingCostAssets: number; // assets consumed by ops
  newSharesIssued: number;
  assetsFromDilution: number; // new assets bought with dilution proceeds
  totalShares: number;
  nav: number; // total net asset value
  navPerShare: number;
  impliedStockPrice: number; // navPerShare * premium
}

/** Full result from the crypto treasury valuation model */
export interface CryptoTreasuryResult {
  profile: CryptoTreasuryProfile;
  inputs: CryptoTreasuryInputs;
  projections: CryptoTreasuryYearProjection[];
  fairValuePerShare: number;
  currentPrice: number;
  upsidePercent: number;
  verdict: ValuationResult["verdict"];
  terminalNAVPerShare: number;
  terminalAssetPrice: number;
  /** Sensitivity: rows = asset growth rates, cols = discount rates */
  sensitivityMatrix: {
    assetGrowthRates: number[];
    discountRates: number[];
    values: number[][]; // fair value per share
  };
  /** Sensitivity: rows = NAV premiums, cols = asset growth rates */
  premiumSensitivity: {
    navPremiums: number[];
    assetGrowthRates: number[];
    values: number[][];
  };
}

/** Preset value for a slider parameter (bearish → bullish) */
export interface SliderPreset {
  value: number;
  label: string;
}

/** Slider parameter configuration */
export interface SliderParam {
  key: string;
  label: string;
  description: string;
  presets: SliderPreset[];
  defaultIndex: number; // which preset is selected by default
  suffix: string; // e.g. "%" or "x"
  category: "growth" | "yield" | "valuation";
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
