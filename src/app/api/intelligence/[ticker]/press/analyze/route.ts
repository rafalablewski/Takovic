import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { buildCoverageContext } from "@/lib/ai/prompts";
import { db } from "@/lib/db";
import { pressAnalyses } from "@/lib/db/schema";
import { pressDedupeKey } from "@/lib/ai/press-dedupe-key";
import { requireIntelligenceAuth } from "@/lib/api/intelligence-auth";

const bodySchema = z.object({
  title: z.string().max(500).optional().nullable(),
  source: z.string().max(120).optional().nullable(),
  publishedAt: z.string().max(64).optional().nullable(),
  url: z.string().url().max(1000).optional().nullable(),
  text: z.string().min(30),
});

function buildPressPrompt(input: {
  ticker: string;
  title: string | null;
  source: string | null;
  publishedAt: string | null;
  text: string;
  bmnrContext: string | null;
}): string {
  const contextBlock = input.bmnrContext
    ? `\nReference context (BMNR analyst framework):\n${input.bmnrContext}\n`
    : "";
  return `You are an equity intelligence analyst.

Analyze the press release text and return concise Markdown with sections:
## Executive summary
## What changed materially
## Market/valuation impact
## Risks or caveats
## Follow-up checks

Rules:
- Be factual and specific to the provided text.
- Use bullet points.
- Flag uncertainty where needed.
- Do not invent numbers or facts not in the text.

Ticker: ${input.ticker}
Title: ${input.title ?? "N/A"}
Source: ${input.source ?? "N/A"}
Published at: ${input.publishedAt ?? "N/A"}
${contextBlock}
Press release text:
${input.text}`;
}

async function runAnalysis(prompt: string): Promise<{
  analysis: string;
  model: string;
  provider: "deepseek" | "anthropic" | "openrouter" | "gemini";
}> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    const model = process.env.DEEPSEEK_MODEL_FILING || "deepseek-chat";
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: Number(process.env.DEEPSEEK_MAX_TOKENS_FILING) || 4096,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { analysis: text, model, provider: "deepseek" };
    }
  }

  const claudeKey = process.env.ANTHROPIC_API_KEY;
  if (claudeKey) {
    const model = process.env.CLAUDE_MODEL_FILING || "claude-3-5-sonnet-latest";
    const client = new Anthropic({ apiKey: claudeKey });
    const message = await client.messages.create({
      model,
      max_tokens: Number(process.env.CLAUDE_MAX_TOKENS_FILING) || 4096,
      messages: [{ role: "user", content: prompt }],
    });
    const block = message.content[0];
    const text = block.type === "text" ? block.text.trim() : "";
    if (text) return { analysis: text, model, provider: "anthropic" };
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    const model = process.env.OPENROUTER_MODEL_FILING || "openai/gpt-4o-mini";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterKey}`,
        "HTTP-Referer":
          process.env.OPENROUTER_HTTP_REFERER || "https://takovic.com",
        "X-Title": process.env.OPENROUTER_APP_TITLE || "Takovic",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: Number(process.env.OPENROUTER_MAX_TOKENS_FILING) || 4096,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return { analysis: text, model, provider: "openrouter" };
    }
  }

  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const model = process.env.GEMINI_MODEL_FILING || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: Number(process.env.GEMINI_MAX_TOKENS_FILING) || 4096,
        },
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return { analysis: text, model, provider: "gemini" };
    }
  }

  throw new Error(
    "No AI provider configured for press analysis. Set one of: DEEPSEEK_API_KEY, ANTHROPIC_API_KEY, OPENROUTER_API_KEY, GOOGLE_API_KEY."
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const unauthorized = await requireIntelligenceAuth(request);
  if (unauthorized) return unauthorized;

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
  const bmnrContext = ticker === "BMNR" ? await buildCoverageContext("BMNR") : null;
  const prompt = buildPressPrompt({
    ticker,
    title: body.title ?? null,
    source: body.source ?? null,
    publishedAt: body.publishedAt ?? null,
    text: body.text,
    bmnrContext,
  });

  try {
    const result = await runAnalysis(prompt);
    const fingerprint = pressDedupeKey(ticker, {
      title: body.title ?? "",
      date: body.publishedAt ?? "",
      url: body.url ?? "",
      source: body.source ?? "",
    });
    const analyzedAt = new Date();
    try {
      await db
        .insert(pressAnalyses)
        .values({
          pressFingerprint: fingerprint,
          ticker,
          title: body.title ?? "Untitled",
          publishedAt: body.publishedAt ?? null,
          source: body.source ?? null,
          url: body.url ?? null,
          pastedText: body.text,
          analysis: result.analysis,
          aiProvider: result.provider,
          model: result.model,
          analyzedAt,
        })
        .onConflictDoUpdate({
          target: pressAnalyses.pressFingerprint,
          set: {
            analysis: result.analysis,
            pastedText: body.text,
            aiProvider: result.provider,
            model: result.model,
            analyzedAt,
          },
        });
    } catch (dbError) {
      console.warn(`press_analyses upsert skipped for ${ticker}:`, dbError);
    }
    return NextResponse.json({
      key: fingerprint,
      analysis: result.analysis,
      provider: result.provider,
      model: result.model,
      ticker,
      analyzedAt: analyzedAt.toISOString(),
    });
  } catch (error) {
    console.error("Press analysis failed:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

