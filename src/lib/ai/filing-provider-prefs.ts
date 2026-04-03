/** Client-safe: AI provider ids for SEC filing analysis (no server-only imports). */

export const FILING_AI_PROVIDERS = [
  "deepseek",
  "claude",
  "gemini",
  "openrouter",
] as const;

export type FilingAiProvider = (typeof FILING_AI_PROVIDERS)[number];

export const DEFAULT_FILING_AI_PROVIDER: FilingAiProvider = "deepseek";

const SET = new Set<string>(FILING_AI_PROVIDERS);

export function normalizeFilingAiProvider(
  value: string | null | undefined
): FilingAiProvider {
  if (value && SET.has(value)) return value as FilingAiProvider;
  return DEFAULT_FILING_AI_PROVIDER;
}

export const FILING_AI_PROVIDER_LABELS: Record<FilingAiProvider, string> = {
  deepseek: "DeepSeek",
  claude: "Claude",
  gemini: "Gemini",
  openrouter: "OpenRouter",
};

export const FILING_AI_PROVIDER_STORAGE_KEY = "takovic_filing_ai_provider";
