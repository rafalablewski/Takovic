"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import {
  INVESTMENT_DUE_DILIGENCE,
  INVESTMENT_CURRENT_ASSESSMENT,
  ECOSYSTEM_HEALTH,
  SCORECARD,
  INVESTMENT_SUMMARY_WHATS_NEW_TITLE,
  INVESTMENT_SUMMARY_WHATS_NEW_BULLETS,
  INVESTMENT_SUMMARY_HEADLINE,
  INVESTMENT_SUMMARY_CLOSING_QUOTE,
  GROWTH_DRIVERS,
  COMPETITIVE_MOAT_SOURCES,
  COMPETITIVE_MOAT_SOURCES_DETAIL,
  COMPETITIVE_THREATS,
  COMPETITIVE_THREATS_DETAIL,
  MOAT_DURABILITY,
  RISK_MATRIX,
  STRATEGIC_ASSESSMENT_INTRO,
  STRATEGIC_PERSPECTIVES,
  KEY_STRATEGIC_QUESTIONS,
  ECOSYSTEM_TRIGGERS_INTRO,
  ECOSYSTEM_TRIGGER_COLUMNS,
  POSITION_SIZING,
  POSITION_SIZING_ALLOCATION_INTRO,
  POSITION_SIZING_ALLOCATION_ROWS,
  POSITION_SIZING_ZONES_TITLE,
  POSITION_SIZING_ZONES,
  POSITION_SIZING_PORTFOLIO_TITLE,
  POSITION_SIZING_PORTFOLIO_LINES,
  ANALYSIS_ARCHIVE,
  CFA_INVESTMENT_GLOSSARY_TITLE,
  CFA_INVESTMENT_GLOSSARY,
  INVESTMENT_TAB_FOOTNOTE,
} from "@/data/coverage/bmnr";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Shield,
  TrendingUp,
  Swords,
  AlertTriangle,
  Target,
  Archive,
  CheckCircle2,
  Sparkles,
  Info,
  BookOpen,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Grade colors (incl. A+, B+)
// ---------------------------------------------------------------------------

const gradeColors: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "B+": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  C: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  D: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  F: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  bullish: "text-emerald-600 dark:text-emerald-400",
  healthy: "text-emerald-600 dark:text-emerald-400",
  growing: "text-emerald-600 dark:text-emerald-400",
  deflationary: "text-emerald-600 dark:text-emerald-400",
  upgraded: "text-emerald-600 dark:text-emerald-400",
  neutral: "text-gray-600 dark:text-gray-400",
  bearish: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
};

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const growthImpactColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const moatStrengthColors: Record<string, string> = {
  Strong: "text-emerald-600 dark:text-emerald-400",
  Critical: "text-red-600 dark:text-red-400",
  High: "text-orange-600 dark:text-orange-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Low: "text-muted-foreground",
};

function likelihoodLabel(l: string): string {
  if (l === "low") return "Low likelihood";
  if (l === "medium") return "Medium likelihood";
  return "High likelihood";
}

// ---------------------------------------------------------------------------
// Collapsible section (remount on layoutKey to honor Expand/Collapse All)
// ---------------------------------------------------------------------------

