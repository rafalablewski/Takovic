/**
 * Shared shape for structured competitor / Comps-tab news entries.
 * Valid competitor IDs and categories for a ticker live in header comments
 * of that ticker's coverage data files (e.g. src/data/coverage/bmnr.ts for
 * comparables context. BMNR ships structured rows in `COMPETITOR_NEWS` (see
 * `CompetitorNewsItem` in `@/types/coverage` and `bmnr-competitor-news.ts`).
 *
 * LAST UPDATED: 2026-03-30
 */

export type CompetitorNewsImplication = "positive" | "neutral" | "negative";

/** Proposed entry format when adding Comps (Comparables) intelligence */
export interface CompetitorNewsEntry {
  date: string;
  competitor: string;
  category: string;
  headline: string;
  details: string[];
  implication: CompetitorNewsImplication;
  thesisComparison: string;
  source: string;
  sourceUrl: string;
  storyId?: string;
  storyTitle?: string;
}
