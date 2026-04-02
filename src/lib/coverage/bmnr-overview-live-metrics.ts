/**
 * Recompute BMNR overview Key Metrics using live stock and ETH spot prices.
 * Static holdings / share count / dividend per share come from the PR-era snapshot;
 * prices fall back to the snapshot when a live quote is missing.
 */

import { BMNR_VALUATION_SNAPSHOT as S } from "@/data/coverage/bmnr-crypto-snapshot";
import type { EthCorrelationMetric } from "@/data/coverage/bmnr-ethereum";
import type { OverviewMetric } from "@/types/coverage";
import { formatCurrency } from "@/lib/utils";

export function applyBmnrLivePricesToOverviewMetrics(
  metrics: readonly OverviewMetric[],
  liveStockPrice: number | null,
  liveEthPrice: number | null
): OverviewMetric[] {
  const stockPrice = liveStockPrice ?? S.stockPriceUsd;
  const ethPrice = liveEthPrice ?? S.ethPriceUsd;
  const shares = S.sharesOutstanding;

  const navTotal =
    shares * S.navPerShare - S.totalEthValueUsd + S.totalEth * ethPrice;
  const navPerShareLive = shares > 0 ? navTotal / shares : 0;
  const premiumDiscount =
    navPerShareLive !== 0 ? (stockPrice - navPerShareLive) / navPerShareLive : 0;
  const navMultiple =
    navPerShareLive !== 0 ? stockPrice / navPerShareLive : 0;
  const totalEthValue = S.totalEth * ethPrice;
  const marketCap = stockPrice * shares;
  const dividendYield =
    stockPrice > 0 ? S.annualDiv / stockPrice : 0;
  const totalStackLive = S.totalStackUsd - S.totalEthValueUsd + totalEthValue;

  const overrides: Record<string, string | number> = {
    "NAV/Share": navPerShareLive,
    "Stock Price": stockPrice,
    "Premium/Discount": premiumDiscount,
    "Dividend Yield": dividendYield,
    "ETH Price": ethPrice,
    "Total Value": totalEthValue,
    "Market Cap": marketCap,
    "NAV Multiple": navMultiple,
    "Div Yield": dividendYield,
    "Total Stack (PR)": totalStackLive,
  };

  return metrics.map((m) => {
    if (m.label in overrides) {
      return { ...m, value: overrides[m.label] };
    }
    return m;
  });
}

/**
 * BMNR Ethereum tab — correlation strip (live stock + ETH vs PR snapshot holdings).
 */
export function buildBmnrEthCorrelationMetrics(
  liveStockPrice: number | null,
  liveEthPrice: number | null
): EthCorrelationMetric[] {
  const stock = liveStockPrice ?? S.stockPriceUsd;
  const eth = liveEthPrice ?? S.ethPriceUsd;
  const shares = S.sharesOutstanding;
  const totalEth = S.totalEth;

  const ethPerShare = shares > 0 ? totalEth / shares : 0;
  const navTotal =
    shares * S.navPerShare - S.totalEthValueUsd + totalEth * eth;
  const navPerShare = shares > 0 ? navTotal / shares : 0;
  const navVsStockPct =
    navPerShare !== 0 ? ((stock - navPerShare) / navPerShare) * 100 : 0;
  const navDetail = !Number.isFinite(navVsStockPct)
    ? "—"
    : navVsStockPct <= 0
      ? `${Math.abs(navVsStockPct).toFixed(1)}% discount`
      : `${navVsStockPct.toFixed(1)}% premium`;

  const impliedEth = ethPerShare > 0 ? stock / ethPerShare : 0;
  const navSensPer100 = shares > 0 ? (totalEth * 100) / shares : 0;

  return [
    {
      label: "ETH Price",
      value: formatCurrency(eth),
      detail: "Current spot",
    },
    {
      label: "NAV Per Share",
      value: formatCurrency(navPerShare),
      detail: navDetail,
    },
    {
      label: "ETH Per Share",
      value: ethPerShare.toFixed(4),
      detail: "Your fractional ETH",
    },
    {
      label: "Implied ETH Price",
      value: formatCurrency(impliedEth),
      detail: `vs ${formatCurrency(eth)} spot`,
    },
    {
      label: "NAV Sensitivity",
      value: formatCurrency(navSensPer100),
      detail: "per $100 ETH move",
    },
  ];
}
