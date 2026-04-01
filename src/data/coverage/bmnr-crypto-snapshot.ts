/**
 * Canonical BMNR numbers shared by coverage Overview Key Metrics and
 * crypto treasury valuation (Model tab). Update this file when the PR-era
 * snapshot changes; keep OVERVIEW prose in bmnr.ts aligned with these values.
 *
 * LAST UPDATED: 2026-03-31
 * NEXT UPDATE: After next material PR / 8-K
 */

import type { CryptoTreasuryProfile } from "@/types/analysis";

/** PR Mar 30, 2026 era — aligns with OVERVIEW metric descriptions in bmnr.ts */
export const BMNR_VALUATION_SNAPSHOT = {
  companyName: "Bitmine Immersion Technologies",
  /** Total ETH on balance sheet */
  totalEth: 4_732_082,
  ethStaked: 3_142_643,
  ethPriceUsd: 2005,
  stockPriceUsd: 17.65,
  sharesOutstanding: 470_000_000,
  navPerShare: 22.9,
  premiumDiscount: -0.23,
  dividendYield: 0.0022,
  totalEthValueUsd: 9.49e9,
  stakingRevenueAnnualized: 177e6,
  navMultiple: 0.77,
  ethPerShare: 0.01007,
  quarterlyDiv: 0.01,
  annualDiv: 0.04,
  divYieldVsStock: 0.0023,
  payoutAnnual: 18.8e6,
  mrBeastEquity: 200e6,
  orbsStake: 102e6,
  btcWorth: 9.9e6,
  cashUsd: 961e6,
  totalStackUsd: 10.7e9,
} as const;

export function getBmnrCryptoTreasuryProfile(): CryptoTreasuryProfile {
  const s = BMNR_VALUATION_SNAPSHOT;
  const marketCap = s.stockPriceUsd * s.sharesOutstanding;
  return {
    ticker: "BMNR",
    companyName: s.companyName,
    asset: "ETH",
    assetHoldings: s.totalEth,
    assetPrice: s.ethPriceUsd,
    sharesOutstanding: s.sharesOutstanding,
    currentStockPrice: s.stockPriceUsd,
    stakingRatio: s.ethStaked / s.totalEth,
    marketCap,
  };
}
