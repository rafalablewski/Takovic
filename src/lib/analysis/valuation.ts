/**
 * Advanced valuation engine.
 * Implements 6 models: multi-stage DCF, DDM, Graham Number,
 * Peter Lynch PEG, comparable multiples, and Earnings Power Value.
 *
 * All rates are decimals (0.10 = 10%) unless noted otherwise.
 */

import type {
  DCFInputs,
  DDMInputs,
  MultiplesInputs,
  GrahamInputs,
  LynchInputs,
  EPVInputs,
  WACCInputs,
  ModelResult,
  ValuationResult,
  StockValuationParams,
} from "@/types/analysis";

// ---------------------------------------------------------------------------
// WACC
// ---------------------------------------------------------------------------

export function calculateWACC(inputs: WACCInputs): number {
  const totalCapital = inputs.marketCapEquity + inputs.totalDebt;
  if (totalCapital <= 0) return 0.10; // default fallback

  const equityWeight = inputs.marketCapEquity / totalCapital;
  const debtWeight = inputs.totalDebt / totalCapital;

  return (
    equityWeight * inputs.costOfEquity +
    debtWeight * inputs.costOfDebt * (1 - inputs.taxRate)
  );
}

// ---------------------------------------------------------------------------
// 1. Multi-Stage DCF
// ---------------------------------------------------------------------------

export function calculateDCF(inputs: DCFInputs): number {
  const {
    currentFCF,
    fcfGrowthRateHigh,
    highGrowthYears,
    fadeYears,
    terminalGrowthRate,
    discountRate,
    sharesOutstanding,
    netDebt,
  } = inputs;

  if (discountRate <= terminalGrowthRate) return 0; // invalid
  if (sharesOutstanding <= 0) return 0;

  let totalPV = 0;
  let fcf = currentFCF;
  let year = 0;

  // Phase 1: High growth
  for (let i = 0; i < highGrowthYears; i++) {
    year++;
    fcf *= 1 + fcfGrowthRateHigh;
    totalPV += fcf / Math.pow(1 + discountRate, year);
  }

  // Phase 2: Fade (linear interpolation from high growth to terminal growth)
  for (let i = 0; i < fadeYears; i++) {
    year++;
    const fadeProgress = (i + 1) / fadeYears;
    const fadeRate =
      fcfGrowthRateHigh * (1 - fadeProgress) +
      terminalGrowthRate * fadeProgress;
    fcf *= 1 + fadeRate;
    totalPV += fcf / Math.pow(1 + discountRate, year);
  }

  // Terminal value (Gordon Growth Model)
  const terminalFCF = fcf * (1 + terminalGrowthRate);
  const terminalValue = terminalFCF / (discountRate - terminalGrowthRate);
  const pvTerminal = terminalValue / Math.pow(1 + discountRate, year);

  const enterpriseValue = totalPV + pvTerminal;
  const equityValue = enterpriseValue - netDebt;

  return Math.max(0, equityValue / sharesOutstanding);
}

// ---------------------------------------------------------------------------
// 2. Dividend Discount Model (Gordon Growth)
// ---------------------------------------------------------------------------

export function calculateDDM(inputs: DDMInputs): number {
  const { currentDividendPerShare, dividendGrowthRate, requiredReturn } = inputs;

  if (requiredReturn <= dividendGrowthRate) return 0;
  if (currentDividendPerShare <= 0) return 0;

  const nextDividend = currentDividendPerShare * (1 + dividendGrowthRate);
  return nextDividend / (requiredReturn - dividendGrowthRate);
}

// ---------------------------------------------------------------------------
// 3. Graham Number
// ---------------------------------------------------------------------------

/** Graham Number = sqrt(22.5 * EPS * BVPS) */
export function calculateGrahamNumber(inputs: GrahamInputs): number {
  const { eps, bookValuePerShare } = inputs;

  if (eps <= 0 || bookValuePerShare <= 0) return 0;

  // Graham's constants: P/E <= 15 and P/B <= 1.5 → 15 * 1.5 = 22.5
  return Math.sqrt(22.5 * eps * bookValuePerShare);
}

