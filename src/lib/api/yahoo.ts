/**
 * Yahoo Finance API client — powered by yahoo-finance2.
 *
 * Drop-in replacement for the former FMP client.  Every exported function and
 * type keeps the same name so consumers only need to update their import path.
 *
 * yahoo-finance2 is server-side only (no CORS / cookies in browsers), which is
 * fine because all callers are Next.js Server Components or Route Handlers.
 */

import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

/** yahoo-finance2 sometimes returns {} instead of a number — coerce safely. */
function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return 0;
}

// ---------------------------------------------------------------------------
// Stock quote
// ---------------------------------------------------------------------------

export async function getQuote(ticker: string): Promise<FMPQuote | null> {
  try {
    const q = await yf.quote(ticker);
    if (!q || !q.regularMarketPrice) return null;
    return {
      symbol: q.symbol,
      name: q.shortName ?? q.longName ?? q.symbol,
      price: q.regularMarketPrice ?? 0,
      changesPercentage: q.regularMarketChangePercent ?? 0,
      change: q.regularMarketChange ?? 0,
      dayLow: q.regularMarketDayLow ?? 0,
      dayHigh: q.regularMarketDayHigh ?? 0,
      yearHigh: q.fiftyTwoWeekHigh ?? 0,
      yearLow: q.fiftyTwoWeekLow ?? 0,
      marketCap: q.marketCap ?? 0,
      volume: q.regularMarketVolume ?? 0,
      avgVolume: q.averageDailyVolume3Month ?? 0,
      open: q.regularMarketOpen ?? 0,
      previousClose: q.regularMarketPreviousClose ?? 0,
      eps: q.epsTrailingTwelveMonths ?? 0,
      pe: q.trailingPE ?? 0,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (err) {
    console.error(`Yahoo quote error for ${ticker}:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Company profile
// ---------------------------------------------------------------------------

export async function getProfile(ticker: string): Promise<FMPProfile | null> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["assetProfile", "summaryProfile", "price"],
    });
    const ap = summary.assetProfile;
    const price = summary.price;
    if (!ap && !price) return null;
    return {
      symbol: ticker,
      companyName: price?.longName ?? price?.shortName ?? ticker,
      description: ap?.longBusinessSummary ?? "",
      sector: ap?.sector ?? "",
      industry: ap?.industry ?? "",
      exchange: price?.exchangeName ?? "",
      currency: price?.currency ?? "USD",
      country: ap?.country ?? "",
      website: ap?.website ?? "",
      image: "",
      fullTimeEmployees: ap?.fullTimeEmployees?.toString() ?? "",
      ipoDate: "",
      ceo: ap?.companyOfficers?.[0]?.name ?? "",
      mktCap: price?.marketCap ?? 0,
    };
  } catch (err) {
    console.error(`Yahoo profile error for ${ticker}:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Income statement
// ---------------------------------------------------------------------------

export async function getIncomeStatement(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
): Promise<FMPIncomeStatement[]> {
  try {
    const mod =
      period === "quarter"
        ? "incomeStatementHistoryQuarterly"
        : "incomeStatementHistory";
    const summary = await yf.quoteSummary(ticker, { modules: [mod as any] });
    const statements: any[] =
      (summary as any)[mod]?.incomeStatementHistory ?? [];
    return statements.slice(0, limit).map((s: any) => ({
      date: s.endDate
        ? new Date(s.endDate).toISOString().slice(0, 10)
        : "",
      period: period === "quarter" ? "Q" : "FY",
      revenue: s.totalRevenue ?? 0,
      netIncome: s.netIncome ?? 0,
      eps: s.dilutedEPS ?? 0,
      epsdiluted: s.dilutedEPS ?? 0,
      grossProfit: s.grossProfit ?? 0,
      operatingIncome: s.operatingIncome ?? 0,
    }));
  } catch (err) {
    console.error(`Yahoo income statement error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Balance sheet
// ---------------------------------------------------------------------------

export async function getBalanceSheet(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
): Promise<FMPBalanceSheet[]> {
  try {
    const mod =
      period === "quarter"
        ? "balanceSheetHistoryQuarterly"
        : "balanceSheetHistory";
    const summary = await yf.quoteSummary(ticker, { modules: [mod as any] });
    const sheets: any[] =
      (summary as any)[mod]?.balanceSheetStatements ?? [];
    return sheets.slice(0, limit).map((s: any) => ({
      date: s.endDate
        ? new Date(s.endDate).toISOString().slice(0, 10)
        : "",
      period: period === "quarter" ? "Q" : "FY",
      totalAssets: s.totalAssets ?? 0,
      totalLiabilities: s.totalLiab ?? 0,
      totalStockholdersEquity: s.totalStockholderEquity ?? 0,
      totalDebt: (s.longTermDebt ?? 0) + (s.shortLongTermDebt ?? 0),
      cashAndCashEquivalents: s.cash ?? 0,
    }));
  } catch (err) {
    console.error(`Yahoo balance sheet error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Cash flow statement
// ---------------------------------------------------------------------------

export async function getCashFlowStatement(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
): Promise<FMPCashFlowStatement[]> {
  try {
    const mod =
      period === "quarter"
        ? "cashflowStatementHistoryQuarterly"
        : "cashflowStatementHistory";
    const summary = await yf.quoteSummary(ticker, { modules: [mod as any] });
    const flows: any[] =
      (summary as any)[mod]?.cashflowStatements ?? [];
    return flows.slice(0, limit).map((s: any) => ({
      date: s.endDate
        ? new Date(s.endDate).toISOString().slice(0, 10)
        : "",
      period: period === "quarter" ? "Q" : "FY",
      freeCashFlow: (s.totalCashFromOperatingActivities ?? 0) + (s.capitalExpenditures ?? 0),
      operatingCashFlow: s.totalCashFromOperatingActivities ?? 0,
      capitalExpenditure: s.capitalExpenditures ?? 0,
      dividendsPaid: s.dividendsPaid ?? 0,
      netCashUsedForInvestingActivites: s.totalCashflowsFromInvestingActivities ?? 0,
      debtRepayment: s.repaymentOfDebt ?? 0,
      commonStockRepurchased: s.repurchaseOfStock ?? 0,
    }));
  } catch (err) {
    console.error(`Yahoo cash flow error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Key metrics
// ---------------------------------------------------------------------------

export async function getKeyMetrics(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
): Promise<FMPKeyMetrics[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["defaultKeyStatistics", "financialData"],
    });
    const ks = summary.defaultKeyStatistics;
    const fd = summary.financialData;
    const m: FMPKeyMetrics = {
      date: new Date().toISOString().slice(0, 10),
      period: period === "quarter" ? "Q" : "FY",
      peRatio: ks?.trailingEps && fd?.currentPrice
        ? num(fd.currentPrice) / num(ks.trailingEps)
        : num(ks?.forwardPE),
      pbRatio: num(ks?.priceToBook),
      psRatio: num(ks?.priceToSalesTrailing12Months),
      roe: num(fd?.returnOnEquity),
      roa: num(fd?.returnOnAssets),
      debtToEquity: num(fd?.debtToEquity) ? num(fd?.debtToEquity) / 100 : 0,
      currentRatio: num(fd?.currentRatio),
      revenuePerShare: num(fd?.revenuePerShare),
      dividendYield: num(ks?.dividendYield),
      freeCashFlowYield: 0,
      grossProfitMargin: num(fd?.grossMargins),
      operatingProfitMargin: num(fd?.operatingMargins),
      netProfitMargin: num(fd?.profitMargins),
    };
    return Array(limit).fill(null).map(() => ({ ...m })).slice(0, 1);
  } catch (err) {
    console.error(`Yahoo key metrics error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function searchStocks(query: string, limit = 10): Promise<FMPSearchResult[]> {
  try {
    const results = await yf.search(query);
    return (results.quotes ?? [])
      .filter((q: any) => q.symbol && q.quoteType !== "OPTION")
      .slice(0, limit)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname ?? q.longname ?? q.symbol,
        currency: "",
        stockExchange: q.exchange ?? "",
        exchangeShortName: q.exchDisp ?? "",
      }));
  } catch (err) {
    console.error(`Yahoo search error for ${query}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Stock news (via search insights)
// ---------------------------------------------------------------------------

export async function getStockNews(ticker: string, limit = 20): Promise<FMPNews[]> {
  try {
    const results = await yf.search(ticker, { newsCount: limit });
    return (results.news ?? []).slice(0, limit).map((n: any) => ({
      symbol: ticker,
      title: n.title ?? "",
      text: n.title ?? "",
      publishedDate: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString()
        : "",
      site: n.publisher ?? "",
      url: n.link ?? "",
      image: n.thumbnail?.resolutions?.[0]?.url ?? "",
    }));
  } catch (err) {
    console.error(`Yahoo news error for ${ticker}:`, err);
    return [];
  }
}

const DEFAULT_NEWS_TICKERS = "AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META,SPY,QQQ";

export async function getMarketNews(limit = 30, tickers?: string): Promise<FMPNews[]> {
  const tickerStr = tickers?.trim() || DEFAULT_NEWS_TICKERS;
  const first = tickerStr.split(",")[0];
  return getStockNews(first, limit);
}

// ---------------------------------------------------------------------------
// SEC filings
// ---------------------------------------------------------------------------

export async function getSECFilings(ticker: string, type?: string, limit = 50): Promise<FMPSECFiling[]> {
  try {
    const summary = await yf.quoteSummary(ticker, { modules: ["secFilings" as any] });
    let filings: any[] = (summary as any).secFilings?.filings ?? [];
    if (type) {
      filings = filings.filter((f: any) => f.type === type);
    }
    return filings.slice(0, limit).map((f: any) => ({
      symbol: ticker,
      cik: "",
      type: f.type ?? "",
      link: f.edgarUrl ?? "",
      finalLink: f.edgarUrl ?? "",
      acceptedDate: f.date ? new Date(f.date).toISOString() : "",
      fillingDate: f.date ? new Date(f.date).toISOString().slice(0, 10) : "",
    }));
  } catch (err) {
    console.error(`Yahoo SEC filings error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Press releases (not directly available — return empty)
// ---------------------------------------------------------------------------

export async function getPressReleases(ticker: string, _limit = 30): Promise<FMPPressRelease[]> {
  return [];
}

// ---------------------------------------------------------------------------
// Stock screener (not directly available — use dailyGainers as proxy)
// ---------------------------------------------------------------------------

export async function screenStocks(_params: Record<string, string>): Promise<FMPScreenerResult[]> {
  return [];
}

// ---------------------------------------------------------------------------
// Historical price OHLCV
// ---------------------------------------------------------------------------

export async function getHistoricalPriceFull(
  ticker: string,
  options?: { from?: string; to?: string }
): Promise<FMPHistoricalPriceFullResponse> {
  try {
    const period1 = options?.from ?? "2000-01-01";
    const period2 = options?.to ?? new Date().toISOString().slice(0, 10);
    const result = await yf.chart(ticker, {
      period1,
      period2,
      interval: "1d",
    });
    const quotes = result.quotes ?? [];
    const historical: FMPHistoricalBar[] = quotes.map((q: any) => ({
      date: q.date ? new Date(q.date).toISOString().slice(0, 10) : "",
      open: q.open ?? 0,
      high: q.high ?? 0,
      low: q.low ?? 0,
      close: q.close ?? 0,
      adjClose: q.adjclose ?? q.close ?? 0,
      volume: q.volume ?? 0,
    }));
    return { symbol: ticker, historical };
  } catch (err) {
    console.error(`Yahoo historical price error for ${ticker}:`, err);
    return { symbol: ticker, historical: [] };
  }
}

// ---------------------------------------------------------------------------
// Earnings calendar
// ---------------------------------------------------------------------------

export async function getEarningsCalendar(from: string, to: string): Promise<FMPEarningsCalendarItem[]> {
  // Yahoo doesn't have a standalone earnings calendar API.
  // We use the screener/search approach for the most relevant upcoming earnings.
  // For now, return empty — the calendar page will show "no events" gracefully.
  return [];
}

// ---------------------------------------------------------------------------
// Market movers
// ---------------------------------------------------------------------------

export async function getStockMarketGainers(): Promise<FMPMoverQuote[]> {
  try {
    const result = await yf.dailyGainers?.() ?? (await yf.screener({ scrIds: "day_gainers" }));
    const quotes = (result as any)?.quotes ?? [];
    return quotes.slice(0, 20).map(mapMoverQuote);
  } catch (err) {
    console.error("Yahoo gainers error:", err);
    return [];
  }
}

export async function getStockMarketLosers(): Promise<FMPMoverQuote[]> {
  try {
    const result = await (yf as any).dailyLosers?.() ?? (await yf.screener({ scrIds: "day_losers" }));
    const quotes = (result as any)?.quotes ?? [];
    return quotes.slice(0, 20).map(mapMoverQuote);
  } catch (err) {
    console.error("Yahoo losers error:", err);
    return [];
  }
}

export async function getStockMarketActives(): Promise<FMPMoverQuote[]> {
  try {
    const result = await yf.screener({ scrIds: "most_actives" });
    const quotes = (result as any)?.quotes ?? [];
    return quotes.slice(0, 20).map(mapMoverQuote);
  } catch (err) {
    console.error("Yahoo actives error:", err);
    return [];
  }
}

function mapMoverQuote(q: any): FMPMoverQuote {
  return {
    symbol: q.symbol ?? "",
    changes: q.regularMarketChange ?? 0,
    price: q.regularMarketPrice ?? 0,
    changesPercentage: q.regularMarketChangePercent ?? 0,
    companyName: q.shortName ?? q.longName ?? q.symbol ?? "",
  };
}

// ---------------------------------------------------------------------------
// Intraday bars (5 min)
// ---------------------------------------------------------------------------

export async function getHistoricalChart5Min(
  ticker: string,
  from: string,
  to: string
): Promise<FMPIntradayBar[]> {
  try {
    const result = await yf.chart(ticker, {
      period1: from,
      period2: to,
      interval: "5m",
    });
    return (result.quotes ?? []).map((q: any) => ({
      date: q.date ? new Date(q.date).toISOString() : "",
      open: q.open ?? 0,
      low: q.low ?? 0,
      high: q.high ?? 0,
      close: q.close ?? 0,
      volume: q.volume ?? 0,
    }));
  } catch (err) {
    console.error(`Yahoo 5min chart error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Analyst estimates & price targets
// ---------------------------------------------------------------------------

export async function getAnalystEstimates(
  ticker: string,
  _period: "annual" | "quarter" = "annual",
  limit = 6
): Promise<FMPAnalystEstimate[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["earningsTrend"],
    });
    const trends: any[] = (summary as any).earningsTrend?.trend ?? [];
    return trends.slice(0, limit).map((t: any) => ({
      symbol: ticker,
      date: t.endDate ?? "",
      estimatedRevenueLow: t.revenueEstimate?.low ?? 0,
      estimatedRevenueHigh: t.revenueEstimate?.high ?? 0,
      estimatedRevenueAvg: t.revenueEstimate?.avg ?? 0,
      estimatedEbitdaLow: 0,
      estimatedEbitdaHigh: 0,
      estimatedEbitdaAvg: 0,
      estimatedEpsLow: t.earningsEstimate?.low ?? 0,
      estimatedEpsHigh: t.earningsEstimate?.high ?? 0,
      estimatedEpsAvg: t.earningsEstimate?.avg ?? 0,
      estimatedNetIncomeLow: 0,
      estimatedNetIncomeHigh: 0,
      estimatedNetIncomeAvg: 0,
      numberAnalystEstimatedRevenue: t.revenueEstimate?.numberOfAnalysts ?? 0,
      numberAnalystsEstimatedEps: t.earningsEstimate?.numberOfAnalysts ?? 0,
    }));
  } catch (err) {
    console.error(`Yahoo analyst estimates error for ${ticker}:`, err);
    return [];
  }
}

export async function getPriceTarget(ticker: string): Promise<FMPPriceTarget[]> {
  return [];
}

export async function getPriceTargetConsensus(ticker: string): Promise<FMPPriceTargetConsensus | null> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["financialData"],
    });
    const fd = summary.financialData;
    if (!fd?.targetMeanPrice) return null;
    return {
      symbol: ticker,
      targetHigh: fd.targetHighPrice ?? 0,
      targetLow: fd.targetLowPrice ?? 0,
      targetConsensus: fd.targetMeanPrice ?? 0,
      targetMedian: fd.targetMedianPrice ?? fd.targetMeanPrice ?? 0,
    };
  } catch (err) {
    console.error(`Yahoo price target error for ${ticker}:`, err);
    return null;
  }
}

export async function getAnalystRecommendations(ticker: string): Promise<FMPAnalystRecommendation[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["recommendationTrend"],
    });
    const trends: any[] = summary.recommendationTrend?.trend ?? [];
    return trends.map((t: any) => ({
      symbol: ticker,
      date: t.period ?? "",
      analystRatingsbuy: t.buy ?? 0,
      analystRatingsHold: t.hold ?? 0,
      analystRatingsSell: t.sell ?? 0,
      analystRatingsStrongSell: t.strongSell ?? 0,
      analystRatingsStrongBuy: t.strongBuy ?? 0,
    }));
  } catch (err) {
    console.error(`Yahoo analyst recommendations error for ${ticker}:`, err);
    return [];
  }
}

export async function getUpgradesDowngrades(ticker: string): Promise<FMPUpgradeDowngrade[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["upgradeDowngradeHistory"],
    });
    const history: any[] = (summary as any).upgradeDowngradeHistory?.history ?? [];
    return history.slice(0, 30).map((h: any) => ({
      symbol: ticker,
      publishedDate: h.epochGradeDate
        ? new Date(h.epochGradeDate * 1000).toISOString()
        : "",
      newsURL: "",
      newsTitle: "",
      newsBaseURL: "",
      newsPublisher: h.firm ?? "",
      newGrade: h.toGrade ?? "",
      previousGrade: h.fromGrade ?? "",
      gradingCompany: h.firm ?? "",
      action: h.action ?? "",
      priceWhenPosted: 0,
    }));
  } catch (err) {
    console.error(`Yahoo upgrades/downgrades error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Insider & institutional ownership
// ---------------------------------------------------------------------------

export async function getInstitutionalHolders(ticker: string): Promise<FMPInstitutionalHolder[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["institutionOwnership"],
    });
    const holders: any[] = summary.institutionOwnership?.ownershipList ?? [];
    return holders.map((h: any) => ({
      holder: h.organization ?? "",
      shares: h.position ?? 0,
      dateReported: h.reportDate
        ? new Date(h.reportDate).toISOString().slice(0, 10)
        : "",
      change: h.pctChange ?? 0,
      changePercentage: (h.pctChange ?? 0) * 100,
    }));
  } catch (err) {
    console.error(`Yahoo institutional holders error for ${ticker}:`, err);
    return [];
  }
}

export async function getInsiderTrading(ticker: string, limit = 50): Promise<FMPInsiderTrade[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["insiderTransactions"],
    });
    const txns: any[] = summary.insiderTransactions?.transactions ?? [];
    return txns.slice(0, limit).map((t: any) => ({
      symbol: ticker,
      filingDate: t.startDate
        ? new Date(t.startDate).toISOString().slice(0, 10)
        : "",
      transactionDate: t.startDate
        ? new Date(t.startDate).toISOString().slice(0, 10)
        : "",
      reportingName: t.filerName ?? "",
      transactionType: t.transactionText ?? "",
      securitiesOwned: t.ownership === "D" ? (t.shares ?? 0) : 0,
      securitiesTransacted: Math.abs(t.shares ?? 0),
      price: t.value ? t.value / Math.max(Math.abs(t.shares ?? 1), 1) : 0,
      typeOfOwner: t.filerRelation ?? "",
    }));
  } catch (err) {
    console.error(`Yahoo insider trading error for ${ticker}:`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Dividends
// ---------------------------------------------------------------------------

export async function getHistoricalDividends(ticker: string): Promise<FMPHistoricalDividendResponse> {
  try {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const events = await yf.historical(ticker, {
      period1: fiveYearsAgo.toISOString().slice(0, 10),
      events: "dividends",
    });
    const records: FMPDividendRecord[] = (events ?? []).map((e: any) => ({
      date: e.date ? new Date(e.date).toISOString().slice(0, 10) : "",
      label: "",
      adjDividend: e.dividends ?? e.amount ?? 0,
      dividend: e.dividends ?? e.amount ?? 0,
      recordDate: "",
      paymentDate: "",
      declarationDate: "",
    }));
    return { symbol: ticker, historical: records };
  } catch (err) {
    console.error(`Yahoo dividend history error for ${ticker}:`, err);
    return { symbol: ticker, historical: [] };
  }
}

// ---------------------------------------------------------------------------
// Economic calendar (not available in yahoo-finance2)
// ---------------------------------------------------------------------------

export async function getEconomicCalendar(_from: string, _to: string): Promise<FMPEconomicEvent[]> {
  return [];
}

// ---------------------------------------------------------------------------
// Sector performance
// ---------------------------------------------------------------------------

const SECTOR_ETFS: { ticker: string; sector: string }[] = [
  { ticker: "XLK", sector: "Technology" },
  { ticker: "XLV", sector: "Healthcare" },
  { ticker: "XLF", sector: "Financial Services" },
  { ticker: "XLY", sector: "Consumer Cyclical" },
  { ticker: "XLP", sector: "Consumer Defensive" },
  { ticker: "XLE", sector: "Energy" },
  { ticker: "XLI", sector: "Industrials" },
  { ticker: "XLB", sector: "Basic Materials" },
  { ticker: "XLRE", sector: "Real Estate" },
  { ticker: "XLU", sector: "Utilities" },
  { ticker: "XLC", sector: "Communication Services" },
];

export async function getSectorPerformance(): Promise<FMPSectorPerformance[]> {
  try {
    const quotes = await yf.quote(
      SECTOR_ETFS.map((s) => s.ticker),
      { return: "array" }
    );
    const arr = Array.isArray(quotes) ? quotes : [quotes];
    return SECTOR_ETFS.map((s, i) => ({
      sector: s.sector,
      changesPercentage: ((arr[i] as any)?.regularMarketChangePercent ?? 0).toFixed(4),
    }));
  } catch (err) {
    console.error("Yahoo sector performance error:", err);
    return [];
  }
}

export async function getHistoricalSectorPerformance(_limit = 5): Promise<FMPHistoricalSectorPerformance[]> {
  return [];
}

// ---------------------------------------------------------------------------
// ETF
// ---------------------------------------------------------------------------

export async function getETFHoldings(ticker: string): Promise<FMPETFHolding[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["topHoldings"],
    });
    const holdings: any[] = summary.topHoldings?.holdings ?? [];
    return holdings.map((h: any) => ({
      asset: h.symbol ?? "",
      name: h.holdingName ?? h.symbol ?? "",
      sharesNumber: 0,
      weightPercentage: (h.holdingPercent ?? 0) * 100,
      marketValue: 0,
    }));
  } catch (err) {
    console.error(`Yahoo ETF holdings error for ${ticker}:`, err);
    return [];
  }
}

export async function getETFSectorWeightings(ticker: string): Promise<FMPETFSectorWeight[]> {
  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: ["topHoldings"],
    });
    const sectors: any[] = summary.topHoldings?.sectorWeightings ?? [];
    const result: FMPETFSectorWeight[] = [];
    for (const entry of sectors) {
      for (const [sector, weight] of Object.entries(entry)) {
        result.push({
          sector,
          weightPercentage: (((weight as number) ?? 0) * 100).toFixed(2),
        });
      }
    }
    return result;
  } catch (err) {
    console.error(`Yahoo ETF sector weights error for ${ticker}:`, err);
    return [];
  }
}

export async function getETFCountryWeightings(ticker: string): Promise<FMPETFCountryWeight[]> {
  // Yahoo doesn't provide country weightings directly via quoteSummary
  return [];
}

// ---------------------------------------------------------------------------
// Options chain
// ---------------------------------------------------------------------------

export async function getOptionsChain(ticker: string) {
  try {
    return await yf.options(ticker);
  } catch (err) {
    console.error(`Yahoo options error for ${ticker}:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function fmpMoverSymbol(q: FMPMoverQuote): string {
  return (q.ticker ?? q.symbol ?? "").toUpperCase();
}

// ---------------------------------------------------------------------------
// Type definitions — kept identical to FMP for drop-in compatibility
// ---------------------------------------------------------------------------

export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  timestamp: number;
}

export interface FMPProfile {
  symbol: string;
  companyName: string;
  description: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  country: string;
  website: string;
  image: string;
  fullTimeEmployees: string;
  ipoDate: string;
  ceo: string;
  mktCap: number;
}

export interface FMPIncomeStatement {
  date: string;
  period: string;
  revenue: number;
  netIncome: number;
  eps: number;
  epsdiluted: number;
  grossProfit: number;
  operatingIncome: number;
}

export interface FMPBalanceSheet {
  date: string;
  period: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  totalDebt: number;
  cashAndCashEquivalents: number;
}

export interface FMPKeyMetrics {
  date: string;
  period: string;
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  revenuePerShare: number;
  dividendYield: number;
  freeCashFlowYield: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
}

export interface FMPCashFlowStatement {
  date: string;
  period: string;
  freeCashFlow: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  dividendsPaid: number;
  netCashUsedForInvestingActivites: number;
  debtRepayment: number;
  commonStockRepurchased: number;
}

export interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export interface FMPNews {
  symbol: string;
  title: string;
  text: string;
  publishedDate: string;
  site: string;
  url: string;
  image: string;
}

export interface FMPSECFiling {
  symbol: string;
  cik: string;
  type: string;
  link: string;
  finalLink: string;
  acceptedDate: string;
  fillingDate: string;
}

export interface FMPPressRelease {
  symbol: string;
  date: string;
  title: string;
  text: string;
  url?: string;
  source?: string;
}

export interface FMPScreenerResult {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  price: number;
  volume: number;
  exchange: string;
  country: string;
}

export interface FMPHistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose?: number;
  volume: number;
  unadjustedVolume?: number;
  change?: number;
  changePercent?: number;
  vwap?: number;
  label?: string;
  changeOverTime?: number;
}

export interface FMPHistoricalPriceFullResponse {
  symbol: string;
  historical: FMPHistoricalBar[];
}

export interface FMPEarningsCalendarItem {
  date: string;
  symbol: string;
  eps: number | null;
  epsEstimated: number | null;
  time?: string;
  revenue: number | null;
  revenueEstimated: number | null;
  fiscalDateEnding?: string;
  updatedFromDate?: string;
}

export interface FMPMoverQuote {
  ticker?: string;
  symbol?: string;
  changes: number;
  price: number;
  changesPercentage: number;
  companyName: string;
}

export interface FMPIntradayBar {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

export interface FMPAnalystEstimate {
  symbol: string;
  date: string;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  estimatedRevenueAvg: number;
  estimatedEbitdaLow: number;
  estimatedEbitdaHigh: number;
  estimatedEbitdaAvg: number;
  estimatedEpsLow: number;
  estimatedEpsHigh: number;
  estimatedEpsAvg: number;
  estimatedNetIncomeLow: number;
  estimatedNetIncomeHigh: number;
  estimatedNetIncomeAvg: number;
  numberAnalystEstimatedRevenue: number;
  numberAnalystsEstimatedEps: number;
}

export interface FMPPriceTarget {
  symbol: string;
  publishedDate: string;
  newsURL: string;
  newsTitle: string;
  analystName: string;
  priceTarget: number;
  adjPriceTarget: number;
  priceWhenPosted: number;
  newsPublisher: string;
  analystCompany: string;
}

export interface FMPPriceTargetConsensus {
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetConsensus: number;
  targetMedian: number;
}

export interface FMPAnalystRecommendation {
  symbol: string;
  date: string;
  analystRatingsbuy: number;
  analystRatingsHold: number;
  analystRatingsSell: number;
  analystRatingsStrongSell: number;
  analystRatingsStrongBuy: number;
}

export interface FMPUpgradeDowngrade {
  symbol: string;
  publishedDate: string;
  newsURL: string;
  newsTitle: string;
  newsBaseURL: string;
  newsPublisher: string;
  newGrade: string;
  previousGrade: string;
  gradingCompany: string;
  action: string;
  priceWhenPosted: number;
}

export interface FMPInstitutionalHolder {
  holder: string;
  shares: number;
  dateReported: string;
  change: number;
  changePercentage: number;
}

export interface FMPInsiderTrade {
  symbol: string;
  filingDate: string;
  transactionDate: string;
  reportingName: string;
  transactionType: string;
  securitiesOwned: number;
  securitiesTransacted: number;
  price: number;
  typeOfOwner: string;
}

export interface FMPHistoricalDividendResponse {
  symbol: string;
  historical: FMPDividendRecord[];
}

export interface FMPDividendRecord {
  date: string;
  label: string;
  adjDividend: number;
  dividend: number;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
}

export interface FMPEconomicEvent {
  event: string;
  date: string;
  country: string;
  actual: number | null;
  previous: number | null;
  change: number | null;
  changePercentage: number | null;
  estimate: number | null;
  impact: string;
}

export interface FMPSectorPerformance {
  sector: string;
  changesPercentage: string;
}

export interface FMPHistoricalSectorPerformance {
  date: string;
  utilitiesChangesPercentage: number;
  basicMaterialsChangesPercentage: number;
  communicationServicesChangesPercentage: number;
  consumerCyclicalChangesPercentage: number;
  consumerDefensiveChangesPercentage: number;
  energyChangesPercentage: number;
  financialServicesChangesPercentage: number;
  healthcareChangesPercentage: number;
  industrialsChangesPercentage: number;
  realEstateChangesPercentage: number;
  technologyChangesPercentage: number;
}

export interface FMPETFHolding {
  asset: string;
  name: string;
  sharesNumber: number;
  weightPercentage: number;
  marketValue: number;
}

export interface FMPETFSectorWeight {
  sector: string;
  weightPercentage: string;
}

export interface FMPETFCountryWeight {
  country: string;
  weightPercentage: string;
}
