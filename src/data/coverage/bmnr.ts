/**
 * BMNR coverage data — Bitmine Immersion Technologies
 *
 * LAST UPDATED: 2026-03-31
 * NEXT UPDATE: After next 8-K filing or material event
 */

import type { ComparableCompany } from "@/types/coverage";

export type { ComparableCompany } from "@/types/coverage";

// ---------------------------------------------------------------------------
// Overview
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
  group: "valuation" | "holdings" | "staking" | "shares" | "dividend" | "other";
}

export const OVERVIEW = {
  thesis:
    "BMNR: ETH treasury company accumulating ETH through strategic capital raises and generating yield via staking. Key metrics: NAV per share, NAV premium/discount, and dividend yield.",

  bullCase: [
    { title: "ETH price appreciation", detail: "Cycle targets $10K-$15K+" },
    { title: "NAV premium expansion", detail: "MSTR trades 2-3x; BMNR could follow" },
    { title: "ETF/index inclusion", detail: "Forces passive buying, liquidity premium" },
    { title: "Dividend growth", detail: "Staking scales → higher payouts" },
    { title: "MAVAN live", detail: "Proprietary staking platform launched Mar 2026" },
    { title: "Regulatory clarity", detail: "ETH not a security, staking approved" },
  ] as CasePoint[],

  bearCase: [
    { title: "ETH price crash", detail: "Crypto winter, -70% drawdowns possible" },
    { title: "NAV discount", detail: "Premium compresses or inverts" },
    { title: "Dilution risk", detail: "Aggressive ATM erodes ETH/share" },
    { title: "Slashing events", detail: "Validator penalties reduce holdings" },
    { title: "Regulatory action", detail: "SEC deems ETH a security" },
    { title: "Execution risk", detail: "MAVAN delays, competition" },
  ] as CasePoint[],

  metrics: [
    // Valuation (stock est. from PR-era marks; reconcile with filings)
    { label: "NAV/Share", value: 22.9, description: "Rough book incl. ETH+cash+moonshots (PR Mar 30)", format: "currency", group: "valuation" },
    { label: "Stock Price", value: 17.65, description: "Illustrative (align w/ purchase log era)", format: "currency", group: "valuation" },
    { label: "Premium/Discount", value: -0.23, description: "Vs rough NAV/share", format: "percent", group: "valuation" },
    { label: "Dividend Yield", value: 0.0022, description: "$0.04/share annually", format: "percent", group: "valuation" },
    // Holdings (PR Mar 30, 2026 — snapshot Mar 29)
    { label: "Total ETH", value: 4732082, description: "4.732M; 3.92% of 120.7M supply", format: "eth", group: "holdings" },
    { label: "ETH Price", value: 2005, description: "Mark (COIN ref, PR)", format: "currency", group: "holdings" },
    { label: "Total Value", value: 9.49e9, description: "ETH at PR mark", format: "currency", group: "holdings" },
    // Staking
    { label: "ETH Staked", value: 3142643, description: "~66% of ETH book (PR)", format: "eth", group: "staking" },
    { label: "Staking Revenue", value: 177e6, description: "Annualized (PR Mar 30)", format: "currency", group: "staking" },
    // Shares
    { label: "Shares", value: 470e6, description: "Outstanding (approx.)", format: "number", group: "shares" },
    { label: "Market Cap", value: 8.3e9, description: "~$17.65 × 470M (illustrative)", format: "currency", group: "shares" },
    { label: "NAV Multiple", value: 0.77, description: "Vs rough NAV/share", format: "multiplier", group: "shares" },
    { label: "ETH/Share", value: 0.01007, description: "ETH per share (470M SO)", format: "text", group: "shares" },
    // Dividend
    { label: "Quarterly Div", value: 0.01, description: "Per share", format: "currency", group: "dividend" },
    { label: "Annual Div", value: 0.04, description: "Per share", format: "currency", group: "dividend" },
    { label: "Div Yield", value: 0.0023, description: "Vs ~$17.65", format: "percent", group: "dividend" },
    { label: "Payout", value: 18.8e6, description: "Annual total", format: "currency", group: "dividend" },
    // Other assets
    { label: "MrBeast Equity", value: 200e6, description: "Beast Industries", format: "currency", group: "other" },
    { label: "Orbs Stake", value: 102e6, description: "Eightco ORBS (PR Mar 30)", format: "currency", group: "other" },
    { label: "BTC Worth", value: 9.9e6, description: "197 BTC (mark est.)", format: "currency", group: "other" },
    { label: "Cash", value: 961e6, description: "Total cash (PR)", format: "currency", group: "other" },
    { label: "Total Stack (PR)", value: 10.7e9, description: "Crypto+cash+moonshots headline", format: "currency", group: "other" },
  ] as OverviewMetric[],
};

