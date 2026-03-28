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
  // --- Batch 2: Feb 2026 (continued) ---
  {
    date: "2026-02-17",
    category: "enterprise",
    company: "Northstake / P2P.org",
    title: "Northstake Adds P2P.org ($10B+ Staked) to Institutional Staking Vault Manager on Lido V3",
    sentiment: "bullish",
    summary: "P2P.org, one of the largest non-custodial Ethereum validators globally with over $10 billion in staked assets and 1M+ staked ETH, joins Northstake's Staking Vault Manager as a node operator built on Lido V3 stVault primitives. Zero-slashing track record spanning eight years, 99% uptime.",
    significance: "Institutional Ethereum staking infrastructure maturing rapidly with Lido V3 modular staking primitives. Multi-operator frameworks with enterprise-grade APIs enable asset managers to access diversified, secure Ethereum staking.",
    bmnrImplication: "Institutional staking infrastructure maturation directly supports BMNR's MAVAN validator strategy. More production-ready staking tooling lowers barriers for institutional staking participation.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-11",
    category: "institutional",
    company: "Uniswap Labs / Securitize / BlackRock",
    title: "BlackRock BUIDL Tradable via UniswapX — First Major TradFi-DeFi Integration on Ethereum",
    sentiment: "bullish",
    summary: "Uniswap Labs and Securitize announced a strategic integration to make BlackRock USD Institutional Digital Liquidity Fund (BUIDL) shares available to trade via UniswapX technology. BlackRock has also made a strategic investment within the Uniswap ecosystem.",
    significance: "WATERSHED TradFi-DeFi convergence: world's largest asset manager's tokenized treasury fund now tradable on leading DEX infrastructure. First time institutional tokenized assets have DeFi liquidity rails with regulatory compliance.",
    bmnrImplication: "BUIDL on UniswapX is the strongest signal yet that Ethereum is the institutional settlement layer bridging TradFi and DeFi. BlackRock investing in Uniswap ecosystem validates on-chain trading infrastructure.",
    source: "Business Wire",
  },
  {
    date: "2026-02-11",
    category: "institutional",
    company: "ICE / CoinDesk",
    title: "ICE Launches CoinDesk Ether Futures — Regulated Crypto Derivatives on NYSE Parent Exchange",
    sentiment: "bullish",
    summary: "Intercontinental Exchange (NYSE: ICE), parent of the NYSE and a Fortune 500 company, launched cryptocurrency futures contracts based on seven CoinDesk Indices including ICE CoinDesk Ether Futures. Over $40 billion in AUM tied to CoinDesk Indices. Also plans CDOR USDC futures based on DeFi overnight rates.",
    significance: "NYSE parent company launching regulated ETH futures brings institutional-grade derivatives infrastructure to crypto. CoinDesk Overnight Rate (CDOR) USDC futures create DeFi-native rate benchmarks analogous to SOFR.",
    bmnrImplication: "Regulated ETH futures on ICE expand institutional hedging and exposure tools for ETH. CDOR USDC futures based on DeFi overnight rates could create standardized yield benchmarks relevant to BMNR's staking yield positioning.",
    source: "Business Wire",
  },
  {
    date: "2026-02-11",
    category: "institutional",
    company: "Polygon Labs / EEA",
    title: "Polygon, Ethena, Nethermind Join Enterprise Ethereum Alliance — Institutional Ethereum Taking Shape",
    sentiment: "bullish",
    summary: "Polygon Labs ($7B+ monthly stablecoin volume), Ethena (USDe fastest to $10B TVL in 500 days), and Nethermind (Ethereum execution client builder) join the Enterprise Ethereum Alliance, described as the \"institutional coordination layer for Ethereum.\"",
    significance: "Three major Ethereum infrastructure providers joining the institutional coordination body signals consolidation of Ethereum's institutional stack across payments, DeFi, and protocol layers.",
    bmnrImplication: "Institutional Ethereum coordination strengthening across all layers. All roads lead to more institutional demand for ETH as the settlement layer.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-06",
    category: "institutional",
    company: "NEOS Investments",
    title: "NEOS Ethereum High Income ETF (NEHI) Reports 37% Annualized Distribution Rate — Highest in Suite",
    sentiment: "bullish",
    summary: "The Ethereum High Income ETF (NEHI) posted a 37.04% annualized distribution rate — the highest across all 16 NEOS ETFs. For comparison, NEOS Bitcoin High Income ETF (BTCI) posted a 28.27% rate. ETH's higher implied volatility generates richer options premiums.",
    significance: "ETH options-based income ETF achieving highest distribution rate demonstrates strong institutional demand for ETH yield products. ETH's higher implied volatility vs BTC creates differentiated yield products.",
    bmnrImplication: "NEHI's 37% distribution rate (vs BTCI's 28%) demonstrates ETH's superior options premium generation. More ETH yield products expand the investment ecosystem and validate institutional appetite for ETH-denominated yield.",
    source: "Business Wire",
  },
];
