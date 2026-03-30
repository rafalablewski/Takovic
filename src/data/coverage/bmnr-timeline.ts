/**
 * BMNR timeline — 1:1 with internal EVENT TIMELINE export (91 events).
 * Structured data lives in `bmnr-timeline-full.json` (regenerate: `node scripts/parse-bmnr-timeline-export.mjs`
 * after updating `scripts/bmnr-timeline-source.txt`).
 *
 * LAST UPDATED: 2026-03-31
 * NEXT UPDATE: After next material 8-K / PR / holdings milestone (re-paste export or extend JSON)
 */

import timelineJson from "./bmnr-timeline-full.json";

export type TimelineEventType = "filing" | "purchase" | "corporate" | "milestone" | "market";

export interface TimelineKeyChangeRow {
  metric: string;
  previous: string;
  newValue: string;
  change: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  topic: string;
  title: string;
  sentiment: "bullish" | "neutral" | "bearish";
  sentimentLabel: string;
  type: TimelineEventType;
  keyChanges: TimelineKeyChangeRow[];
  notes: string;
  source?: string;
}

export const TIMELINE_DESCRIPTION =
  "Track key events for BMNR — ETH accumulation, SEC filings, capital raises, corporate strategy, and product launches. Company-level catalysts in reverse-chronological order; each entry mirrors the export (KEY CHANGES table, NOTES, source).";

export const TIMELINE_EVENTS = timelineJson as TimelineEvent[];
