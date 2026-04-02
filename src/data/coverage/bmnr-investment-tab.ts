/**
 * BMNR — Investment tab copy (Due Diligence, scorecard, thesis, risks, archive).
 * LAST UPDATED: 2026-03-31
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LetterGrade = "A" | "A+" | "B" | "B+" | "C" | "D" | "F";

export interface ScorecardItem {
  category: string;
  grade: LetterGrade;
  /** Omit from UI when 0 */
  weight: number;
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

export type GrowthImpactLevel = "Critical" | "High" | "Medium" | "Low";

export interface GrowthDriverItem {
  driver: string;
  impactLevel: GrowthImpactLevel;
  description: string;
}

export interface MoatSourceRow {
  name: string;
  strength: string;
}

export interface MoatThreatRow {
  name: string;
  level: string;
}

export interface RiskItem {
  risk: string;
  severity: "critical" | "high" | "medium" | "low";
  likelihood: "high" | "medium" | "low";
  mitigation: string;
}

export interface AllocationRow {
  profile: string;
  range: string;
}

export interface AccumulationZoneRow {
  navRange: string;
  action: string;
}

export interface AnalysisArchiveEntry {
  date: string;
  title: string;
  summary: string;
  verdict: string;
}

export interface StrategicPerspectiveBlock {
  title: string;
  subtitle: string;
  body: string;
}

export interface KeyStrategicQuestion {
  question: string;
  theCase: string;
  hesitation: string;
  verdict: string;
}

export interface EcosystemTriggerColumn {
  title: string;
  lines: string[];
}

export interface CfaGlossaryItem {
  term: string;
  definition: string;
}

// ---------------------------------------------------------------------------
// Due diligence header + current assessment
// ---------------------------------------------------------------------------

export const INVESTMENT_DUE_DILIGENCE = {
  sectionLabel: "DUE DILIGENCE",
  title: "Investment Analysis.",
  description:
    "Multi-perspective due diligence with 8-category scorecard, growth drivers, competitive moat, risk matrix, and historical archive.",
  dataAsOf: "2026-02-23",
  sourceLine:
    "February 23, 2026 — Updated: PR: 4.423M ETH Holdings + $9.6B Total + 3.66% Supply + 73% to Alchemy of 5%",
};

export const INVESTMENT_CURRENT_ASSESSMENT = {
  verdict: "STRONG BUY",
  ticker: "BMNR",
  tagline: "The ETH Supercycle Play",
  lastUpdated: "2026-02-23",
  trigger:
    "February 23, 2026 — Updated: PR: 4.423M ETH Holdings + $9.6B Total + 3.66% Supply + 73% to Alchemy of 5%",
  scorecardOverallGrade: "A" as LetterGrade,
  headlineMetrics: [
    { label: "NAV/Share", value: "$23.14", sub: "@ $2,185 ETH" },
    { label: "Total Holdings", value: "$11.5B", sub: "4.596M ETH + $1.2B Cash" },
    { label: "Staked ETH", value: "3.04M", sub: "$6.6B VALUE (66.2%)" },
  ],
};

// ---------------------------------------------------------------------------
// Scorecard (8 categories) + ecosystem
// ---------------------------------------------------------------------------

export const SCORECARD: ScorecardItem[] = [
  {
    category: "Financial Strength",
    grade: "A+",
    weight: 0,
    assessment: "Solid: $9.6B total holdings, $691M cash, zero debt (ETH down to $1,958)",
    details: [],
  },
  {
    category: "Profitability",
    grade: "A+",
    weight: 0,
    assessment: "Staking yield: $171M/yr annualized (68.7% deployed, 2.81% CESR), dividend initiated",
    details: [],
  },
  {
    category: "Growth",
    grade: "A+",
    weight: 0,
    assessment: '3.66% ETH supply, 73% to "Alchemy of 5%", $24.5B ATM capacity',
    details: [],
  },
  {
    category: "Valuation",
    grade: "A+",
    weight: 0,
    assessment: "Below NAV at $1,958 ETH — deep value, ETH -62% from 2025 highs, V-shaped recoveries expected",
    details: [],
  },
  {
    category: "Competitive Position",
    grade: "A+",
    weight: 0,
    assessment: "#1 ETH treasury globally, 4yr+ head start, scale nearly unassailable",
    details: [],
  },
  {
    category: "Execution",
    grade: "B+",
    weight: 0,
    assessment: "Flawless pivot, Young Kim CFO/COO, 81% YES shareholder vote, MAVAN Q1",
    details: [],
  },
  {
    category: "Regulatory/External",
    grade: "A",
    weight: 0,
    assessment: "Pro-crypto admin, GENIUS Act + SEC Project Crypto; SEC/staking risk persists",
    details: [],
  },
  {
    category: "Capital Structure",
    grade: "A",
    weight: 0,
    assessment: "500K+ stockholders, #165 most traded, $200M Beast Industries closed",
    details: [],
  },
];

