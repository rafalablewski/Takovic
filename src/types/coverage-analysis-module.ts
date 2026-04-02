/**
 * Shape of investment-tab exports from `src/data/coverage/<ticker>.ts` (e.g. bmnr).
 * Used to type dynamic imports in AnalysisTab — avoids implicit-any in .map callbacks.
 */

import type {
  AccumulationZoneRow,
  AllocationRow,
  AnalysisArchiveEntry,
  CfaGlossaryItem,
  EcosystemHealth,
  EcosystemTriggerColumn,
  GrowthDriverItem,
  KeyStrategicQuestion,
  LetterGrade,
  MoatSourceRow,
  MoatThreatRow,
  RiskItem,
  ScorecardItem,
  StrategicPerspectiveBlock,
} from "@/data/coverage/bmnr-investment-tab";

export type InvestmentHeadlineMetric = {
  label: string;
  value: string;
  sub?: string;
};

export type InvestmentDueDiligenceBlock = {
  sectionLabel: string;
  title: string;
  description: string;
  dataAsOf: string;
  sourceLine: string;
};

export type InvestmentCurrentAssessmentBlock = {
  verdict: string;
  ticker: string;
  tagline: string;
  lastUpdated: string;
  trigger: string;
  scorecardOverallGrade: LetterGrade;
  headlineMetrics: InvestmentHeadlineMetric[];
};

export type PositionSizingBlock = {
  recommendation: string;
  priceTargets: Array<{
    scenario: string;
    ethPrice: number;
    navPremium: number;
    impliedPrice: number;
    upside: number;
  }>;
  notes: string;
};

/** All symbols AnalysisTab reads from a coverage ticker module. */
export type CoverageAnalysisModule = {
  INVESTMENT_DUE_DILIGENCE: InvestmentDueDiligenceBlock;
  INVESTMENT_CURRENT_ASSESSMENT: InvestmentCurrentAssessmentBlock;
  ECOSYSTEM_HEALTH: EcosystemHealth;
  SCORECARD: ScorecardItem[];
  INVESTMENT_SUMMARY_WHATS_NEW_TITLE: string;
  INVESTMENT_SUMMARY_WHATS_NEW_BULLETS: string[];
  INVESTMENT_SUMMARY_HEADLINE: string;
  INVESTMENT_SUMMARY_CLOSING_QUOTE: string;
  GROWTH_DRIVERS: GrowthDriverItem[];
  COMPETITIVE_MOAT_SOURCES: MoatSourceRow[];
  COMPETITIVE_MOAT_SOURCES_DETAIL: Record<string, string>;
  COMPETITIVE_THREATS: MoatThreatRow[];
  COMPETITIVE_THREATS_DETAIL: Record<string, string>;
  MOAT_DURABILITY: string;
  RISK_MATRIX: RiskItem[];
  STRATEGIC_ASSESSMENT_INTRO: string;
  STRATEGIC_PERSPECTIVES: StrategicPerspectiveBlock[];
  KEY_STRATEGIC_QUESTIONS: KeyStrategicQuestion[];
  ECOSYSTEM_TRIGGERS_INTRO: string;
  ECOSYSTEM_TRIGGER_COLUMNS: EcosystemTriggerColumn[];
  POSITION_SIZING: PositionSizingBlock;
  POSITION_SIZING_ALLOCATION_INTRO: string;
  POSITION_SIZING_ALLOCATION_ROWS: AllocationRow[];
  POSITION_SIZING_ZONES_TITLE: string;
  POSITION_SIZING_ZONES: AccumulationZoneRow[];
  POSITION_SIZING_PORTFOLIO_TITLE: string;
  POSITION_SIZING_PORTFOLIO_LINES: string[];
  ANALYSIS_ARCHIVE: AnalysisArchiveEntry[];
  CFA_INVESTMENT_GLOSSARY_TITLE: string;
  CFA_INVESTMENT_GLOSSARY: CfaGlossaryItem[];
  INVESTMENT_TAB_FOOTNOTE: string;
};
