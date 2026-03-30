/**
 * Maps ticker → dedicated coverage analyst prompt builder.
 * Register new tickers here when you add src/lib/ai/coverage-prompts/<ticker>.ts
 */

import type { CoveragePromptBuilder } from "./types";
import { buildBmnrCoveragePrompt } from "./bmnr";

export const COVERAGE_PROMPT_BUILDERS: Partial<
  Record<string, CoveragePromptBuilder>
> = {
  BMNR: buildBmnrCoveragePrompt,
};

export function getCoveragePromptBuilder(
  ticker: string
): CoveragePromptBuilder | undefined {
  return COVERAGE_PROMPT_BUILDERS[ticker.toUpperCase()];
}
