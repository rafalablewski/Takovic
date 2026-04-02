/**
 * Registry of known crypto treasury companies.
 *
 * These companies hold crypto assets on their balance sheet as a primary
 * strategy. Traditional valuation models (DCF, Graham, etc.) don't apply —
 * instead we use NAV-based projection with staking yield, dilution, and
 * asset growth assumptions.
 *
 * LAST UPDATED: 2026-04-02
 * NEXT UPDATE: When BMNR_VALUATION_SNAPSHOT or MSTR profile changes
 */

import { getBmnrCryptoTreasuryProfile } from "@/data/coverage/bmnr-crypto-snapshot";
import type {
  CryptoTreasuryProfile,
  CryptoTreasuryInputs,
  SliderParam,
} from "@/types/analysis";

// ---------------------------------------------------------------------------
// Known crypto treasury tickers
// ---------------------------------------------------------------------------

const CRYPTO_TREASURY_TICKERS = new Set(["BMNR", "MSTR"]);

export function isCryptoTreasury(ticker: string): boolean {
  return CRYPTO_TREASURY_TICKERS.has(ticker.toUpperCase());
}

// ---------------------------------------------------------------------------
// Company profiles (updated periodically with actual holdings data)
// ---------------------------------------------------------------------------

const PROFILES: Record<string, CryptoTreasuryProfile> = {
  BMNR: getBmnrCryptoTreasuryProfile(),
  MSTR: {
    ticker: "MSTR",
    companyName: "MicroStrategy",
    asset: "BTC",
    assetHoldings: 499_096, // BTC held (as of early 2026)
    assetPrice: 87_000, // current BTC price USD
    sharesOutstanding: 230_000_000,
    currentStockPrice: 330,
    stakingRatio: 0, // BTC not staked
    marketCap: 75_900_000_000,
  },
};

export function getCryptoTreasuryProfile(
  ticker: string
): CryptoTreasuryProfile | null {
  return PROFILES[ticker.toUpperCase()] ?? null;
}

/** Check if a crypto treasury company holds ETH (has staking, ethereum ecosystem features) */
export function isEthTreasury(ticker: string): boolean {
  const profile = PROFILES[ticker.toUpperCase()];
  return profile?.asset === "ETH";
}

/** Check if a crypto treasury company holds BTC */
export function isBtcTreasury(ticker: string): boolean {
  const profile = PROFILES[ticker.toUpperCase()];
  return profile?.asset === "BTC";
}

// ---------------------------------------------------------------------------
// Default inputs per asset type
// ---------------------------------------------------------------------------

const DEFAULT_INPUTS: Record<string, CryptoTreasuryInputs> = {
  ETH: {
    /** Terminal-year ETH spot vs today; 0 = flat spot (NAV walkthrough default). */
    assetGrowthRate: 0,
    stakingYield: 0,
    navPremium: 1.0,
    operatingCostRate: 0,
    dilutionRate: 0.08,
    discountRate: 0.12,
    projectionYears: 5,
    /** Net compound on ETH stack (staking − operating drag) per year. */
    netEthHoldingsGrowthRate: 0.025,
  },
  BTC: {
    assetGrowthRate: 0.15,
    stakingYield: 0,
    navPremium: 1.5,
    operatingCostRate: 0.005,
    dilutionRate: 0.05,
    discountRate: 0.12,
    projectionYears: 5,
    netEthHoldingsGrowthRate: 0,
  },
};

export function getDefaultInputs(
  asset: string
): CryptoTreasuryInputs {
  return { ...(DEFAULT_INPUTS[asset] ?? DEFAULT_INPUTS.ETH) };
}

// ---------------------------------------------------------------------------
// Slider parameter definitions (bearish → bullish presets)
// ---------------------------------------------------------------------------

