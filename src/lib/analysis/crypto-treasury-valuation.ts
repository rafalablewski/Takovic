/**
 * Crypto treasury company valuation engine.
 *
 * ## ETH treasuries (e.g. BMNR) — NAV-based terminal model
 * - Terminal ETH balance: H₀ × (1 + netEthHoldingsGrowthRate)^N (staking net of costs in one rate).
 * - Terminal share count: S₀ × (1 + dilutionRate)^N — dilution does **not** purchase ETH.
 * - Terminal spot: P₀ × (1 + assetGrowthRate)^N (default assetGrowthRate = 0 → flat spot).
 * - Terminal NAV = H_N × P_N; NAV/share = NAV / S_N; implied price = NAV/share × navPremium.
 * - Fair value today = terminal implied price ÷ (1 + discountRate)^N.
 *
 * ## BTC treasuries (e.g. MSTR) — legacy year-by-year path
 * - Asset price grows annually; staking/ops on holdings; dilution issues shares and buys more BTC.
 */

import type {
  CryptoTreasuryProfile,
  CryptoTreasuryInputs,
  CryptoTreasuryYearProjection,
  CryptoTreasuryResult,
  ValuationResult,
} from "@/types/analysis";

// ---------------------------------------------------------------------------
// ETH: closed-form geometric terminal (holdings + shares + optional spot CAGR)
// ---------------------------------------------------------------------------

function projectEthTreasuryNavBased(
  profile: CryptoTreasuryProfile,
  inputs: CryptoTreasuryInputs
): CryptoTreasuryYearProjection[] {
  const projections: CryptoTreasuryYearProjection[] = [];
  const H0 = profile.assetHoldings;
  const S0 = profile.sharesOutstanding;
  const P0 = profile.assetPrice;
  const N = inputs.projectionYears;
  const gH = inputs.netEthHoldingsGrowthRate;
  const gP = inputs.assetGrowthRate;
  const dil = inputs.dilutionRate;

  let prevShares = S0;

  for (let y = 1; y <= N; y++) {
    const prevHoldings = H0 * Math.pow(1 + gH, y - 1);
    const assetHoldings = H0 * Math.pow(1 + gH, y);
    const totalShares = S0 * Math.pow(1 + dil, y);
    const assetPrice = P0 * Math.pow(1 + gP, y);
    const nav = assetHoldings * assetPrice;
    const navPerShare = totalShares > 0 ? nav / totalShares : 0;
    const impliedStockPrice = navPerShare * inputs.navPremium;
    const newSharesIssued = totalShares - prevShares;
    prevShares = totalShares;

    projections.push({
      year: y,
      assetPrice,
      assetHoldings,
      stakingIncome: assetHoldings - prevHoldings,
      operatingCostAssets: 0,
      newSharesIssued,
      assetsFromDilution: 0,
      totalShares,
      nav,
      navPerShare,
      impliedStockPrice,
    });
  }

  return projections;
}

// ---------------------------------------------------------------------------
// BTC: year-by-year (dilution proceeds buy more asset)
// ---------------------------------------------------------------------------

function projectBtcTreasuryLegacy(
  profile: CryptoTreasuryProfile,
  inputs: CryptoTreasuryInputs
): CryptoTreasuryYearProjection[] {
  const projections: CryptoTreasuryYearProjection[] = [];

  let assetPrice = profile.assetPrice;
  let assetHoldings = profile.assetHoldings;
  let totalShares = profile.sharesOutstanding;

  for (let y = 1; y <= inputs.projectionYears; y++) {
    assetPrice *= 1 + inputs.assetGrowthRate;

    const stakingIncome =
      assetHoldings * profile.stakingRatio * inputs.stakingYield;

    const operatingCostAssets = assetHoldings * inputs.operatingCostRate;

    const newSharesIssued = totalShares * inputs.dilutionRate;
    const prevNavPerShare =
      totalShares > 0 ? (assetHoldings * assetPrice) / totalShares : 0;
    const issuePrice = prevNavPerShare * inputs.navPremium;
    const capitalRaised = newSharesIssued * issuePrice;
    const assetsFromDilution =
      assetPrice > 0 ? capitalRaised / assetPrice : 0;

    assetHoldings =
      assetHoldings +
      stakingIncome -
      operatingCostAssets +
      assetsFromDilution;
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

export function projectCryptoTreasury(
  profile: CryptoTreasuryProfile,
  inputs: CryptoTreasuryInputs
): CryptoTreasuryYearProjection[] {
  if (profile.asset === "ETH") {
    return projectEthTreasuryNavBased(profile, inputs);
  }
  return projectBtcTreasuryLegacy(profile, inputs);
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

  const terminal = projections[projections.length - 1];
  const terminalStockPrice = terminal?.impliedStockPrice ?? 0;
  const fairValuePerShare =
    terminalStockPrice /
    Math.pow(1 + inputs.discountRate, inputs.projectionYears);

  const currentPrice = profile.currentStockPrice;
  const upsidePercent =
    currentPrice > 0
      ? ((fairValuePerShare - currentPrice) / currentPrice) * 100
      : 0;

  const baseGrowth = inputs.assetGrowthRate;
  const assetGrowthRates = [-0.30, -0.05, 0, 0.10, 0.20, 0.35, 0.6];
  if (!assetGrowthRates.some((r) => Math.abs(r - baseGrowth) < 0.001)) {
    assetGrowthRates.push(baseGrowth);
    assetGrowthRates.sort((a, b) => a - b);
  }

  const discountRates = [0, 0.08, 0.1, 0.12, 0.2, 0.35];
  if (!discountRates.some((r) => Math.abs(r - inputs.discountRate) < 0.001)) {
    discountRates.push(inputs.discountRate);
    discountRates.sort((a, b) => a - b);
  }

  const sensitivityValues = assetGrowthRates.map((gr) =>
    discountRates.map((dr) => {
      const proj = projectCryptoTreasury(profile, {
        ...inputs,
        assetGrowthRate: gr,
        discountRate: dr,
      });
      const term = proj[proj.length - 1];
      return (
        (term?.impliedStockPrice ?? 0) /
        Math.pow(1 + dr, inputs.projectionYears)
      );
    })
  );

  const navPremiums = [0.4, 0.7, 1.0, 1.2, 1.5, 2.0];
  if (!navPremiums.some((p) => Math.abs(p - inputs.navPremium) < 0.001)) {
    navPremiums.push(inputs.navPremium);
    navPremiums.sort((a, b) => a - b);
  }

  const premiumValues = navPremiums.map((np) =>
    assetGrowthRates.map((gr) => {
      const proj = projectCryptoTreasury(profile, {
        ...inputs,
        navPremium: np,
        assetGrowthRate: gr,
      });
      const term = proj[proj.length - 1];
      return (
        (term?.impliedStockPrice ?? 0) /
        Math.pow(1 + inputs.discountRate, inputs.projectionYears)
      );
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
