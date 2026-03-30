/**
 * SEC EDGAR API client.
 *
 * Uses the free EDGAR APIs — no API key required.
 * SEC requires User-Agent in format: "Company AdminContact@company.com"
 *
 * Endpoints:
 *   - data.sec.gov/submissions/CIK{cik}.json — company filings
 *   - efts.sec.gov/LATEST/search-index — full-text search
 *
 * SEC rate limit: 10 requests/second. We use Next.js revalidation caching.
 */

const EDGAR_BASE = process.env.EDGAR_BASE_URL || "https://data.sec.gov";
const EFTS_BASE = process.env.EDGAR_EFTS_BASE_URL || "https://efts.sec.gov/LATEST";

// SEC requires: "Sample Company Name AdminContact@<sample company domain>.com"
const USER_AGENT = process.env.EDGAR_USER_AGENT || "Takovic admin@takovic.com";

/** Request timeout for EDGAR API calls (ms) */
const EDGAR_TIMEOUT_MS = Number(process.env.EDGAR_TIMEOUT_MS) || 15_000;

/** Cache revalidation interval (seconds) */
const EDGAR_CACHE_REVALIDATE = Number(process.env.EDGAR_CACHE_REVALIDATE) || 3600;

// ---------------------------------------------------------------------------
// Known CIK mappings — avoids the 4MB company_tickers.json download
// Add tickers here as needed for instant resolution.
// ---------------------------------------------------------------------------

