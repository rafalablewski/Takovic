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

/** Tabs that appear before stock-specific custom tabs */
export const TABS_BEFORE_CUSTOM: CoverageTab[] = [
  { id: "overview", label: "Overview", description: "Company thesis and key metrics", icon: "LayoutDashboard" },
];

/** Tabs that appear after stock-specific custom tabs */
export const TABS_AFTER_CUSTOM: CoverageTab[] = [
  { id: "valuation", label: "Model", description: "DCF projections, scenario analysis", icon: "Calculator" },
  { id: "comparables", label: "Comps", description: "Peer comps, competitive positioning", icon: "GitCompareArrows" },
  { id: "capital-structure", label: "Capital", description: "Share structure, dilution, programs", icon: "Layers" },
  { id: "financials", label: "Financials", description: "Quarterly data, balance sheet, key metrics", icon: "DollarSign" },
  { id: "timeline", label: "Timeline", description: "SEC filings, events, milestones", icon: "Clock" },
  { id: "analysis", label: "Investment", description: "Scorecard, moat, risks, growth drivers", icon: "BarChart3" },
  { id: "wall-street", label: "Wall Street", description: "Analyst ratings, price targets, reports", icon: "Building2" },
];

/** All universal tabs combined (for stocks with no custom tabs) */
export const UNIVERSAL_TABS: CoverageTab[] = [...TABS_BEFORE_CUSTOM, ...TABS_AFTER_CUSTOM];

// ---------------------------------------------------------------------------
// Covered stock profiles
// ---------------------------------------------------------------------------

export interface CoveredStock {
  ticker: string;
  name: string;
  /** Primary listing exchange (e.g. NASDAQ, NYSE) — optional for prompt context */
  exchange?: string;
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
    exchange: "NYSE",
    sector: "Crypto / ETH Treasury",
    coverageDate: "2025-07-01",
    analyst: "Takovic Research",
    status: "active",
    description: "ETH treasury company accumulating ETH through strategic capital raises and generating yield via staking. Key metrics: NAV per share, NAV premium/discount, and dividend yield.",
    customTabs: [
      { id: "operations", label: "Business Operations", description: "Ethereum ecosystem, staking, ETH acquisitions", icon: "Briefcase" },
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
  // Overview → custom (Ethereum, Purchases, etc.) → Model, Comps, Capital, ...
  return [...TABS_BEFORE_CUSTOM, ...stock.customTabs, ...TABS_AFTER_CUSTOM];
}
