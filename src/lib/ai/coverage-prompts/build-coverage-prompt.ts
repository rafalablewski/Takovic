/**
 * Builds CoveragePromptContext from registry + optional coverage/entity modules.
 */

import { getCoveredStock, getTabsForStock } from "@/data/coverage/registry";
import {
  resolveCoveragePrompt,
  type CoveragePromptContext,
} from "./coverage-analyst-template";

export type { CoveragePromptContext };

async function loadOptionalCoverageModules(upperTicker: string): Promise<{
  competitors: string;
  stockSpecificMetrics: string;
}> {
  const lower = upperTicker.toLowerCase();
  let competitors = "No peer / comps context loaded yet.";
  let stockSpecificMetrics = "No structured metrics snapshot loaded yet.";

  try {
    const cov = await import(`@/data/coverage/${lower}`);
    if ("COMPARABLES" in cov && cov.COMPARABLES != null) {
      competitors = JSON.stringify(cov.COMPARABLES, null, 2);
    } else if ("COMPETITORS" in cov && cov.COMPETITORS != null) {
      const c = cov.COMPETITORS as unknown;
      competitors =
        typeof c === "string" ? c : JSON.stringify(c, null, 2);
    }
    if (
      "OVERVIEW" in cov &&
      cov.OVERVIEW &&
      typeof cov.OVERVIEW === "object" &&
      "metrics" in cov.OVERVIEW &&
      (cov.OVERVIEW as { metrics?: unknown }).metrics != null
    ) {
      stockSpecificMetrics = JSON.stringify(
        (cov.OVERVIEW as { metrics: unknown }).metrics,
        null,
        2
      );
    }
  } catch {
    // coverage module missing or incomplete
  }

  try {
    const ent = await import(`@/data/${upperTicker}/index`);
    if (
      competitors.startsWith("No peer") &&
      "COMPETITORS" in ent &&
      ent.COMPETITORS != null
    ) {
      const c = ent.COMPETITORS as unknown;
      competitors = typeof c === "string" ? c : JSON.stringify(c, null, 2);
    }
    if (
      stockSpecificMetrics.startsWith("No structured") &&
      ("KEY_METRICS" in ent || "DOMAIN_METRICS" in ent)
    ) {
      const m =
        "KEY_METRICS" in ent && ent.KEY_METRICS != null
          ? ent.KEY_METRICS
          : (ent as { DOMAIN_METRICS?: unknown }).DOMAIN_METRICS;
      if (m != null) {
        stockSpecificMetrics =
          typeof m === "string" ? m : JSON.stringify(m, null, 2);
      }
    }
  } catch {
    // entity barrel optional
  }

  return { competitors, stockSpecificMetrics };
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

  const { competitors, stockSpecificMetrics } =
    await loadOptionalCoverageModules(upperTicker);

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
    domainSections,
    stockSpecificMetrics,
    dataRootHint,
  };

  return resolveCoveragePrompt(context);
}
