import { NextResponse } from "next/server";
import { getCoveredStock, isCovered } from "@/data/coverage/registry";
import { importCoverageTickerModule } from "@/lib/coverage/import-coverage-module";
import {
  COVERAGE_API_SECTIONS,
  isCoverageApiSection,
  type CoverageApiSection,
} from "@/types/coverage";

const INVESTMENT_EXPORT_KEYS = [
  "INVESTMENT_DUE_DILIGENCE",
  "INVESTMENT_CURRENT_ASSESSMENT",
  "ECOSYSTEM_HEALTH",
  "SCORECARD",
  "INVESTMENT_SUMMARY_WHATS_NEW_TITLE",
  "INVESTMENT_SUMMARY_WHATS_NEW_BULLETS",
  "INVESTMENT_SUMMARY_HEADLINE",
  "INVESTMENT_SUMMARY_CLOSING_QUOTE",
  "GROWTH_DRIVERS",
  "COMPETITIVE_MOAT_SOURCES",
  "COMPETITIVE_MOAT_SOURCES_DETAIL",
  "COMPETITIVE_THREATS",
  "COMPETITIVE_THREATS_DETAIL",
  "MOAT_DURABILITY",
  "RISK_MATRIX",
  "STRATEGIC_ASSESSMENT_INTRO",
  "STRATEGIC_PERSPECTIVES",
  "KEY_STRATEGIC_QUESTIONS",
  "ECOSYSTEM_TRIGGERS_INTRO",
  "ECOSYSTEM_TRIGGER_COLUMNS",
  "POSITION_SIZING",
  "POSITION_SIZING_ALLOCATION_INTRO",
  "POSITION_SIZING_ALLOCATION_ROWS",
  "POSITION_SIZING_ZONES_TITLE",
  "POSITION_SIZING_ZONES",
  "POSITION_SIZING_PORTFOLIO_TITLE",
  "POSITION_SIZING_PORTFOLIO_LINES",
  "ANALYSIS_ARCHIVE",
  "CFA_INVESTMENT_GLOSSARY_TITLE",
  "CFA_INVESTMENT_GLOSSARY",
  "INVESTMENT_TAB_FOOTNOTE",
] as const;

function pickInvestment(mod: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of INVESTMENT_EXPORT_KEYS) {
    if (k in mod) out[k] = mod[k];
  }
  return out;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string; section: string }> }
) {
  const { ticker, section: sectionRaw } = await context.params;
  const upper = ticker.toUpperCase();
  const section = sectionRaw.toLowerCase();

  if (!isCovered(upper)) {
    return NextResponse.json(
      { error: "Ticker not in coverage registry" },
      { status: 404 }
    );
  }

  if (!isCoverageApiSection(section)) {
    return NextResponse.json(
      {
        error: "Unknown section",
        validSections: [...COVERAGE_API_SECTIONS],
      },
      { status: 400 }
    );
  }

  const lower = ticker.toLowerCase();

  try {
    const payload = await buildSectionPayload(section, upper, lower);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "Coverage data not available for this ticker/section" },
      { status: 404 }
    );
  }
}

async function buildSectionPayload(
  section: CoverageApiSection,
  upper: string,
  lower: string
): Promise<Record<string, unknown>> {
  switch (section) {
    case "meta": {
      const stock = getCoveredStock(upper);
      return { ticker: upper, meta: stock };
    }
    case "ecosystem-news": {
      const mod = await import(`@/data/coverage/${lower}-ecosystem-news`);
      return { ticker: upper, ecosystemNews: mod.ECOSYSTEM_NEWS ?? null };
    }
    case "overview": {
      const mod = await importCoverageTickerModule(lower);
      return { ticker: upper, overview: mod.OVERVIEW ?? null };
    }
    case "comparables": {
      const mod = await importCoverageTickerModule(lower);
      return {
        ticker: upper,
        comparables: mod.COMPARABLES ?? null,
        insight: mod.COMPARABLES_INSIGHT ?? null,
        competitorNews: mod.COMPETITOR_NEWS ?? null,
        peerSnapshot: mod.PEER_SNAPSHOT ?? null,
      };
    }
    case "financials": {
      const mod = await importCoverageTickerModule(lower);
      return {
        ticker: upper,
        quarterlyFinancials: mod.QUARTERLY_FINANCIALS ?? null,
        description: mod.FINANCIALS_DESCRIPTION ?? null,
      };
    }
    case "capital-structure": {
      const mod = await importCoverageTickerModule(lower);
      return { ticker: upper, capitalStructure: mod.CAPITAL_STRUCTURE ?? null };
    }
    case "wall-street": {
      const mod = await importCoverageTickerModule(lower);
      return {
        ticker: upper,
        analysts: mod.WALL_STREET ?? null,
        note: mod.WALL_STREET_NOTE ?? null,
        firms: mod.WALL_STREET_FIRMS ?? null,
      };
    }
    case "timeline": {
      const mod = await importCoverageTickerModule(lower);
      return {
        ticker: upper,
        events: mod.TIMELINE_EVENTS ?? null,
        description: mod.TIMELINE_DESCRIPTION ?? null,
      };
    }
    case "investment": {
      const mod = await importCoverageTickerModule(lower);
      return { ticker: upper, investment: pickInvestment(mod) };
    }
    case "eth-purchases": {
      const mod = await importCoverageTickerModule(lower);
      return {
        ticker: upper,
        purchases: mod.ETH_PURCHASES ?? null,
        summary: mod.ETH_PURCHASE_SUMMARY ?? null,
        historyDescription: mod.ETH_PURCHASE_HISTORY_DESCRIPTION ?? null,
        overviewHeading: mod.ETH_PURCHASE_OVERVIEW_HEADING ?? null,
        overviewSourceLine: mod.ETH_PURCHASE_OVERVIEW_SOURCE_LINE ?? null,
        logSubheading: mod.ETH_PURCHASE_LOG_SUBHEADING ?? null,
        tableHeaders: mod.ETH_PURCHASE_TABLE_HEADERS ?? null,
        methodology: mod.ETH_MNAV_METHODOLOGY ?? null,
      };
    }
    case "ethereum-intelligence": {
      const mod = await importCoverageTickerModule(lower);
      return { ticker: upper, ethereumIntelligence: mod.ETHEREUM_INTELLIGENCE ?? null };
    }
  }
}
