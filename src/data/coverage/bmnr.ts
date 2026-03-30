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
// Investment Analysis
// ---------------------------------------------------------------------------

// --- Scorecard types ---

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

export interface ScorecardItem {
  category: string;
  grade: LetterGrade;
  weight: number; // relative importance %
  assessment: string;
  details: string[];
}

export interface EcosystemMetricStatus {
  label: string;
  value: string;
  status: "bullish" | "healthy" | "growing" | "deflationary" | "upgraded" | "neutral" | "bearish" | "warning";
  statusLabel: string;
}

export interface EcosystemHealth {
  title: string;
  description: string;
  overallGrade: LetterGrade;
  metrics: EcosystemMetricStatus[];
  commentary: string;
}

// --- Scorecard data ---

export const ECOSYSTEM_HEALTH: EcosystemHealth = {
  title: "Ecosystem Health",
  description: "Ethereum network fundamentals (see Ethereum tab for details)",
  overallGrade: "A",
  metrics: [
    { label: "ETF Flows (7d)", value: "+$340M", status: "bullish", statusLabel: "Bullish" },
    { label: "Staking Rate", value: "28.3%", status: "healthy", statusLabel: "Healthy" },
    { label: "DeFi TVL Trend", value: "$62.4B", status: "growing", statusLabel: "Growing" },
    { label: "Supply Growth", value: "-0.2%", status: "deflationary", statusLabel: "Deflationary" },
    { label: "Protocol Progress", value: "Fusaka Live", status: "upgraded", statusLabel: "Upgraded" },
  ],
  commentary:
    "Strong ecosystem tailwinds despite ETH price weakness (-62% from 2025 highs). Ethereum daily txns hit ATH (2.5M), active addresses ATH (1M daily). Tom Lee: ETH prices see V-shaped recoveries from 50%+ drops (8th time since 2018). GENIUS Act + SEC Project Crypto transformational.",
};

export const SCORECARD: ScorecardItem[] = [
  {
    category: "Asset Quality",
    grade: "A",
    weight: 20,
    assessment: "Strong — pure ETH exposure, highly liquid asset",
    details: [
      "100% Ethereum — no altcoin dilution",
      "ETH is #2 crypto by market cap, deep liquidity",
      "Institutional-grade custody (presumed)",
      "Staking provides productive yield on holdings",
    ],
  },
  {
    category: "Accumulation Strategy",
    grade: "B",
    weight: 15,
    assessment: "Active — frequent raises, rapid execution",
    details: [
      "Weekly/bi-weekly capital raises via ATM and registered directs",
      "35+ purchase events tracked since Jul 2025",
      "Rapid execution capability — can deploy capital within days",
      "Risk: dilution rate 15-25% annually",
    ],
  },
  {
    category: "Management & Governance",
    grade: "C",
    weight: 15,
    assessment: "Early stage — limited track record",
    details: [
      "Small team, micro-cap company",
      "Single-class common stock (no dual-class)",
      "Transparent 8-K filings for purchases",
      "Limited public commentary / investor relations",
    ],
  },
  {
    category: "Valuation",
    grade: "C",
    weight: 15,
    assessment: "Premium — trading well above NAV",
    details: [
      "~9.9x NAV premium is high vs ETH ETFs (1.0x)",
      "Premium justified if: yield optimization, regulatory wrapper, liquidity",
      "Compare: MSTR trades at 2-3x NAV for BTC",
      "Risk: premium compression in bear market",
    ],
  },
  {
    category: "Yield Generation",
    grade: "B",
    weight: 10,
    assessment: "Moderate — base staking with upside from restaking",
    details: [
      "~3.5% APY from native ETH staking",
      "Only 30% of holdings staked currently — room to grow",
      "Restaking (EigenLayer) could boost to 5-7%+",
      "No dividend paid yet — yield retained for accumulation",
    ],
  },
  {
    category: "Liquidity & Structure",
    grade: "C",
    weight: 10,
    assessment: "Thin — micro-cap with limited float",
    details: [
      "NYSE-listed but low daily volume",
      "~48.5M shares outstanding",
      "Frequent dilution events affect price",
      "Bid-ask spreads may be wide",
    ],
  },
  {
    category: "Regulatory Environment",
    grade: "B",
    weight: 10,
    assessment: "Improving — GENIUS Act + SEC Project Crypto positive",
    details: [
      "SEC classifies under SIC 6199 (Finance Services)",
      "ETH not classified as security — positive clarity",
      "ETH ETFs approved — institutional legitimacy",
      "GENIUS Act and SEC Project Crypto transformational for crypto equities",
    ],
  },
  {
    category: "Competitive Position",
    grade: "B",
    weight: 5,
    assessment: "First-mover in public ETH treasury space",
    details: [
      "Few direct competitors for public ETH treasury equity",
      "ETH ETFs are competition for passive exposure",
      "Differentiated by: staking yield, leverage, equity structure",
      "Moat: early accumulation advantage if ETH appreciates",
    ],
  },
];

// --- Investment Thesis ---

export const INVESTMENT_SUMMARY =
  "BMNR represents a leveraged, yield-generating bet on Ethereum via public equity markets. The company accumulates ETH through capital raises, stakes a portion for yield, and trades at a significant NAV premium reflecting the market's appetite for structured ETH exposure. The thesis depends on: (1) ETH price appreciation, (2) premium sustainability, (3) accretive dilution (ETH growth > share dilution), and (4) staking yield expansion.";

