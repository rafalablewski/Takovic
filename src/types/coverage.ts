/**
 * Shared types for coverage UI modules (Comps tab, coverage data files).
 */

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