export const ECOSYSTEM_HEALTH: EcosystemHealth = {
  title: "Ecosystem Health",
  description: "Ethereum network fundamentals (see Ethereum tab for details)",
  overallGrade: "A",
  metrics: [
    { label: "ETF Flows (7d)", value: "+$340M", status: "bullish", statusLabel: "✓ Bullish" },
    { label: "Staking Rate", value: "28.3%", status: "healthy", statusLabel: "✓ Healthy" },
    { label: "DeFi TVL Trend", value: "$62.4B", status: "growing", statusLabel: "✓ Growing" },
    { label: "Supply Growth", value: "-0.2%", status: "deflationary", statusLabel: "✓ Deflationary" },
    { label: "Protocol Progress", value: "Fusaka Live", status: "upgraded", statusLabel: "✓ Upgraded" },
  ],
  commentary:
    "Strong ecosystem tailwinds despite ETH price weakness (-62% from 2025 highs). Ethereum daily txns hit ATH (2.5M), active addresses ATH (1M daily). Tom Lee: ETH prices see V-shaped recoveries from 50%+ drops (8th time since 2018). GENIUS Act + SEC Project Crypto transformational.",
};

// ---------------------------------------------------------------------------
// Investment summary (What's New + thesis blocks)
// ---------------------------------------------------------------------------

export const INVESTMENT_SUMMARY_WHATS_NEW_TITLE =
  "What's New (February 23, 2026 — Updated: PR: 4.423M ETH Holdings + $9.6B Total + 3.66% Supply + 73% to Alchemy of 5%)";

export const INVESTMENT_SUMMARY_WHATS_NEW_BULLETS = [
  'Tom Lee: "mini crypto winter" — 3 secular drivers: Wall Street tokenization, AI/agentic-AI on smart blockchains, creator economy verification',
  '"Price of ETH is not reflective of the high utility of ETH" — Tom Lee',
  'Acquired 51,162 ETH in past week — largest weekly buy in recent weeks, now 3.66% of supply (73% to 5%)',
  "Cash builds to $691M (+$21M WoW) despite continued aggressive accumulation",
  "Staked ETH: 3.04M (68.7%) — mechanical decline in ratio as new ETH not yet staked",
  "ETH -62% from 2025 highs, annualized staking revenue: $171M (2.81% CESR)",
  "BNP Paribas same week tokenizing on public Ethereum — validates thesis",
  "Headline: BMNR is the single best way to play the Ethereum supercycle with downside protection.",
];

export const INVESTMENT_SUMMARY_HEADLINE =
  "Thesis: This is not just another crypto stock. BMNR has created something unprecedented: a yield-generating, dividend-paying, institutionally-accessible vehicle for leveraged ETH exposure.  They own 3.66% of all Ethereum in existence — 4.423 million tokens. They're over 73% of the way to 5%. No one else is even close.  The MSTR playbook worked. BMNR is running the same play on a yield-bearing asset — and paying you to wait. With $691M cash and $24.5B ATM capacity, the accumulation machine keeps running. 3.04M ETH staked (68.7% of holdings). CESR rate at 2.81%. ETH -62% from 2025 highs — Tom Lee: \"mini crypto winter\" — 3 secular drivers gaining traction (tokenization, AI agents, creators). MAVAN on track Q1 2026.";

export const INVESTMENT_SUMMARY_CLOSING_QUOTE =
  '"If you believe ETH goes higher, BMNR is the trade. If you\'re wrong, $9.6B in assets, staking income ($171M/yr annualized at 68.7% staked, $249M at full MAVAN scale), and NAV floor limit your downside. Asymmetric."';