export function getSliderParams(asset: string): SliderParam[] {
  if (asset === "ETH") {
    return [
      {
        key: "netEthHoldingsGrowthRate",
        label: "Net ETH Holdings Growth",
        description:
          "Single annual compound on the ETH balance through the horizon (staking and reinvestment net of operating drag). Matches NAV-based treasury math: H_terminal = H₀ × (1 + g)^N. Example base case: 2.5%.",
        presets: [
          { value: 0, label: "0%" },
          { value: 0.015, label: "1.5%" },
          { value: 0.025, label: "2.5%" },
          { value: 0.035, label: "3.5%" },
          { value: 0.05, label: "5%" },
          { value: 0.07, label: "7%" },
        ],
        defaultIndex: 2,
        suffix: "%",
        category: "yield",
      },
      {
        key: "assetGrowthRate",
        label: "Terminal ETH Price CAGR",
        description:
          "Annual growth applied to **spot ETH** from today to the terminal year. Use **0%** for a flat ETH price to terminal (standard NAV walkthrough). Raise if you want an explicit ETH price path layered on top.",
        presets: [
          { value: -0.2, label: "-20%" },
          { value: -0.05, label: "-5%" },
          { value: 0, label: "0%" },
          { value: 0.1, label: "10%" },
          { value: 0.2, label: "20%" },
          { value: 0.35, label: "35%" },
        ],
        defaultIndex: 2,
        suffix: "%",
        category: "growth",
      },
      {
        key: "navPremium",
        label: "NAV Premium at Terminal",
        description:
          "Multiple on terminal NAV/share for the implied stock price before discounting. 1.0x = at NAV. <1x = discount; >1x = premium.",
        presets: [
          { value: 0.40, label: "0.40x" },
          { value: 0.70, label: "0.70x" },
          { value: 1.0, label: "1.00x" },
          { value: 1.2, label: "1.20x" },
          { value: 1.5, label: "1.50x" },
          { value: 2.0, label: "2.00x" },
        ],
        defaultIndex: 2,
        suffix: "x",
        category: "valuation",
      },
      {
        key: "dilutionRate",
        label: "Annual Share Dilution",
        description:
          "Share count compounds at this rate; **ATM proceeds are not modeled as buying more ETH** (NAV-based ETH treasury convention). S₀ × (1 + d)^N diluted shares at terminal.",
        presets: [
          { value: 0.25, label: "25%" },
          { value: 0.15, label: "15%" },
          { value: 0.08, label: "8%" },
          { value: 0.05, label: "5%" },
          { value: 0.03, label: "3%" },
          { value: 0, label: "0%" },
        ],
        defaultIndex: 2,
        suffix: "%",
        category: "valuation",
      },
      {
        key: "discountRate",
        label: "Discount Rate",
        description:
          "One rate for time value **and** risk (regulatory, liquidity, tech, execution). Terminal implied price ÷ (1 + r)^N. Example: 12% over 5 years.",
        presets: [
          { value: 0.35, label: "35%" },
          { value: 0.2, label: "20%" },
          { value: 0.12, label: "12%" },
          { value: 0.11, label: "11%" },
          { value: 0.1, label: "10%" },
          { value: 0.08, label: "8%" },
        ],
        defaultIndex: 2,
        suffix: "%",
        category: "valuation",
      },
    ];
  }

  // BTC sliders (MSTR-style)
  return [
    {
      key: "assetGrowthRate",
      label: "BTC Annual Growth Rate",
      description:
        "Expected annual BTC price appreciation. Historical: 4yr CAGR ~50%. Post-halving cycles tend to outperform.",
      presets: [
        { value: -0.20, label: "-20%" },
        { value: 0.0, label: "0%" },
        { value: 0.15, label: "15%" },
        { value: 0.25, label: "25%" },
        { value: 0.40, label: "40%" },
        { value: 0.60, label: "60%" },
      ],
      defaultIndex: 2,
      suffix: "%",
      category: "growth",
    },
    {
      key: "navPremium",
      label: "NAV Premium/Discount",
      description:
        "Stock price vs NAV per share. MSTR historically trades at 1.5-3x NAV. Premium reflects leveraged BTC exposure and Saylor premium.",
      presets: [
        { value: 0.80, label: "0.80x" },
        { value: 1.00, label: "1.00x" },
        { value: 1.50, label: "1.50x" },
        { value: 2.00, label: "2.00x" },
        { value: 2.50, label: "2.50x" },
        { value: 3.00, label: "3.00x" },
      ],
      defaultIndex: 2,
      suffix: "x",
      category: "valuation",
    },
    {
      key: "operatingCostRate",
      label: "Operating Costs (% of AUM)",
      description:
        "Annual operating expenses as % of BTC holdings value. MSTR has software revenue offsetting some costs.",
      presets: [
        { value: 0.02, label: "2%" },
        { value: 0.01, label: "1%" },
        { value: 0.005, label: "0.5%" },
        { value: 0.003, label: "0.3%" },
        { value: 0.002, label: "0.2%" },
        { value: 0.001, label: "0.1%" },
      ],
      defaultIndex: 2,
      suffix: "%",
      category: "yield",
    },
    {
      key: "dilutionRate",
      label: "Annual Dilution Rate",
      description:
        "Expected share count increase. MSTR uses ATM offerings and convertible notes to acquire more BTC.",
      presets: [
        { value: 0.20, label: "20%" },
        { value: 0.10, label: "10%" },
        { value: 0.05, label: "5%" },
        { value: 0.03, label: "3%" },
        { value: 0.01, label: "1%" },
        { value: 0.00, label: "0%" },
      ],
      defaultIndex: 2,
      suffix: "%",
      category: "valuation",
    },
    {
      key: "discountRate",
      label: "Discount Rate / WACC",
      description:
        "Required return for discounting future value. Higher for volatile crypto exposure.",
      presets: [
        { value: 0.30, label: "30%" },
        { value: 0.20, label: "20%" },
        { value: 0.12, label: "12%" },
        { value: 0.10, label: "10%" },
        { value: 0.08, label: "8%" },
        { value: 0.06, label: "6%" },
      ],
      defaultIndex: 2,
      suffix: "%",
      category: "valuation",
    },
  ];
}
