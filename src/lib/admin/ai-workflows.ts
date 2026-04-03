/**
 * Read-only catalog of AI workflows (agents) for admin UI and discovery.
 * Source of truth for prompts remains the referenced modules.
 */

export interface AiWorkflow {
  id: string;
  name: string;
  purpose: string;
  /** Primary module defining the prompt or client call */
  source: string;
  /** Env vars that select model (when applicable) */
  modelEnvKeys: string[];
  /** App routes or surfaces that invoke this workflow */
  consumers: string[];
}

export const AI_WORKFLOWS: AiWorkflow[] = [
  {
    id: "coverage-analyst",
    name: "Coverage analyst",
    purpose:
      "Classify pasted research items, comps intelligence, cross-refs, and pre-write gates for covered tickers ({{PLACEHOLDER}} template).",
    source: "src/lib/ai/coverage-prompts/coverage-analyst-template.ts + build-coverage-prompt.ts",
    modelEnvKeys: [],
    consumers: [
      "Admin → Prompts & AI (/admin/prompts): resolved prompt + copy",
      "Manual / IDE — buildCoverageContext(ticker)",
      "Coverage pages: src/app/(dashboard)/coverage/[ticker]",
    ],
  },
  {
    id: "stock-summary",
    name: "Stock AI summary",
    purpose:
      "JSON investment summary, sentiment, strengths/weaknesses from fundamentals + headlines.",
    source: "src/lib/ai/claude.ts — generateStockSummary",
    modelEnvKeys: ["CLAUDE_MODEL_SUMMARY"],
    consumers: ["/api/analysis/[ticker]"],
  },
  {
    id: "news-sentiment",
    name: "News sentiment",
    purpose: "Single-label sentiment classification for news articles.",
    source: "src/lib/ai/claude.ts — analyzeNewsSentiment",
    modelEnvKeys: ["CLAUDE_MODEL_SENTIMENT"],
    consumers: ["FMP news pipeline (where sentiment is applied)"],
  },
  {
    id: "sec-edgar-filing-analysis",
    name: "SEC/EDGAR file analysis",
    purpose:
      "Equity-research-style deep dive on SEC filing excerpts: JSON with Markdown report (10 sections), sentiment, executive bullets; multi-provider.",
    source:
      "src/lib/ai/filing-equity-research-prompt.ts + filing-analyze.ts — buildFilingPrompt",
    modelEnvKeys: [
      "DEEPSEEK_API_KEY",
      "DEEPSEEK_MODEL_FILING",
      "DEEPSEEK_MAX_TOKENS_FILING",
      "ANTHROPIC_API_KEY",
      "CLAUDE_MODEL_FILING",
      "CLAUDE_MAX_TOKENS_FILING",
      "GOOGLE_API_KEY / GEMINI_API_KEY",
      "GEMINI_MODEL_FILING",
      "OPENROUTER_API_KEY",
      "OPENROUTER_MODEL_FILING",
      "FILING_AI_MAX_TOKENS",
      "FILING_AI_MAX_CHARS",
    ],
    consumers: [
      "POST /api/intelligence/[ticker]/filings/analyze",
      "Intelligence + stock research SEC filings — Analyze button",
      "Admin → Prompts & AI: full prompt preview + copy",
    ],
  },
];

export function getAiWorkflowById(id: string): AiWorkflow | undefined {
  return AI_WORKFLOWS.find((w) => w.id === id);
}