// Legacy single string — composed in UI from parts above; kept for any grep consumers
export const INVESTMENT_SUMMARY = INVESTMENT_SUMMARY_HEADLINE;

// ---------------------------------------------------------------------------
// Growth drivers
// ---------------------------------------------------------------------------

export const GROWTH_DRIVERS: GrowthDriverItem[] = [
  {
    driver: "ETH Price Appreciation",
    impactLevel: "Critical",
    description:
      "Every $1,000 ETH move = $4.4B NAV change. ETH -62% from highs — \"mini crypto winter\", V-shaped recovery expected. At $10K, NAV/share hits $99+.",
  },
  {
    driver: "Staking Income Scale",
    impactLevel: "High",
    description:
      "3.04M ETH staked ($6.0B, 68.7% of holdings). Annualized: $171M, $249M at full MAVAN scale (2.81% CESR).",
  },
  {
    driver: "NAV Premium Expansion",
    impactLevel: "High",
    description: "Currently below NAV at $1,958 ETH. MSTR trades 2-3x. Gap closure = significant upside.",
  },
  {
    driver: "Continued Accumulation",
    impactLevel: "High",
    description: "$691M cash + $24.5B ATM capacity. 81% YES vote unlocks massive share authorization.",
  },
  {
    driver: "Dividend Growth",
    impactLevel: "Medium",
    description: "Started at $0.04/yr. As staking scales (now 68.7%), expect 10-20% annual dividend growth.",
  },
  {
    driver: "Ethereum Ecosystem Catalyst",
    impactLevel: "High",
    description:
      "Adoption Thesis: As more companies build on Ethereum (DeFi protocols, tokenized assets, on-chain payments, gaming), network activity and transaction fees increase. Greater Ethereum utility drives fundamental demand for ETH, directly benefiting BMNR's treasury holdings.\n\nCross-Portfolio Note: This thesis is doubly bullish for portfolios holding both BMNR and CRCL — Ethereum adoption drives ETH price appreciation (BMNR NAV) and increases USDC demand for on-chain settlement (CRCL revenue). The positions are positively correlated through Ethereum ecosystem growth.",
  },
];

// ---------------------------------------------------------------------------
// Competitive moat
// ---------------------------------------------------------------------------

export const COMPETITIVE_MOAT_SOURCES: MoatSourceRow[] = [
  { name: "Scale Dominance", strength: "Strong" },
  { name: "Yield Advantage", strength: "Strong" },
  { name: "Capital Access", strength: "Strong" },
  { name: "Management Depth", strength: "Strong" },
  { name: "Retail Base", strength: "Strong" },
];

export const COMPETITIVE_MOAT_SOURCES_DETAIL: Record<string, string> = {
  "Scale Dominance": "4.423M ETH = 3.66% of total supply. #1 ETH treasury, #2 global crypto treasury behind MSTR.",
  "Yield Advantage":
    "Only ETH treasury generating staking yield AND paying dividends. 3.04M ETH staked, $171M/yr annualized (2.81% CESR).",
  "Capital Access": "$691M cash + $24.5B ATM + 81% shareholder YES vote unlocks massive issuance capacity.",
  "Management Depth":
    "Tom Lee (Chairman) + Young Kim CFO/COO (MIT/HBS, 20yr institutional PM). Backed by ARK, Founders Fund, Pantera, Galaxy, Bill Miller III.",
  "Retail Base": "500K+ individual stockholders. #165 most traded US stock ($0.7B/day). Deep liquidity.",
};

export const COMPETITIVE_THREATS: MoatThreatRow[] = [
  { name: "ETH Price Collapse", level: "Critical" },
  { name: "NAV Premium Evaporation", level: "High" },
  { name: "Regulatory Crackdown", level: "Medium" },
  { name: "New Competitors", level: "Low" },
];

export const COMPETITIVE_THREATS_DETAIL: Record<string, string> = {
  "ETH Price Collapse": "-70% drawdown would devastate NAV. At $1K ETH, NAV/share drops to ~$9.70.",
  "NAV Premium Evaporation": "Currently near NAV. Could drop to 0.5x or worse. GBTC traded at -40% discount for years.",
  "Regulatory Crackdown": "SEC declares ETH a security, bans staking, or targets crypto treasuries.",
  "New Competitors": "Scale advantage nearly unassailable — years + billions required to catch up.",
};

