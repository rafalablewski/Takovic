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
