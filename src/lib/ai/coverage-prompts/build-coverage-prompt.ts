/**
 * Builds CoveragePromptContext from registry + template placeholders.
 *
 * Peer context: instructs analysts to use the product Comps tab and
 * src/data/coverage/<ticker>.ts (COMPARABLES) — no inline peer enumeration.
 */

import { getCoveredStock, getTabsForStock } from "@/data/coverage/registry";
import {
  resolveCoveragePrompt,
  type CoveragePromptContext,
} from "./coverage-analyst-template";

export type { CoveragePromptContext };

function buildCompsGuidanceForPrompt(upperTicker: string): string {
  const lower = upperTicker.toLowerCase();
  return [
    "Peer list policy: Do not rely on an inline peer list in this prompt.",
    "The product Comps tab is the canonical comparables view for this ticker. It loads COMPARABLES and optional COMPARABLES_INSIGHT from the coverage data module at the path below.",
    `Module: src/data/coverage/${lower}.ts — add, remove, or edit COMPARABLES[] there; the Comps tab and human review stay aligned.`,
    "When classifying Comps news, threat levels, or competitive tables, use peers from that tab (or the same source file), not a snapshot.",
  ].join("\n\n");
}

/** BMNR: tie analyst reasoning to the ETH purchase log + mNAV framing. Other tickers: empty. */
function buildAdditionalAnalystInstructionsBlock(upperTicker: string, companyName: string): string {
  if (upperTicker !== "BMNR") return "";

  const lower = upperTicker.toLowerCase();
  return [
    "════════════════════════════════════════",
    `TICKER-SPECIFIC ANALYSIS CONTEXT (${upperTicker})`,
    "════════════════════════════════════════",
    "",
    `ETH purchases context: When you analyze pasted text about ${companyName} (${upperTicker}), **interpret material facts in the context of the ETH purchase program** wherever applicable—not only as generic treasury or “crypto” news. Explicitly weigh: weekly vs. historical accumulation pace; USD deployed and implied ETH pricing vs. the structured purchase log; mNAV (and ranges) vs. \`ETH_PURCHASE_SUMMARY\` / methodology; shares outstanding and dilution vs. per-share ETH; and whether disclosures confirm, extend, or contradict existing rows.`,
    "",
    `**UI:** Business Operations → ETH Purchases. **Data:** src/data/coverage/${lower}-eth-purchases.ts (\`ETH_PURCHASES\`, \`ETH_PURCHASE_SUMMARY\`, \`ETH_MNAV_METHODOLOGY\`). For weekly PR/8-K ETH totals, propose **concrete** updates to that module (new or revised purchase rows, summary fields) plus date-anchored Timeline entries when appropriate—do not stop at high-level Overview bullets if the content is purchase-specific.`,
    "",
  ].join("\n");
}

/**
 * Returns the fully resolved coverage analyst prompt for a covered ticker.
 */
export async function buildCoveragePromptForTicker(
  ticker: string
): Promise<string | null> {
  const upperTicker = ticker.toUpperCase();
  const stock = getCoveredStock(upperTicker);
  if (!stock) return null;

  const tabs = getTabsForStock(upperTicker);
  const tickerTabs = tabs.map((t) => t.label).join(", ");

  const hasOperationsTab = tabs.some((t) => t.id === "operations");
  const tabHierarchyNotes = hasOperationsTab
    ? "This ticker includes a Business Operations top-level tab. The product may show nested sub-views under it — use the exact sub-tab labels from the live UI when proposing placement (format: Business Operations → <SubViewLabel>). Do not invent labels."
    : "No Business Operations tab in the registry for this ticker; do not assume operational sub-views unless the UI shows them.";

  const domainSections =
    stock.customTabs.length > 0
      ? stock.customTabs
          .map((t) => `- ${t.label}: ${t.description}`)
          .join("\n")
      : "None defined in registry yet.";

  const competitors = buildCompsGuidanceForPrompt(upperTicker);

  const lower = upperTicker.toLowerCase();
  const dataRootHint = [
    `- Coverage modules: src/data/coverage/${lower}/ (e.g. ${lower}.ts, optional ecosystem or feed files).`,
    `- Entity barrel (if present): src/data/${upperTicker}/index.ts`,
    `Replace ${lower} / ${upperTicker} with this prompt's ticker when resolving paths.`,
  ].join("\n");

  const context: CoveragePromptContext = {
    ticker: upperTicker,
    companyName: stock.name,
    exchange: stock.exchange ?? "—",
    description: stock.description,
    specialistDomain: stock.sector,
    competitors,
    tickerTabs,
    tabHierarchyNotes,
    additionalAnalystInstructionsBlock: buildAdditionalAnalystInstructionsBlock(upperTicker, stock.name),
    domainSections,
    dataRootHint,
  };

  return resolveCoveragePrompt(context);
}
