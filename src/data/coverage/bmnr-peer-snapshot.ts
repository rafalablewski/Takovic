/**
 * BMNR Comps — extended peer snapshot, valuation matrix, SOTP, NAV sensitivity.
 *
 * BMNR row + SOTP ETH line + implied-matrix "current" align with
 * `BMNR_VALUATION_SNAPSHOT` (PR Mar 30, 2026). Peer prices otherwise static.
 *
 * LAST UPDATED: 2026-04-02
 * NEXT UPDATE: After material NAV, ETH price, or peer filing changes
 */

import type { PeerSnapshotBundle } from "@/types/coverage";
import { BMNR_VALUATION_SNAPSHOT as S } from "./bmnr-crypto-snapshot";

/** Market cap per canonical snapshot: price × diluted shares */
const BMNR_MCAP_B = (S.stockPriceUsd * S.sharesOutstanding) / 1e9;

/** SOTP illustrative total: ETH spot + scaled staking NPV + fixed premia (aligned to PR-era ETH book) */
const SOTP_TOTAL_STR = `$${(
  S.totalEthValueUsd / 1e9 +
  1.06 +
  0.5 +
  0.3
).toFixed(2)}B`;

/** Prior grid built at ~$21.36 NAV/sh; scale to `S.navPerShare` */
const NAV_SENSITIVITY_BASE = 21.36;
const NAV_SENS_SCALE = S.navPerShare / NAV_SENSITIVITY_BASE;
const LEGACY_NAV_GRID = [
  ["$8.01", "$10.68", "$13.35", "$16.02", "$21.36"],
  ["$12.02", "$16.02", "$20.03", "$24.04", "$32.05"],
  ["$16.02", "$21.36", "$26.71", "$32.05", "$42.73"],
  ["$20.03", "$26.71", "$33.38", "$40.06", "$53.41"],
  ["$24.04", "$32.05", "$40.06", "$48.07", "$64.09"],
  ["$32.05", "$42.73", "$53.41", "$64.09", "$85.46"],
] as const;

function scaleNavCell(cell: string): string {
  const n = Number.parseFloat(cell.replace(/[$,]/g, ""));
  if (!Number.isFinite(n)) return cell;
  return `$${(n * NAV_SENS_SCALE).toFixed(2)}`;
}

const NAV_SENSITIVITY_VALUES = LEGACY_NAV_GRID.map((row) =>
  row.map(scaleNavCell)
);

export const PEER_SNAPSHOT_METADATA = {
  lastUpdated: "2026-04-02",
  source: "Internal comps snapshot (BMNR figures tied to BMNR_VALUATION_SNAPSHOT)",
  nextExpectedUpdate: "Quarterly or after major peer events",
} as const;

