/**
 * Shared types for coverage UI modules (Comps tab, coverage data files).
 */

import type { FMPQuote } from "@/lib/api/yahoo";

// ---------------------------------------------------------------------------
// Live quotes (coverage overview + GET /api/coverage/[ticker]/live-quotes)
// ---------------------------------------------------------------------------

/** Display row after normalizing Yahoo quote fields for the overview strip. */
export interface LiveQuoteRow {
  symbol: string;
  label: string;
  price: number;
  changesPercentage: number;
}

/** Serialized API response and Redis cache shape for live quotes. */
export interface LiveQuotesPayload {
  stock: FMPQuote | null;
  eth: FMPQuote | null;
  ethSymbol: string;
  /** When true, UI should show an Ethereum spot column (may be null if fetch failed). */
  includeEthSpot: boolean;
  updatedAt: number;
}

/** Client state after mapping API quotes into display rows. */
export interface NormalizedLiveQuotesPayload {
  stock: LiveQuoteRow | null;
  eth: LiveQuoteRow | null;
  ethSymbol: string;
  includeEthSpot: boolean;
  updatedAt: number;
}

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

/** Comps peer lens (BMNR extended peer snapshot) */
export type PeerLensId = "all" | "eth_treasury" | "btc_treasury" | "exchanges";

/** Rich peer row for BMNR-style comps grid */
export interface PeerSnapshotCard {
  id: string;
  name: string;
  /** e.g. "BMNR · ETH" */
  tickerLine: string;
  /** Small badge: ETH, BTC, BTC+ETH */
  assetBadge: string;
  threat?: "high" | "medium" | "low";
  /** e.g. "ETH", "BTC TREASURY", "EXCHANGE" */
  role: string;
  /** Which lens filters include this card (`all` shows every card) */
  lenses: Array<Exclude<PeerLensId, "all">>;
  holdings: string;
  navPerShare: string;
  price: string;
  premium: string;
  yieldDisplay: string;
  marketCap: string;
  status?: string;
  focus?: string;
  narrative?: string;
  /** True for the covered ticker (e.g. BMNR) */
  isSubject?: boolean;
}

export interface PeerYieldAdvantage {
  title: string;
  subtitle: string;
  statLabel: string;
  statValue: string;
}

export interface ImpliedValuationRow {
  method: string;
  peerBasis: string;
  multiple: string;
  impliedValue: string;
  vsCurrent: string;
}

export interface SotpRow {
  component: string;
  metric: string;
  multiple: string;
  value: string;
}

/** ETH price row labels × NAV multiple column labels */
export interface NavPremiumSensitivity {
  caption: string;
  subtitle?: string;
  rowLabels: string[];
  colLabels: string[];
  /** values[row][col] */
  values: string[][];
}

export interface PeerSnapshotBundle {
  lenses: { id: PeerLensId; label: string }[];
  cards: PeerSnapshotCard[];
  yieldAdvantage: PeerYieldAdvantage;
  valuationFramework: string;
  impliedValuationTitle: string;
  impliedValuationCaption: string;
  impliedValuationRows: ImpliedValuationRow[];
  sotpTitle: string;
  sotpRows: SotpRow[];
  sotpTotalLabel: string;
  sotpTotalValue: string;
  navSensitivity: NavPremiumSensitivity;
}

/** Comps-tab competitor filter buckets (BMNR intelligence) */
export type CompetitorNewsBucket =
  | "riot"
  | "coinbase"
  | "cleanspark"
  | "ethzilla"
  | "kraken"
  | "marathon"
  | "miscellaneous"
  | "strategy";

export type CompetitorNewsStoryCategory =
  | "Partnership"
  | "Technology"
  | "Yield"
  | "Strategy"
  | "Regulatory"
  | "Financial"
  | "Acquisition"
  | "Funding";

export type CompetitorNewsImplication = "positive" | "neutral" | "negative";

/** Structured competitor news row for Comps tab */
export interface CompetitorNewsItem {
  date: string;
  category: CompetitorNewsStoryCategory;
  competitor: CompetitorNewsBucket;
  /** Display name (e.g. "Kraken", "Marathon Digital") */
  competitorLabel: string;
  headline: string;
  implication: CompetitorNewsImplication;
  bullets: string[];
  bmnrComparison: string;
  source: string;
  /** Optional link when the source has a public URL */
  sourceUrl?: string;
}

// ---------------------------------------------------------------------------
// Capital structure tab (coverage)
// ---------------------------------------------------------------------------

/** Headline metric in the capital summary strip (numeric formatting in UI). */
export interface CapitalMetric {
  label: string;
  value: string | number;
  format?: "number" | "currency" | "percent" | "text";
}

export interface CapitalInfoRow {
  label: string;
  value: string;
}

/** Summary tiles / sub-nav keys for the Capital tab (`?cap=`). */
export interface CapitalDetailViewTile {
  /** URL-safe id, e.g. `share-classes` */
  id: string;
  count: string;
  title: string;
  subtitle: string;
}

