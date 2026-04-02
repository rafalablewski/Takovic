/**
 * BMNR Comps-tab competitor intelligence (merged parts).
 *
 * LAST UPDATED: 2026-04-02
 * NEXT UPDATE: When material peer / ecosystem news warrants new rows
 */

import type { CompetitorNewsItem } from "@/types/coverage";
import { BMNR_COMPETITOR_NEWS_P1 } from "./bmnr-competitor-news-p1";
import { BMNR_COMPETITOR_NEWS_P2 } from "./bmnr-competitor-news-p2";
import { BMNR_COMPETITOR_NEWS_P3 } from "./bmnr-competitor-news-p3";
import { BMNR_COMPETITOR_NEWS_P4 } from "./bmnr-competitor-news-p4";

export const COMPETITOR_NEWS_METADATA = {
  lastUpdated: "2026-04-02",
  source: "Internal comps intelligence feed",
  nextExpectedUpdate: "Rolling — add rows newest-first",
} as const;

/** Newest-first competitor news for the Comps tab (84 items). */
export const COMPETITOR_NEWS: CompetitorNewsItem[] = [
  ...BMNR_COMPETITOR_NEWS_P1,
  ...BMNR_COMPETITOR_NEWS_P2,
  ...BMNR_COMPETITOR_NEWS_P3,
  ...BMNR_COMPETITOR_NEWS_P4,
];