// ---------------------------------------------------------------------------
// Investment Analysis (full Due Diligence tab — see bmnr-investment-tab.ts)
// ---------------------------------------------------------------------------

export {
  type LetterGrade,
  type ScorecardItem,
  type EcosystemMetricStatus,
  type EcosystemHealth,
  type GrowthDriverItem,
  type MoatSourceRow,
  type MoatThreatRow,
  type RiskItem,
  type AllocationRow,
  type AccumulationZoneRow,
  type AnalysisArchiveEntry,
  type StrategicPerspectiveBlock,
  type KeyStrategicQuestion,
  type EcosystemTriggerColumn,
  type CfaGlossaryItem,
  INVESTMENT_DUE_DILIGENCE,
  INVESTMENT_CURRENT_ASSESSMENT,
  SCORECARD,
  ECOSYSTEM_HEALTH,
  INVESTMENT_SUMMARY,
  INVESTMENT_SUMMARY_WHATS_NEW_TITLE,
  INVESTMENT_SUMMARY_WHATS_NEW_BULLETS,
  INVESTMENT_SUMMARY_HEADLINE,
  INVESTMENT_SUMMARY_CLOSING_QUOTE,
  GROWTH_DRIVERS,
  COMPETITIVE_MOAT,
  COMPETITIVE_MOAT_SOURCES,
  COMPETITIVE_MOAT_SOURCES_DETAIL,
  COMPETITIVE_THREATS,
  COMPETITIVE_THREATS_DETAIL,
  MOAT_DURABILITY,
  RISK_MATRIX,
  STRATEGIC_ASSESSMENT_INTRO,
  STRATEGIC_PERSPECTIVES,
  KEY_STRATEGIC_QUESTIONS,
  ECOSYSTEM_TRIGGERS_INTRO,
  ECOSYSTEM_TRIGGER_COLUMNS,
  POSITION_SIZING,
  POSITION_SIZING_ALLOCATION_INTRO,
  POSITION_SIZING_ALLOCATION_ROWS,
  POSITION_SIZING_ZONES_TITLE,
  POSITION_SIZING_ZONES,
  POSITION_SIZING_PORTFOLIO_TITLE,
  POSITION_SIZING_PORTFOLIO_LINES,
  ANALYSIS_ARCHIVE,
  CFA_INVESTMENT_GLOSSARY_TITLE,
  CFA_INVESTMENT_GLOSSARY,
  INVESTMENT_TAB_FOOTNOTE,
} from "./bmnr-investment-tab";

// ---------------------------------------------------------------------------
// Wall Street Coverage
// ---------------------------------------------------------------------------

export interface AnalystCoverage {
  firm: string;
  analyst: string;
  rating: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
  priceTarget: number | null;
  date: string;
  note: string;
}

export const WALL_STREET: AnalystCoverage[] = [
  // BMNR is a micro-cap — limited/no institutional coverage yet
];

export const WALL_STREET_NOTE =
  "No institutional analyst coverage has been initiated for BMNR as of March 2026. This is typical for micro-cap crypto treasury companies. Coverage is expected to increase following potential uplisting or significant AUM growth.";

// ---------------------------------------------------------------------------
// Capital Structure
// ---------------------------------------------------------------------------

export interface CapitalMetric {
  label: string;
  value: string | number;
  format?: "number" | "currency" | "percent" | "text";
}

export interface CapitalInfoRow {
  label: string;
  value: string;
}

