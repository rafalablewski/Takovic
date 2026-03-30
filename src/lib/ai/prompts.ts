/**
 * Coverage analyst prompts — orchestration entry point.
 *
 * Per-ticker prompt text lives in src/lib/ai/coverage-prompts/ (e.g. bmnr.ts).
 * Register builders in coverage-prompts/registry.ts.
 *
 * LAST UPDATED: 2026-03-30
 */

import { getCoveredStock } from "@/data/coverage/registry";
import { getCoveragePromptBuilder } from "@/lib/ai/coverage-prompts/registry";

// Re-export BMNR helpers for callers that need them explicitly
export {
  BMNR_COVERAGE_ANALYST_PROMPT,
  resolveBmnrCoveragePrompt,
  buildBmnrCoveragePrompt,
} from "@/lib/ai/coverage-prompts/bmnr";
export type { BmnrCoveragePromptVars } from "@/lib/ai/coverage-prompts/bmnr";
export { COVERAGE_PROMPT_BUILDERS } from "@/lib/ai/coverage-prompts/registry";

/**
 * Builds the fully resolved coverage analyst prompt for a ticker, if a
 * dedicated prompt module is registered.
 *
 * Returns null if the ticker is not in active coverage, or no dedicated
 * prompt exists yet (add one under coverage-prompts/ + registry).
 */
export async function buildCoverageContext(
  ticker: string
): Promise<string | null> {
  const upperTicker = ticker.toUpperCase();
  const stock = getCoveredStock(upperTicker);

  if (!stock) {
    return null;
  }

  const builder = getCoveragePromptBuilder(upperTicker);
  if (!builder) {
    console.warn(
      `[coverage prompt] No dedicated prompt for ${upperTicker}. Add src/lib/ai/coverage-prompts/${upperTicker.toLowerCase()}.ts and register in registry.ts.`
    );
    return null;
  }

  return builder();
}
