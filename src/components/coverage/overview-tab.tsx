"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { OVERVIEW } from "@/data/coverage/bmnr";
import type { OverviewMetric, CasePoint } from "@/data/coverage/bmnr";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Metric formatting
// ---------------------------------------------------------------------------

function formatMetricValue(metric: OverviewMetric): string {
  const v = metric.value;
  if (typeof v === "string") return v;

  switch (metric.format) {
    case "currency":
      if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
      if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
      if (Math.abs(v) < 1) return `$${v.toFixed(4)}`;
      return formatCurrency(v);
    case "percent":
      return `${(v * 100).toFixed(v >= 0 ? 2 : 1)}%`;
    case "number":
      if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
      if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
      if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
      return v.toLocaleString();
    case "eth":
      if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
      if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
      return v.toLocaleString();
    case "multiplier":
      return `${v.toFixed(2)}x`;
    case "text":
      return String(v);
    default:
      return typeof v === "number" ? v.toLocaleString() : String(v);
  }
}

// ---------------------------------------------------------------------------
// Collapsible section
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
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

export function OverviewTab({ ticker }: { ticker: string }) {
  const data = ticker === "BMNR" ? OVERVIEW : null;
  if (!data) return <p className="text-sm text-muted-foreground">No overview data.</p>;

  return (
    <div className="space-y-4">
      {/* Thesis */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.thesis}</p>
        </CardContent>
      </Card>

      {/* Bull Case */}
      <CaseSection
        title="Bull Case"
        points={data.bullCase}
        variant="bull"
      />

      {/* Bear Case */}
      <CaseSection
        title="Bear Case"
        points={data.bearCase}
        variant="bear"
      />

      {/* Metrics Table */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Metric
                  </th>
                  <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Value
                  </th>
                  <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground pl-4">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.metrics.map((metric) => {
                  const isNegative =
                    typeof metric.value === "number" && metric.value < 0;
                  const isPercent = metric.format === "percent";
                  return (
                    <tr
                      key={metric.label}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="py-2.5 text-xs font-medium text-foreground">
                        {metric.label}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 text-right text-sm font-semibold tabular-nums",
                          isPercent && isNegative
                            ? "text-red-600 dark:text-red-400"
                            : isPercent && !isNegative
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                        )}
                      >
                        {formatMetricValue(metric)}
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground pl-4">
                        {metric.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bull / Bear Case Section
// ---------------------------------------------------------------------------

function CaseSection({
  title,
  points,
  variant,
}: {
  title: string;
  points: CasePoint[];
  variant: "bull" | "bear";
}) {
  const isBull = variant === "bull";

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          {isBull ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <CardTitle
            className={cn(
              "text-sm font-medium",
              isBull
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            )}
          >
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3">
        <div className="space-y-2.5">
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  isBull
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                )}
              >
                {isBull ? (
                  <Plus className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Minus className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  {p.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {" — "}
                  {p.detail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
