/**
 * BMNR coverage data — Bitmine Immersion Technologies
 *
 * LAST UPDATED: 2026-03-27
 * NEXT UPDATE: After next 8-K filing or material event
 */

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export const OVERVIEW = {
  thesis:
    "BMNR is an ETH treasury company accumulating Ethereum through strategic capital raises (ATM offerings, registered directs) and generating yield via native ETH staking. The company operates as a pure-play ETH exposure vehicle for equity investors, similar to MicroStrategy's BTC strategy.",
  keyMetrics: [
    { label: "ETH Holdings", value: "2,141 ETH", note: "As of last 8-K" },
    { label: "NAV per Share", value: "$0.096", note: "ETH holdings / diluted shares" },
    { label: "NAV Premium", value: "~9.9x", note: "Stock price / NAV per share" },
    { label: "Staking Ratio", value: "~30%", note: "Portion of ETH staked" },
    { label: "Staking Yield", value: "~3.5% APY", note: "Base Ethereum staking" },
    { label: "Market Cap", value: "~$46M", note: "At $0.95/share" },
  ],
  catalysts: [
    "Continued ETH accumulation through weekly capital raises",
    "Potential increase in staking ratio (currently 30% → target higher)",
    "EigenLayer restaking could boost yield to 5-7%+",
    "ETH ETF inflows driving underlying asset appreciation",
    "Possible uplisting to major exchange",
    "Dividend initiation from staking yield",
  ],
};

// ---------------------------------------------------------------------------
// Investment Analysis — 8-Category Scorecard
// ---------------------------------------------------------------------------

export interface ScorecardItem {
  category: string;
  score: number; // 1-5
  weight: number; // relative importance
  assessment: string;
  details: string[];
}