export const MOAT_DURABILITY =
  "Moat Durability: A- (Strong). Scale advantage is nearly unassailable — would take years and billions for competitors to catch up. Yield advantage over BTC treasuries is permanent. Key risk is ETH price, not competitive dynamics.";

/** @deprecated UI uses MOAT_DURABILITY + structured rows; kept for imports */
export const COMPETITIVE_MOAT = {
  moatType: "MOAT SOURCES",
  strengths: COMPETITIVE_MOAT_SOURCES.map((s) => `${s.name} — ${COMPETITIVE_MOAT_SOURCES_DETAIL[s.name]}`),
  weaknesses: COMPETITIVE_THREATS.map((t) => `${t.name} — ${COMPETITIVE_THREATS_DETAIL[t.name]}`),
  vsETFs: MOAT_DURABILITY,
};

// ---------------------------------------------------------------------------
// Risk matrix
// ---------------------------------------------------------------------------

export const RISK_MATRIX: RiskItem[] = [
  {
    risk: "ETH Price Collapse",
    severity: "critical",
    likelihood: "low",
    mitigation:
      "The existential risk. A -70% drawdown would devastate NAV. At $1,000 ETH, NAV/share drops to ~$9.90. This is a leveraged ETH bet.\n\nMitigation: Staking income ($249M/yr at full MAVAN scale) provides cushion; NAV floor via $1B buyback authorization.",
  },
  {
    risk: "NAV Premium Evaporation",
    severity: "high",
    likelihood: "medium",
    mitigation:
      "Currently below NAV at $1,958 ETH. If sentiment shifts further, could drop to 0.5x. GBTC traded at -40% discount for years.\n\nMitigation: $1B buyback at discount provides floor; dividend yield supports valuation.",
  },
  {
    risk: "Regulatory Crackdown",
    severity: "medium",
    likelihood: "low",
    mitigation:
      "SEC declares ETH a security, bans staking, or targets crypto treasuries. Current environment favorable but politics change.\n\nMitigation: Diversified staking providers; compliance-first approach; MAVAN US-based.",
  },
  {
    risk: "MAVAN Execution Failure",
    severity: "medium",
    likelihood: "low",
    mitigation:
      "Delays or technical issues with proprietary staking. On track for Q1 2026 launch.\n\nMitigation: Third-party providers already operational (3.04M staked); upside risk, not existential.",
  },
  {
    risk: "Dilution Fatigue",
    severity: "low",
    likelihood: "low",
    mitigation:
      "Market stops funding ATMs at premium. Would slow accumulation but not fatal.\n\nMitigation: $691M cash + staking income ($171M/yr annualized) provides runway without issuance.",
  },
];

// ---------------------------------------------------------------------------
// Strategic assessment — four perspectives + Q&A + ecosystem triggers
// ---------------------------------------------------------------------------

export const STRATEGIC_ASSESSMENT_INTRO =
  "Multi-perspective risk evaluation and strategic decision framework for ETH treasury exposure";