export const CAPITAL_STRUCTURE = {
  description:
    "ETH treasury capital strategy, share structure, ATM programs, warrant detail, and dilution analysis. Single-class common stock with rapid execution capability.",
  summary:
    "ETH treasury company with 470M shares outstanding. Active ATM program and convertible notes add dilution risk.",

  // Key headline metrics
  headlines: [
    { label: "Shares Outstanding", value: 470e6, format: "number" },
    { label: "Fully Diluted", value: 484.2e6, format: "number" },
    { label: "Basic Mkt Cap", value: 8.64e9, format: "currency" },
    { label: "FD Mkt Cap", value: 8.90e9, format: "currency" },
  ] as CapitalMetric[],

  // Info grid
  info: [
    { label: "Stock Price", value: "$18.39" },
    { label: "Dilution", value: "+3.0%" },
    { label: "Common Stock", value: "470M" },
    { label: "Convertible Notes", value: "Various" },
    { label: "ATM Program", value: "Active" },
    { label: "Source", value: "SEC / Market" },
  ] as CapitalInfoRow[],

  // Detailed sections (collapsible)
  shareClass: "Single class — Common Stock",
  sharesOutstanding: 470_000_000,
  fullyDiluted: 484_200_000,
  sharesAuthorized: 1_000_000_000,

  warrants: {
    description: "Multiple warrant series outstanding from prior financing rounds and convertible note conversions",
    estimatedDilution: "~14.2M additional shares if all exercised (+3.0%)",
  },
  atmProgram: {
    active: true,
    description: "At-the-market offering program for continuous equity raises",
    facility: "Up to $2B capacity (estimated)",
    usage: "Used weekly for ETH purchases — primary capital deployment vehicle",
  },
  registeredDirects: {
    active: true,
    description: "Registered direct offerings for larger block raises",
    frequency: "As needed for larger ETH acquisitions",
  },
  convertibleNotes: {
    active: true,
    description: "Various convertible note series outstanding",
    detail: "Conversion prices at varying strikes; adds dilution on conversion",
  },
  dilutionAnalysis: {
    annualRate: "15-25% estimated based on recent activity",
    mitigant: "Dilution proceeds used 100% for ETH purchases — accretive if ETH appreciates faster than dilution",
    riskScenario: "If ETH declines, dilution is destructive to per-share value",
  },
};

// ---------------------------------------------------------------------------
// Comparable Analysis
// ---------------------------------------------------------------------------

export const COMPARABLES: ComparableCompany[] = [
  {
    ticker: "MSTR",
    name: "MicroStrategy (Strategy)",
    asset: "BTC",
    holdings: "762,099 BTC",
    holdingsValue: "~$51B",
    navPremium: "1.75x",
    stakingYield: "0%",
    marketCap: "$75.9B",
    threatLevel: "low",
    competitiveFocus: "BTC treasury pioneer — different asset, but sets NAV premium precedent",
    keyDifferentiator: "BTC-only, no staking yield, much larger scale",
  },
  {
    ticker: "COIN",
    name: "Coinbase",
    asset: "Mixed",
    holdings: "N/A (exchange)",
    holdingsValue: "N/A",
    navPremium: "N/A",
    stakingYield: "Staking-as-a-service",
    marketCap: "$46B",
    threatLevel: "medium",
    competitiveFocus: "Could launch ETH treasury strategy or offer competing staking products",
    keyDifferentiator: "Exchange model, staking infrastructure provider",
  },
  {
    ticker: "ETHE",
    name: "Grayscale Ethereum Trust",
    asset: "ETH",
    holdings: "~2.6M ETH",
    holdingsValue: "$5.7B",
    navPremium: "~1.0x",
    stakingYield: "0%",
    marketCap: "$5.7B",
    threatLevel: "high",
    competitiveFocus: "Direct ETH exposure competitor — cheaper, more liquid, no staking",
    keyDifferentiator: "ETF structure, no staking yield, institutional access",
  },
  {
    ticker: "ETHD",
    name: "Various ETH ETFs",
    asset: "ETH",
    holdings: "Various",
    holdingsValue: "$10B+ combined",
    navPremium: "~1.0x",
    stakingYield: "0% (pending SEC approval)",
    marketCap: "N/A",
    threatLevel: "high",
    competitiveFocus: "Passive ETH exposure at 1.0x NAV — staking ETFs would narrow BMNR's yield advantage",
    keyDifferentiator: "Low-cost passive, no staking (yet), high liquidity",
  },
];

