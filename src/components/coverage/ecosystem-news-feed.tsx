"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ECOSYSTEM_NEWS } from "@/data/coverage/bmnr-ecosystem-news";
import type { EcosystemNewsItem } from "@/data/coverage/bmnr-ecosystem-news";
import {
  Newspaper,
  Filter,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Minus,
  Building2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "enterprise", label: "Enterprise" },
  { value: "institutional", label: "Institutional" },
  { value: "defi", label: "DeFi" },
  { value: "l2", label: "L2" },
  { value: "protocol", label: "Protocol" },
  { value: "regulatory", label: "Regulatory" },
  { value: "product", label: "Product" },
] as const;

const categoryColors: Record<string, string> = {
  enterprise: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  institutional: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  defi: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  l2: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  protocol: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  regulatory: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  product: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  ecosystem: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
};

const sentimentConfig = {
  bullish: { label: "+ Bullish", color: "text-emerald-600 dark:text-emerald-400" },
  neutral: { label: "~ Neutral", color: "text-gray-500 dark:text-gray-400" },
  bearish: { label: "- Bearish", color: "text-red-600 dark:text-red-400" },
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function EcosystemNewsFeed() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(10);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Derive company list with counts
  const companyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of ECOSYSTEM_NEWS) {
      const co = item.company.split(" / ")[0].split(" (")[0];
      counts[co] = (counts[co] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count >= 2);
  }, []);

  // Filter
  const filtered = useMemo(() => {
    let items = ECOSYSTEM_NEWS;
    if (categoryFilter !== "all") {
      items = items.filter((i) => i.category === categoryFilter);
    }
    if (companyFilter) {
      items = items.filter((i) => i.company.includes(companyFilter));
    }
    return items;
  }, [categoryFilter, companyFilter]);

  const visible = filtered.slice(0, showCount);

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Ecosystem Intelligence</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Track news about the ETH ecosystem — institutional adoption, stablecoin launches, L2 growth, protocol upgrades, and enterprise partnerships
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-4 space-y-4">
        {/* Company filter pills (top companies) */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <button
              onClick={() => { setCompanyFilter(null); setShowCount(10); }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                !companyFilter ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              All ({ECOSYSTEM_NEWS.length})
            </button>
            {companyCounts.slice(0, 15).map(([company, count]) => (
              <button
                key={company}
                onClick={() => { setCompanyFilter(companyFilter === company ? null : company); setShowCount(10); }}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  companyFilter === company ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {company} ({count})
              </button>
            ))}
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {CATEGORY_FILTERS.map((f) => {
              const count = f.value === "all"
                ? ECOSYSTEM_NEWS.length
                : ECOSYSTEM_NEWS.filter((i) => i.category === f.value).length;
              if (count === 0 && f.value !== "all") return null;
              return (
                <button
                  key={f.value}
                  onClick={() => { setCategoryFilter(f.value); setShowCount(10); }}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    categoryFilter === f.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* News items */}
        <div className="space-y-3">
          {visible.map((item, idx) => {
            const isExpanded = expandedIdx === idx;
            const sent = sentimentConfig[item.sentiment];

            return (
              <div
                key={`${item.date}-${idx}`}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/20"
              >
                <div className="space-y-2">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs tabular-nums text-muted-foreground">{item.date}</span>
                      <Badge className={cn("text-[10px]", categoryColors[item.category])}>
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">{item.company}</span>
                    </div>
                    <span className={cn("shrink-0 text-xs font-medium", sent.color)}>{sent.label}</span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-medium leading-snug text-foreground">{item.title}</h4>

                  {/* Summary (always visible) */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isExpanded ? item.summary : item.summary.length > 200 ? item.summary.slice(0, 200) + "..." : item.summary}
                  </p>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="space-y-2 border-t border-border pt-2">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Significance for Ethereum</p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.significance}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">BMNR Implication</p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.bmnrImplication}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60">Source: {item.source}</p>
                    </div>
                  )}

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more */}
        {filtered.length > showCount && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount((c) => c + 10)}
            >
              Show more ({filtered.length - showCount} remaining)
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
        {showCount > 10 && showCount >= filtered.length && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount(10)}
            >
              Show less
              <ChevronUp className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