export const GROWTH_DRIVERS = [
  {
    driver: "ETH Price Appreciation",
    impact: "high" as const,
    description: "Primary value driver. ETH at $2,185 is -62% from 2025 highs. V-shaped recovery pattern (8th occurrence since 2018). ETF inflows accelerating.",
  },
  {
    driver: "Staking Yield Expansion",
    impact: "medium" as const,
    description: "Currently 30% staked at ~3.5% APY. Increasing staking ratio to 80%+ and adding restaking (EigenLayer) could boost effective yield to 5-7%.",
  },
  {
    driver: "Accretive Capital Raises",
    impact: "high" as const,
    description: "Issuing equity at 9.9x NAV premium means each $1 raised buys ~$1 of ETH but is backed by ~$0.10 of NAV. If ETH appreciates, dilution becomes accretive.",
  },
  {
    driver: "Regulatory Tailwinds",
    impact: "medium" as const,
    description: "GENIUS Act + SEC Project Crypto creating favorable environment. ETH ETF staking approval would be transformational for yield narrative.",
  },
  {
    driver: "Dividend Initiation",
    impact: "medium" as const,
    description: "Staking yield could fund a dividend, attracting income-focused investors and potentially justifying a higher NAV premium.",
  },
  {
    driver: "Institutional Adoption",
    impact: "low" as const,
    description: "Uplisting to major exchange or institutional coverage initiation could drive re-rating and volume improvement.",
  },
];

export const COMPETITIVE_MOAT = {
  moatType: "Narrow — first-mover with accumulation advantage",
  strengths: [
    "First public ETH treasury company — brand recognition in niche",
    "2,141 ETH accumulated — cost basis advantage if ETH appreciates",
    "Operational infrastructure for rapid capital deployment",
    "NYSE listing provides regulatory compliance framework",
  ],
  weaknesses: [
    "Low barriers to entry — any company can adopt ETH treasury strategy",
    "ETH ETFs provide cheaper, more liquid passive exposure",
    "No proprietary technology or IP moat",
    "Dependent on capital markets remaining open for equity raises",
  ],
  vsETFs: "BMNR differentiates from ETH ETFs through: (1) staking yield (ETFs can't stake yet), (2) leveraged exposure via NAV premium, (3) equity structure enabling options/margin. However, if staking ETFs are approved, this advantage narrows significantly.",
};

// --- Risk Assessment ---

export interface RiskItem {
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  likelihood: "high" | "medium" | "low";
  mitigation: string;
}

export const RISK_MATRIX: RiskItem[] = [
  { risk: "ETH price decline (>50%)", severity: "critical", likelihood: "medium", mitigation: "Dollar-cost averaging via continuous purchases; staking yield provides income floor" },
  { risk: "NAV premium compression to 1x", severity: "critical", likelihood: "medium", mitigation: "Dividend initiation, staking yield expansion, and operational track record could sustain premium" },
  { risk: "Excessive dilution eroding per-share value", severity: "high", likelihood: "high", mitigation: "Only accretive if ETH appreciation > dilution rate; management must balance growth vs. existing shareholders" },
  { risk: "Regulatory crackdown on crypto equities", severity: "high", likelihood: "low", mitigation: "NYSE listing provides compliance framework; GENIUS Act trajectory is favorable" },
  { risk: "Smart contract / staking risk", severity: "high", likelihood: "low", mitigation: "Use institutional-grade staking providers; diversify across validators" },
  { risk: "Liquidity crisis — unable to raise capital", severity: "high", likelihood: "low", mitigation: "Maintain ATM program capacity; diversify funding sources" },
  { risk: "Management execution risk", severity: "medium", likelihood: "medium", mitigation: "Transparent 8-K reporting; simple business model reduces execution complexity" },
  { risk: "Competitor entry (larger ETH treasury co)", severity: "medium", likelihood: "medium", mitigation: "First-mover advantage; established accumulation base" },
];

export const STRATEGIC_ASSESSMENT =
  "BMNR is a high-risk, high-reward position suitable for investors with strong ETH conviction seeking leveraged equity exposure. The 9.9x NAV premium is the primary risk — if ETH drops 50% AND the premium compresses to 2x, the stock could decline 80%+. Conversely, ETH recovery to ATH ($4,800) with sustained premium implies 2-3x upside. Position sizing should reflect crypto-like volatility.";

export const POSITION_SIZING = {
  recommendation: "Small position (1-3% of portfolio) due to micro-cap, high-volatility, binary outcome profile",
  priceTargets: [
    { scenario: "Bear", ethPrice: 1500, navPremium: 2.0, impliedPrice: 0.13, upside: -86 },
    { scenario: "Base", ethPrice: 3500, navPremium: 5.0, impliedPrice: 0.75, upside: -21 },
    { scenario: "Bull", ethPrice: 5000, navPremium: 8.0, impliedPrice: 1.71, upside: 80 },
    { scenario: "Moon", ethPrice: 8000, navPremium: 10.0, impliedPrice: 3.43, upside: 261 },
  ],
  notes: "Price targets assume 48.5M shares outstanding (no further dilution). Actual targets will be lower with dilution factored in. See Valuation Calculator for dynamic modeling.",
};

// --- Analysis Archive ---

export interface AnalysisArchiveEntry {
  date: string;
  title: string;
  summary: string;
  verdict: string;
}

export const ANALYSIS_ARCHIVE: AnalysisArchiveEntry[] = [
  // Append-only — each update creates a dated snapshot
];

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
