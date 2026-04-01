/**
 * Financial Modeling Prep API client.
 * Docs: https://site.financialmodelingprep.com/developer/docs
 */

const FMP_BASE_URL = process.env.FMP_BASE_URL || "https://financialmodelingprep.com/api/v3";
const FMP_CACHE_REVALIDATE = Number(process.env.FMP_CACHE_REVALIDATE) || 300;

function getFmpApiKey(): string {
  const key = process.env.YAHOO_FINANCE;
  if (!key) {
    throw new Error(
      "YAHOO_FINANCE is not set. Add it to .env.local — get a key at https://site.financialmodelingprep.com/"
    );
  }
  return key;
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${FMP_BASE_URL}${endpoint}`);
  url.searchParams.set("apikey", getFmpApiKey());
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function fetchFMP<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, { next: { revalidate: FMP_CACHE_REVALIDATE } }); // 5 min cache

  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Stock quote
export async function getQuote(ticker: string) {
  const data = await fetchFMP<FMPQuote[]>(`/quote/${ticker}`);
  return data[0] ?? null;
}

// Company profile
export async function getProfile(ticker: string) {
  const data = await fetchFMP<FMPProfile[]>(`/profile/${ticker}`);
  return data[0] ?? null;
}

// Income statement
export async function getIncomeStatement(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
) {
  return fetchFMP<FMPIncomeStatement[]>(
    `/income-statement/${ticker}`,
    { period, limit: limit.toString() }
  );
}

// Balance sheet
export async function getBalanceSheet(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
) {
  return fetchFMP<FMPBalanceSheet[]>(
    `/balance-sheet-statement/${ticker}`,
    { period, limit: limit.toString() }
  );
}

// Cash flow statement
export async function getCashFlowStatement(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
) {
  return fetchFMP<FMPCashFlowStatement[]>(
    `/cash-flow-statement/${ticker}`,
    { period, limit: limit.toString() }
  );
}

// Key metrics
export async function getKeyMetrics(
  ticker: string,
  period: "annual" | "quarter" = "annual",
  limit = 5
) {
  return fetchFMP<FMPKeyMetrics[]>(
    `/key-metrics/${ticker}`,
    { period, limit: limit.toString() }
  );
}

// Stock search
export async function searchStocks(query: string, limit = 10) {
  return fetchFMP<FMPSearchResult[]>("/search", {
    query,
    limit: limit.toString(),
  });
}

// Stock news
export async function getStockNews(ticker: string, limit = 20) {
  return fetchFMP<FMPNews[]>("/stock_news", {
    tickers: ticker,
    limit: limit.toString(),
  });
}

/** FMP stock_news requires tickers; without them the API returns no rows even with a valid key. */
const DEFAULT_STOCK_NEWS_TICKERS =
  "AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META,SPY,QQQ";

// General market news (aggregated headlines for the given symbols)
export async function getMarketNews(limit = 30, tickers?: string) {
  const tickersParam =
    tickers?.trim() || DEFAULT_STOCK_NEWS_TICKERS;
  return fetchFMP<FMPNews[]>("/stock_news", {
    tickers: tickersParam,
    limit: limit.toString(),
  });
}

// SEC filings
export async function getSECFilings(ticker: string, type?: string, limit = 50) {
  const params: Record<string, string> = { limit: limit.toString() };
  if (type) params.type = type;
  return fetchFMP<FMPSECFiling[]>(`/sec_filings/${ticker}`, params);
}

// Press releases
export async function getPressReleases(ticker: string, limit = 30) {
  return fetchFMP<FMPPressRelease[]>(`/press-releases/${ticker}`, {
    limit: limit.toString(),
  });
}

// Stock screener
export async function screenStocks(params: Record<string, string>) {
  return fetchFMP<FMPScreenerResult[]>("/stock-screener", params);
}

/** Daily OHLCV — `from` / `to` as YYYY-MM-DD (optional). */
export async function getHistoricalPriceFull(
  ticker: string,
  options?: { from?: string; to?: string }
) {
  const params: Record<string, string> = {};
  if (options?.from) params.from = options.from;
  if (options?.to) params.to = options.to;
  const data = await fetchFMP<FMPHistoricalPriceFullResponse>(
    `/historical-price-full/${ticker}`,
    params
  );
  return data;
}

/** Earnings announcements in a date range (YYYY-MM-DD). */
export async function getEarningsCalendar(from: string, to: string) {
  return fetchFMP<FMPEarningsCalendarItem[]>("/earning_calendar", {
    from,
    to,
  });
}

/** Top gaining stocks (session snapshot). */
export async function getStockMarketGainers() {
  return fetchFMP<FMPMoverQuote[]>("/stock_market/gainers");
}

/** Top losing stocks (session snapshot). */
export async function getStockMarketLosers() {
  return fetchFMP<FMPMoverQuote[]>("/stock_market/losers");
}

/** Most active by volume (session snapshot). */
export async function getStockMarketActives() {
  return fetchFMP<FMPMoverQuote[]>("/stock_market/actives");
}

/** Intraday bars (5-minute). `from` / `to` as YYYY-MM-DD. */
export async function getHistoricalChart5Min(
  ticker: string,
  from: string,
  to: string
) {
  return fetchFMP<FMPIntradayBar[]>(`/historical-chart/5min/${ticker}`, {
    from,
    to,
  });
}

// Types for FMP API responses
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
  type: string; // 10-K, 10-Q, 8-K, S-1, DEF 14A, etc.
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

/** Gainers / losers / actives endpoints return quote-like rows. */
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

export function fmpMoverSymbol(q: FMPMoverQuote): string {
  return (q.ticker ?? q.symbol ?? "").toUpperCase();
}

// ---------------------------------------------------------------------------
// Analyst estimates & price targets
// ---------------------------------------------------------------------------

export async function getAnalystEstimates(ticker: string, period: "annual" | "quarter" = "annual", limit = 6) {
  return fetchFMP<FMPAnalystEstimate[]>(`/analyst-estimates/${ticker}`, { period, limit: limit.toString() });
}

export async function getPriceTarget(ticker: string) {
  return fetchFMP<FMPPriceTarget[]>(`/price-target/${ticker}`);
}

export async function getPriceTargetConsensus(ticker: string) {
  const data = await fetchFMP<FMPPriceTargetConsensus[]>(`/price-target-consensus/${ticker}`);
  return data[0] ?? null;
}

export async function getAnalystRecommendations(ticker: string) {
  return fetchFMP<FMPAnalystRecommendation[]>(`/analyst-stock-recommendations/${ticker}`);
}

export async function getUpgradesDowngrades(ticker: string) {
  return fetchFMP<FMPUpgradeDowngrade[]>(`/upgrades-downgrades/${ticker}`);
}

// ---------------------------------------------------------------------------
// Insider & institutional ownership
// ---------------------------------------------------------------------------

export async function getInstitutionalHolders(ticker: string) {
  return fetchFMP<FMPInstitutionalHolder[]>(`/institutional-holder/${ticker}`);
}

export async function getInsiderTrading(ticker: string, limit = 50) {
  return fetchFMP<FMPInsiderTrade[]>(`/insider-trading`, { symbol: ticker, limit: limit.toString() });
}

// ---------------------------------------------------------------------------
// Dividends
// ---------------------------------------------------------------------------

export async function getHistoricalDividends(ticker: string) {
  const data = await fetchFMP<FMPHistoricalDividendResponse>(`/historical-price-full/stock_dividend/${ticker}`);
  return data;
}

// ---------------------------------------------------------------------------
// Economic calendar
// ---------------------------------------------------------------------------

export async function getEconomicCalendar(from: string, to: string) {
  return fetchFMP<FMPEconomicEvent[]>("/economic_calendar", { from, to });
}

// ---------------------------------------------------------------------------
// Sector performance
// ---------------------------------------------------------------------------

export async function getSectorPerformance() {
  return fetchFMP<FMPSectorPerformance[]>("/sector-performance");
}

export async function getHistoricalSectorPerformance(limit = 5) {
  return fetchFMP<FMPHistoricalSectorPerformance[]>("/historical-sectors-performance", { limit: limit.toString() });
}

// ---------------------------------------------------------------------------
// ETF
// ---------------------------------------------------------------------------

export async function getETFHoldings(ticker: string) {
  return fetchFMP<FMPETFHolding[]>(`/etf-holder/${ticker}`);
}

export async function getETFSectorWeightings(ticker: string) {
  return fetchFMP<FMPETFSectorWeight[]>(`/etf-sector-weightings/${ticker}`);
}

export async function getETFCountryWeightings(ticker: string) {
  return fetchFMP<FMPETFCountryWeight[]>(`/etf-country-weightings/${ticker}`);
}

// ---------------------------------------------------------------------------
// New type definitions
// ---------------------------------------------------------------------------

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
