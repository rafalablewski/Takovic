/**
 * Coverage analyst prompts — stock-agnostic template filled from registry + data modules.
 *
 * Template: src/lib/ai/coverage-prompts/coverage-analyst-template.ts
 *
 * LAST UPDATED: 2026-03-30
 */

import { getCoveredStock } from "@/data/coverage/registry";
import { buildCoveragePromptForTicker } from "@/lib/ai/coverage-prompts/build-coverage-prompt";

export {
  COVERAGE_ANALYST_PROMPT,
  resolveCoveragePrompt,
  type CoveragePromptContext,
} from "@/lib/ai/coverage-prompts/coverage-analyst-template";
export { buildCoveragePromptForTicker } from "@/lib/ai/coverage-prompts/build-coverage-prompt";

/**
 * Builds the fully resolved coverage analyst prompt for a covered ticker.
 * Company name, exchange, description, sector, tabs, and file-path guidance are injected
 * at runtime — the template contains no hardcoded issuer, peer list, or numeric facts.
 */
export async function buildCoverageContext(
  ticker: string
): Promise<string | null> {
  const upperTicker = ticker.toUpperCase();
  if (!getCoveredStock(upperTicker)) {
    return null;
  }
  return buildCoveragePromptForTicker(upperTicker);
}
