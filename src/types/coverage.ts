/**
 * Shared types for coverage UI modules (Comps tab, coverage data files).
 */

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

export interface CasePoint {
  title: string;
  detail: string;
}

export interface OverviewMetric {
  label: string;
  value: string | number;
  description: string;
  format?: "currency" | "percent" | "number" | "eth" | "multiplier" | "text";
  group:
    | "valuation"
    | "holdings"
    | "staking"
    | "shares"
    | "dividend"
    | "other";
}

export interface CoverageOverview {
  thesis: string;
  bullCase: CasePoint[];
  bearCase: CasePoint[];
  metrics: OverviewMetric[];
}

// ---------------------------------------------------------------------------
// API / loader section keys
// ---------------------------------------------------------------------------

export const COVERAGE_API_SECTIONS = [
  "meta",
  "overview",
  "comparables",
  "financials",
  "capital-structure",
  "wall-street",
  "timeline",
  "investment",
  "eth-purchases",
  "ethereum-intelligence",
  "ecosystem-news",
] as const;

export type CoverageApiSection = (typeof COVERAGE_API_SECTIONS)[number];

export function isCoverageApiSection(s: string): s is CoverageApiSection {
  return (COVERAGE_API_SECTIONS as readonly string[]).includes(s);
}

// ---------------------------------------------------------------------------
// Wall Street tab
// ---------------------------------------------------------------------------

export interface AnalystCoverage {
  firm: string;
  analyst: string;
  rating: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
  priceTarget: number | null;
  date: string;
  note: string;
}

// ---------------------------------------------------------------------------
// Comparables
// ---------------------------------------------------------------------------

export interface ComparableCompany {
  ticker: string;
  name: string;
  asset: "ETH" | "BTC" | "Mixed";
  holdings: string;
  holdingsValue: string;
  navPremium: string;
  stakingYield: string;
  marketCap: string;
  threatLevel: "high" | "medium" | "low";
  competitiveFocus: string;
  keyDifferentiator: string;
}
