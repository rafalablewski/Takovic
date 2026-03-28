/**
 * Coverage registry — defines which stocks have active research coverage
 * and what tabs each stock's coverage page should display.
 *
 * LAST UPDATED: 2026-03-27
 */

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

export interface CoverageTab {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide icon name
}

/** Universal tabs available for all covered stocks */
export const UNIVERSAL_TABS: CoverageTab[] = [
  { id: "overview", label: "Overview", description: "Company thesis and key metrics", icon: "LayoutDashboard" },
  { id: "analysis", label: "Investment Analysis", description: "Scorecard, moat, risks, growth drivers", icon: "BarChart3" },
  { id: "comparables", label: "Comparable Analysis", description: "Peer comps, competitive positioning", icon: "GitCompareArrows" },
  { id: "financials", label: "Financials", description: "Quarterly data, balance sheet, key metrics", icon: "DollarSign" },
  { id: "wall-street", label: "Wall Street", description: "Analyst ratings, price targets, reports", icon: "Building2" },
  { id: "capital-structure", label: "Capital Structure", description: "Share structure, dilution, programs", icon: "Layers" },
  { id: "timeline", label: "Timeline", description: "SEC filings, events, milestones", icon: "Clock" },
  { id: "valuation", label: "Valuation Model", description: "DCF projections, scenario analysis", icon: "Calculator" },
];

// ---------------------------------------------------------------------------
// Covered stock profiles
// ---------------------------------------------------------------------------

export interface CoveredStock {
  ticker: string;
  name: string;
  sector: string;
  coverageDate: string; // when coverage was initiated
  analyst: string;
  status: "active" | "suspended" | "archived";
  description: string;
  customTabs: CoverageTab[]; // stock-specific tabs
}

const COVERED_STOCKS: Record<string, CoveredStock> = {
  BMNR: {
    ticker: "BMNR",
    name: "Bitmine Immersion Technologies",
    sector: "Crypto / ETH Treasury",
    coverageDate: "2025-07-01",
    analyst: "Takovic Research",
    status: "active",
    description: "ETH treasury company accumulating ETH through strategic capital raises and generating yield via staking. Key metrics: NAV per share, NAV premium/discount, and dividend yield.",
    customTabs: [
      { id: "ethereum", label: "Ethereum", description: "BMNR-ETH correlation, protocol roadmap, ecosystem", icon: "Coins" },
      { id: "eth-purchases", label: "ETH Purchases", description: "Complete record of all ETH acquisitions from 8-K filings", icon: "ShoppingCart" },
    ],
  },
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export function getCoveredStock(ticker: string): CoveredStock | null {
  return COVERED_STOCKS[ticker.toUpperCase()] ?? null;
}

export function getAllCoveredStocks(): CoveredStock[] {
  return Object.values(COVERED_STOCKS);
}

export function isCovered(ticker: string): boolean {
  return ticker.toUpperCase() in COVERED_STOCKS;
}

export function getTabsForStock(ticker: string): CoverageTab[] {
  const stock = getCoveredStock(ticker);
  if (!stock) return UNIVERSAL_TABS;
  return [...UNIVERSAL_TABS, ...stock.customTabs];
}
