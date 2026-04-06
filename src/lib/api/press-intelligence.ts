import { createHash } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import { getGoogleNews } from "@/lib/api/google-news";
import { db } from "@/lib/db";
import { pressReleases } from "@/lib/db/schema";

export interface PressIntelligenceItem {
  id: string;
  symbol: string;
  date: string;
  title: string;
  text: string;
  source: string;
  url: string;
  rawPayload?: unknown;
}

export interface PressSourceStatus {
  provider: "primary" | "secondary" | "tertiary";
  name: string;
  enabled: boolean;
  resultCount: number;
  note?: string;
}

export interface PressFetchResult {
  items: PressIntelligenceItem[];
  sourceStatus: PressSourceStatus[];
}

const NEWSWIRE_SOURCE_RE =
  /(pr newswire|prnewswire|business wire|accesswire|globe newswire|globenewswire)/i;
const PRESS_HEADLINE_RE =
  /(press release|announces|announc(?:e|es|ed)|launch(?:es|ed)?|partners? with|reports?|results|guidance|earnings)/i;

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function stableItemId(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 32);
}

function normalizeItem(input: {
  symbol: string;
  date: string;
  title: string;
  text?: string;
  source: string;
  url: string;
  rawPayload?: unknown;
}): PressIntelligenceItem {
  const symbol = input.symbol.toUpperCase();
  const date = parseDate(input.date);
  const title = input.title.trim();
  const source = input.source.trim() || "Unknown";
  const url = input.url.trim();
  const text = (input.text ?? "").trim();
  const id = stableItemId([symbol, source, url, date, title]);

  return {
    id,
    symbol,
    date,
    title,
    text,
    source,
    url,
    rawPayload: input.rawPayload,
  };
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const TICKER_HEADLINE_ALIASES: Record<string, RegExp[]> = {
  BMNR: [/bitmine/i, /bit\s*mine/i],
};
const TICKER_EXCLUDED_ISSUER_PREFIXES: Record<string, RegExp[]> = {
  BMNR: [/^eightco\b/i, /^ark\s+invest\b/i],
};

const QM_CONFIG: Record<
  string,
  { topics: string[]; sourceFilter: RegExp; headlineFilter: RegExp }
> = {
  BMNR: {
    topics: ["BMNR"],
    sourceFilter: /(pr newswire|prnewswire)/i,
    headlineFilter: /bitmine|bmnr|bit\s*mine/i,
  },
};

function tickerMentionRegex(ticker: string): RegExp {
  return new RegExp(`\\b${ticker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
}

function isRelevantToTicker(
  ticker: string,
  title: string,
  text?: string
): boolean {
  const haystack = `${title} ${text ?? ""}`;
  if (tickerMentionRegex(ticker).test(haystack)) return true;
  const aliasMatchers = TICKER_HEADLINE_ALIASES[ticker.toUpperCase()] ?? [];
  return aliasMatchers.some((re) => re.test(haystack));
}

function isExcludedNonCompanyIssued(ticker: string, title: string): boolean {
  const checks = TICKER_EXCLUDED_ISSUER_PREFIXES[ticker.toUpperCase()] ?? [];
  return checks.some((re) => re.test((title || "").trim()));
}

async function primaryQuoteMediaAccessWireAdapter(
  ticker: string,
  limit: number
): Promise<PressIntelligenceItem[]> {
  const cfg = QM_CONFIG[ticker.toUpperCase()];
  if (!cfg) return [];

  try {
    const all: PressIntelligenceItem[] = [];
    for (const topic of cfg.topics) {
      const url =
        "https://www.accesswire.com/qm/data/getHeadlines.json" +
        `?topics=${encodeURIComponent(topic)}` +
        "&excludeTopics=NONCOMPANY" +
        "&noSrc=qmr" +
        "&src=pzo,bayaw,prn,bwi,TheNewsWire,nfil,actw,irw,acn,cnw,nwd,glpr,nwmw" +
        "&summary=true&summLen=300&thumbnailurl=true" +
        "&start=1000-01-01&end=3000-01-01";

      const res = await fetch(url, {
        next: { revalidate: 900 },
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Takovic/1.0)" },
      });
      if (!res.ok) continue;
      const raw = (await res.json()) as {
        results?: { news?: Array<{ newsitem?: Array<Record<string, unknown>> }> };
      };
      const items = raw?.results?.news?.[0]?.newsitem ?? [];
      for (const item of items) {
        const source = String(item.source ?? "");
        const headline = String(item.headline ?? "");
        const summary = String(item.qmsummary ?? "");
        if (!cfg.sourceFilter.test(source)) continue;
        if (!cfg.headlineFilter.test(headline)) continue;
        if (isExcludedNonCompanyIssued(ticker, headline)) continue;
        all.push(
          normalizeItem({
            symbol: ticker,
            date: String(item.datetime ?? ""),
            title: headline,
            text: summary,
            source,
            url:
              String(item.permalink ?? "") ||
              String(item.storyurl ?? "") ||
              "",
            rawPayload: item,
          })
        );
      }
    }
    return dedupeAndSort(all, limit);
  } catch (error) {
    console.warn("[press-intelligence] QuoteMedia fetch failed:", error);
    return [];
  }
}

async function bmnrInvestorRelationsAdapter(
  ticker: string,
  limit: number
): Promise<PressIntelligenceItem[]> {
  if (ticker.toUpperCase() !== "BMNR") return [];

  try {
    const res = await fetch(
      "https://www.bitminetech.io/investor-relations#press-releases",
      {
        next: { revalidate: 900 },
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Takovic/1.0)" },
      }
    );
    if (!res.ok) return [];

    const html = await res.text();
    const linkRe =
      /<a[^>]+href="(https:\/\/www\.prnewswire\.com[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const dateRe =
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i;

    const out: PressIntelligenceItem[] = [];
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(html)) !== null) {
      const url = match[1] ?? "";
      const rawTitle = stripHtml(match[2] ?? "");
      if (!url || !rawTitle) continue;

      const start = Math.max(0, match.index - 300);
      const end = Math.min(html.length, match.index + 300);
      const context = stripHtml(html.slice(start, end));
      const dm = context.match(dateRe);
      const date = dm ? new Date(dm[0]).toISOString() : new Date().toISOString();

      if (!isRelevantToTicker(ticker, rawTitle)) continue;
      out.push(
        normalizeItem({
          symbol: ticker,
          date,
          title: rawTitle,
          text: "",
          source: "PR Newswire via Bitmine IR",
          url,
        })
      );
    }

    return dedupeAndSort(out, limit);
  } catch {
    return [];
  }
}

async function secondaryGlobeNewswireAdapter(
  ticker: string,
  limit: number
): Promise<PressIntelligenceItem[]> {
  const query = `${ticker} GlobeNewswire press release`;
  const articles = await getGoogleNews(query, Math.max(limit, 15));

  return articles
    .filter(
      (a) =>
        (/globe ?newswire/i.test(a.source) || /globe ?newswire/i.test(a.title)) &&
        isRelevantToTicker(ticker, a.title, a.description)
    )
    .map((a) =>
      normalizeItem({
        symbol: ticker,
        date: a.publishedDate,
        title: a.title,
        text: a.description,
        source: a.source,
        url: a.url,
        rawPayload: a,
      })
    );
}

async function tertiaryNewswireAdapter(
  ticker: string,
  limit: number
): Promise<PressIntelligenceItem[]> {
  const query = `${ticker} press release`;
  const articles = await getGoogleNews(query, Math.max(limit * 2, 30));

  return articles
    .filter(
      (a) =>
        NEWSWIRE_SOURCE_RE.test(a.source) &&
        (PRESS_HEADLINE_RE.test(a.title) || PRESS_HEADLINE_RE.test(a.description)) &&
        isRelevantToTicker(ticker, a.title, a.description)
    )
    .map((a) =>
      normalizeItem({
        symbol: ticker,
        date: a.publishedDate,
        title: a.title,
        text: a.description,
        source: a.source,
        url: a.url,
        rawPayload: a,
      })
    );
}

function dedupeAndSort(items: PressIntelligenceItem[], limit: number): PressIntelligenceItem[] {
  const map = new Map<string, PressIntelligenceItem>();
  for (const item of items) {
    if (!item.title) continue;
    const key = stableItemId([item.symbol, item.source, item.url || item.title, item.date]);
    if (!map.has(key)) map.set(key, item);
  }

  return Array.from(map.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export async function fetchPressIntelligence(
  ticker: string,
  limit = 100
): Promise<PressFetchResult> {
  const symbol = ticker.toUpperCase();
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  const [primary, issuerIr, secondary, tertiary] = await Promise.all([
    primaryQuoteMediaAccessWireAdapter(symbol, safeLimit),
    bmnrInvestorRelationsAdapter(symbol, safeLimit),
    secondaryGlobeNewswireAdapter(symbol, safeLimit),
    tertiaryNewswireAdapter(symbol, safeLimit),
  ]);

  const merged =
    symbol === "BMNR" && primary.length > 0
      ? primary
      : [...primary, ...issuerIr, ...secondary, ...tertiary];
  const items = dedupeAndSort(merged, safeLimit);

  return {
    items,
    sourceStatus: [
      {
        provider: "primary",
        name: "QuoteMedia / AccessWire",
        enabled: true,
        resultCount: primary.length,
      },
      {
        provider: "secondary",
        name: "Issuer IR page (BMNR)",
        enabled: true,
        resultCount: issuerIr.length,
      },
      {
        provider: "secondary",
        name: "GlobeNewswire",
        enabled: true,
        resultCount: secondary.length,
      },
      {
        provider: "tertiary",
        name: "Newswire source-filtered feed",
        enabled: true,
        resultCount: tertiary.length,
      },
    ],
  };
}

export async function loadPressIntelligenceFromDb(
  ticker: string,
  limit = 100
): Promise<PressIntelligenceItem[]> {
  try {
    const rows = await db
      .select()
      .from(pressReleases)
      .where(eq(pressReleases.ticker, ticker.toUpperCase()))
      .orderBy(desc(pressReleases.publishedAt))
      .limit(Math.min(Math.max(limit, 1), 200));

    return rows.map((row) => ({
      // Keep DB-backed rows relevant to the searched ticker.
      id: row.externalId,
      symbol: row.ticker,
      date:
        row.publishedAt instanceof Date
          ? row.publishedAt.toISOString()
          : String(row.publishedAt),
      title: row.headline,
      text: row.summary ?? "",
      source: row.source,
      url: row.url ?? "",
      rawPayload: row.rawPayload ?? undefined,
    })).filter((item) =>
      NEWSWIRE_SOURCE_RE.test(item.source) &&
      isRelevantToTicker(ticker, item.title, item.text) &&
      !isExcludedNonCompanyIssued(ticker, item.title)
    );
  } catch (error) {
    console.warn("[press-intelligence] DB read skipped:", error);
    return [];
  }
}

export async function upsertPressIntelligence(
  ticker: string,
  items: PressIntelligenceItem[]
): Promise<void> {
  if (items.length === 0) return;
  const symbol = ticker.toUpperCase();
  const values = items.map((item) => ({
    ticker: symbol,
    source: item.source,
    externalId: item.id || stableItemId([symbol, item.source, item.url, item.date, item.title]),
    headline: item.title,
    summary: item.text || null,
    publishedAt: new Date(item.date),
    url: item.url || null,
    rawPayload: item.rawPayload ? JSON.stringify(item.rawPayload) : null,
  }));

  try {
    await db
      .insert(pressReleases)
      .values(values)
      .onConflictDoUpdate({
        target: [
          pressReleases.ticker,
          pressReleases.source,
          pressReleases.externalId,
        ],
        set: {
          headline: sql`excluded.headline`,
          summary: sql`excluded.summary`,
          publishedAt: sql`excluded.published_at`,
          url: sql`excluded.url`,
          rawPayload: sql`excluded.raw_payload`,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.warn("[press-intelligence] DB upsert skipped:", error);
  }
}

export async function getPressIntelligenceForTicker(
  ticker: string,
  limit = 100,
  options?: { refresh?: boolean }
): Promise<PressFetchResult> {
  const symbol = ticker.toUpperCase();
  const fromDb = await loadPressIntelligenceFromDb(symbol, limit);
  const shouldForceBmnrRefresh =
    symbol === "BMNR" && fromDb.length > 0 && fromDb.length < 50;

  if (!options?.refresh && fromDb.length > 0 && !shouldForceBmnrRefresh) {
    return {
      items: fromDb,
      sourceStatus: [],
    };
  }

  const fetched = await fetchPressIntelligence(symbol, limit);
  await upsertPressIntelligence(symbol, fetched.items);
  const latest = await loadPressIntelligenceFromDb(symbol, limit);
  const items = latest.length > 0 ? latest : fetched.items;
  return {
    items,
    sourceStatus: fetched.sourceStatus,
  };
}

