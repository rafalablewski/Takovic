/**
 * BMNR Ethereum Intelligence — Protocol data, institutional flows,
 * value accrual mechanics, roadmap, and ecosystem news.
 *
 * LAST UPDATED: 2026-03-27
 * NEXT UPDATE: Weekly — track ETF flows, network metrics, ecosystem news
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EthCorrelationMetric {
  label: string;
  value: string;
  detail: string;
}

export interface NetworkMetric {
  label: string;
  value: string;
  category: "staking" | "activity" | "economics";
}

export interface ETFFlow {
  fund: string;
  aum: string;
  change: string;
  changePositive: boolean;
}

export interface ThesisSection {
  emoji: string;
  title: string;
  body: string;
}

export interface ValueAccrualStep {
  step: number;
  title: string;
  description: string;
  sections: { heading: string; bullets: string[] }[];
  formula: string;
}

export interface RoadmapMilestone {
  name: string;
  status: "complete" | "development" | "research";
  date: string;
  description: string;
}

export interface EcosystemNewsItem {
  id: string;
  date: string;
  category: "enterprise" | "institutional" | "defi" | "l2" | "protocol" | "regulatory";
  company: string;
  title: string;
  sentiment: "bullish" | "neutral" | "bearish";
  summary: string;
  significance: string;
  bmnrImplication: string;
  source: string;
}

// ---------------------------------------------------------------------------
// Main data export
// ---------------------------------------------------------------------------

export const ETHEREUM_INTELLIGENCE = {
  description:
    "BMNR-ETH correlation metrics, protocol roadmap, institutional adoption events, and ecosystem fundamentals driving the treasury thesis.",

  // --- Correlation ---
  correlation: {
    headline: "BMNR functions as a leveraged ETH proxy — tracking Ethereum ecosystem health is essential",
    metrics: [
      { label: "ETH Price", value: "$2,185", detail: "Current spot" },
      { label: "NAV Per Share", value: "$21.36", detail: "-13.9% discount" },
      { label: "ETH Per Share", value: "0.0098", detail: "Your fractional ETH" },
      { label: "Implied ETH Price", value: "$1,881", detail: "vs $2,185 spot" },
      { label: "NAV Sensitivity", value: "$0.98", detail: "per $100 ETH move" },
    ] as EthCorrelationMetric[],
  },

  // --- Network Metrics ---
  networkMetrics: {
    headlines: [
      { label: "ETH Staked", value: "28.3%", category: "staking" },
      { label: "DeFi TVL", value: "$62.4B", category: "activity" },
      { label: "L2 TVL", value: "$18.7B", category: "activity" },
      { label: "Supply Growth", value: "-0.2%", category: "economics" },
    ] as NetworkMetric[],
    details: [
      { label: "Validators", value: "1,067K", category: "staking" },
      { label: "Daily Active Addresses", value: "420K", category: "activity" },
      { label: "Avg Gas (Gwei)", value: "12", category: "economics" },
      { label: "Network Revenue (24h)", value: "$2.8M", category: "economics" },
      { label: "ETH Burned (24h)", value: "1.2K ETH", category: "economics" },
      { label: "Total ETH Staked", value: "34.2M", category: "staking" },
    ] as NetworkMetric[],
    whyItMatters:
      "Higher network activity → More fees → More ETH burned → Deflationary pressure → ETH price appreciation → BMNR NAV growth",
  },

  // --- Institutional Flows (ETF) ---
  etfFlows: {
    totalAUM: "$12.4B",
    weeklyNetFlows: "+$340M",
    funds: [
      { fund: "Grayscale ETHE", aum: "$4.8B", change: "-2.1%", changePositive: false },
      { fund: "BlackRock ETHA", aum: "$3.2B", change: "+8.4%", changePositive: true },
      { fund: "Fidelity FETH", aum: "$2.1B", change: "+5.2%", changePositive: true },
      { fund: "Bitwise ETHW", aum: "$1.1B", change: "+3.8%", changePositive: true },
      { fund: "21Shares CETH", aum: "$0.8B", change: "+2.1%", changePositive: true },
    ] as ETFFlow[],
  },

  // --- Thesis Framework ---
  thesisQuote:
    "The evidence suggests a fundamental shift: the world's largest financial institutions are no longer asking if they should build on Ethereum, but how fast they can deploy.",
  thesisSections: [
    {
      emoji: "💰",
      title: "TradFi Giants Are All-In",
      body: "BlackRock ($10T+ AUM) launched BUIDL tokenized fund on Ethereum, now filing for staked ETH ETF. Fidelity ($5.8T AUM) launching FIDD stablecoin on Ethereum. Franklin Templeton preparing institutional money market funds for tokenized distribution. These aren't experiments — they're production deployments.",
    },
    {
      emoji: "🏛️",
      title: "Regulatory Clarity Enabling Scale",
      body: "The GENIUS Act provides clear stablecoin guardrails. Telcoin launched the first US bank-issued stablecoin (eUSD) under this framework. Franklin Templeton retrofitting Rule 2a-7 funds for compliance. Regulation is now an enabler, not a blocker.",
    },
    {
      emoji: "🌍",
      title: "Global Payment Rails Integrating",
      body: "Mastercard partnering with ADI Foundation for stablecoin payments. HSBC, Ant International & Swift completed cross-border tokenized deposits POC using EVM/ERC-20 standards. Shift4 offering Ethereum stablecoin settlement to hundreds of thousands of merchants.",
    },
    {
      emoji: "🌐",
      title: "Emerging Markets Onboarding",
      body: "ADI Chain (Ethereum L2) partnering with M-Pesa to bring 60M+ African users onchain. Abu Dhabi's IHC backing institutional L2 infrastructure. UAE Central Bank regulating Dirham stablecoin. Financial inclusion happening on Ethereum rails.",
    },
  ] as ThesisSection[],

  // --- Value Accrual Mechanics ---
  valueAccrualIntro:
    "How institutional adoption translates to ETH value — a framework for analyzing network economics",
  valueAccrualSteps: [
    {
      step: 1,
      title: "Settlement Layer Market Capture",
      description: "Tokenized assets require blockchain settlement infrastructure",
      sections: [
        {
          heading: "Current State",
          bullets: [
            "Stablecoin market: ~$310B supply",
            "Tokenized treasuries: ~$3B (BUIDL, BENJI, etc.)",
            "Ethereum L1+L2 settlement share: ~65%",
          ],
        },
        {
          heading: "2030 Projections",
          bullets: [
            "Stablecoin market: $2T+ (Citi, Standard Chartered)",
            "Tokenized RWAs: $16T (BCG), $30T (Standard Chartered)",
            "Global settlement volume addressable: $500T+/year",
          ],
        },
      ],
      formula: "Settlement Capture Rate = (ETH L1/L2 Volume ÷ Total Tokenized Volume) × Fee Revenue per $1 Settled",
    },
    {
      step: 2,
      title: "EIP-1559 Deflationary Mechanics",
      description: "Transaction fees create permanent supply reduction",
      sections: [
        {
          heading: "Burn Mechanism",
          bullets: [
            "Base fee burned per transaction (not paid to validators)",
            "~4.3M ETH burned since EIP-1559 (Aug 2021)",
            "High activity periods: net deflationary supply",
          ],
        },
        {
          heading: "Economic Model",
          bullets: [
            "Issuance: ~0.5-1% annually (PoS rewards)",
            "Burn rate: variable based on network demand",
            "Net supply change = Issuance − Burn",
          ],
        },
      ],
      formula: "Supply Impact = −(Base Fee × Gas Used) + (Block Reward × Validators) → Deflationary when Burn > Issuance",
    },
    {
      step: 3,
      title: "Staking Yield as Risk-Free Rate Proxy",
      description: "ETH staking provides protocol-native yield analogous to sovereign bonds",
      sections: [
        {
          heading: "Yield Components",
          bullets: [
            "Consensus rewards: ~2.8% base APY",
            "Execution layer tips: +0.5-1.5% variable",
            "MEV revenue share: +0.3-0.8% variable",
          ],
        },
        {
          heading: "Institutional Comparison",
          bullets: [
            "US 10Y Treasury: ~4.5% (USD denominated)",
            "ETH Staking: ~3.5-4.5% (ETH denominated)",
            "Key difference: ETH yield + price appreciation",
          ],
        },
      ],
      formula: "Total Return = Staking APY + ETH Price Δ − Slashing Risk (~0.001%)",
    },
    {
      step: 4,
      title: "Network Effects & Competitive Moat",
      description: "Metcalfe's Law dynamics create winner-take-most outcomes in settlement infrastructure",
      sections: [
        {
          heading: "Network Effect Drivers",
          bullets: [
            "Liquidity depth: $50B+ DEX volume/month",
            "Developer ecosystem: 4,000+ monthly active devs",
            "Composability: 2,500+ DeFi protocols",
          ],
        },
        {
          heading: "Switching Cost Factors",
          bullets: [
            "Smart contract migration complexity",
            "Liquidity fragmentation risk",
            "Security track record (9+ years)",
          ],
        },
      ],
      formula: "Network Value ∝ n² where n = (Users × Developers × Liquidity × Integrations)",
    },
    {
      step: 5,
      title: "BMNR Treasury Strategy Value Capture",
      description: "Corporate treasury structure provides leveraged exposure to ETH ecosystem growth",
      sections: [
        {
          heading: "Treasury Economics",
          bullets: [
            "Holdings: 4.28M ETH (3.55% of supply)",
            "Staking rate: 67.6% of holdings",
            "Yield generation: ~$120M annually at current rates",
          ],
        },
        {
          heading: "Equity Value Drivers",
          bullets: [
            "NAV = ETH Holdings × ETH Price",
            "Premium/Discount to NAV (market sentiment)",
            "Operating leverage from capital markets access",
          ],
        },
      ],
      formula: "BMNR Return = (ETH Δ × Holdings) + (Staking Yield × Staked %) + NAV Premium Expansion",
    },
  ] as ValueAccrualStep[],

  investmentCaseQuote:
    "When the world's largest asset managers, payment networks, and banks all choose the same settlement layer, that's not speculation — that's infrastructure becoming standard. BMNR's thesis is that owning the asset that secures this infrastructure (ETH) is the trade of the decade.",

  // --- Protocol Roadmap ---
  roadmap: [
    { name: "Pectra Upgrade", status: "complete", date: "Nov 2025", description: "Account abstraction (EIP-7702), validator consolidation (2048 ETH max), historical block hashes" },
    { name: "Fusaka Upgrade", status: "complete", date: "Dec 2025", description: "PeerDAS (EIP-7594), 60M gas limit, secp256r1 precompile, BPO blob scaling" },
    { name: "Verkle Trees", status: "development", date: "Q3 2026", description: "Stateless clients, reduced storage requirements, faster sync" },
    { name: "Single Slot Finality", status: "research", date: "2027+", description: "Reduce finality time from ~15 min to ~12 sec" },
    { name: "Danksharding", status: "research", date: "2027+", description: "Full data sharding, 100x+ L2 scaling capacity" },
  ] as RoadmapMilestone[],

  // --- CFA-style educational footer ---
  cfaNotes: [
    "ETH as Productive Asset: Unlike BTC, ETH generates yield via staking (~3-4% APY). Network also burns fees (EIP-1559), creating potential deflation. Both increase fundamental value.",
    "Network Effects: Ethereum hosts 60%+ of DeFi TVL, majority of NFTs, and most L2s. Developer mindshare and liquidity create strong network effects and switching costs.",
    "L2 Scaling Thesis: Rollups (Arbitrum, Optimism, Base) scale Ethereum while paying fees to L1. More L2 activity = more ETH demand for settlement and data availability.",
    "Institutional Adoption: ETH ETFs, BlackRock BUIDL fund, enterprise L2s signal institutional acceptance. Drives long-term demand and reduces volatility over time.",
    "Protocol Upgrades: Ethereum roadmap executing on schedule. Pectra (Nov 2025) and Fusaka (Dec 2025) now live. Next: Verkle Trees, Danksharding. Successful upgrades improve scalability and UX.",
    "BMNR Correlation: BMNR stock price highly correlated with ETH. Tracking ecosystem health is essential for BMNR thesis — positive ETH catalysts are positive BMNR catalysts.",
  ],
};

/** Runtime shape of `ETHEREUM_INTELLIGENCE` for coverage UI (dynamic import). */
export type EthereumIntelligence = typeof ETHEREUM_INTELLIGENCE;
