"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { importCoverageTickerModule } from "@/lib/coverage/import-coverage-module";
import { buildBmnrEthCorrelationMetrics } from "@/lib/coverage/bmnr-overview-live-metrics";
import { toNormalizedLiveQuotes } from "@/lib/coverage/normalize-live-quotes";
import type { LiveQuotesPayload, NormalizedLiveQuotesPayload } from "@/types/coverage";
import type {
  EthereumIntelligence,
  ValueAccrualStep,
  RoadmapMilestone,
} from "@/data/coverage/bmnr-ethereum";
import { EcosystemNewsFeed } from "@/components/coverage/ecosystem-news-feed";
import { CoverageSectionCollapsible } from "@/components/coverage/coverage-section-collapsible";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Coins,
  Building2,
  BookOpen,
  Milestone,
  Quote,
  Zap,
  GraduationCap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Roadmap status styling
// ---------------------------------------------------------------------------

const roadmapStatus: Record<string, string> = {
  complete: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  development: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  research: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

type EthereumIntelState =
  | { status: "loading" }
  | { status: "ready"; data: EthereumIntelligence }
  | { status: "empty" };

function isEthereumIntelligenceShape(x: unknown): boolean {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.description === "string" &&
    o.correlation != null &&
    typeof o.correlation === "object" &&
    o.networkMetrics != null &&
    typeof o.networkMetrics === "object"
  );
}

