import type { Sentiment } from "./analysis";

export interface NewsArticle {
  id: string;
  stockId: string | null;
  tickers: string[];
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  sentiment: Sentiment;
  imageUrl: string | null;
  publishedAt: Date;
}

export interface MarketDigest {
  id: string;
  date: string;
  summary: string;
  topMovers: {
    ticker: string;
    name: string;
    changePercent: number;
    reason: string;
  }[];
  sectorPerformance: {
    sector: string;
    changePercent: number;
  }[];
  generatedAt: Date;
}