export interface CapitalShareClassRow {
  class: string;
  authorized: string;
  outstanding: string;
  voting: string;
  status: string;
}

export interface CapitalShareholderRow {
  shareholder: string;
  sharesM: string;
  pct: string;
  type: string;
  source: string;
}

export interface CapitalEquityOfferingRow {
  date: string;
  type: string;
  amount: string;
  status: string;
  /** Billions USD — when set, rolled into total shelf capacity display */
  amountBillions?: number;
}

export interface CapitalWarrantRow {
  type: string;
  shares: string;
  strike: string;
  source: string;
  /** Shares underlying this tranche; drives FD total and dilution when summed */
  shareCount?: number;
}

export interface CapitalEquityPlanRow {
  plan: string;
  reserved: string;
  status: string;
}

export interface CapitalFullyDilutedRow {
  component: string;
  sharesM: string;
  pctOfTotal: string;
}

export interface CapitalLiquidityHero {
  label: string;
  value: string;
  sublabel?: string;
}

export interface CapitalEthStressRow {
  label: string;
  ethPrice: string;
  runway: string;
  yieldPerQ: string;
  liquidity: string;
}

export interface CapitalRunwayScenarioRow {
  scenario: string;
  cash: string;
  burnQ: string;
  yieldQ: string;
  runway: string;
}

export interface CapitalTreasuryFactor {
  title: string;
  body: string;
}

export interface CapitalKeyValue {
  label: string;
  value: string;
}

export interface CapitalInsiderSaleRow {
  insider: string;
  sharesSold: string;
  proceeds: string;
  avgPrice: string;
  method: string;
  notes: string;
  /** Shares sold (raw count); when all rows carry this, insider totals are computed */
  sharesSoldNumber?: number;
  /** Proceeds in USD; when set with sharesSoldNumber, reinforces totals */
  proceedsUsd?: number;
}

export interface CapitalRsuRow {
  insider: string;
  rsusGranted: string;
  vested: string;
  taxWithheld: string;
  unvested: string;
  vestingSchedule: string;
}

export interface CapitalEarlyHolderRow {
  shareholder: string;
  shares: string;
  pct: string;
  source: string;
  notes: string;
}

export interface CoverageDataMetadata {
  lastUpdated: string;
  source: string;
  nextExpectedUpdate: string;
  notes?: string;
}

/**
 * Rich capital structure payload for `CAPITAL_STRUCTURE` on coverage tickers.
 * `schemaVersion: 2` is required for the full tab UI.
 */
export interface CapitalStructureData {
  schemaVersion: 2;
  metadata: CoverageDataMetadata;
  description: string;
  headlines: CapitalMetric[];
  info: CapitalInfoRow[];
  summary: string;
  detailViews: CapitalDetailViewTile[];
  shareClassTableTitle: string;
  shareClassFootnote: string;
  shareClasses: CapitalShareClassRow[];
  majorShareholdersTitle: string;
  majorShareholders: CapitalShareholderRow[];
  majorShareholdersFootnote: string;
  equityOfferingsTitle: string;
  equityOfferings: CapitalEquityOfferingRow[];
  totalShelfCapacity: string;
  warrantsTitle: string;
  warrants: CapitalWarrantRow[];
  warrantsTotalLabel: string;
  warrantsTotalShares: string;
  equityPlansTitle: string;
  equityPlans: CapitalEquityPlanRow[];
  equityPlansFootnote: string;
  fullyDilutedTitle: string;
  fullyDilutedComponents: CapitalFullyDilutedRow[];
  fullyDilutedFootnote: string;
  liquiditySectionTitle: string;
  liquidityHero: CapitalLiquidityHero[];
  stakingYieldQ: string;
  netBurnQ: string;
  ethStressTitle: string;
  ethStressFootnote: string;
  ethStressRows: CapitalEthStressRow[];
  runwayScenariosTitle: string;
  runwayScenariosIntro: string;
  runwayScenarios: CapitalRunwayScenarioRow[];
  /** Optional second line under the runway table */
  runwayScenariosFootnote?: string;
  treasuryFactorsTitle: string;
  treasuryFactors: CapitalTreasuryFactor[];
  cashPositionTitle: string;
  cashPositionGrid: CapitalKeyValue[];
  ethTreasuryTitle: string;
  ethTreasuryGrid: CapitalKeyValue[];
  insiderActivityTitle: string;
  insiderTotals: {
    totalSharesSold: string;
    totalProceeds: string;
    avgPrice: string;
    period: string;
  };
  insiderSalesIntro: string;
  insiderSales: CapitalInsiderSaleRow[];
  rsuSectionTitle: string;
  rsuGrants: CapitalRsuRow[];
  rsuFootnote?: string;
  earlyShareholdersTitle: string;
  earlyShareholdersIntro: string;
  earlyShareholders: CapitalEarlyHolderRow[];
}
