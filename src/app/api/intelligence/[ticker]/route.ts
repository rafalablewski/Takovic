import { NextResponse } from "next/server";
import {
  resolveCIK,
  getCompanySubmissions,
  buildFilingUrl,
  buildFilingIndexUrl,
} from "@/lib/api/edgar";
import type { EdgarCompanyInfo, EdgarFiling } from "@/lib/api/edgar";
import { getPressReleases } from "@/lib/api/fmp";
import type { FMPPressRelease } from "@/lib/api/fmp";

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
}

export interface IntelligenceResponse {
  ticker: string;
  company: EdgarCompanyInfo | null;
  filings: IntelligenceFiling[];
  pressReleases: FMPPressRelease[];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    // Resolve CIK from ticker
    const cik = await resolveCIK(upperTicker);

    let company: EdgarCompanyInfo | null = null;
    let edgarFilings: EdgarFiling[] = [];

    if (cik) {
      const submissions = await getCompanySubmissions(cik);
      company = submissions.company;
      edgarFilings = submissions.filings;
    }

    // Build URLs for each filing
    const filings: IntelligenceFiling[] = edgarFilings.map((f) => ({
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
        ? buildFilingUrl(cik!, f.accessionNumber, f.primaryDocument)
        : "",
      indexUrl: buildFilingIndexUrl(cik!, f.accessionNumber),
    }));

    // Press releases from FMP (EDGAR doesn't have these)
    let pressReleases: FMPPressRelease[] = [];
    try {
      pressReleases = await getPressReleases(upperTicker, 30);
    } catch {
      // FMP may fail for smaller tickers — that's OK
    }

    const response: IntelligenceResponse = {
      ticker: upperTicker,
      company,
      filings,
      pressReleases: pressReleases ?? [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Intelligence API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch intelligence data" },
      { status: 500 }
    );
  }
}