export const COMPARABLES_INSIGHT =
  "Each card combines quantitative metrics (holdings, NAV, premium) with qualitative intelligence (threat level, competitive focus). BMNR's ETH staking yield vs BTC treasuries' 0% is the key structural differentiator.";

// ---------------------------------------------------------------------------
// Financials
// ---------------------------------------------------------------------------

export interface QuarterlyFinancial {
  period: string; // e.g. "Q3 2025"
  revenue: number;
  stakingRevenue: number;
  operatingExpenses: number;
  netIncome: number;
  ethHoldings: number;
  ethPrice: number;
  cashPosition: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
}

export const FINANCIALS_DESCRIPTION =
  "Quarterly financial data, balance sheet trends, and key metric evolution. Focus on ETH holdings growth, staking revenue, and cash position management.";

export const QUARTERLY_FINANCIALS: QuarterlyFinancial[] = [
  { period: "Q3 2025", revenue: 1_200_000, stakingRevenue: 800_000, operatingExpenses: 3_500_000, netIncome: -2_300_000, ethHoldings: 743, ethPrice: 2380, cashPosition: 5_200_000, totalAssets: 12_800_000, totalLiabilities: 2_100_000, shareholdersEquity: 10_700_000 },
  { period: "Q4 2025", revenue: 4_800_000, stakingRevenue: 3_200_000, operatingExpenses: 4_100_000, netIncome: 700_000, ethHoldings: 1403, ethPrice: 2450, cashPosition: 3_800_000, totalAssets: 38_200_000, totalLiabilities: 3_400_000, shareholdersEquity: 34_800_000 },
  { period: "Q1 2026", revenue: 8_500_000, stakingRevenue: 6_100_000, operatingExpenses: 5_200_000, netIncome: 3_300_000, ethHoldings: 2141, ethPrice: 2185, cashPosition: 4_100_000, totalAssets: 51_600_000, totalLiabilities: 4_800_000, shareholdersEquity: 46_800_000 },
];

// ---------------------------------------------------------------------------
// Timeline — full event list in bmnr-timeline.ts
// ---------------------------------------------------------------------------

export {
  type TimelineEvent,
  TIMELINE_DESCRIPTION,
  TIMELINE_EVENTS,
} from "./bmnr-timeline";

// ---------------------------------------------------------------------------
// Ethereum (stock-specific) — see bmnr-ethereum.ts for full intelligence
// ---------------------------------------------------------------------------

// Re-export from dedicated file to keep this file under 500 lines
export {
  ETHEREUM_INTELLIGENCE,
  type EthCorrelationMetric,
  type NetworkMetric,
  type ETFFlow,
  type ThesisSection,
  type ValueAccrualStep,
  type RoadmapMilestone,
  type EcosystemNewsItem,
} from "./bmnr-ethereum";

// ---------------------------------------------------------------------------
// ETH Purchases — weekly 8-K/PR log (see bmnr-eth-purchases.ts)
// ---------------------------------------------------------------------------

export {
  type ETHPurchase,
  ETH_PURCHASES,
  ETH_PURCHASE_SUMMARY,
  ETH_PURCHASE_HISTORY_TITLE,
  ETH_PURCHASE_HISTORY_DESCRIPTION,
  ETH_ACCUMULATION_SUMMARY_HEADING,
  ETH_PURCHASE_OVERVIEW_HEADING,
  ETH_PURCHASE_OVERVIEW_SOURCE_LINE,
  ETH_PURCHASE_LOG_HEADING,
  ETH_PURCHASE_LOG_SUBHEADING,
  ETH_PURCHASE_TABLE_HEADERS,
  ETH_MNAV_METHODOLOGY,
} from "./bmnr-eth-purchases";
