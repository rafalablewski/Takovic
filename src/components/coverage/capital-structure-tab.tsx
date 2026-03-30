"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatLargeNumber } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { CAPITAL_STRUCTURE } from "@/data/coverage/bmnr";
import type { CapitalMetric } from "@/data/coverage/bmnr";
import {
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Banknote,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function fmtHeadline(m: CapitalMetric): string {
  const v = m.value;
  if (typeof v === "string") return v;
  switch (m.format) {
    case "currency":
      if (Math.abs(v) >= 1e6) return formatLargeNumber(v, { prefix: "$", decimals: Math.abs(v) >= 1e9 ? 2 : 1 });
      return `$${v.toLocaleString()}`;
    case "number":
      if (Math.abs(v) >= 1e6) return formatLargeNumber(v, { decimals: Math.abs(v) >= 1e9 ? 2 : 1 });
      return v.toLocaleString();
    case "percent":
      return `${(v * 100).toFixed(1)}%`;
    default:
      return String(v);
  }
}

// ---------------------------------------------------------------------------
// Collapsible
// ---------------------------------------------------------------------------

function Collapsible({
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

export function CapitalStructureTab({ ticker }: { ticker: string }) {
  const data = isEthTreasury(ticker) ? CAPITAL_STRUCTURE : null;
  if (!data) return <p className="text-sm text-muted-foreground">No capital structure data.</p>;

  return (
    <div className="space-y-4">
      {/* Description */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
        </CardContent>
      </Card>

      {/* Key Metrics — Capital Summary */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Capital Summary</span>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-4 space-y-5">
          {/* Headline numbers */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.headlines.map((h) => (
              <div key={h.label} className="text-center">
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {fmtHeadline(h)}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {h.label}
                </p>
              </div>
            ))}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 border-t border-border pt-4">
            {data.info.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium tabular-nums text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capital Structure summary */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Capital Structure</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      {/* Share Structure */}
      <Collapsible
        title="Share Structure"
        icon={<Layers className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCell label="Share Class" value={data.shareClass} />
          <MetricCell label="Outstanding" value={fmtNum(data.sharesOutstanding)} />
          <MetricCell label="Fully Diluted" value={fmtNum(data.fullyDiluted)} />
          <MetricCell label="Authorized" value={fmtNum(data.sharesAuthorized)} />
        </div>
      </Collapsible>

      {/* ATM Program */}
      <Collapsible
        title="ATM Program"
        icon={<Banknote className="h-4 w-4 text-muted-foreground" />}
        badge={data.atmProgram.active ? <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px]">Active</Badge> : undefined}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{data.atmProgram.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <MetricCell label="Facility" value={data.atmProgram.facility} />
            <MetricCell label="Usage" value={data.atmProgram.usage} />
          </div>
        </div>
      </Collapsible>

      {/* Convertible Notes */}
      <Collapsible
        title="Convertible Notes"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        badge={data.convertibleNotes.active ? <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-[10px]">Active</Badge> : undefined}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{data.convertibleNotes.description}</p>
          <p className="text-xs text-muted-foreground">{data.convertibleNotes.detail}</p>
        </div>
      </Collapsible>

      {/* Registered Directs */}
      <Collapsible
        title="Registered Directs"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        badge={data.registeredDirects.active ? <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px]">Active</Badge> : undefined}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{data.registeredDirects.description}</p>
          <MetricCell label="Frequency" value={data.registeredDirects.frequency} />
        </div>
      </Collapsible>

      {/* Warrants */}
      <Collapsible
        title="Warrants"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{data.warrants.description}</p>
          <MetricCell label="Estimated Dilution" value={data.warrants.estimatedDilution} />
        </div>
      </Collapsible>

      {/* Dilution Analysis */}
      <Collapsible
        title="Dilution Analysis"
        icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
      >
        <div className="space-y-3">
          <MetricCell label="Annual Dilution Rate" value={data.dilutionAnalysis.annualRate} highlight="amber" />
          <div className="rounded-md bg-muted/40 p-3 space-y-1.5">
            <p className="text-xs">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Bull case: </span>
              <span className="text-muted-foreground">{data.dilutionAnalysis.mitigant}</span>
            </p>
            <p className="text-xs">
              <span className="font-medium text-red-600 dark:text-red-400">Bear case: </span>
              <span className="text-muted-foreground">{data.dilutionAnalysis.riskScenario}</span>
            </p>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function MetricCell({ label, value, highlight }: { label: string; value: string; highlight?: "amber" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-0.5 text-sm font-medium",
        highlight === "amber" ? "text-amber-600 dark:text-amber-400" : "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}

function fmtNum(n: number): string {
  if (n >= 1e6) return formatLargeNumber(n, { decimals: n >= 1e9 ? 2 : 1 });
  return n.toLocaleString();
}
