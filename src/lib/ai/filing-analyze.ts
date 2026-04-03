/**
 * Multi-provider SEC filing excerpt analysis.
 * Output: JSON with Markdown `report` (equity research template) + sentiment.
 * Default provider: DeepSeek (OpenAI-compatible).
 */

import Anthropic from "@anthropic-ai/sdk";
import { FILING_EQUITY_RESEARCH_INSTRUCTIONS } from "@/lib/ai/filing-equity-research-prompt";
import {
  FILING_AI_PROVIDERS,
  type FilingAiProvider,
  DEFAULT_FILING_AI_PROVIDER,
  normalizeFilingAiProvider,
} from "@/lib/ai/filing-provider-prefs";

export const AI_PROVIDERS = FILING_AI_PROVIDERS;
export type AiProvider = FilingAiProvider;
export { DEFAULT_FILING_AI_PROVIDER };

export function normalizeAiProvider(value: string | undefined): AiProvider {
  return normalizeFilingAiProvider(value ?? undefined);
}

const VALID_SENTIMENTS = [
  "bullish",
  "somewhat_bullish",
  "neutral",
  "somewhat_bearish",
  "bearish",
] as const;

export type FilingSentiment = (typeof VALID_SENTIMENTS)[number];

export interface FilingAnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: FilingSentiment;
  model: string;
}

function buildFilingPrompt(input: {
  ticker: string;
  companyName: string | null;
  form: string;
  filingDate: string;
  items: string | null;
  truncatedNote: boolean;
  documentText: string;
}): string {
  const note = input.truncatedNote
    ? "\n\nNote: The filing text below is a truncated excerpt only. State assumptions clearly; avoid claiming full-document facts you cannot see."
    : "";

  return `${FILING_EQUITY_RESEARCH_INSTRUCTIONS}

---

## Filing metadata (context)
- Ticker: ${input.ticker}
- Company: ${input.companyName || "Unknown"}
- Form: ${input.form}
- Filing date: ${input.filingDate}
${input.items ? `- 8-K items: ${input.items}` : ""}
${note}

---

## Required output format
Respond with **one JSON object only** (no markdown code fences). Use valid JSON: escape quotes and newlines inside strings.

Schema:
{
  "sentiment": "bullish" | "somewhat_bullish" | "neutral" | "somewhat_bearish" | "bearish",
  "report": "<single string containing your FULL analysis as Markdown, following sections 1–10 above with the same headings and depth>",
  "executiveSummaryBullets": ["5–10 strings", "TL;DR bullets mirroring section 1"]
}

- The "report" field must include **all** sections 1–10 with Markdown headings (##) and bullet lists as appropriate.
- Put the entire Markdown report inside the JSON string (use \\n for newlines).

--- FILING TEXT START ---
${input.documentText}
--- FILING TEXT END ---`;
}

function parseFilingJson(raw: string): Omit<FilingAnalysisResult, "model"> {
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fence) text = fence[1].trim();

  let parsed: {
    report?: string;
    summary?: string;
    executiveSummaryBullets?: string[];
    keyPoints?: string[];
    sentiment?: string;
  };
  try {
    parsed = JSON.parse(text) as typeof parsed;
  } catch (e) {
    console.error(
      "Filing AI JSON parse error:",
      e,
      "Raw snippet:",
      text.slice(0, 800)
    );
    throw new Error(
      "The model returned invalid JSON; try again or switch provider."
    );
  }

  const report =
    typeof parsed.report === "string" && parsed.report.trim().length > 0
      ? parsed.report.trim()
      : typeof parsed.summary === "string" && parsed.summary.trim().length > 0
        ? parsed.summary.trim()
        : "";

  const summary = report || "No analysis generated.";

  const bulletSource = Array.isArray(parsed.executiveSummaryBullets)
    ? parsed.executiveSummaryBullets
    : Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints
      : [];

  const keyPoints = bulletSource.filter(
    (x): x is string => typeof x === "string" && x.length > 0
  );

  let sentiment: FilingSentiment = "neutral";
  const s = String(parsed.sentiment || "").toLowerCase().replace(/\s/g, "_");
  if ((VALID_SENTIMENTS as readonly string[]).includes(s)) {
    sentiment = s as FilingSentiment;
  }

  return { summary, keyPoints, sentiment };
}

