export interface Stock {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  currency: string;
  logoUrl: string | null;
  lastUpdated: Date;
}

export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  previousClose: number;
  timestamp: Date;
}

export interface StockProfile {
  ticker: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  country: string;
  website: string;
  logoUrl: string;
  employees: number;
  ipoDate: string;
  ceo: string;
}

export interface FinancialData {
  stockId: string;
  period: "Q1" | "Q2" | "Q3" | "Q4" | "FY";
  year: number;
  revenue: number;
  netIncome: number;
  eps: number;
  peRatio: number;
  debtToEquity: number;
  roe: number;
  freeCashFlow: number;
  dividendYield: number;
  reportDate: string;
}

export interface KeyMetrics {
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  roe: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  revenueGrowth: number | null;
  epsGrowth: number | null;
  dividendYield: number | null;
  freeCashFlowYield: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
}