const TICKER_TO_CIK: Record<string, string> = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  GOOGL: "0001652044",
  AMZN: "0001018724",
  META: "0001326801",
  TSLA: "0001318605",
  NVDA: "0001045810",
  BMNR: "0001829311",
  MSTR: "0001050446",
  JPM: "0000019617",
  V: "0001403161",
  JNJ: "0000200406",
  WMT: "0000104169",
  PG: "0000080424",
  UNH: "0000731766",
  HD: "0000354950",
  BAC: "0000070858",
  XOM: "0000034088",
  PFE: "0000078003",
  COST: "0000909832",
  DIS: "0001744489",
  NFLX: "0001065280",
  AMD: "0000002488",
  INTC: "0000050863",
  CRM: "0001108524",
  COIN: "0001679788",
  PLTR: "0001321655",
  SOFI: "0001818874",
  GME: "0001326380",
  AMC: "0001411579",
};

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchEdgar<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EDGAR_TIMEOUT_MS); // 15s timeout

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": "gzip, deflate",
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: EDGAR_CACHE_REVALIDATE }, // 1hr cache
    });

    if (!response.ok) {
      throw new Error(`EDGAR ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// CIK resolution: ticker → padded 10-digit CIK
// ---------------------------------------------------------------------------

let tickerMapCache: Record<string, string> | null = null;

async function getTickerToCIKMap(): Promise<Record<string, string>> {
  if (tickerMapCache) return tickerMapCache;

  // This file is ~4MB — cache aggressively
  const data = await fetchEdgar<Record<string, { cik_str: number; ticker: string; title: string }>>(
    `${EDGAR_BASE}/files/company_tickers.json`
  );

  const map: Record<string, string> = {};
  for (const entry of Object.values(data)) {
    map[entry.ticker.toUpperCase()] = String(entry.cik_str).padStart(10, "0");
  }

  tickerMapCache = map;
  return map;
}

export async function resolveCIK(ticker: string): Promise<string | null> {
  const upper = ticker.toUpperCase();

  // 1. Check hardcoded map first (instant, no network)
  if (TICKER_TO_CIK[upper]) return TICKER_TO_CIK[upper];

  // 2. Try the full SEC ticker map (4MB download, cached after first load)
  try {
    const map = await getTickerToCIKMap();
    return map[upper] ?? null;
  } catch (err) {
    console.warn("Failed to load SEC ticker map, using hardcoded only:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Company submissions (filings)
// ---------------------------------------------------------------------------

export interface EdgarCompanyInfo {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  ein: string;
  category: string;
  stateOfIncorporation: string;
  fiscalYearEnd: string;
  phone: string;
  website: string;
}

export interface EdgarFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  act: string;
  form: string;
  fileNumber: string;
  items: string;
  size: number;
  isXBRL: boolean;
  isInlineXBRL: boolean;
  primaryDocument: string;
  primaryDocDescription: string;
}

interface EdgarSubmissionsResponse {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  ein: string;
  category: string;
  stateOfIncorporation: string;
  fiscalYearEnd: string;
  phone: string;
  website: string;
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      acceptanceDateTime: string[];
      act: string[];
      form: string[];
      fileNumber: string[];
      items: string[];
      size: number[];
      isXBRL: number[];
      isInlineXBRL: number[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
    files: { name: string; filingCount: number; filingFrom: string; filingTo: string }[];
  };
}

export async function getCompanySubmissions(
  cik: string
): Promise<{ company: EdgarCompanyInfo; filings: EdgarFiling[] }> {
  const paddedCIK = cik.padStart(10, "0");
  const data = await fetchEdgar<EdgarSubmissionsResponse>(
    `${EDGAR_BASE}/submissions/CIK${paddedCIK}.json`
  );

  const company: EdgarCompanyInfo = {
    cik: data.cik,
    entityType: data.entityType,
    sic: data.sic,
    sicDescription: data.sicDescription,
    name: data.name,
    tickers: data.tickers ?? [],
    exchanges: data.exchanges ?? [],
    ein: data.ein ?? "",
    category: data.category ?? "",
    stateOfIncorporation: data.stateOfIncorporation ?? "",
    fiscalYearEnd: data.fiscalYearEnd ?? "",
    phone: data.phone ?? "",
    website: data.website ?? "",
  };

  // Flatten the parallel arrays into filing objects
  const recent = data.filings?.recent;
  const filings: EdgarFiling[] = [];

  if (recent?.accessionNumber) {
    for (let i = 0; i < recent.accessionNumber.length; i++) {
      filings.push({
        accessionNumber: recent.accessionNumber[i] ?? "",
        filingDate: recent.filingDate[i] ?? "",
        reportDate: recent.reportDate[i] ?? "",
        acceptanceDateTime: recent.acceptanceDateTime[i] ?? "",
        act: recent.act[i] ?? "",
        form: recent.form[i] ?? "",
        fileNumber: recent.fileNumber[i] ?? "",
        items: recent.items[i] ?? "",
        size: recent.size[i] ?? 0,
        isXBRL: recent.isXBRL[i] === 1,
        isInlineXBRL: recent.isInlineXBRL[i] === 1,
        primaryDocument: recent.primaryDocument[i] ?? "",
        primaryDocDescription: recent.primaryDocDescription[i] ?? "",
      });
    }
  }

  return { company, filings };
}

// ---------------------------------------------------------------------------
// EFTS full-text search
// ---------------------------------------------------------------------------

export interface EdgarSearchHit {
  id: string;
  entity_name: string;
  file_num: string;
  file_date: string;
  period_of_report: string;
  form_type: string;
  file_description: string;
  inc_states: string;
  biz_locations: string;
  biz_phone: string;
  entity_id: string;
  adsh: string;
  display_names: string[];
  display_date_filed: string;
}

interface EdgarSearchResponse {
  query: { q: string; dateRange?: string; forms?: string };
  hits: {
    total: { value: number };
    hits: { _id: string; _source: EdgarSearchHit }[];
  };
}

export async function searchEdgarFilings(params: {
  query: string;
  ticker?: string;
  forms?: string;
  dateRange?: string;
  from?: number;
  size?: number;
}): Promise<{ total: number; results: EdgarSearchHit[] }> {
  const searchParams = new URLSearchParams();
  searchParams.set("q", params.query);
  if (params.ticker) searchParams.set("q", `"${params.ticker}" ${params.query}`);
  if (params.forms) searchParams.set("forms", params.forms);
  if (params.dateRange) searchParams.set("dateRange", params.dateRange);
  if (params.from != null) searchParams.set("from", String(params.from));
  if (params.size != null) searchParams.set("size", String(params.size));

  const data = await fetchEdgar<EdgarSearchResponse>(
    `${EFTS_BASE}/search-index?${searchParams.toString()}`
  );

  return {
    total: data.hits.total.value,
    results: data.hits.hits.map((h) => h._source),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the URL to view a filing on EDGAR */
export function buildFilingUrl(cik: string, accessionNumber: string, primaryDocument: string): string {
  const paddedCIK = cik.padStart(10, "0");
  const accessionNoDashes = accessionNumber.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${paddedCIK}/${accessionNoDashes}/${primaryDocument}`;
}

/** Build the URL to the filing index page on EDGAR */
export function buildFilingIndexUrl(cik: string, accessionNumber: string): string {
  const paddedCIK = cik.padStart(10, "0");
  const accessionNoDashes = accessionNumber.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${paddedCIK}/${accessionNoDashes}/`;
}