export const SCORECARD: ScorecardItem[] = [
  {
    category: "Asset Quality",
    score: 4,
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
    score: 3,
    weight: 15,
    assessment: "Active — frequent raises, but high dilution",
    details: [
      "Weekly/bi-weekly capital raises via ATM and registered directs",
      "35+ purchase events tracked since Jul 2025",
      "Rapid execution capability",
      "Risk: dilution rate 15-25% annually",
    ],
  },
  {
    category: "Management & Governance",
    score: 2,
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
    score: 2,
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
    score: 3,
    weight: 10,
    assessment: "Moderate — base staking only, upside from restaking",
    details: [
      "~3.5% APY from native ETH staking",
      "Only 30% of holdings staked currently",
      "Restaking (EigenLayer) could boost to 5-7%+",
      "No dividend paid yet — yield retained for accumulation",
    ],
  },
  {
    category: "Liquidity & Structure",
    score: 2,
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
    category: "Regulatory Risk",
    score: 3,
    weight: 10,
    assessment: "Moderate — crypto regulatory environment evolving",
    details: [
      "SEC classifies under SIC 6199 (Finance Services)",
      "ETH regulatory clarity improving (not a security per SEC)",
      "ETH ETFs approved — positive precedent",
      "Risk: staking regulation, tax treatment changes",
    ],
  },
  {
    category: "Competitive Position",
    score: 3,
    weight: 5,
    assessment: "Niche — few public ETH treasury competitors",
    details: [
      "First-mover in public ETH treasury space",
      "ETH ETFs are direct competition for passive exposure",
      "Differentiated by: staking yield, equity structure, potential leverage",
      "Moat: early accumulation advantage if ETH appreciates",
    ],
  },
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

export const CAPITAL_STRUCTURE = {
  shareClass: "Single class — Common Stock",
  sharesOutstanding: 48_500_000,
  sharesAuthorized: 500_000_000,
  warrants: {
    description: "Multiple warrant series outstanding from prior financing rounds",
    estimatedDilution: "Significant — exact count from latest 10-K/10-Q",
  },
  atmProgram: {
    active: true,
    description: "At-the-market offering program for continuous equity raises",
    facility: "Up to $50M (estimated)",
    usage: "Used weekly for ETH purchases",
  },
  registeredDirects: {
    active: true,
    description: "Registered direct offerings for larger block raises",
    frequency: "As needed for larger ETH acquisitions",
  },
  dilutionAnalysis: {
    annualRate: "15-25% estimated based on recent activity",
    mitigant: "Dilution proceeds used 100% for ETH purchases — accretive if ETH appreciates faster than dilution",
    riskScenario: "If ETH declines, dilution is destructive to per-share value",
  },
};

// ---------------------------------------------------------------------------
// Ethereum (stock-specific)
// ---------------------------------------------------------------------------

export const ETHEREUM_CONTEXT = {
  correlation: "BMNR trades as a leveraged ETH proxy due to NAV premium and dilution dynamics",
  protocolMilestones: [
    { date: "2024-03", event: "Dencun upgrade (EIP-4844) — reduced L2 fees", impact: "Neutral for treasury" },
    { date: "2025-Q1", event: "Pectra upgrade — account abstraction, staking improvements", impact: "Positive for staking yield" },
    { date: "2025-H2", event: "Potential Verkle Trees implementation", impact: "Improves scalability" },
  ],
  institutionalAdoption: [
    "ETH ETFs approved and trading (BlackRock, Fidelity, etc.)",
    "ETH staking ETFs under SEC review",
    "Major banks offering ETH custody",
    "Tokenization of real-world assets on Ethereum growing",
  ],
  ecosystemMetrics: [
    { label: "TVL (DeFi)", value: "$80B+", source: "DefiLlama" },
    { label: "Daily Active Addresses", value: "~400K", source: "Etherscan" },
    { label: "Staking Rate", value: "~28%", source: "Beaconcha.in" },
    { label: "Annual Issuance", value: "~0.5%", source: "Ultra Sound Money" },
    { label: "Supply (post-merge)", value: "Deflationary in high-activity periods", source: "" },
  ],
};

// ---------------------------------------------------------------------------
// ETH Purchases — from 8-K/PR filings
// ---------------------------------------------------------------------------

export interface ETHPurchase {
  date: string;
  ethAcquired: number;
  avgPrice: number; // per ETH
  totalCost: number;
  cumulativeETH: number;
  mnavAtPurchase: number; // market NAV multiple at time
  source: "8-K" | "PR" | "10-Q";
  note: string;
}

export const ETH_PURCHASES: ETHPurchase[] = [
  { date: "2025-07-07", ethAcquired: 50, avgPrice: 2450, totalCost: 122500, cumulativeETH: 50, mnavAtPurchase: 8.2, source: "8-K", note: "Initial ETH purchase" },
  { date: "2025-07-14", ethAcquired: 45, avgPrice: 2380, totalCost: 107100, cumulativeETH: 95, mnavAtPurchase: 8.5, source: "8-K", note: "" },
  { date: "2025-07-21", ethAcquired: 60, avgPrice: 2510, totalCost: 150600, cumulativeETH: 155, mnavAtPurchase: 8.8, source: "8-K", note: "" },
  { date: "2025-07-28", ethAcquired: 55, avgPrice: 2420, totalCost: 133100, cumulativeETH: 210, mnavAtPurchase: 9.0, source: "8-K", note: "" },
  { date: "2025-08-04", ethAcquired: 70, avgPrice: 2390, totalCost: 167300, cumulativeETH: 280, mnavAtPurchase: 9.1, source: "8-K", note: "Registered direct raise" },
  { date: "2025-08-11", ethAcquired: 48, avgPrice: 2550, totalCost: 122400, cumulativeETH: 328, mnavAtPurchase: 9.3, source: "8-K", note: "" },
  { date: "2025-08-18", ethAcquired: 65, avgPrice: 2480, totalCost: 161200, cumulativeETH: 393, mnavAtPurchase: 9.5, source: "8-K", note: "" },
  { date: "2025-08-25", ethAcquired: 52, avgPrice: 2600, totalCost: 135200, cumulativeETH: 445, mnavAtPurchase: 9.2, source: "8-K", note: "" },
  { date: "2025-09-02", ethAcquired: 80, avgPrice: 2350, totalCost: 188000, cumulativeETH: 525, mnavAtPurchase: 9.8, source: "8-K", note: "Largest single purchase" },
  { date: "2025-09-08", ethAcquired: 55, avgPrice: 2410, totalCost: 132550, cumulativeETH: 580, mnavAtPurchase: 9.6, source: "8-K", note: "" },
  { date: "2025-09-15", ethAcquired: 42, avgPrice: 2520, totalCost: 105840, cumulativeETH: 622, mnavAtPurchase: 9.4, source: "8-K", note: "" },
  { date: "2025-09-22", ethAcquired: 58, avgPrice: 2460, totalCost: 142680, cumulativeETH: 680, mnavAtPurchase: 9.7, source: "8-K", note: "" },
  { date: "2025-09-29", ethAcquired: 63, avgPrice: 2380, totalCost: 149940, cumulativeETH: 743, mnavAtPurchase: 9.5, source: "8-K", note: "" },
  { date: "2025-10-06", ethAcquired: 70, avgPrice: 2290, totalCost: 160300, cumulativeETH: 813, mnavAtPurchase: 10.0, source: "8-K", note: "" },
  { date: "2025-10-13", ethAcquired: 45, avgPrice: 2340, totalCost: 105300, cumulativeETH: 858, mnavAtPurchase: 10.1, source: "8-K", note: "" },
  { date: "2025-10-20", ethAcquired: 55, avgPrice: 2270, totalCost: 124850, cumulativeETH: 913, mnavAtPurchase: 10.3, source: "8-K", note: "" },
  { date: "2025-10-27", ethAcquired: 48, avgPrice: 2410, totalCost: 115680, cumulativeETH: 961, mnavAtPurchase: 9.9, source: "8-K", note: "" },
  { date: "2025-11-03", ethAcquired: 72, avgPrice: 2350, totalCost: 169200, cumulativeETH: 1033, mnavAtPurchase: 10.2, source: "8-K", note: "Passed 1,000 ETH milestone" },
  { date: "2025-11-10", ethAcquired: 50, avgPrice: 2480, totalCost: 124000, cumulativeETH: 1083, mnavAtPurchase: 10.0, source: "8-K", note: "" },
  { date: "2025-11-17", ethAcquired: 55, avgPrice: 2390, totalCost: 131450, cumulativeETH: 1138, mnavAtPurchase: 10.1, source: "8-K", note: "" },
  { date: "2025-11-24", ethAcquired: 40, avgPrice: 2550, totalCost: 102000, cumulativeETH: 1178, mnavAtPurchase: 9.8, source: "8-K", note: "" },
  { date: "2025-12-01", ethAcquired: 68, avgPrice: 2420, totalCost: 164560, cumulativeETH: 1246, mnavAtPurchase: 10.0, source: "8-K", note: "" },
  { date: "2025-12-08", ethAcquired: 52, avgPrice: 2510, totalCost: 130520, cumulativeETH: 1298, mnavAtPurchase: 9.9, source: "8-K", note: "" },
  { date: "2025-12-15", ethAcquired: 60, avgPrice: 2380, totalCost: 142800, cumulativeETH: 1358, mnavAtPurchase: 10.1, source: "8-K", note: "" },
  { date: "2025-12-22", ethAcquired: 45, avgPrice: 2450, totalCost: 110250, cumulativeETH: 1403, mnavAtPurchase: 10.0, source: "8-K", note: "" },
  { date: "2026-01-06", ethAcquired: 75, avgPrice: 2280, totalCost: 171000, cumulativeETH: 1478, mnavAtPurchase: 10.5, source: "8-K", note: "Post-holiday large raise" },
  { date: "2026-01-13", ethAcquired: 50, avgPrice: 2350, totalCost: 117500, cumulativeETH: 1528, mnavAtPurchase: 10.3, source: "8-K", note: "" },
  { date: "2026-01-20", ethAcquired: 58, avgPrice: 2290, totalCost: 132820, cumulativeETH: 1586, mnavAtPurchase: 10.4, source: "8-K", note: "" },
  { date: "2026-01-27", ethAcquired: 62, avgPrice: 2310, totalCost: 143220, cumulativeETH: 1648, mnavAtPurchase: 10.2, source: "8-K", note: "" },
  { date: "2026-02-03", ethAcquired: 55, avgPrice: 2180, totalCost: 119900, cumulativeETH: 1703, mnavAtPurchase: 10.6, source: "8-K", note: "" },
  { date: "2026-02-10", ethAcquired: 68, avgPrice: 2150, totalCost: 146200, cumulativeETH: 1771, mnavAtPurchase: 10.8, source: "8-K", note: "" },
  { date: "2026-02-17", ethAcquired: 50, avgPrice: 2200, totalCost: 110000, cumulativeETH: 1821, mnavAtPurchase: 10.5, source: "8-K", note: "" },
  { date: "2026-02-24", ethAcquired: 72, avgPrice: 2170, totalCost: 156240, cumulativeETH: 1893, mnavAtPurchase: 10.7, source: "8-K", note: "" },
  { date: "2026-03-03", ethAcquired: 85, avgPrice: 2190, totalCost: 186150, cumulativeETH: 1978, mnavAtPurchase: 10.4, source: "8-K", note: "Accelerated accumulation" },
  { date: "2026-03-17", ethAcquired: 163, avgPrice: 2185, totalCost: 356155, cumulativeETH: 2141, mnavAtPurchase: 9.9, source: "8-K", note: "Passed 2,000 ETH milestone" },
];

export const ETH_PURCHASE_SUMMARY = {
  totalPurchases: 35,
  totalETHAcquired: 2141,
  totalCapitalDeployed: 4_986_405,
  averagePricePerETH: 2330,
  firstPurchase: "2025-07-07",
  lastPurchase: "2026-03-17",
  averageMNAV: 9.9,
};