async function openAiCompatibleJson(args: {
  url: string;
  apiKey: string;
  model: string;
  prompt: string;
  extraHeaders?: Record<string, string>;
}): Promise<{ text: string; model: string }> {
  const res = await fetch(args.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.apiKey}`,
      ...args.extraHeaders,
    },
    body: JSON.stringify({
      model: args.model,
      messages: [{ role: "user", content: args.prompt }],
      response_format: { type: "json_object" },
      max_tokens:
        Number(process.env.FILING_AI_MAX_TOKENS) || 16_384,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`LLM error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty model response");
  return { text, model: args.model };
}

async function analyzeWithDeepSeek(prompt: string): Promise<FilingAnalysisResult> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not configured");
  const model = process.env.DEEPSEEK_MODEL_FILING || "deepseek-chat";
  const { text, model: used } = await openAiCompatibleJson({
    url: "https://api.deepseek.com/chat/completions",
    apiKey: key,
    model,
    prompt,
  });
  const parsed = parseFilingJson(text);
  return { ...parsed, model: used };
}

async function analyzeWithOpenRouter(prompt: string): Promise<FilingAnalysisResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");
  const model =
    process.env.OPENROUTER_MODEL_FILING || "openai/gpt-4o-mini";
  const { text, model: used } = await openAiCompatibleJson({
    url: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: key,
    model,
    prompt,
    extraHeaders: {
      "HTTP-Referer":
        process.env.OPENROUTER_HTTP_REFERER || "https://takovic.com",
      "X-Title": process.env.OPENROUTER_APP_TITLE || "Takovic",
    },
  });
  const parsed = parseFilingJson(text);
  return { ...parsed, model: used };
}

async function analyzeWithClaude(prompt: string): Promise<FilingAnalysisResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");
  const model = process.env.CLAUDE_MODEL_FILING || "claude-sonnet-4-6";
  const client = new Anthropic({ apiKey: key });
  const message = await client.messages.create({
    model,
    max_tokens: Number(process.env.CLAUDE_MAX_TOKENS_FILING) || 16_384,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  const text = block.type === "text" ? block.text : "";
  const parsed = parseFilingJson(text);
  return { ...parsed, model };
}

async function analyzeWithGemini(prompt: string): Promise<FilingAnalysisResult> {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY (or GEMINI_API_KEY) is not configured");
  const model = process.env.GEMINI_MODEL_FILING || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens:
          Number(process.env.GEMINI_MAX_TOKENS_FILING) || 8192,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  const parsed = parseFilingJson(text);
  return { ...parsed, model };
}

export async function analyzeFilingWithProvider(
  provider: AiProvider,
  input: {
    ticker: string;
    companyName: string | null;
    form: string;
    filingDate: string;
    items: string | null;
    documentText: string;
    wasTruncated: boolean;
  }
): Promise<FilingAnalysisResult> {
  const prompt = buildFilingPrompt({
    ticker: input.ticker,
    companyName: input.companyName,
    form: input.form,
    filingDate: input.filingDate,
    items: input.items,
    truncatedNote: input.wasTruncated,
    documentText: input.documentText,
  });

  switch (provider) {
    case "deepseek":
      return analyzeWithDeepSeek(prompt);
    case "openrouter":
      return analyzeWithOpenRouter(prompt);
    case "claude":
      return analyzeWithClaude(prompt);
    case "gemini":
      return analyzeWithGemini(prompt);
    default:
      return analyzeWithDeepSeek(prompt);
  }
}