function CollapsibleCardRemount({
  title,
  icon,
  badge,
  defaultExpanded,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  defaultExpanded: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultExpanded);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground">{title}</span>
          {badge}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <CardContent className="px-5 pb-5 pt-0">{children}</CardContent>}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function AnalysisTab({ ticker }: { ticker: string }) {
  const [layoutKey, setLayoutKey] = useState(0);
  const [defaultExpanded, setDefaultExpanded] = useState(true);

  if (!isEthTreasury(ticker)) return <p className="text-sm text-muted-foreground">No analysis data.</p>;

  const expandAll = () => {
    setDefaultExpanded(true);
    setLayoutKey((k) => k + 1);
  };
  const collapseAll = () => {
    setDefaultExpanded(false);
    setLayoutKey((k) => k + 1);
  };

  const cc = (id: string, title: string, icon: React.ReactNode, badge: React.ReactNode | undefined, children: React.ReactNode) => (
    <CollapsibleCardRemount key={`${id}-${layoutKey}`} defaultExpanded={defaultExpanded} title={title} icon={icon} badge={badge}>
      {children}
    </CollapsibleCardRemount>
  );

  const scoreOverall = INVESTMENT_CURRENT_ASSESSMENT.scorecardOverallGrade;

  return (
    <div className="space-y-4">
      {/* DUE DILIGENCE */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
          {INVESTMENT_DUE_DILIGENCE.sectionLabel}
        </p>
        <h2 className="text-lg font-semibold text-foreground">{INVESTMENT_DUE_DILIGENCE.title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{INVESTMENT_DUE_DILIGENCE.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-[10px] font-medium uppercase tracking-wide text-primary hover:underline"
          >
            Expand All
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[10px] font-medium uppercase tracking-wide text-primary hover:underline"
          >
            Collapse All
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Data as of:</span> {INVESTMENT_DUE_DILIGENCE.dataAsOf}
          <span className="mx-2 text-muted-foreground/50">•</span>
          <span className="font-medium text-foreground">Source:</span> {INVESTMENT_DUE_DILIGENCE.sourceLine}
        </p>
      </div>

      {/* CURRENT ASSESSMENT */}
      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="space-y-4 p-5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">CURRENT ASSESSMENT</p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-amber-500/90 text-white hover:bg-amber-500 text-xs font-bold px-2 py-0.5">
              {INVESTMENT_CURRENT_ASSESSMENT.verdict}
            </Badge>
            <span className="text-sm font-semibold text-foreground">{INVESTMENT_CURRENT_ASSESSMENT.ticker}</span>
          </div>
          <p className="text-base font-medium text-foreground">{INVESTMENT_CURRENT_ASSESSMENT.tagline}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Last Updated:</span> {INVESTMENT_CURRENT_ASSESSMENT.lastUpdated}
            <span className="mx-1.5">•</span>
            <span className="font-medium text-foreground">Trigger:</span> {INVESTMENT_CURRENT_ASSESSMENT.trigger}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {INVESTMENT_CURRENT_ASSESSMENT.headlineMetrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-background/80 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{m.value}</p>
                {m.sub ? <p className="mt-0.5 text-xs text-muted-foreground">{m.sub}</p> : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RATINGS & SCORING */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-2">RATINGS & SCORING</p>

      {cc(
        "scorecard",
        "INVESTMENT SCORECARD",
        <BarChart3 className="h-4 w-4 text-muted-foreground" />,
        <Badge className={cn("text-[10px] font-bold", gradeColors[scoreOverall])}>Overall: {scoreOverall}</Badge>,
        <div className="space-y-4">
          {SCORECARD.map((item) => (
            <div key={item.category} className="space-y-2 border-b border-border/50 pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{item.category}</span>
                <Badge className={cn("text-[10px] font-bold w-9 justify-center", gradeColors[item.grade])}>{item.grade}</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.assessment}</p>
              {item.details.length > 0 ? (
                <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {item.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground/80">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {d}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {cc(
        "ecosystem",
        ECOSYSTEM_HEALTH.title,
        <Sparkles className="h-4 w-4 text-muted-foreground" />,
        <Badge className={cn("text-[10px] font-bold", gradeColors[ECOSYSTEM_HEALTH.overallGrade])}>
          {ECOSYSTEM_HEALTH.overallGrade}
        </Badge>,
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{ECOSYSTEM_HEALTH.description}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ECOSYSTEM_HEALTH.metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{m.value}</p>
                <div className="mt-1 flex items-center gap-1">
                  <CheckCircle2 className={cn("h-3 w-3", statusColors[m.status])} />
                  <span className={cn("text-[10px] font-medium", statusColors[m.status])}>{m.statusLabel}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{ECOSYSTEM_HEALTH.commentary}</p>
          </div>
        </div>
      )}

      {/* INVESTMENT THESIS */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-4">INVESTMENT THESIS</p>

      {cc(
        "summary",
        "INVESTMENT SUMMARY",
        <Info className="h-4 w-4 text-muted-foreground" />,
        undefined,
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">{INVESTMENT_SUMMARY_WHATS_NEW_TITLE}</p>
            <ul className="space-y-1.5">
              {INVESTMENT_SUMMARY_WHATS_NEW_BULLETS.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{INVESTMENT_SUMMARY_HEADLINE}</p>
          <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3">
            {INVESTMENT_SUMMARY_CLOSING_QUOTE}
          </p>
        </div>
      )}

      {cc(
        "growth",
        "GROWTH DRIVERS",
        <TrendingUp className="h-4 w-4 text-muted-foreground" />,
        undefined,
        <div className="space-y-4">
          {GROWTH_DRIVERS.map((g) => (
            <div key={g.driver} className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{g.driver}</span>
                <Badge className={cn("text-[10px] font-semibold", growthImpactColors[g.impactLevel])}>{g.impactLevel}</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{g.description}</p>
            </div>
          ))}
        </div>
      )}

      {cc(
        "moat",
        "COMPETITIVE MOAT",
        <Swords className="h-4 w-4 text-muted-foreground" />,
        undefined,
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">MOAT SOURCES</p>
            <ul className="space-y-3">
              {COMPETITIVE_MOAT_SOURCES.map((s) => (
                <li key={s.name} className="rounded-md border border-border/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                    <span className={cn("text-xs font-semibold", moatStrengthColors[s.strength] ?? "")}>{s.strength}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{COMPETITIVE_MOAT_SOURCES_DETAIL[s.name]}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">COMPETITIVE THREATS</p>
            <ul className="space-y-3">
              {COMPETITIVE_THREATS.map((t) => (
                <li key={t.name} className="rounded-md border border-border/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <span className={cn("text-xs font-semibold", moatStrengthColors[t.level] ?? "")}>{t.level}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{COMPETITIVE_THREATS_DETAIL[t.name]}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{MOAT_DURABILITY}</p>
          </div>
        </div>
      )}

      {/* RISK ASSESSMENT */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-4">RISK ASSESSMENT</p>

      {cc(
        "riskmatrix",
        "RISK MATRIX",
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
        <Badge variant="secondary" className="text-[10px]">
          {RISK_MATRIX.length} risks
        </Badge>,
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Risk", "Severity", "Likelihood", "Mitigation"].map((h) => (
                  <th key={h} className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {RISK_MATRIX.map((r, i) => (
                <tr key={i} className="hover:bg-muted/50 align-top">
                  <td className="py-2.5 pr-3 text-xs font-medium text-foreground">{r.risk}</td>
                  <td className="py-2.5 pr-3">
                    <Badge className={cn("text-[10px]", severityColors[r.severity])}>{r.severity}</Badge>
                  </td>
                  <td className="py-2.5 pr-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {likelihoodLabel(r.likelihood)}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cc(
        "strategic",
        "RISKS & STRATEGIC ASSESSMENT",
        <Shield className="h-4 w-4 text-muted-foreground" />,
        undefined,
        <div className="space-y-6">
          <p className="text-sm font-medium text-foreground">{STRATEGIC_ASSESSMENT_INTRO}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">RISK EVALUATION — FOUR PERSPECTIVES</p>
            <div className="space-y-5">
              {STRATEGIC_PERSPECTIVES.map((p) => (
                <div key={p.title} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-bold text-foreground">{p.title}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mt-0.5 mb-2">{p.subtitle}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">KEY STRATEGIC QUESTIONS</p>
            <div className="space-y-5">
              {KEY_STRATEGIC_QUESTIONS.map((q) => (
                <div key={q.question} className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">{q.question}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{q.theCase}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{q.hesitation}</p>
                  {q.verdict ? (
                    <p className="text-xs font-medium text-foreground leading-relaxed whitespace-pre-wrap">{q.verdict}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Ecosystem-Based Triggers</p>
            <p className="text-xs text-muted-foreground mb-3">{ECOSYSTEM_TRIGGERS_INTRO}</p>
            <div className="grid gap-4 md:grid-cols-3">
              {ECOSYSTEM_TRIGGER_COLUMNS.map((col) => (
                <div key={col.title} className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-foreground mb-2">{col.title}</p>
                  <ul className="space-y-1">
                    {col.lines.map((line, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {cc(
        "position",
        "POSITION SIZING & PRICE TARGETS",
        <Target className="h-4 w-4 text-muted-foreground" />,
        undefined,
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">{POSITION_SIZING_ALLOCATION_INTRO}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/50">
                  {POSITION_SIZING_ALLOCATION_ROWS.map((row) => (
                    <tr key={row.profile} className="hover:bg-muted/50">
                      <td className="py-2 pr-3 text-xs font-medium text-foreground">{row.profile}</td>
                      <td className="py-2 text-xs tabular-nums text-muted-foreground">{row.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">{POSITION_SIZING_ZONES_TITLE}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/50">
                  {POSITION_SIZING_ZONES.map((z) => (
                    <tr key={z.navRange} className="hover:bg-muted/50">
                      <td className="py-2 pr-3 text-xs font-medium text-foreground">{z.navRange}</td>
                      <td className="py-2 text-xs text-muted-foreground">{z.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">{POSITION_SIZING_PORTFOLIO_TITLE}</p>
            <ul className="space-y-2">
              {POSITION_SIZING_PORTFOLIO_LINES.map((line, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          {POSITION_SIZING.priceTargets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {["Scenario", "ETH Price", "NAV Premium", "Implied Price", "Upside"].map((h) => (
                      <th key={h} className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {POSITION_SIZING.priceTargets.map((pt) => (
                    <tr key={pt.scenario} className="hover:bg-muted/50">
                      <td className="py-2 text-xs font-medium text-foreground">{pt.scenario}</td>
                      <td className="py-2 text-xs tabular-nums text-muted-foreground">${pt.ethPrice.toLocaleString()}</td>
                      <td className="py-2 text-xs tabular-nums text-muted-foreground">{pt.navPremium.toFixed(1)}x</td>
                      <td className="py-2 text-xs tabular-nums font-medium text-foreground">${pt.impliedPrice.toFixed(2)}</td>
                      <td
                        className={cn(
                          "py-2 text-xs tabular-nums font-medium",
                          pt.upside >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {pt.upside >= 0 ? "+" : ""}
                        {pt.upside}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {POSITION_SIZING.notes ? <p className="text-[10px] text-muted-foreground/70">{POSITION_SIZING.notes}</p> : null}
        </div>
      )}

      {/* HISTORICAL ANALYSIS */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-4">HISTORICAL ANALYSIS</p>

      {cc(
        "archive",
        `ANALYSIS ARCHIVE (${ANALYSIS_ARCHIVE.length} ENTRIES)`,
        <Archive className="h-4 w-4 text-muted-foreground" />,
        undefined,
        ANALYSIS_ARCHIVE.length === 0 ? (
          <p className="text-xs text-muted-foreground">No archived analysis entries yet.</p>
        ) : (
          <div className="space-y-3">
            {ANALYSIS_ARCHIVE.map((entry, i) => (
              <div key={`${entry.date}-${i}`} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">{entry.title}</span>
                  <Badge variant="secondary" className="text-[10px] tabular-nums shrink-0">
                    {entry.date}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{entry.summary}</p>
                <p className="mt-1 text-[10px] font-medium text-foreground">{entry.verdict}</p>
              </div>
            ))}
          </div>
        )
      )}

      {/* CFA glossary */}
      <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">{CFA_INVESTMENT_GLOSSARY_TITLE}</p>
        </div>
        <ul className="space-y-3">
          {CFA_INVESTMENT_GLOSSARY.map((item) => (
            <li key={item.term} className="text-xs">
              <span className="font-semibold text-foreground">{item.term}:</span>{" "}
              <span className="text-muted-foreground leading-relaxed">{item.definition}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-[10px] text-muted-foreground pb-4">{INVESTMENT_TAB_FOOTNOTE}</p>
    </div>
  );
}
