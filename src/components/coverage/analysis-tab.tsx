"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import {
  ECOSYSTEM_HEALTH,
  SCORECARD,
  INVESTMENT_SUMMARY,
  GROWTH_DRIVERS,
  COMPETITIVE_MOAT,
  RISK_MATRIX,
  STRATEGIC_ASSESSMENT,
  POSITION_SIZING,
  ANALYSIS_ARCHIVE,
} from "@/data/coverage/bmnr";
import type { LetterGrade, RiskItem } from "@/data/coverage/bmnr";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Grade colors
// ---------------------------------------------------------------------------

const gradeColors: Record<LetterGrade, string> = {
  A: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
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

const impactColors: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

function CollapsibleCard({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
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
  if (!isEthTreasury(ticker)) return <p className="text-sm text-muted-foreground">No analysis data.</p>;

  const overallGrade = SCORECARD.reduce(
    (acc, s) => {
      const gradeValue = { A: 4, B: 3, C: 2, D: 1, F: 0 }[s.grade];
      return { sum: acc.sum + gradeValue * s.weight, totalWeight: acc.totalWeight + s.weight };
    },
    { sum: 0, totalWeight: 0 }
  );
  const avgGradeNum = overallGrade.sum / overallGrade.totalWeight;
  const avgGrade: LetterGrade = avgGradeNum >= 3.5 ? "A" : avgGradeNum >= 2.5 ? "B" : avgGradeNum >= 1.5 ? "C" : avgGradeNum >= 0.5 ? "D" : "F";

  return (
    <div className="space-y-4">
      {/* ================================================================== */}
      {/* RATINGS & SCORING                                                  */}
      {/* ================================================================== */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-2">
        Ratings & Scoring
      </p>

      {/* Ecosystem Health */}
      <CollapsibleCard
        title={ECOSYSTEM_HEALTH.title}
        icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
        badge={<Badge className={cn("text-[10px] font-bold", gradeColors[ECOSYSTEM_HEALTH.overallGrade])}>{ECOSYSTEM_HEALTH.overallGrade}</Badge>}
        defaultOpen
      >
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
      </CollapsibleCard>

      {/* Investment Scorecard */}
      <CollapsibleCard
        title="Investment Scorecard"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        badge={<Badge className={cn("text-[10px] font-bold", gradeColors[avgGrade])}>Overall: {avgGrade}</Badge>}
        defaultOpen
      >
        <div className="space-y-4">
          {SCORECARD.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-[10px] font-bold w-6 justify-center", gradeColors[item.grade])}>{item.grade}</Badge>
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <span className="text-[10px] text-muted-foreground/60">{item.weight}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{item.assessment}</p>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {item.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground/80">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* ================================================================== */}
      {/* INVESTMENT THESIS                                                  */}
      {/* ================================================================== */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-4">
        Investment Thesis
      </p>

      {/* Investment Summary */}
      <CollapsibleCard
        title="Investment Summary"
        icon={<Info className="h-4 w-4 text-muted-foreground" />}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{INVESTMENT_SUMMARY}</p>
      </CollapsibleCard>

      {/* Growth Drivers */}
      <CollapsibleCard
        title="Growth Drivers"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="space-y-4">
          {GROWTH_DRIVERS.map((g) => (
            <div key={g.driver} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{g.driver}</span>
                <Badge className={cn("text-[10px]", impactColors[g.impact])}>{g.impact} impact</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{g.description}</p>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Competitive Moat */}
      <CollapsibleCard
        title="Competitive Moat"
        icon={<Swords className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <p className="text-xs font-medium text-foreground">{COMPETITIVE_MOAT.moatType}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Strengths</p>
              <ul className="space-y-1.5">
                {COMPETITIVE_MOAT.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-red-600 dark:text-red-400">Weaknesses</p>
              <ul className="space-y-1.5">
                {COMPETITIVE_MOAT.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-[10px] font-medium text-muted-foreground mb-1">vs ETH ETFs</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{COMPETITIVE_MOAT.vsETFs}</p>
          </div>
        </div>
      </CollapsibleCard>

      {/* ================================================================== */}
      {/* RISK ASSESSMENT                                                    */}
      {/* ================================================================== */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-4">
        Risk Assessment
      </p>

      {/* Risk Matrix */}
      <CollapsibleCard
        title="Risk Matrix"
        icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        badge={<Badge variant="secondary" className="text-[10px]">{RISK_MATRIX.length} risks</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Risk", "Severity", "Likelihood", "Mitigation"].map((h) => (
                  <th key={h} className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {RISK_MATRIX.map((r, i) => (
                <tr key={i} className="hover:bg-muted/50">
                  <td className="py-2.5 pr-3 text-xs font-medium text-foreground">{r.risk}</td>
                  <td className="py-2.5 pr-3">
                    <Badge className={cn("text-[10px]", severityColors[r.severity])}>{r.severity}</Badge>
                  </td>
                  <td className="py-2.5 pr-3">
                    <Badge variant="secondary" className="text-[10px]">{r.likelihood}</Badge>
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      {/* Strategic Assessment */}
      <CollapsibleCard
        title="Risks & Strategic Assessment"
        icon={<Shield className="h-4 w-4 text-muted-foreground" />}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{STRATEGIC_ASSESSMENT}</p>
      </CollapsibleCard>

      {/* Position Sizing & Price Targets */}
      <CollapsibleCard
        title="Position Sizing & Price Targets"
        icon={<Target className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-xs font-medium text-foreground">{POSITION_SIZING.recommendation}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["Scenario", "ETH Price", "NAV Premium", "Implied Price", "Upside"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
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
                    <td className={cn("py-2 text-xs tabular-nums font-medium", pt.upside >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {pt.upside >= 0 ? "+" : ""}{pt.upside}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-muted-foreground/70">{POSITION_SIZING.notes}</p>
        </div>
      </CollapsibleCard>

      {/* ================================================================== */}
      {/* HISTORICAL ANALYSIS                                                */}
      {/* ================================================================== */}
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 pt-4">
        Historical Analysis
      </p>

      <CollapsibleCard
        title={`Analysis Archive (${ANALYSIS_ARCHIVE.length} entries)`}
        icon={<Archive className="h-4 w-4 text-muted-foreground" />}
      >
        {ANALYSIS_ARCHIVE.length === 0 ? (
          <p className="text-xs text-muted-foreground">No archived analysis entries yet. Each coverage update will create a dated snapshot here.</p>
        ) : (
          <div className="space-y-3">
            {ANALYSIS_ARCHIVE.map((entry, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{entry.title}</span>
                  <Badge variant="secondary" className="text-[10px] tabular-nums">{entry.date}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{entry.summary}</p>
                <p className="mt-1 text-[10px] font-medium">{entry.verdict}</p>
              </div>
            ))}
          </div>
        )}
      </CollapsibleCard>
    </div>
  );
}
