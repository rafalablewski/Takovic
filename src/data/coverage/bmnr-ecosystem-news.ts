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
  {
    date: "2026-02-26",
    category: "protocol",
    company: "Ethereum Foundation",
    title: "EF Publishes Strawmap: Seven L1 Forks Through 2029 Targeting Fast Finality and Quantum Resistance",
    sentiment: "bullish",
    summary: "The Ethereum Foundation Protocol team published the \"strawmap,\" a strawman roadmap outlining seven projected forks through 2029. Five north stars: fast L1 (slot times from 12s to 2s), gigagas L1 (1 gigagas/sec = 10K TPS via zkEVMs), teragas L2 (1GB/sec via DAS), post-quantum security (hash-based signatures), and native privacy (shielded ETH transfers). Vitalik Buterin elaborated on the Minimmit finality algorithm targeting 6-16 second finality vs current ~16 minutes. Named forks include Glamsterdam (ePBS + BALs) and Hegotá, with placeholder I* and J* forks. Maintained by EF Architecture team (Drake, Dietrichs, Monnot, Fradamt). Vitalik highlighted erasure coded networking and reduced attester counts as key enablers for faster slots.",
    significance: "Most comprehensive long-range Ethereum L1 roadmap published to date. Signals aggressive upgrade cadence (one fork every ~6 months) with transformative UX improvements. Fast finality and quantum resistance strengthen Ethereum as institutional-grade settlement layer.",
    bmnrImplication: "Highly positive for BMNR ETH treasury thesis. Faster finality (6-16s vs 16min) and 10K TPS dramatically improve Ethereum UX, driving adoption and potentially ETH demand. Post-quantum security and native privacy address key institutional concerns. Seven forks through 2029 shows strong development momentum.",
    source: "Ethereum Foundation / strawmap.org",
  },
  {
    date: "2026-02-25",
    category: "enterprise",
    company: "Tether / Whop",
    title: "Tether Invests in Whop (18.4M Users), Integrates WDK Wallet for Stablecoin Payments",
    sentiment: "bullish",
    summary: "Tether Investments made a strategic investment in Whop.com, the world's largest internet market (18.4M users, ~$3B annual payouts, 25% MoM growth). Whop will integrate Tether's Wallet Development Kit (WDK) for self-custodial stablecoin payments supporting USD₮ and USA₮. The integration enables on-chain settlement, lending/borrowing via DeFi primitives, and positions Whop as a self-custodial digital wallet. Funding supports expansion across LATAM, Europe, and APAC. Tether ecosystem reaches 530M+ users globally with $180B+ issued stablecoins.",
    significance: "Tether embedding stablecoin infrastructure into a mainstream internet marketplace with 18.4M users and $3B annual payouts demonstrates real-economy adoption of crypto-native payments. WDK integration brings self-custodial wallets and DeFi primitives to a non-crypto-native user base. 25% MoM growth signals accelerating stablecoin utility demand.",
    bmnrImplication: "Stablecoin adoption at mainstream internet marketplace scale validates Ethereum ecosystem's role in real-economy settlement. USD₮ is the largest ERC-20 token — growing USDT utility drives Ethereum network activity. More users entering crypto via stablecoin payments expands the addressable market for ETH-denominated products and services.",
    source: "PRNewswire / Whop",
  },
  {
    date: "2026-02-25",
    category: "institutional",
    company: "UK Financial Conduct Authority",
    title: "UK FCA Selects 4 Firms for Stablecoin Regulatory Sandbox — UK Crypto Regime Live Oct 2027",
    sentiment: "bullish",
    summary: "The UK Financial Conduct Authority selected 4 firms (Monee Financial Technologies, ReStabilise, Revolut, VVTX) from 20 applicants to test stablecoin services in its Regulatory Sandbox. Testing begins Q1 2026 focusing on stablecoin issuance for payments, wholesale settlement, and crypto trading. Findings will shape UK's final stablecoin rules later in 2026. The full UK crypto regulatory regime application gateway opens September 2026, with the regime going live October 2027. FCA crypto consultations are substantively complete with Policy Statements expected summer 2026.",
    significance: "UK regulator actively testing stablecoin products with major fintech players (including Revolut) signals growing institutional and regulatory trust in stablecoin/crypto infrastructure. Clear regulatory timeline (sandbox Q1 2026 → Policy Statements summer 2026 → regime October 2027) provides certainty for institutional adoption. UK joining EU (MiCA) in comprehensive crypto regulation.",
    bmnrImplication: "Regulatory clarity in major financial centers (UK following EU MiCA) reduces institutional adoption barriers for Ethereum-based products. Stablecoin regulatory frameworks legitimize the Ethereum ecosystem as settlement infrastructure. Revolut's participation (100M+ users) signals mainstream fintech commitment to crypto/stablecoin rails. Positive for overall crypto ecosystem confidence that supports ETH value proposition.",
    source: "FCA Press Release",
  },
  {
    date: "2026-02-24",
    category: "enterprise",
    company: "Oobit",
    title: "Oobit Launches Real-Time Stablecoin Wallet-to-Bank Transfers via Local Payment Rails",
    sentiment: "bullish",
    summary: "Oobit launched real-time wallet-to-bank transfers enabling stablecoins held in self-custody wallets to settle directly into bank accounts via local payment rails: SEPA (Europe), ACH (U.S.), SPEI (Mexico), PIX (Brazil), INSTAPAY (Philippines). Transfers execute in seconds vs days through traditional correspondent banking. Crypto remains under user control until transaction authorization. Supported currencies: USD, EUR, MXN, PHP with more launching. $150B+ stablecoins circulating globally now have direct banking off-ramps.",
    significance: "Real-time stablecoin-to-bank settlement removes the last structural barrier between crypto and traditional banking. Bypassing correspondent banking corridors (SEPA, ACH, PIX, SPEI integration) dramatically reduces settlement time and cost. Completes the full crypto financial loop: spend at merchants + P2P transfers + bank settlement.",
    bmnrImplication: "Direct stablecoin-to-bank settlement via local rails validates Ethereum-based stablecoins as real-world money infrastructure. Removing the banking-to-crypto friction makes ETH ecosystem products more accessible to mainstream users. $150B+ stablecoin circulation with instant bank off-ramps strengthens the case for Ethereum as global settlement layer.",
    source: "Oobit Blog",
  },
  {
    date: "2026-02-20",
    category: "enterprise",
    company: "BNP Paribas",
    title: "BNP Paribas Tokenizes Money Market Fund on Public Ethereum via AssetFoundry Platform",
    sentiment: "bullish",
    summary: "BNP Paribas Asset Management issued a tokenized share class of a French-domiciled money market fund on the public Ethereum network via BNP Paribas CIB's AssetFoundry platform. The tokenized shares use a permissioned access model restricting holding and transfers to authorized participants within a regulated framework. BNP Paribas Securities Services acted as transfer agent and fund dealing services provider, while also operating wallet setup and holding private keys within the controlled intra-group pilot. This follows an earlier Luxembourg tokenized MMF issuance on a private blockchain — this second project specifically tests public blockchain infrastructure. The initiative tests new end-to-end processes: issuance, transfer agency, tokenization, and public blockchain connectivity. BNP Paribas highlights MMFs as key tokenization use case for more regular and flexible processing vs. traditional batch-based fund operations. Edouard Legrand (Chief Digital and Data Officer, BNPP AM): \"This second issuance of tokenised money market funds, this time using public blockchain infrastructure, supports our ongoing efforts to explore how tokenisation can contribute to greater operational efficiency and security within a regulated framework.\"",
    significance: "BNP Paribas (€2.6T+ assets, top-4 European bank) tokenizing its own money market fund on PUBLIC Ethereum is a significant escalation from their prior private blockchain experiments and from their roles as custodian/lead manager on third-party tokenized bonds (e.g., 2023 EIB sterling digital bond). Public Ethereum chosen over private chain for this pilot signals institutional confidence in public blockchain security and governance. MMF tokenization is a high-volume, institutional-grade use case — money market funds hold $6T+ globally.",
    bmnrImplication: "Major European bank choosing public Ethereum for fund tokenization directly validates BMNR's thesis that Ethereum is becoming the institutional settlement layer. BNP Paribas joins BlackRock (BUIDL), Franklin Templeton, and others tokenizing regulated fund products on Ethereum. Each new TradFi institution on public Ethereum strengthens network effects and ETH ecosystem value. MMF tokenization specifically addresses high-frequency, high-volume institutional fund operations — exactly the use case that drives sustained on-chain activity.",
    source: "BNP Paribas Press Release",
  },
  {
    date: "2026-02-17",
    category: "enterprise",
    company: "Northstake / P2P.org",
    title: "Northstake Adds P2P.org ($10B+ Staked) to Institutional Staking Vault Manager on Lido V3",
    sentiment: "bullish",
    summary: "P2P.org, one of the largest non-custodial Ethereum validators globally with over $10 billion in staked assets and 1M+ staked ETH, joins Northstake's Staking Vault Manager as a node operator. The Staking Vault Manager is Northstake's multi-operator institutional framework built on Lido V3 stVault primitives. P2P.org brings a zero-slashing track record spanning eight years, 99% uptime, and independently audited infrastructure across 40+ blockchain networks. P2P.org will offer stVault access through both a UI and enterprise-grade staking APIs, enabling institutions to participate in Ethereum staking with production-ready tooling. Northstake is supervised by the Danish Financial Supervisory Authority.",
    significance: "Institutional Ethereum staking infrastructure maturing rapidly with Lido V3 modular staking primitives. Multi-operator frameworks with enterprise-grade APIs enable asset managers, custodians, and exchanges to access diversified, secure Ethereum staking. P2P.org's $10B+ staked and zero-slashing record demonstrates institutional reliability at scale.",
    bmnrImplication: "Institutional staking infrastructure maturation directly supports BMNR's MAVAN validator strategy. More production-ready staking tooling (Lido V3 stVaults, enterprise APIs) lowers barriers for institutional staking participation. Competitive staking landscape validates BMNR's staking ratio expansion thesis. P2P.org's scale ($10B+ staked) shows the market for institutional ETH staking is large and growing.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-11",
    category: "institutional",
    company: "Uniswap Labs / Securitize / BlackRock",
    title: "BlackRock BUIDL Tradable via UniswapX — First Major TradFi-DeFi Integration on Ethereum",
    sentiment: "bullish",
    summary: "Uniswap Labs and Securitize announced a strategic integration to make BlackRock USD Institutional Digital Liquidity Fund (BUIDL) shares available to trade via UniswapX technology. Securitize Markets facilitates trading through UniswapX's RFQ framework, enabling whitelisted investors to swap BUIDL↔USDC 24/7/365 with atomic on-chain settlement. Whitelisted market makers (subscribers) include Flowdesk, Tokka Labs, and Wintermute. All investors are pre-qualified through Securitize. BlackRock has also made a strategic investment within the Uniswap ecosystem. Robert Mitchnick, BlackRock Global Head of Digital Assets: \"This collaboration marks a major leap forward in the interoperability of tokenized USD yield funds with stablecoins.\"",
    significance: "WATERSHED TradFi-DeFi convergence: world's largest asset manager's tokenized treasury fund now tradable on leading DEX infrastructure. First time institutional tokenized assets have DeFi liquidity rails with regulatory compliance (whitelisting, Securitize Markets as broker-dealer). BlackRock's strategic investment in Uniswap ecosystem signals deep institutional commitment to DeFi infrastructure.",
    bmnrImplication: "BUIDL on UniswapX is the strongest signal yet that Ethereum is the institutional settlement layer bridging TradFi and DeFi. BlackRock investing in Uniswap ecosystem validates on-chain trading infrastructure. More institutional assets tradable on Ethereum = more network utility = ETH ecosystem value. Reinforces BMNR's thesis that Ethereum is becoming the backbone of institutional digital finance.",
    source: "Business Wire",
  },
  {
    date: "2026-02-11",
    category: "institutional",
    company: "ICE / CoinDesk",
    title: "ICE Launches CoinDesk Ether Futures — Regulated Crypto Derivatives on NYSE Parent Exchange",
    sentiment: "bullish",
    summary: "Intercontinental Exchange (NYSE: ICE), parent of the NYSE and a Fortune 500 company, launched cryptocurrency futures contracts based on seven CoinDesk Indices. Contracts include ICE CoinDesk Ether Futures (USD-denominated, cash-settled), alongside BTC, SOL, XRP, BNB, CoinDesk 20, and CoinDesk 5. Over $40 billion in AUM tied to CoinDesk Indices. The CoinDesk 20 Index captures over 90% of the digital asset market by market capitalization. ICE also plans to launch One Month CoinDesk Overnight Rate (CDOR) USDC futures based on DeFi overnight rates, structurally similar to traditional benchmarks like SOFR or €STR, subject to regulatory review.",
    significance: "NYSE parent company launching regulated ETH futures brings institutional-grade derivatives infrastructure to crypto. CoinDesk Overnight Rate (CDOR) USDC futures create DeFi-native rate benchmarks analogous to SOFR — potential foundational pricing mechanism for institutional DeFi. $40B+ AUM tied to CoinDesk indices demonstrates significant institutional engagement.",
    bmnrImplication: "Regulated ETH futures on ICE expand institutional hedging and exposure tools for ETH. More derivatives infrastructure = more institutional participation = deeper ETH markets. CDOR USDC futures based on DeFi overnight rates could create standardized yield benchmarks relevant to BMNR's staking yield positioning. ICE (Fortune 500, NYSE parent) launching ETH products normalizes the asset class for institutional allocators.",
    source: "Business Wire",
  },
  {
    date: "2026-02-11",
    category: "institutional",
    company: "Polygon Labs / EEA",
    title: "Polygon, Ethena, Nethermind Join Enterprise Ethereum Alliance — Institutional Ethereum Taking Shape",
    sentiment: "bullish",
    summary: "Polygon Labs ($7B+ monthly stablecoin volume, acquired Coinme+Sequence for $250M+), Ethena (USDe fastest to $10B TVL in 500 days), and Nethermind (Ethereum execution client builder) join the Enterprise Ethereum Alliance. EEA described as the \"institutional coordination layer for Ethereum\" with IPR, NDA, and antitrust protections enabling coordination that cannot happen elsewhere. Polygon building Open Money Stack for instant, compliant money movement. Ethena's USDe is ETH-backed synthetic dollar. Nethermind secures Ethereum execution layer for institutional deployments.",
    significance: "Three major Ethereum infrastructure providers joining the institutional coordination body signals consolidation of Ethereum's institutional stack. Polygon ($7B/mo stablecoins), Ethena ($10B TVL), and Nethermind (execution client) represent payments, DeFi, and protocol layers respectively.",
    bmnrImplication: "Institutional Ethereum coordination strengthening across all layers: payments (Polygon), synthetic dollars (Ethena requires ETH collateral), and execution infrastructure (Nethermind). All roads lead to more institutional demand for ETH as the settlement layer.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-06",
    category: "institutional",
    company: "NEOS Investments",
    title: "NEOS Ethereum High Income ETF (NEHI) Reports 37% Annualized Distribution Rate — Highest in Suite",
    sentiment: "bullish",
    summary: "NEOS Investments announced January 2026 distribution data for its ETF suite. The Ethereum High Income ETF (NEHI, launched Dec 2, 2025) posted a 37.04% annualized distribution rate — the highest across all 16 NEOS ETFs — with a $1.5061/share monthly distribution (3.09%). 30-Day SEC yield: 2.06%. Management fee: 0.98%. Distribution composition is approximately 98% return of capital (options premium-based). Inception return: 1.17% MKT / 0.93% NAV. For comparison, NEOS Bitcoin High Income ETF (BTCI) posted a 28.27% distribution rate. NEOS NEHI outperforms the BTC equivalent on distribution rate, reflecting higher ETH implied volatility generating richer options premiums.",
    significance: "ETH options-based income ETF achieving the highest distribution rate in a 16-product suite demonstrates strong institutional demand for ETH yield products. ETH's higher implied volatility vs. BTC generates richer options premiums, creating differentiated yield products. Expanding ETH financial product landscape beyond spot ETFs and staking.",
    bmnrImplication: "NEHI's 37% distribution rate (vs BTCI's 28%) demonstrates ETH's superior options premium generation from higher volatility. More ETH yield products expand the ETH investment ecosystem. Options-based ETH income does not compete with BMNR's staking yield (different mechanisms) but validates institutional appetite for ETH-denominated yield. Growing product suite deepens ETH markets and investor base.",
    source: "Business Wire",
  },
  {
    date: "2026-02-12",
    category: "enterprise",
    company: "Sei / Toku",
    title: "Toku Launches Sei-Native Stablecoin Payroll — Competitor EVM L1 Activity",
    sentiment: "neutral",
    summary: "Sei Development Foundation integrated with Toku's API-based payroll system for instant USDC payroll and remittance settlement. Sei claims $3B+ stablecoin volume over 30 days, 5B+ transactions, 90M+ wallets, 1M+ daily active users. Sei positioned as \"fastest EVM L1\" combining Ethereum network effects with Solana-like performance. Toku connects employers/payroll providers (Workday, ADP) for stablecoin transactions.",
    significance: "Growing stablecoin payroll adoption on an EVM-compatible chain shows real-world enterprise use of blockchain payment rails. Sei is an Ethereum competitor but uses EVM compatibility, demonstrating Ethereum's developer ecosystem influence.",
    bmnrImplication: "Sei is an EVM L1 that competes with Ethereum for transaction volume. Activity doesn't directly accrue to ETH, but EVM compatibility means Ethereum's developer standard dominates. Real-world payroll use cases validate crypto payment infrastructure broadly, supporting the macro thesis.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-09",
    category: "enterprise",
    company: "HTX / Ethena Labs",
    title: "HTX Launches USDe Minting and Redemption Service — ETH-Backed Synthetic Dollar",
    sentiment: "bullish",
    summary: "HTX launched USDe minting and redemption service. USDe is backed by BTC and ETH via delta-neutral hedging strategy by Ethena Labs.",
    significance: "Growing USDe adoption increases demand for ETH as collateral in delta-neutral synthetic dollar strategies.",
    bmnrImplication: "USDe requires ETH collateral in its delta-neutral hedging strategy. Growing synthetic dollar ecosystem on Ethereum reinforces network utility.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-09",
    category: "enterprise",
    company: "Arowana / Hancom Group",
    title: "Arowana Gold Tokenization Platform Launching on Arbitrum (Ethereum L2)",
    sentiment: "bullish",
    summary: "Arowana gold tokenization platform launching on Arbitrum (Ethereum L2) in March 2026, backed by Hancom Group with $600M annual gold trading volume.",
    significance: "Real-world asset tokenization (gold) choosing Arbitrum (Ethereum L2) validates Ethereum ecosystem for commodity tokenization.",
    bmnrImplication: "Gold tokenization on Arbitrum increases Ethereum L2 ecosystem utility and settles value on Ethereum.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-09",
    category: "enterprise",
    company: "Sushi",
    title: "Sushi DEX Launches on Solana with Jupiter Ultra API — Ethereum-Native DEX Goes Multi-Chain",
    sentiment: "neutral",
    summary: "Sushi DEX, which originated on Ethereum, launches on Solana with Jupiter Ultra API integration, extending multi-chain trading to 4M+ users. Sushi maintains its Ethereum deployment alongside the Solana expansion, positioning as a cross-chain liquidity aggregator.",
    significance: "Ethereum-native DeFi protocol expanding to Solana demonstrates multi-chain strategy while maintaining Ethereum as home chain. Shows Ethereum DeFi protocols leveraging their brand and liquidity across ecosystems.",
    bmnrImplication: "Ethereum-originated DEX expanding to other chains shows Ethereum's DeFi ecosystem exporting innovation. Sushi retaining Ethereum deployment means continued ETH-based liquidity. Multi-chain expansion grows the overall DeFi pie.",
    source: "PR Newswire",
  },
  {
    date: "2026-02-06",
    category: "protocol",
    company: "ENS (Ethereum Name Service)",
    title: "ENSv2 Staying on Ethereum L1 — Namechain L2 Cancelled as Ethereum Scaling Makes It Unnecessary",
    sentiment: "bullish",
    summary: "ENS lead developer nick.eth announces ENSv2 will deploy exclusively on Ethereum L1, ceasing development of Namechain (their planned custom L2). Key driver: Ethereum L1 scaling faster than anyone predicted — 99% reduction in ENS registration gas costs over past year. Gas limit increased from 30M to 60M in 2025 (Fusaka upgrade), with core devs targeting 200M in 2026. ENS registration now costs <5 cents in gas (down from ~$5). At current gas prices, subsidizing every ENS transaction in 2025 would cost ~$10,000 — far less than running an L2. ENSv2 features still shipping: single-step registration, stablecoin purchases from any chain, new registry design, ENS App and ENS Explorer now in public alpha. Nick.eth: \"If we were starting today, knowing what we know about Ethereum's scaling progress and trajectory, would we build our own L2 for ENSv2? The answer is clearly no.\" Staying on L1 provides strongest security, decentralization, and liveness guarantees — no additional trust assumptions from L2 rollup contracts or centralized preconfers.",
    significance: "LANDMARK DECISION: Major Ethereum protocol (ENS, millions of names) choosing to STAY on L1 rather than migrate to L2 because L1 is now cheap enough. Validates Ethereum's scaling roadmap in the most concrete way possible — a major project that planned an L2 for 2 years cancelled it because L1 scaling exceeded expectations. 99% gas cost reduction + 200M gas limit target = Ethereum L1 becoming viable for mass consumer applications. ENS comparing Namechain to Concorde — knowing when to change course is leadership.",
    bmnrImplication: "ENS staying on L1 is one of the strongest validation signals for Ethereum's scaling trajectory. Gas limit 30M → 60M → 200M target makes L1 viable for consumer apps. More activity staying on L1 = more direct ETH demand for gas = more value accrual to ETH. 99% cost reduction demolishes the \"Ethereum is too expensive\" narrative. BMNR thesis strengthened: Ethereum scaling is working, and the network is becoming institutional-grade infrastructure.",
    source: "ENS Blog",
  },
];
