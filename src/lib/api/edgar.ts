/**
 * SEC EDGAR API client.
 *
 * Uses the free EDGAR APIs — no API key required.
 * Requires a User-Agent header identifying the application (SEC policy).
 *
 * Endpoints:
 *   - data.sec.gov/submissions/CIK{cik}.json — company filings
 *   - efts.sec.gov/LATEST/search-index — full-text search
 *   - data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json — XBRL facts
 *
 * SEC rate limit: 10 requests/second. We use Next.js revalidation caching.
 */

const EDGAR_BASE = "https://data.sec.gov";
const EFTS_BASE = "https://efts.sec.gov/LATEST";
const USER_AGENT = "Takovic/1.0 (contact@takovic.com)";

// ---------------------------------------------------------------------------
// Known CIK mappings (avoids an extra lookup for known tickers)
// ---------------------------------------------------------------------------

const TICKER_TO_CIK: Record<string, string> = {
  BMNR: "0001829311",
};

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchEdgar<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    next: { revalidate: 3600 }, // 1hr cache
  });

  if (!response.ok) {
    throw new Error(`EDGAR API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// CIK resolution: ticker → padded 10-digit CIK
// ---------------------------------------------------------------------------

let tickerMapCache: Record<string, string> | null = null;

async function getTickerToCIKMap(): Promise<Record<string, string>> {
  if (tickerMapCache) return tickerMapCache;

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

  // Check hardcoded first
  if (TICKER_TO_CIK[upper]) return TICKER_TO_CIK[upper];

  // Fall back to SEC ticker map
  const map = await getTickerToCIKMap();
  return map[upper] ?? null;
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
    tickers: data.tickers,
    exchanges: data.exchanges,
    ein: data.ein,
    category: data.category,
    stateOfIncorporation: data.stateOfIncorporation,
    fiscalYearEnd: data.fiscalYearEnd,
    phone: data.phone,
    website: data.website,
  };

  // Flatten the parallel arrays into filing objects
  const recent = data.filings.recent;
  const filings: EdgarFiling[] = [];

  for (let i = 0; i < recent.accessionNumber.length; i++) {
    filings.push({
      accessionNumber: recent.accessionNumber[i],
      filingDate: recent.filingDate[i],
      reportDate: recent.reportDate[i],
      acceptanceDateTime: recent.acceptanceDateTime[i],
      act: recent.act[i],
      form: recent.form[i],
      fileNumber: recent.fileNumber[i],
      items: recent.items[i],
      size: recent.size[i],
      isXBRL: recent.isXBRL[i] === 1,
      isInlineXBRL: recent.isInlineXBRL[i] === 1,
      primaryDocument: recent.primaryDocument[i],
      primaryDocDescription: recent.primaryDocDescription[i],
    });
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