export const STRATEGIC_PERSPECTIVES: StrategicPerspectiveBlock[] = [
  {
    title: "CFA LEVEL III",
    subtitle: "Portfolio Construction & Factor Analysis",
    body: `Factor Exposures: BMNR exhibits ~0.85 beta to ETH with additional equity volatility from NAV premium fluctuations. Correlation to BTC ~0.7, SPY ~0.3. This is levered crypto exposure — expect 1.2-1.5x ETH moves in both directions. The staking yield (3-5% APY on ETH) provides modest carry but doesn't materially reduce volatility. Position sizing must account for crypto-like drawdowns (50-80% peak-to-trough historically).

Liquidity Analysis: Average daily volume ~$2-5M — adequate for retail but challenging for institutional blocks >$500K without market impact. Bid-ask spreads can widen to 1-2% in volatility. This is a small-cap ($50-150M market cap) with corresponding liquidity constraints. Consider multi-day accumulation for positions >1% of portfolio.

Governance & ESG: Founder-controlled via Class B shares. Management pivoted successfully from BTC mining — demonstrates adaptability but also thesis drift risk. ESG profile mixed: PoS staking is energy-efficient, but crypto association carries headline risk. No dividend history despite recent announcement — track record TBD.

Ecosystem Assessment: Ethereum network fundamentals support the thesis despite price weakness. ATH daily txns (2.5M), ATH active addresses (1M), deflationary supply (-0.2%), and growing institutional adoption via ETFs. $171M annual staking income at current 68.7% deployment (2.81% CESR). Tom Lee: "mini crypto winter" — 3 secular drivers gaining traction.`,
  },
  {
    title: "HEDGE FUND",
    subtitle: "Alpha Generation & Event Catalysts",
    body: `NAV Arbitrage: BMNR trades at varying premiums/discounts to NAV. When premium compresses to <10%, accumulate. When premium expands to >50%, trim. This is the core tactical playbook. Track ETH price × holdings ÷ shares = NAV per share, compare to stock price daily. Premium mean-reverts over 30-60 day windows.

Catalyst Stacking: Key events: (1) MAVAN infrastructure launch — validates yield thesis, (2) ETH ETF approval/flows — institutional demand driver, (3) Quarterly ETH accumulation PRs — shows execution, (4) Staking deployment milestones — unlocks yield narrative. Each positive catalyst builds momentum. Position into catalysts, trim into strength.

Cycle Positioning: ETH treasury equities are leveraged bets on crypto cycles. In bull markets, NAV premiums expand and stock outperforms ETH. In bear markets, premiums compress and stock underperforms ETH. We're in early-to-mid cycle based on halving timing. Aggressive accumulation phase, but maintain stop-losses for cycle turn protection.

Ecosystem Assessment: ETH price dislocation is the opportunity. $691M cash + $24.5B ATM = unlimited firepower. 3.04M ETH staked (68.7%, $171M/yr). Tom Lee: 3 secular drivers (tokenization, AI agents, creators). "Price of ETH is not reflective of high utility." Best entry points come after sharp declines.`,
  },
  {
    title: "CIO / CIS",
    subtitle: "Strategic Allocation & Fiduciary Considerations",
    body: `Strategic Thesis: BMNR offers "yield-bearing ETH exposure in equity wrapper" — the only way to get staking yield through traditional brokerage accounts. For investors who can't or won't hold ETH directly, this provides compliant exposure to ETH + staking yield. Think of it as the "MSTR for ETH" with added yield kicker.

Portfolio Fit: Classify as "alternative/crypto allocation" not "equity." Size within crypto bucket (typically 1-5% of portfolio for aggressive investors, 0% for conservative). Do not benchmark against S&P — this will underperform in risk-off environments. Appropriate for investors with 3-5 year horizons who can stomach 50%+ drawdowns.

Reputational Risk: Small-cap crypto equity carries headline risk. However, the pivot from BTC mining to ETH treasury is defensible ("we followed the yield opportunity"). If questioned: "It's a regulated equity providing exposure to Ethereum staking infrastructure, not speculative tokens." The yield narrative differentiates from pure crypto speculation.

Ecosystem Assessment: Ecosystem maturation reduces tail risk despite -62% price decline. ETH fundamentals at ATH (2.5M daily txns, 1M active addresses). Beast Industries ($200M, CLOSED) expands GenZ reach. GENIUS Act + SEC Project Crypto as transformational as ending Bretton Woods in 1971. Tom Lee: "mini crypto winter" — sentiment at rock bottom = contrarian entry.`,
  },
  {
    title: "TECHNICAL ANALYST",
    subtitle: "Chart Patterns & Price Action",
    body: `Trend Structure: Price action shows higher highs and higher lows since ETH treasury pivot — classic uptrend structure. Weekly RSI holding above 50 confirms sustained bullish momentum. MACD histogram expanding on daily timeframe. Key support at 20-day SMA has held on all pullbacks — this is your buy zone.

ETH Correlation: BMNR exhibits 0.85-0.95 correlation with ETH on 30-day rolling basis — trade it as leveraged ETH proxy. When ETH breaks key levels, BMNR moves 1.2-1.5x. Watch ETH $3,500 support and $4,200 resistance for directional cues on BMNR positioning.

NAV Premium Cycles: NAV premium/discount provides tactical entry/exit signals independent of price. Accumulate aggressively below 1.0x NAV (discount = free money). Trim 20-30% above 1.5x NAV. Current Bollinger Band squeeze on weekly suggests imminent volatility expansion — prepare for directional move.

Technical Outlook: BMNR exhibits 0.85-0.95 correlation with ETH on 30-day rolling basis — trade it as leveraged ETH proxy. NAV premium/discount cycles provide tactical entry/exit signals: accumulate below 1.0x NAV, trim above 1.5x NAV. Watch ETH $3,500 support and $4,200 resistance for directional cues. Bollinger Band squeeze on weekly suggests imminent volatility expansion.`,
  },
];

