import { NextRequest, NextResponse } from "next/server";
import {
  resolveCIK,
  getCompanySubmissions,
  buildFilingUrl,
  buildFilingIndexUrl,
} from "@/lib/api/edgar";
import type { EdgarCompanyInfo, EdgarFiling } from "@/lib/api/edgar";
import { getSECFilings } from "@/lib/api/yahoo";
import type { FMPPressRelease } from "@/lib/api/yahoo";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { filingAnalyses, pressAnalyses } from "@/lib/db/schema";
import { filingDedupeKey } from "@/lib/ai/filing-dedupe-key";
import { getPressIntelligenceForTicker } from "@/lib/api/press-intelligence";
import { pressDedupeKey } from "@/lib/ai/press-dedupe-key";

/** Serialized filing for the client */
export interface IntelligenceFiling {
  form: string;
  filingDate: string;
  acceptanceDateTime: string;
  reportDate: string;
  accessionNumber: string;
  primaryDocument: string;
  primaryDocDescription: string;
  items: string;
  size: number;
  isXBRL: boolean;
  viewUrl: string;
  indexUrl: string;
  source: "edgar" | "fmp";
}

/** Key is filingDedupeKey(ticker, filing); use to restore saved AI summaries after refresh. */
export type SavedFilingAnalysesMap = Record<
  string,
  { summary: string; analyzedAt: string; excerptTruncated?: boolean }
>;
export type SavedPressAnalysesMap = Record<
  string,
  { analysis: string; analyzedAt: string; model?: string; aiProvider?: string }
>;

export interface IntelligenceResponse {
  ticker: string;
  company: EdgarCompanyInfo | null;
  filings: IntelligenceFiling[];
  pressReleases: FMPPressRelease[];
  source: "edgar" | "fmp";
  savedFilingAnalyses: SavedFilingAnalysesMap;
  savedPressAnalyses: SavedPressAnalysesMap;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const fallback: IntelligenceResponse = {
    ticker: upperTicker,
    company: null,
    filings: [],
    pressReleases: [],
    source: "fmp",
    savedFilingAnalyses: {},
    savedPressAnalyses: {},
  };
  try {
    const { searchParams } = new URL(request.url);
    const refreshPress = searchParams.get("refreshPress") === "1";

    let company: EdgarCompanyInfo | null = null;
    let filings: IntelligenceFiling[] = [];
    let source: "edgar" | "fmp" = "edgar";

    // 1. Try EDGAR first
    try {
      const cik = await resolveCIK(upperTicker);

      if (cik) {
        const submissions = await getCompanySubmissions(cik);
        company = submissions.company;

        filings = submissions.filings.map((f: EdgarFiling) => ({
          form: f.form,
          filingDate: f.filingDate,
          acceptanceDateTime: f.acceptanceDateTime,
          reportDate: f.reportDate,
          accessionNumber: f.accessionNumber,
          primaryDocument: f.primaryDocument,
          primaryDocDescription: f.primaryDocDescription,
          items: f.items,
          size: f.size,
          isXBRL: f.isXBRL,
          viewUrl: f.primaryDocument
            ? buildFilingUrl(cik, f.accessionNumber, f.primaryDocument)
            : "",
          indexUrl: buildFilingIndexUrl(cik, f.accessionNumber),
          source: "edgar" as const,
        }));
      }
    } catch (edgarError) {
      console.warn(`EDGAR failed for ${upperTicker}, falling back to FMP:`, edgarError);
    }

    // 2. If EDGAR returned no filings, fall back to FMP
    if (filings.length === 0) {
      try {
        const fmpFilings = await getSECFilings(upperTicker, undefined, 50);
        source = "fmp";

        if (fmpFilings && fmpFilings.length > 0) {
          filings = fmpFilings.map((f) => ({
            form: f.type,
            filingDate: f.fillingDate,
            acceptanceDateTime: f.acceptedDate,
            reportDate: "",
            accessionNumber: "",
            primaryDocument: "",
            primaryDocDescription: "",
            items: "",
            size: 0,
            isXBRL: false,
            viewUrl: f.finalLink || "",
            indexUrl: f.link || "",
            source: "fmp" as const,
          }));
        }
      } catch (fmpError) {
        console.warn(`FMP filings also failed for ${upperTicker}:`, fmpError);
      }
    }

    // 3. Press releases from FMP (EDGAR doesn't have these)
    let pressReleases: FMPPressRelease[] = [];
    try {
      const press = await getPressIntelligenceForTicker(upperTicker, 100, {
        refresh: refreshPress,
      });
      pressReleases = press.items.map((item) => ({
        symbol: item.symbol,
        date: item.date,
        title: item.title,
        text: item.text,
        url: item.url,
        source: item.source,
      }));
    } catch {
      // Press wire may fail for smaller tickers — that's OK
    }

    const savedFilingAnalyses: SavedFilingAnalysesMap = {};
    const savedPressAnalyses: SavedPressAnalysesMap = {};
    try {
      const rows = await db
        .select()
        .from(filingAnalyses)
        .where(eq(filingAnalyses.ticker, upperTicker));

      for (const row of rows) {
        const key = filingDedupeKey(upperTicker, {
          accessionNumber: row.accessionNumber ?? "",
          viewUrl: row.documentUrl,
          filingDate: row.filingDate,
          form: row.form,
        });
        savedFilingAnalyses[key] = {
          summary: row.summary,
          analyzedAt:
            row.analyzedAt instanceof Date
              ? row.analyzedAt.toISOString()
              : String(row.analyzedAt),
          excerptTruncated: row.excerptTruncated,
        };
      }
    } catch (e) {
      console.warn(`filing_analyses load skipped for ${upperTicker}:`, e);
    }

    try {
      const rows = await db
        .select()
        .from(pressAnalyses)
        .where(eq(pressAnalyses.ticker, upperTicker));

      for (const row of rows) {
        const key = pressDedupeKey(upperTicker, {
          title: row.title,
          date: row.publishedAt,
          url: row.url,
          source: row.source,
        });
        savedPressAnalyses[key] = {
          analysis: row.analysis,
          analyzedAt:
            row.analyzedAt instanceof Date
              ? row.analyzedAt.toISOString()
              : String(row.analyzedAt),
          model: row.model ?? undefined,
          aiProvider: row.aiProvider ?? undefined,
        };
      }
    } catch (e) {
      console.warn(`press_analyses load skipped for ${upperTicker}:`, e);
    }

    const response: IntelligenceResponse = {
      ticker: upperTicker,
      company,
      filings,
      pressReleases,
      source,
      savedFilingAnalyses,
      savedPressAnalyses,
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error(`intelligence route fatal for ${upperTicker}:`, e);
    return NextResponse.json(fallback);
  }
}