// ---------------------------------------------------------------------------
// 4. Peter Lynch Fair Value (PEG-based)
// ---------------------------------------------------------------------------

/**
 * Lynch PEG fair value = EPS * (earnings growth rate + dividend yield).
 * A PEG ratio of 1.0 means the stock is fairly valued.
 * Fair P/E = growth rate + dividend yield, so fair price = EPS * fair P/E.
 */
export function calculateLynchFairValue(inputs: LynchInputs): number {
  const { eps, earningsGrowthRate, dividendYield } = inputs;

  if (eps <= 0) return 0;
  if (earningsGrowthRate <= 0) return 0;

  // Fair P/E = growth rate (%) + dividend yield (%) — inputs are decimals
  const fairPE = (earningsGrowthRate * 100) + (dividendYield * 100);
  return eps * fairPE;
}

// ---------------------------------------------------------------------------
// 5. Comparable Company Multiples
// ---------------------------------------------------------------------------

export function calculateMultiples(inputs: MultiplesInputs): {
  peValue: number;
  pbValue: number;
  psValue: number;
  evEbitdaValue: number;
  average: number;
} {
  const values: number[] = [];

  const peValue = inputs.eps > 0 ? inputs.eps * inputs.targetPE : 0;
  const pbValue =
    inputs.bookValuePerShare > 0
      ? inputs.bookValuePerShare * inputs.targetPB
      : 0;
  const psValue =
    inputs.revenuePerShare > 0 ? inputs.revenuePerShare * inputs.targetPS : 0;
  const evEbitdaValue =
    inputs.ebitdaPerShare > 0
      ? inputs.ebitdaPerShare * inputs.targetEVEBITDA
      : 0;

  if (peValue > 0) values.push(peValue);
  if (pbValue > 0) values.push(pbValue);
  if (psValue > 0) values.push(psValue);
  if (evEbitdaValue > 0) values.push(evEbitdaValue);

  const average =
    values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;

  return { peValue, pbValue, psValue, evEbitdaValue, average };
}

// ---------------------------------------------------------------------------
// 6. Earnings Power Value
// ---------------------------------------------------------------------------

export function calculateEPV(inputs: EPVInputs): number {
  const { normalizedEarnings, wacc, sharesOutstanding, excessCash, totalDebt } =
    inputs;

  if (wacc <= 0 || sharesOutstanding <= 0) return 0;

  const enterpriseValue = normalizedEarnings / wacc;
  const equityValue = enterpriseValue + excessCash - totalDebt;

  return Math.max(0, equityValue / sharesOutstanding);
}

// ---------------------------------------------------------------------------
// Sensitivity Matrix Generator
// ---------------------------------------------------------------------------

