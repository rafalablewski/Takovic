import type { FMPQuote } from "@/lib/api/yahoo";
import type {
  LiveQuoteRow,
  LiveQuotesPayload,
  NormalizedLiveQuotesPayload,
} from "@/types/coverage";

export function normalizeCoverageQuote(
  q: FMPQuote | null,
  labelSymbol: string
): LiveQuoteRow | null {
  if (!q || !Number.isFinite(q.price)) return null;
  return {
    symbol: q.symbol,
    label: labelSymbol,
    price: q.price,
    changesPercentage: q.changesPercentage,
  };
}

export function toNormalizedLiveQuotes(
  json: LiveQuotesPayload,
  upper: string
): NormalizedLiveQuotesPayload {
  return {
    stock: normalizeCoverageQuote(json.stock, upper),
    eth: normalizeCoverageQuote(json.eth, json.ethSymbol),
    ethSymbol: json.ethSymbol,
    includeEthSpot: Boolean(json.includeEthSpot),
    updatedAt: json.updatedAt,
  };
}