export function EthereumTab({ ticker }: { ticker: string }) {
  const [state, setState] = useState<EthereumIntelState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const lower = ticker.toLowerCase();
    setState({ status: "loading" });
    importCoverageTickerModule(lower)
      .then((mod) => {
        if (cancelled) return;
        const raw = mod.ETHEREUM_INTELLIGENCE;
        if (isEthereumIntelligenceShape(raw)) {
          setState({ status: "ready", data: raw as EthereumIntelligence });
        } else {
          setState({ status: "empty" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "empty" });
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (state.status === "loading") {
    return <p className="text-sm text-muted-foreground">Loading Ethereum intelligence…</p>;
  }
  if (state.status === "empty") {
    return <p className="text-sm text-muted-foreground">No Ethereum intelligence for this coverage.</p>;
  }

  return <EthereumTabContent data={state.data} ticker={ticker} />;
}

function EthereumTabContent({
  data,
  ticker,
}: {
  data: EthereumIntelligence;
  ticker: string;
}) {
  const upper = ticker.toUpperCase();
  const isBmnr = upper === "BMNR";
  const [liveQuotes, setLiveQuotes] = useState<NormalizedLiveQuotesPayload | null>(null);

  useEffect(() => {
    if (!isBmnr) {
      setLiveQuotes(null);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/coverage/${encodeURIComponent(upper)}/live-quotes`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = (await res.json()) as LiveQuotesPayload;
        if (!cancelled) setLiveQuotes(toNormalizedLiveQuotes(json, upper));
      } catch {
        /* static correlation metrics */
      }
    }

    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [upper, isBmnr]);

  const correlationMetrics = useMemo(() => {
    if (!isBmnr || !liveQuotes) return data.correlation.metrics;
    return buildBmnrEthCorrelationMetrics(
      liveQuotes.stock?.price ?? null,
      liveQuotes.eth?.price ?? null
    );
  }, [isBmnr, liveQuotes, data.correlation.metrics]);

  return (
    <div className="space-y-4">
      {/* Description */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
        </CardContent>
      </Card>

      {/* ---- BMNR ↔ ETH Correlation ---- */}
      <CoverageSectionCollapsible
        title="BMNR ↔ ETH Correlation"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        defaultOpen
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{data.correlation.headline}</p>
          {isBmnr ? (
            <p className="text-[10px] text-muted-foreground/80">
              {liveQuotes
                ? "Figures use live Yahoo quotes for BMNR and ETH-USD (same as Overview), with holdings from the PR snapshot."
                : "Loading live quotes… showing filing-era figures until data arrives."}
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {correlationMetrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground/70">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </CoverageSectionCollapsible>

      {/* ---- Ethereum Network Metrics ---- */}
      <CoverageSectionCollapsible
        title="Ethereum Network Metrics"
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        defaultOpen
      >
        <div className="space-y-4">
          {/* Headlines */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.networkMetrics.headlines.map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-2xl font-semibold tabular-nums text-foreground">{m.value}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 border-t border-border pt-4">
            {data.networkMetrics.details.map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <span className="text-sm font-medium tabular-nums text-foreground">{m.value}</span>
              </div>
            ))}
          </div>

          {/* Why it matters */}
          <div className="rounded-md bg-muted/40 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Why This Matters for BMNR</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{data.networkMetrics.whyItMatters}</p>
          </div>
        </div>
      </CoverageSectionCollapsible>

      {/* ---- Institutional Flows (ETH ETFs) ---- */}
      <CoverageSectionCollapsible
        title="Institutional Flows (ETH ETFs)"
        icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{data.etfFlows.totalAUM}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total ETF AUM</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{data.etfFlows.weeklyNetFlows}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">7-Day Net Flows</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["Fund", "AUM", "Change"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.etfFlows.funds.map((f) => (
                  <tr key={f.fund} className="hover:bg-muted/50">
                    <td className="py-2 text-xs font-medium text-foreground">{f.fund}</td>
                    <td className="py-2 text-xs tabular-nums text-muted-foreground">{f.aum}</td>
                    <td className={cn("py-2 text-xs tabular-nums font-medium", f.changePositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {f.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CoverageSectionCollapsible>

      {/* ---- Thesis Framework ---- */}
      <CoverageSectionCollapsible
        title="Institutional Adoption Thesis"
        icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="space-y-4">
          {/* Quote */}
          <div className="flex items-start gap-2 rounded-md bg-muted/40 p-4 border-l-2 border-primary">
            <Quote className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-sm italic text-muted-foreground leading-relaxed">{data.thesisQuote}</p>
          </div>

          {data.thesisSections.map((s) => (
            <div key={s.title} className="space-y-1">
              <p className="text-sm font-medium text-foreground">{s.emoji} {s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </CoverageSectionCollapsible>

      {/* ---- Value Accrual Mechanics ---- */}
      <CoverageSectionCollapsible
        title="Value Accrual Mechanics"
        icon={<Zap className="h-4 w-4 text-muted-foreground" />}
        badge={<Badge variant="secondary" className="text-[10px]">{data.valueAccrualSteps.length} steps</Badge>}
      >
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">{data.valueAccrualIntro}</p>

          {data.valueAccrualSteps.map((step) => (
            <ValueAccrualCard key={step.step} step={step} />
          ))}

          {/* Investment case quote */}
          <div className="rounded-md bg-muted/40 p-4 border-l-2 border-emerald-500">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">The Investment Case</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{data.investmentCaseQuote}</p>
          </div>
        </div>
      </CoverageSectionCollapsible>

      {/* ---- Protocol Roadmap ---- */}
      <CoverageSectionCollapsible
        title="Ethereum Protocol Roadmap"
        icon={<Milestone className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="space-y-3">
          {data.roadmap.map((m) => (
            <RoadmapRow key={m.name} milestone={m} />
          ))}
        </div>
      </CoverageSectionCollapsible>

      {/* ---- Ecosystem Intelligence News Feed ---- */}
      <EcosystemNewsFeed ticker={ticker} />

      {/* ---- CFA Notes ---- */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Ethereum Fundamentals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="space-y-2.5">
            {data.cfaNotes.map((note, i) => {
              const [title, ...rest] = note.split(": ");
              return (
                <div key={i} className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">{title}:</span> {rest.join(": ")}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ValueAccrualCard({ step }: { step: ValueAccrualStep }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] tabular-nums">{step.step}</Badge>
        <span className="text-sm font-medium text-foreground">{step.title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{step.description}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {step.sections.map((s) => (
          <div key={s.heading}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{s.heading}</p>
            <ul className="space-y-1">
              {s.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-md bg-muted/30 px-3 py-2">
        <code className="text-[10px] text-muted-foreground font-mono leading-relaxed">{step.formula}</code>
      </div>
    </div>
  );
}

function RoadmapRow({ milestone }: { milestone: RoadmapMilestone }) {
  return (
    <div className="flex items-start gap-3">
      <Badge className={cn("shrink-0 text-[10px]", roadmapStatus[milestone.status])}>
        {milestone.status === "complete" ? "Complete" : milestone.status === "development" ? "Dev" : "Research"}
      </Badge>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{milestone.name}</span>
          <span className="text-xs tabular-nums text-muted-foreground">{milestone.date}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{milestone.description}</p>
      </div>
    </div>
  );
}