export const KEY_STRATEGIC_QUESTIONS: KeyStrategicQuestion[] = [
  {
    question: "Would I Buy Now?",
    theCase:
      "YES — ACCUMULATE ON DIPS\n\nThe Case: At current NAV premium levels, you're getting ETH exposure + staking yield + management execution at a reasonable markup. The \"Alchemy of 5%\" thesis (premium issuance → NAV accretion) is mathematically sound and management is executing. First-mover advantage in ETH treasury space creates optionality.",
    hesitation:
      "The Hesitation: This is highly correlated to ETH — if ETH drops 50%, expect BMNR to drop 50-70%. Small-cap liquidity means exits can be painful. Management track record is short (pivot was recent). NAV premium can compress rapidly in risk-off environments.",
    verdict:
      "The Verdict: Yes, but size appropriately and accumulate on weakness. Don't chase NAV premiums >40%. Build position over 4-6 weeks using NAV discount as entry signal. This is a high-conviction, high-volatility position — treat it as levered ETH, not a stock.",
  },
  {
    question: "What Can I Expect?",
    theCase:
      "Short-Term (0-6 months)\n\nExpect ETH-correlated volatility ±30-50%. NAV premium will fluctuate with sentiment. Key catalysts: MAVAN progress, ETH accumulation PRs, staking deployment updates. Trading range tied to ETH — if ETH $3-5K, expect BMNR $3-8 range (rough).",
    hesitation:
      "Mid-Term (6-18 months)\n\nIf ETH cycle continues upward, NAV premium expansion drives outsized returns. Target: 2-4x from entry if ETH doubles and premium expands. Risk: cycle reversal could mean 60-80% drawdown. MAVAN fully operational should validate yield thesis.",
    verdict:
      "Long-Term (3-5 years)\n\nIf ETH reaches $10-20K cycle highs and BMNR executes on accumulation, this could be a 5-10x from current levels. But crypto cycles are brutal — expect at least one 70%+ drawdown along the way. Diamond hands required. Position size must allow holding through drawdowns.",
  },
  {
    question: "What's My Strategy?",
    theCase:
      "Position Sizing: 1-3% for aggressive crypto-tolerant portfolios, 0.5-1% for growth-oriented, avoid for balanced/conservative. This is your \"high-octane ETH exposure\" position. Never more than you can watch drop 70% without panic selling.\n\nEntry Approach: Accumulate when NAV premium <20%. Add aggressively when premium <10% or at discount. Reduce when premium >50%. Use 4-6 week DCA to avoid catching falling knives. Set limit orders at target NAV premium levels.\n\nExit Strategy: Trim 25% at 2x, another 25% at 3x. Let remaining 50% ride with trailing stop at -30% from highs. Full exit if thesis breaks (management stops accumulating, yield thesis fails, competitive moat erodes).",
    hesitation:
      "Risk Management: Set mental stop at -50% from entry (not hard stop — liquidity issues). If ETH enters confirmed bear market (below 200-day MA for 60+ days), reduce position by 50%. Re-enter when cycle turns. Don't try to catch the exact bottom.",
    verdict: "",
  },
];

export const ECOSYSTEM_TRIGGERS_INTRO =
  "Monitor these Ethereum ecosystem signals (see Ethereum tab) alongside BMNR-specific metrics";

export const ECOSYSTEM_TRIGGER_COLUMNS: EcosystemTriggerColumn[] = [
  {
    title: "Entry Signals (Consider Adding)",
    lines: [
      "→ ETF net flows positive 3+ weeks",
      "→ DeFi TVL expanding >5% monthly",
      "→ Major protocol upgrade successful",
      "→ Enterprise adoption announcement",
      "→ Staking rate stable or growing",
    ],
  },
  {
    title: "Exit Signals (Consider Reducing)",
    lines: [
      "→ ETF outflows >$500M for 2+ weeks",
      "→ DeFi TVL contracting >10% monthly",
      "→ Protocol upgrade delayed 6+ months",
      "→ Regulatory enforcement on ETH",
      "→ Staking rate declining >2%",
    ],
  },
  {
    title: "Hold Signals (Stay Course)",
    lines: [
      "→ Mixed or flat ETF flows",
      "→ Sideways DeFi activity",
      "→ Protocol development on track",
      "→ No major regulatory changes",
      "→ Ecosystem metrics stable",
    ],
  },
];

