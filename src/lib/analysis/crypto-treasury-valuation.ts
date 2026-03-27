/**
 * Crypto treasury company valuation engine.
 *
 * Models companies like BMNR (ETH) or MSTR (BTC) whose value derives
 * from crypto asset holdings rather than traditional earnings/cash flow.
 *
 * Year-by-year projection:
 *   1. Asset price grows at the user-specified growth rate
 *   2. Staking yield adds new assets to holdings
 *   3. Operating costs consume a fraction of holdings
 *   4. Dilution issues new shares; proceeds buy more assets
 *   5. NAV = holdings × asset price; stock price = NAV/share × premium
 *   6. Terminal stock price is discounted back to present for fair value
 */

import type {
  CryptoTreasuryProfile,
  CryptoTreasuryInputs,
  CryptoTreasuryYearProjection,
  CryptoTreasuryResult,
  ValuationResult,
} from "@/types/analysis";

// ---------------------------------------------------------------------------
// Core projection
// ---------------------------------------------------------------------------

export function projectCryptoTreasury(
  profile: CryptoTreasuryProfile,
  inputs: CryptoTreasuryInputs
): CryptoTreasuryYearProjection[] {
  const projections: CryptoTreasuryYearProjection[] = [];

  let assetPrice = profile.assetPrice;
  let assetHoldings = profile.assetHoldings;
  let totalShares = profile.sharesOutstanding;

  for (let y = 1; y <= inputs.projectionYears; y++) {
    // 1. Asset price appreciation
    assetPrice *= 1 + inputs.assetGrowthRate;

    // 2. Staking yield — only staked portion earns yield
    const stakingIncome = assetHoldings * profile.stakingRatio * inputs.stakingYield;

    // 3. Operating costs eat into holdings
    const operatingCostAssets = assetHoldings * inputs.operatingCostRate;

    // 4. Dilution — new shares issued, proceeds buy assets at new price
    const newSharesIssued = totalShares * inputs.dilutionRate;
    // Company issues at market price = NAV/share × premium
    const prevNavPerShare =
      totalShares > 0 ? (assetHoldings * assetPrice) / totalShares : 0;
    const issuePrice = prevNavPerShare * inputs.navPremium;
    const capitalRaised = newSharesIssued * issuePrice;
    const assetsFromDilution = assetPrice > 0 ? capitalRaised / assetPrice : 0;

    // Update running totals
    assetHoldings = assetHoldings + stakingIncome - operatingCostAssets + assetsFromDilution;
    totalShares += newSharesIssued;

    const nav = assetHoldings * assetPrice;
    const navPerShare = totalShares > 0 ? nav / totalShares : 0;
    const impliedStockPrice = navPerShare * inputs.navPremium;

    projections.push({
      year: y,
      assetPrice,
      assetHoldings,
      stakingIncome,
      operatingCostAssets,
      newSharesIssued,
      assetsFromDilution,
      totalShares,
      nav,
      navPerShare,
      impliedStockPrice,
    });
  }

  return projections;
}

// ---------------------------------------------------------------------------
// Fair value (discounted terminal value)
// ---------------------------------------------------------------------------

function getVerdict(upsidePercent: number): ValuationResult["verdict"] {
  if (upsidePercent > 30) return "Significantly Undervalued";
  if (upsidePercent > 10) return "Undervalued";
  if (upsidePercent > -10) return "Fairly Valued";
  if (upsidePercent > -30) return "Overvalued";
  return "Significantly Overvalued";
}

export function runCryptoTreasuryValuation(
  profile: CryptoTreasuryProfile,
  inputs: CryptoTreasuryInputs
): CryptoTreasuryResult {
  const projections = projectCryptoTreasury(profile, inputs);

  // Terminal value = last year's implied stock price, discounted back
  const terminal = projections[projections.length - 1];
  const terminalStockPrice = terminal?.impliedStockPrice ?? 0;
  const fairValuePerShare =
    terminalStockPrice / Math.pow(1 + inputs.discountRate, inputs.projectionYears);

  const currentPrice = profile.currentStockPrice;
  const upsidePercent =
    currentPrice > 0
      ? ((fairValuePerShare - currentPrice) / currentPrice) * 100
      : 0;

  // Sensitivity 1: asset growth rate × discount rate
  const baseGrowth = inputs.assetGrowthRate;
  const assetGrowthRates = [-0.30, -0.05, 0.10, 0.20, 0.35, 0.60];
  // Ensure base is included
  if (!assetGrowthRates.some((r) => Math.abs(r - baseGrowth) < 0.001)) {
    assetGrowthRates.push(baseGrowth);
    assetGrowthRates.sort((a, b) => a - b);
  }

  const discountRates = [0.08, 0.10, 0.11, 0.12, 0.20, 0.35];
  if (!discountRates.some((r) => Math.abs(r - inputs.discountRate) < 0.001)) {
    discountRates.push(inputs.discountRate);
    discountRates.sort((a, b) => a - b);
  }

  const sensitivityValues = assetGrowthRates.map((gr) =>
    discountRates.map((dr) => {
      const proj = projectCryptoTreasury(profile, { ...inputs, assetGrowthRate: gr, discountRate: dr });
      const term = proj[proj.length - 1];
      return (term?.impliedStockPrice ?? 0) / Math.pow(1 + dr, inputs.projectionYears);
    })
  );

  // Sensitivity 2: NAV premium × asset growth rate
  const navPremiums = [0.40, 0.70, 1.00, 1.20, 1.50, 2.00];
  if (!navPremiums.some((p) => Math.abs(p - inputs.navPremium) < 0.001)) {
    navPremiums.push(inputs.navPremium);
    navPremiums.sort((a, b) => a - b);
  }

  const premiumValues = navPremiums.map((np) =>
    assetGrowthRates.map((gr) => {
      const proj = projectCryptoTreasury(profile, { ...inputs, navPremium: np, assetGrowthRate: gr });
      const term = proj[proj.length - 1];
      return (term?.impliedStockPrice ?? 0) / Math.pow(1 + inputs.discountRate, inputs.projectionYears);
    })
  );

  return {
    profile,
    inputs,
    projections,
    fairValuePerShare: Math.round(fairValuePerShare * 100) / 100,
    currentPrice,
    upsidePercent: Math.round(upsidePercent * 10) / 10,
    verdict: getVerdict(upsidePercent),
    terminalNAVPerShare: terminal?.navPerShare ?? 0,
    terminalAssetPrice: terminal?.assetPrice ?? 0,
    sensitivityMatrix: {
      assetGrowthRates,
      discountRates,
      values: sensitivityValues,
    },
    premiumSensitivity: {
      navPremiums,
      assetGrowthRates,
      values: premiumValues,
    },
  };
}
