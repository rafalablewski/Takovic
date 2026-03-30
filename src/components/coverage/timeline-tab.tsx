"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { TIMELINE_EVENTS, TIMELINE_DESCRIPTION } from "@/data/coverage/bmnr";
import type { TimelineEvent } from "@/data/coverage/bmnr";
import {
  Clock,
  FileText,
  ShoppingCart,
  Building,
  Flag,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  filing: { icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Filing" },
  purchase: { icon: ShoppingCart, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Purchase" },
  corporate: { icon: Building, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30", label: "Corporate" },
  milestone: { icon: Flag, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Milestone" },
  market: { icon: TrendingUp, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800", label: "Market" },
};

const FILTER_TYPES = [
  { value: "all", label: "All" },
  { value: "filing", label: "Filings" },
  { value: "purchase", label: "Purchases" },
  { value: "corporate", label: "Corporate" },
  { value: "milestone", label: "Milestones" },
  { value: "market", label: "Market" },
];

export function TimelineTab({ ticker }: { ticker: string }) {
  const [filterType, setFilterType] = useState("all");
  const [showAll, setShowAll] = useState(false);

  if (!isEthTreasury(ticker)) return <p className="text-sm text-muted-foreground">No timeline data.</p>;

  // Reverse chronological
  const sorted = [...TIMELINE_EVENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = filterType === "all" ? sorted : sorted.filter((e) => e.type === filterType);
  const visible = showAll ? filtered : filtered.slice(0, 12);

  return (
    <div className="space-y-4">
      {/* Description */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{TIMELINE_DESCRIPTION}</p>
        </CardContent>
      </Card>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {FILTER_TYPES.map((ft) => {
          const count = ft.value === "all" ? sorted.length : sorted.filter((e) => e.type === ft.value).length;
          if (count === 0 && ft.value !== "all") return null;
          return (
            <button
              key={ft.value}
              onClick={() => { setFilterType(ft.value); setShowAll(false); }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filterType === ft.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {ft.label}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-5">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-0">
              {visible.map((event, idx) => {
                const config = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.market;
                const Icon = config.icon;

                return (
                  <div key={`${event.date}-${idx}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Dot */}
                    <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs tabular-nums text-muted-foreground">{formatDate(event.date)}</span>
                        <Badge className={cn("text-[10px]", config.bg, config.color)}>{config.label}</Badge>
                        {event.source && (
                          <Badge variant="secondary" className="text-[9px]">{event.source}</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{event.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {filtered.length > 12 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show all ${filtered.length} events`}
                {showAll ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