export function generateSensitivityMatrix(
  baseInputs: DCFInputs,
  growthRates: number[],
  discountRates: number[]
): number[][] {
  return growthRates.map((gr) =>
    discountRates.map((dr) =>
      calculateDCF({
        ...baseInputs,
        fcfGrowthRateHigh: gr,
        discountRate: dr,
      })
    )
  );
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

function getVerdict(
  upsidePercent: number
): ValuationResult["verdict"] {
  if (upsidePercent > 30) return "Significantly Undervalued";
  if (upsidePercent > 10) return "Undervalued";
  if (upsidePercent > -10) return "Fairly Valued";
  if (upsidePercent > -30) return "Overvalued";
  return "Significantly Overvalued";
}

// ---------------------------------------------------------------------------
// Composite Valuation (runs all applicable models)
// ---------------------------------------------------------------------------

export function runAllModels(
  params: StockValuationParams,
  overrides?: {
    dcfGrowthHigh?: number;
    highGrowthYears?: number;
    fadeYears?: number;
    terminalGrowth?: number;
    discountRate?: number;
  }
): ValuationResult {
  const models: ModelResult[] = [];

  const wacc = overrides?.discountRate ?? params.wacc;
  const highGrowth =
    overrides?.dcfGrowthHigh ?? Math.max(params.fcfGrowthRate3yr, params.revenueGrowthRate);
  const terminalGrowth = overrides?.terminalGrowth ?? 0.025;
  const highGrowthYears = overrides?.highGrowthYears ?? 5;
  const fadeYears = overrides?.fadeYears ?? 5;

  // 1. Multi-stage DCF
  const hasDCFData = params.freeCashFlow > 0 && params.sharesOutstanding > 0;
  const dcfValue = hasDCFData
    ? calculateDCF({
        currentFCF: params.freeCashFlow,
        fcfGrowthRateHigh: highGrowth,
        highGrowthYears,
        fadeYears,
        terminalGrowthRate: terminalGrowth,
        discountRate: wacc,
        sharesOutstanding: params.sharesOutstanding,
        netDebt: params.netDebt,
      })
    : 0;
  models.push({
    name: "Multi-Stage DCF",
    fairValue: dcfValue,
    description:
      `${highGrowthYears}yr high growth at ${(highGrowth * 100).toFixed(1)}%, ` +
      `${fadeYears}yr fade, ${(terminalGrowth * 100).toFixed(1)}% terminal, ` +
      `${(wacc * 100).toFixed(1)}% WACC`,
    confidence: hasDCFData ? "high" : "low",
    applicable: hasDCFData,
  });

  // 2. DDM
  const hasDividend = params.dividendPerShare > 0;
  const ddmGrowthRate = hasDividend
    ? Math.min(params.revenueGrowthRate, 0.08)
    : 0;
  const ddmValue = hasDividend
    ? calculateDDM({
        currentDividendPerShare: params.dividendPerShare,
        dividendGrowthRate: ddmGrowthRate,
        requiredReturn: wacc,
      })
    : 0;
  models.push({
    name: "Dividend Discount Model",
    fairValue: ddmValue,
    description: hasDividend
      ? `$${params.dividendPerShare.toFixed(2)}/share dividend, ${(ddmGrowthRate * 100).toFixed(1)}% growth`
      : "No dividend paid",
    confidence: hasDividend ? "medium" : "low",
    applicable: hasDividend,
  });

  // 3. Graham Number
  const hasGrahamData = params.eps > 0 && params.bookValuePerShare > 0;
  const grahamValue = hasGrahamData
    ? calculateGrahamNumber({
        eps: params.eps,
        bookValuePerShare: params.bookValuePerShare,
      })
    : 0;
  models.push({
    name: "Graham Number",
    fairValue: grahamValue,
    description: hasGrahamData
      ? `EPS $${params.eps.toFixed(2)}, BVPS $${params.bookValuePerShare.toFixed(2)}`
      : "Requires positive EPS and book value",
    confidence: hasGrahamData ? "medium" : "low",
    applicable: hasGrahamData,
  });

  // 4. Peter Lynch PEG
  const hasLynchData = params.eps > 0 && params.revenueGrowthRate > 0;
  const lynchValue = hasLynchData
    ? calculateLynchFairValue({
        eps: params.eps,
        earningsGrowthRate: params.revenueGrowthRate,
        dividendYield: params.dividendYield,
      })
    : 0;
  models.push({
    name: "Peter Lynch Fair Value",
    fairValue: lynchValue,
    description: hasLynchData
      ? `PEG-based: ${(params.revenueGrowthRate * 100).toFixed(1)}% growth + ${(params.dividendYield * 100).toFixed(1)}% yield`
      : "Requires positive EPS and growth",
    confidence: hasLynchData ? "medium" : "low",
    applicable: hasLynchData,
  });

  // 5. Comparable Multiples
  const hasMultiplesData = params.eps > 0 && params.industryPE > 0;
  const multiples = calculateMultiples({
    eps: params.eps,
    bookValuePerShare: params.bookValuePerShare,
    revenuePerShare: params.revenuePerShare,
    ebitdaPerShare: 0, // not always available; use EV/EBITDA when it is
    targetPE: params.industryPE,
    targetPB: params.industryPB,
    targetPS: params.industryPS,
    targetEVEBITDA: params.industryEVEBITDA,
  });
  models.push({
    name: "Comparable Multiples",
    fairValue: multiples.average,
    description: hasMultiplesData
      ? `P/E: $${multiples.peValue.toFixed(2)}, P/B: $${multiples.pbValue.toFixed(2)}, P/S: $${multiples.psValue.toFixed(2)}`
      : "Insufficient peer data",
    confidence: hasMultiplesData ? "high" : "low",
    applicable: hasMultiplesData,
  });

  // 6. EPV
  const normalizedEarnings =
    params.netMargin > 0
      ? (params.revenuePerShare * params.sharesOutstanding * params.netMargin)
      : 0;
  const excessCash = Math.max(0, params.cashAndEquivalents - params.totalDebt * 0.05);
  const hasEPVData = normalizedEarnings > 0 && wacc > 0;
  const epvValue = hasEPVData
    ? calculateEPV({
        normalizedEarnings,
        wacc,
        sharesOutstanding: params.sharesOutstanding,
        excessCash,
        totalDebt: params.totalDebt,
      })
    : 0;
  models.push({
    name: "Earnings Power Value",
    fairValue: epvValue,
    description: hasEPVData
      ? `Normalized earnings at ${(params.netMargin * 100).toFixed(1)}% margin`
      : "Requires positive earnings",
    confidence: hasEPVData ? "medium" : "low",
    applicable: hasEPVData,
  });

  // Composite: weighted average of applicable models
  const applicableModels = models.filter((m) => m.applicable && m.fairValue > 0);
  const weights: Record<string, number> = {
    "Multi-Stage DCF": 3,
    "Comparable Multiples": 2,
    "Earnings Power Value": 1.5,
    "Graham Number": 1,
    "Peter Lynch Fair Value": 1,
    "Dividend Discount Model": 1,
  };

  let weightedSum = 0;
  let totalWeight = 0;
  for (const m of applicableModels) {
    const w = weights[m.name] ?? 1;
    const confidenceMultiplier =
      m.confidence === "high" ? 1 : m.confidence === "medium" ? 0.8 : 0.5;
    const effectiveWeight = w * confidenceMultiplier;
    weightedSum += m.fairValue * effectiveWeight;
    totalWeight += effectiveWeight;
  }

  const compositeFairValue =
    totalWeight > 0 ? weightedSum / totalWeight : params.currentPrice;
  const upsidePercent =
    params.currentPrice > 0
      ? ((compositeFairValue - params.currentPrice) / params.currentPrice) * 100
      : 0;

  // Sensitivity matrix for DCF
  const baseGrowth = highGrowth;
  const growthStep = 0.02;
  const discountStep = 0.01;
  const sensitivityGrowthRates = [
    baseGrowth - growthStep * 2,
    baseGrowth - growthStep,
    baseGrowth,
    baseGrowth + growthStep,
    baseGrowth + growthStep * 2,
  ].map((r) => Math.max(0, r));
  const sensitivityDiscountRates = [
    wacc - discountStep * 2,
    wacc - discountStep,
    wacc,
    wacc + discountStep,
    wacc + discountStep * 2,
  ].map((r) => Math.max(0.01, r));

  const dcfBaseInputs: DCFInputs = {
    currentFCF: params.freeCashFlow,
    fcfGrowthRateHigh: highGrowth,
    highGrowthYears,
    fadeYears,
    terminalGrowthRate: terminalGrowth,
    discountRate: wacc,
    sharesOutstanding: params.sharesOutstanding,
    netDebt: params.netDebt,
  };

  const sensitivityValues = hasDCFData
    ? generateSensitivityMatrix(
        dcfBaseInputs,
        sensitivityGrowthRates,
        sensitivityDiscountRates
      )
    : [];

  return {
    ticker: params.ticker,
    currentPrice: params.currentPrice,
    models,
    compositeFairValue: Math.round(compositeFairValue * 100) / 100,
    upsidePercent: Math.round(upsidePercent * 10) / 10,
    verdict: getVerdict(upsidePercent),
    sensitivityMatrix: {
      growthRates: sensitivityGrowthRates,
      discountRates: sensitivityDiscountRates,
      values: sensitivityValues,
    },
  };
}