// ---------------------------------------------------------------------------
// Position sizing
// ---------------------------------------------------------------------------

export const POSITION_SIZING_ALLOCATION_INTRO = "RECOMMENDED ALLOCATION";

export const POSITION_SIZING_ALLOCATION_ROWS: AllocationRow[] = [
  { profile: "Aggressive", range: "8-12%" },
  { profile: "Growth", range: "4-8%" },
  { profile: "Balanced", range: "2-4%" },
  { profile: "Conservative", range: "0-2%" },
];

export const POSITION_SIZING_ZONES_TITLE = "ACCUMULATION ZONES";

export const POSITION_SIZING_ZONES: AccumulationZoneRow[] = [
  { navRange: "Below 0.85x NAV", action: "Aggressive accumulation" },
  { navRange: "0.85x-1.0x NAV", action: "Normal accumulation" },
  { navRange: "1.0x-1.25x NAV", action: "Hold / Add on dips" },
  { navRange: "1.25x-1.7x NAV", action: "Hold core position" },
  { navRange: "Above 1.7x NAV", action: "Trim 20-30%" },
];

export const POSITION_SIZING_PORTFOLIO_TITLE = "PORTFOLIO CONSTRUCTION CONTEXT";

export const POSITION_SIZING_PORTFOLIO_LINES = [
  "For multi-asset portfolios holding BMNR alongside other positions",
  "ASSET CLASS BUCKET — Alternatives / Crypto — Limit: 10-20% of portfolio",
  "SINGLE-NAME LIMIT — 5-10% max — High volatility asset",
  "CORRELATION NOTE — BMNR + CRCL — Both ETH-correlated; size combined",
  "Combined Crypto Allocation: If holding both BMNR and CRCL, treat as a single \"Ethereum ecosystem\" allocation. Combined weight should not exceed alternatives bucket limit. BMNR provides NAV/yield exposure; CRCL provides infrastructure/revenue exposure.",
];

/** Legacy shape — scenario table removed for 1:1 spec; notes empty */
export const POSITION_SIZING = {
  recommendation:
    "POSITION SIZING & PRICE TARGETS — See recommended allocation and accumulation zones below.",
  priceTargets: [] as { scenario: string; ethPrice: number; navPremium: number; impliedPrice: number; upside: number }[],
  notes: "",
};

// ---------------------------------------------------------------------------
// Analysis archive (newest first) — align holdings lines with ETH_PURCHASES + timeline
// ---------------------------------------------------------------------------

