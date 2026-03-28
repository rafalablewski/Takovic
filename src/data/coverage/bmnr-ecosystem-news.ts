/**
 * BMNR Ecosystem Intelligence — Ethereum ecosystem news feed.
 * Institutional adoption, enterprise partnerships, protocol upgrades,
 * and regulatory developments driving the ETH treasury thesis.
 *
 * LAST UPDATED: 2026-03-27
 * Entries are reverse chronological. Append new items at the top.
 */

export interface EcosystemNewsItem {
  date: string;
  category: "enterprise" | "institutional" | "defi" | "l2" | "protocol" | "regulatory" | "product" | "ecosystem";
  company: string;
  title: string;
  sentiment: "bullish" | "neutral" | "bearish";
  summary: string;
  significance: string;
  bmnrImplication: string;
  source: string;
}

export const ECOSYSTEM_NEWS: EcosystemNewsItem[] = [
  // --- Batch 1: Feb 2026 (latest) ---
  {
    date: "2026-02-26",
    category: "protocol",
    company: "Ethereum Foundation",
    title: "EF Publishes Strawmap: Seven L1 Forks Through 2029 Targeting Fast Finality and Quantum Resistance",
    sentiment: "bullish",
    summary: "The Ethereum Foundation Protocol team published the \"strawmap,\" a strawman roadmap outlining seven projected forks through 2029. Five north stars: fast L1 (slot times from 12s to 2s), gigagas L1 (1 gigagas/sec = 10K TPS via zkEVMs), teragas L2 (1GB/sec via DAS), post-quantum security (hash-based signatures), and native privacy (shielded ETH transfers). Vitalik Buterin elaborated on the Minimmit finality algorithm targeting 6-16 second finality vs current ~16 minutes.",
    significance: "Most comprehensive long-range Ethereum L1 roadmap published to date. Signals aggressive upgrade cadence (one fork every ~6 months) with transformative UX improvements. Fast finality and quantum resistance strengthen Ethereum as institutional-grade settlement layer.",
    bmnrImplication: "Highly positive for BMNR ETH treasury thesis. Faster finality (6-16s vs 16min) and 10K TPS dramatically improve Ethereum UX, driving adoption and potentially ETH demand. Post-quantum security and native privacy address key institutional concerns.",
    source: "Ethereum Foundation / strawmap.org",
  },
  {
    date: "2026-02-25",
    category: "enterprise",
    company: "Tether / Whop",
    title: "Tether Invests in Whop (18.4M Users), Integrates WDK Wallet for Stablecoin Payments",
    sentiment: "bullish",
    summary: "Tether Investments made a strategic investment in Whop.com, the world's largest internet market (18.4M users, ~$3B annual payouts, 25% MoM growth). Whop will integrate Tether's Wallet Development Kit (WDK) for self-custodial stablecoin payments supporting USD₮ and USA₮.",
    significance: "Tether embedding stablecoin infrastructure into a mainstream internet marketplace with 18.4M users and $3B annual payouts demonstrates real-economy adoption of crypto-native payments.",
    bmnrImplication: "Stablecoin adoption at mainstream internet marketplace scale validates Ethereum ecosystem's role in real-economy settlement. USD₮ is the largest ERC-20 token — growing USDT utility drives Ethereum network activity.",
    source: "PRNewswire / Whop",
  },
  {
    date: "2026-02-25",
    category: "institutional",
    company: "UK Financial Conduct Authority",
    title: "UK FCA Selects 4 Firms for Stablecoin Regulatory Sandbox — UK Crypto Regime Live Oct 2027",
    sentiment: "bullish",
    summary: "The UK FCA selected 4 firms (Monee, ReStabilise, Revolut, VVTX) from 20 applicants to test stablecoin services in its Regulatory Sandbox. Testing begins Q1 2026. Full UK crypto regulatory regime application gateway opens September 2026, with the regime going live October 2027.",
    significance: "UK regulator actively testing stablecoin products with major fintech players (including Revolut) signals growing institutional and regulatory trust in stablecoin/crypto infrastructure.",
    bmnrImplication: "Regulatory clarity in major financial centers (UK following EU MiCA) reduces institutional adoption barriers for Ethereum-based products. Revolut's participation (100M+ users) signals mainstream fintech commitment to crypto/stablecoin rails.",
    source: "FCA Press Release",
  },
  {
    date: "2026-02-24",
    category: "enterprise",
    company: "Oobit",
    title: "Oobit Launches Real-Time Stablecoin Wallet-to-Bank Transfers via Local Payment Rails",
    sentiment: "bullish",
    summary: "Oobit launched real-time wallet-to-bank transfers enabling stablecoins held in self-custody wallets to settle directly into bank accounts via local payment rails: SEPA (Europe), ACH (U.S.), SPEI (Mexico), PIX (Brazil), INSTAPAY (Philippines). Transfers execute in seconds.",
    significance: "Real-time stablecoin-to-bank settlement removes the last structural barrier between crypto and traditional banking. Bypassing correspondent banking corridors dramatically reduces settlement time and cost.",
    bmnrImplication: "Direct stablecoin-to-bank settlement via local rails validates Ethereum-based stablecoins as real-world money infrastructure. Removing the banking-to-crypto friction makes ETH ecosystem products more accessible.",
    source: "Oobit Blog",
  },
  {
    date: "2026-02-20",
    category: "enterprise",
    company: "BNP Paribas",
    title: "BNP Paribas Tokenizes Money Market Fund on Public Ethereum via AssetFoundry Platform",
    sentiment: "bullish",
    summary: "BNP Paribas Asset Management issued a tokenized share class of a French-domiciled money market fund on the public Ethereum network via BNP Paribas CIB's AssetFoundry platform. The tokenized shares use a permissioned access model restricting holding and transfers to authorized participants.",
    significance: "BNP Paribas (€2.6T+ assets, top-4 European bank) tokenizing its own money market fund on PUBLIC Ethereum is a significant escalation from their prior private blockchain experiments.",
    bmnrImplication: "Major European bank choosing public Ethereum for fund tokenization directly validates BMNR's thesis that Ethereum is becoming the institutional settlement layer. BNP Paribas joins BlackRock (BUIDL), Franklin Templeton, and others.",
    source: "BNP Paribas Press Release",
  },
];
