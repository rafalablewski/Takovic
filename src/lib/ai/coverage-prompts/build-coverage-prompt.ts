/**
 * Builds CoveragePromptContext from registry + optional coverage/entity modules.
 *
 * Peer comps: compact snapshot + file path from COMPARABLES at prompt-build time.
 * Metrics are not inlined — analysts verify numbers in source files (see template).
 */

import { getCoveredStock, getTabsForStock } from "@/data/coverage/registry";
import {
  resolveCoveragePrompt,
  type CoveragePromptContext,
} from "./coverage-analyst-template";

export type { CoveragePromptContext };

/** One-line summary per comparable row (shape matches coverage ComparableCompany). */
function formatComparablesSnapshot(
  rows: unknown[],
  coverageFile: string,
  insight?: string
): string {
  const lines = rows.map((row) => {
    if (!row || typeof row !== "object") return null;
    const r = row as Record<string, unknown>;
    const ticker = r.ticker != null ? String(r.ticker) : "?";
    const name = r.name != null ? String(r.name) : "";
    const parts: string[] = [`**${ticker}** — ${name}`];
    if (r.asset != null) parts.push(`asset: ${String(r.asset)}`);
    if (r.threatLevel != null) parts.push(`threat: ${String(r.threatLevel)}`);
    if (r.competitiveFocus != null) parts.push(String(r.competitiveFocus));
    return `- ${parts.join(" | ")}`;
  });

  const body = lines.filter(Boolean).join("\n");
  const tail = insight?.trim()
    ? `\n\nAnalyst framing (from data module):\n${insight.trim()}`
    : "";

  return [
    `Peer / comps set — snapshot generated when this prompt was built. Source of truth: \`${coverageFile}\` (\`COMPARABLES\`). Add, remove, or edit rows there; names, assets, and figures update on the next prompt build.`,
    "",
    body || "(empty COMPARABLES array — add peers in the file above.)",
    tail,
    "",
    "For full field-level detail (holdings strings, NAV, differentiators), open the source file; do not assume this snapshot includes every column.",
  ].join("\n");
}

async function loadOptionalCoverageModules(upperTicker: string): Promise<{
  competitors: string;
}> {
  const lower = upperTicker.toLowerCase();
  const coveragePath = `src/data/coverage/${lower}.ts`;
  let competitors = "No peer / comps context loaded yet.";

  try {
    const cov = await import(`@/data/coverage/${lower}`);
    if ("COMPARABLES" in cov && cov.COMPARABLES != null) {
      const rows = cov.COMPARABLES as unknown;
      const insight =
        "COMPARABLES_INSIGHT" in cov && typeof cov.COMPARABLES_INSIGHT === "string"
          ? cov.COMPARABLES_INSIGHT
          : undefined;
      if (Array.isArray(rows)) {
        competitors = formatComparablesSnapshot(rows, coveragePath, insight);
      } else {
        competitors = String(rows);
      }
    } else if ("COMPETITORS" in cov && cov.COMPETITORS != null) {
      const c = cov.COMPETITORS as unknown;
      competitors =
        typeof c === "string"
          ? c
          : `Peer / comps data (raw — define COMPARABLES[] in ${coveragePath} for a compact snapshot):\n${JSON.stringify(c, null, 2)}`;
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
  } catch {
    // entity barrel optional
  }

  return { competitors };
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

  const { competitors } = await loadOptionalCoverageModules(upperTicker);

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
    dataRootHint,
  };

  return resolveCoveragePrompt(context);
}