export const ANALYSIS_ARCHIVE: AnalysisArchiveEntry[] = [
  {
    date: "2026-03-30",
    title: "STRONG BUY",
    summary:
      "PR: 4.732M ETH + $10.7B Stack + 3.92% Supply + +71,179 ETH Week + MAVAN Live + Cash $961M + ORBS $102M",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-03-25",
    title: "STRONG BUY",
    summary:
      "PR: MAVAN Launched — institutional ETH staking; +101,776 ETH routed to MAVAN (week); forward ~$300M/yr staking at scale",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-03-23",
    title: "STRONG BUY",
    summary:
      "PR: 4.661M ETH + $11.0B Stack + 3.86% Supply + +65,341 ETH Week + Staked 3.14M + CESR/7d 2.75%/2.83%",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-03-17",
    title: "STRONG BUY",
    summary:
      "8-K: Tom Lee Hong Kong investor presentation (Reg FD, Ex. 99.1) + HQ relocation to Norwalk, CT",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-03-16",
    title: "STRONG BUY",
    summary:
      "PR: 4.596M ETH + $11.5B Total + 3.81% Supply + 76% to Alchemy of 5% + ORBS +$80M step-up + EF 5K ETH + +60,999 ETH Week",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-03-12",
    title: "STRONG BUY",
    summary:
      "PR: Eightco (ORBS) $125M — BMNR $75M lead + ARK $25M + Payward $25M; Tom Lee joins ORBS board",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-03-09",
    title: "STRONG BUY",
    summary:
      "PR: 4.535M ETH + Weekly +60,976 ETH @ ~$1,965 + Stack rebuild post-drawdown week",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-03-02",
    title: "STRONG BUY",
    summary:
      "PR: 4.474M ETH + Weekly +50,928 ETH @ ~$1,976 + Sustained >45k ETH/week pace",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-02-23",
    title: "STRONG BUY",
    summary: "PR: 4.423M ETH Holdings + $9.6B Total + 3.66% Supply + 73% to Alchemy of 5%",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-02-17",
    title: "STRONG BUY",
    summary: "PR: 4.371M ETH Holdings + $9.6B Total + Staking 3.04M (69.5%)",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-02-09",
    title: "STRONG BUY",
    summary: "PR: 4.326M ETH Holdings + $10.0B Total + ETH -62% from Highs",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-02-02",
    title: "STRONG BUY",
    summary: "PR: 4.285M ETH Holdings + $10.7B Total + Staking 67.6%",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-01-26",
    title: "STRONG BUY",
    summary: "PR: 4.243M ETH Holdings + $12.8B Total + Davos 2026",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-01-20",
    title: "STRONG BUY",
    summary: "PR: 4.203M ETH Holdings + 81% Shareholder Vote YES + Beast CLOSED",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-01-15",
    title: "STRONG BUY",
    summary: "PR: $200M Beast Industries Investment + Annual Meeting",
    verdict: "STRONG BUY",
  },
  {
    date: "2026-01-12",
    title: "BUY",
    summary: "PR: ETH Holdings Reach 4.168M, $14.0B Total",
    verdict: "BUY",
  },
  {
    date: "2026-01-09",
    title: "BUY",
    summary: "PR: CFO/COO Young Kim Appointed",
    verdict: "BUY",
  },
  {
    date: "2026-01-05",
    title: "BUY",
    summary: "8-K: ETH Holdings $14.2B, 4.14M ETH",
    verdict: "BUY",
  },
  {
    date: "2026-01-02",
    title: "STRONG BUY",
    summary: "Chairman's Message (8-K, DEFA14A)",
    verdict: "STRONG BUY",
  },
  {
    date: "2025-11-24",
    title: "STRONG BUY",
    summary: "FY2025 10-K Annual Report",
    verdict: "STRONG BUY",
  },
  {
    date: "2025-08-12",
    title: "BUY",
    summary: "ATM Expansion to $24.5B (424B5)",
    verdict: "BUY",
  },
  {
    date: "2025-07-29",
    title: "BUY",
    summary: "$1B Buyback Authorization + Holdings Update",
    verdict: "BUY",
  },
  {
    date: "2025-06-30",
    title: "SPECULATIVE",
    summary: "ETH Pivot Announcement",
    verdict: "SPECULATIVE",
  },
  {
    date: "2025-07-14",
    title: "SELL",
    summary: "Q3 FY2025 10-Q Filing",
    verdict: "SELL",
  },
];

// ---------------------------------------------------------------------------
// CFA glossary
// ---------------------------------------------------------------------------

export const CFA_INVESTMENT_GLOSSARY_TITLE = "CFA LEVEL III — INVESTMENT ANALYSIS";

export const CFA_INVESTMENT_GLOSSARY: CfaGlossaryItem[] = [
  {
    term: "NAV Premium/Discount",
    definition:
      "Stock price vs net asset value per share. Premium implies market expects future growth; discount implies skepticism. Track premium trends for entry/exit signals.",
  },
  {
    term: "ETH Treasury Model",
    definition:
      "Company holds ETH as primary asset and generates yield via staking. Similar to MicroStrategy BTC model but with staking income component.",
  },
  {
    term: "Catalyst Calendar",
    definition:
      "Timeline of upcoming events that could move the stock. For BMNR: weekly holdings PRs, MAVAN launch, ETH price movements, ETF staking approvals.",
  },
  {
    term: "Conviction Score",
    definition:
      "Aggregate rating combining fundamental analysis, catalyst proximity, and risk/reward asymmetry. Higher scores indicate stronger investment thesis.",
  },
];

export const INVESTMENT_TAB_FOOTNOTE =
  "abison · Investment Research · Not financial advice";