export const PEER_SNAPSHOT: PeerSnapshotBundle = {
  lenses: [
    { id: "all", label: "All Peers" },
    { id: "eth_treasury", label: "ETH Treasury" },
    { id: "btc_treasury", label: "BTC Treasury" },
    { id: "exchanges", label: "Exchanges" },
  ],
  cards: [
    {
      id: "BMNR",
      name: "Bitmine Immersion",
      tickerLine: "BMNR · ETH",
      assetBadge: "ETH",
      role: "ETH",
      lenses: ["eth_treasury"],
      holdings: S.totalEth.toLocaleString("en-US"),
      navPerShare: `$${S.navPerShare.toFixed(2)}`,
      price: `$${S.stockPriceUsd.toFixed(2)}`,
      premium: `${S.premiumDiscount >= 0 ? "+" : ""}${Math.round(S.premiumDiscount * 100)}%`,
      /** ~7-day / CESR-style staking yield — see `bmnr-eth-purchases` PR Mar 30 block */
      yieldDisplay: "2.80%",
      marketCap: `$${BMNR_MCAP_B.toFixed(1)}B`,
      isSubject: true,
    },
    {
      id: "MSTR",
      name: "MicroStrategy",
      tickerLine: "MSTR · BTC",
      assetBadge: "BTC",
      threat: "high",
      role: "BTC TREASURY",
      lenses: ["btc_treasury"],
      holdings: "713,502",
      navPerShare: "$297.02",
      price: "$390",
      premium: "+31%",
      yieldDisplay: "—",
      marketCap: "$88.1B",
      status: "713,502 BTC ($54B+)",
      focus: "Pioneer BTC treasury, aggressive accumulation via preferred equity",
      narrative:
        "Largest corporate BTC holder. 0% yield - relies on price appreciation. 9.6% preferred dividend funded by dilution.",
    },
    {
      id: "MARA",
      name: "Marathon Digital",
      tickerLine: "MARA · BTC",
      assetBadge: "BTC",
      threat: "medium",
      role: "BTC MINER + TREASURY",
      lenses: ["btc_treasury"],
      holdings: "44,893",
      navPerShare: "$12.83",
      price: "$17.5",
      premium: "+36%",
      yieldDisplay: "—",
      marketCap: "$6.1B",
      status: "~46K BTC",
      focus: "Mining operations with treasury accumulation",
      narrative:
        "Mining generates BTC but no staking yield. Different model than BMNR's ETH staking approach.",
    },
    {
      id: "RIOT",
      name: "Riot Platforms",
      tickerLine: "RIOT · BTC",
      assetBadge: "BTC",
      threat: "low",
      role: "BTC MINER + TREASURY",
      lenses: ["btc_treasury"],
      holdings: "18,221",
      navPerShare: "$4.41",
      price: "$11.2",
      premium: "+154%",
      yieldDisplay: "—",
      marketCap: "$4.6B",
      status: "~18K BTC",
      focus: "Mining with treasury HODL strategy",
      narrative:
        "Smaller BTC miner. Mining costs vs BMNR's staking yield creates structural disadvantage.",
    },
    {
      id: "CLSK",
      name: "CleanSpark",
      tickerLine: "CLSK · BTC",
      assetBadge: "BTC",
      role: "BTC",
      lenses: ["btc_treasury"],
      holdings: "10,000",
      navPerShare: "$3.57",
      price: "$10.5",
      premium: "+194%",
      yieldDisplay: "—",
      marketCap: "$2.9B",
    },
    {
      id: "SMLR",
      name: "Semler Scientific",
      tickerLine: "SMLR · BTC",
      assetBadge: "BTC",
      role: "BTC",
      lenses: ["btc_treasury"],
      holdings: "3,192",
      navPerShare: "$39.90",
      price: "$52",
      premium: "+30%",
      yieldDisplay: "—",
      marketCap: "$0.4B",
    },
    {
      id: "ETHZ",
      name: "ETHZilla",
      tickerLine: "ETHZ · ETH",
      assetBadge: "ETH",
      threat: "high",
      role: "ETH TREASURY + RWA",
      lenses: ["eth_treasury"],
      holdings: "102,000",
      navPerShare: "$13.93",
      price: "$31",
      premium: "+123%",
      yieldDisplay: "4%",
      marketCap: "$0.5B",
      status: "~102K ETH + RWA tokenization",
      focus:
        "ETH accumulation, DeFi restaking (EtherFi/Puffer), RWA tokenization via Liquidity.io (FINRA ATS)",
      narrative:
        "Most direct competitor — also ETH treasury company. Differentiates via RWA tokenization (manufactured homes, auto loans, aircraft engines) and diversified DeFi yield. Trading at -13% NAV discount (mNAV 0.87x).",
    },
    {
      id: "COIN",
      name: "Coinbase",
      tickerLine: "COIN · BTC+ETH",
      assetBadge: "BTC+ETH",
      threat: "low",
      role: "EXCHANGE",
      lenses: ["exchanges"],
      holdings: "14,548 BTC / 148,715 ETH",
      navPerShare: "—",
      price: "$265",
      premium: "—",
      yieldDisplay: "—",
      marketCap: "$51.9B",
      status: "Mixed Holdings",
      focus: "Exchange + institutional custody + staking services",
      narrative:
        "Exchange model, not pure treasury play. Offers staking services but not same investment vehicle.",
    },
  ],
  yieldAdvantage: {
    title: "Yield advantage",
    subtitle: "ETH staking generates yield vs BTC's 0% — structural advantage",
    statLabel: "Staking yield (PR-era CESR / 7-day, vs BTC 0%)",
    statValue: "+2.80%",
  },
  valuationFramework:
    "NAV-based valuation for crypto treasury companies. Premium/discount analysis vs peers.",
  impliedValuationTitle: "Implied valuation matrix",
  impliedValuationCaption: `BMNR value under different NAV multiples (current mcap ~$${BMNR_MCAP_B.toFixed(1)}B, ${S.stockPriceUsd.toFixed(2)} × ${(S.sharesOutstanding / 1e6).toFixed(0)}M sh, PR Mar 30 snapshot)`,
  impliedValuationRows: [
    {
      method: "NAV Multiple",
      peerBasis: "MSTR Premium",
      multiple: "2.0x",
      impliedValue: "$20.08B",
      vsCurrent: "+142%",
    },
    {
      method: "NAV Multiple",
      peerBasis: "Market Average",
      multiple: "1.5x",
      impliedValue: "$15.06B",
      vsCurrent: "+82%",
    },
    {
      method: "NAV Multiple",
      peerBasis: "Fair Value",
      multiple: "1.0x",
      impliedValue: "$10.04B",
      vsCurrent: "+21%",
    },
    {
      method: "NAV Multiple",
      peerBasis: "Discount",
      multiple: "0.75x",
      impliedValue: "$7.53B",
      vsCurrent: "-9%",
    },
    {
      method: "Yield-Adjusted",
      peerBasis: "ETH Yield Premium",
      multiple: "1.3x",
      impliedValue: "$13.05B",
      vsCurrent: "+57%",
    },
    {
      method: "Yield-Adjusted",
      peerBasis: "5yr Compound",
      multiple: "1.15x",
      impliedValue: "$11.70B",
      vsCurrent: "+41%",
    },
  ],
  sotpTitle: "Sum-of-the-parts (SOTP)",
  sotpRows: [
    {
      component: "ETH Holdings",
      metric: "Spot value",
      multiple: `${(S.totalEth / 1e6).toFixed(2)}M ETH · 1.0x`,
      value: `$${(S.totalEthValueUsd / 1e9).toFixed(2)}B`,
    },
    {
      component: "Staking Yield",
      metric: "5yr NPV @ 10%",
      multiple: "2.80% APY · NPV",
      value: "$1.06B",
    },
    {
      component: "Operational Premium",
      metric: "Management + infrastructure",
      multiple: "Strategic",
      value: "$0.50B",
    },
    {
      component: "Growth Optionality",
      metric: "Acquisition capacity",
      multiple: "Option value",
      value: "$0.30B",
    },
  ],
  sotpTotalLabel: "SOTP Total",
  sotpTotalValue: SOTP_TOTAL_STR,
  navSensitivity: {
    caption: "NAV premium sensitivity",
    subtitle:
      "Stock price at different ETH prices × NAV multiples",
    rowLabels: [
      "$1,092.5",
      "$1,638.75",
      "$2,185",
      "$2,731.25",
      "$3,277.5",
      "$4,370",
    ],
    colLabels: ["0.75X", "1X", "1.25X", "1.5X", "2X"],
    values: NAV_SENSITIVITY_VALUES,
  },
};
