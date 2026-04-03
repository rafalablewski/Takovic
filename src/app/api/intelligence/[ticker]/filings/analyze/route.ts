import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { filingAnalyses } from "@/lib/db/schema";
import { buildFilingFingerprint } from "@/lib/ai/filing-fingerprint";
import { FILING_AI_PROVIDERS } from "@/lib/ai/filing-provider-prefs";
import {
  analyzeFilingWithProvider,
  normalizeAiProvider,
  type AiProvider,
} from "@/lib/ai/filing-analyze";
import { fetchFilingDocumentText } from "@/lib/api/sec-document";

const bodySchema = z.object({
  form: z.string().min(1).max(32),
  filingDate: z.string().min(1).max(16),
  source: z.enum(["edgar", "fmp"]),
  viewUrl: z.string().min(8).max(2048),
  accessionNumber: z.string().max(32).optional().nullable(),
  primaryDocDescription: z.string().max(500).optional().nullable(),
  items: z.string().max(500).optional().nullable(),
  companyName: z.string().max(500).optional().nullable(),
  aiProvider: z.enum(FILING_AI_PROVIDERS).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker: tickerParam } = await params;
  const ticker = tickerParam.toUpperCase();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const body = parsed.data;
  const provider: AiProvider = normalizeAiProvider(body.aiProvider);

  const fingerprint = buildFilingFingerprint(ticker, {
    accessionNumber: body.accessionNumber ?? "",
    viewUrl: body.viewUrl,
    filingDate: body.filingDate,
    form: body.form,
  });

  let documentText: string;
  let wasTruncated: boolean;
  try {
    const doc = await fetchFilingDocumentText(body.viewUrl);
    documentText = doc.text;
    wasTruncated = doc.truncated;
    if (!documentText || documentText.length < 50) {
      return NextResponse.json(
        { error: "Document text too short or empty after fetch" },
        { status: 502 }
      );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  let analysis;
  try {
    analysis = await analyzeFilingWithProvider(provider, {
      ticker,
      companyName: body.companyName ?? null,
      form: body.form,
      filingDate: body.filingDate,
      items: body.items ?? null,
      documentText,
      wasTruncated,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI analysis failed";
    const lower = msg.toLowerCase();
    if (
      lower.includes("not configured") ||
      lower.includes("api_key") ||
      lower.includes("401")
    ) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    console.error("Filing AI error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const now = new Date();

  let row: typeof filingAnalyses.$inferSelect | undefined;
  try {
    const inserted = await db
      .insert(filingAnalyses)
      .values({
        filingFingerprint: fingerprint,
        ticker,
        accessionNumber: body.accessionNumber || null,
        form: body.form,
        filingDate: body.filingDate,
        source: body.source,
        documentUrl: body.viewUrl,
        companyName: body.companyName || null,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints.length ? analysis.keyPoints : null,
        sentiment: analysis.sentiment,
        aiProvider: provider,
        model: analysis.model,
        analyzedAt: now,
      })
      .onConflictDoUpdate({
        target: filingAnalyses.filingFingerprint,
        set: {
          ticker,
          accessionNumber: body.accessionNumber || null,
          form: body.form,
          filingDate: body.filingDate,
          source: body.source,
          documentUrl: body.viewUrl,
          companyName: body.companyName || null,
          summary: analysis.summary,
          keyPoints: analysis.keyPoints.length ? analysis.keyPoints : null,
          sentiment: analysis.sentiment,
          aiProvider: provider,
          model: analysis.model,
          analyzedAt: now,
        },
      })
      .returning();
    row = inserted[0];
  } catch (e) {
    console.error("Filing analysis DB error:", e);
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
  }

  return NextResponse.json({
    id: row?.id,
    filingFingerprint: fingerprint,
    summary: analysis.summary,
    keyPoints: analysis.keyPoints,
    sentiment: analysis.sentiment,
    aiProvider: provider,
    model: analysis.model,
    analyzedAt: now.toISOString(),
  });
}
