"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  CompetitorNewsItem,
  CompetitorNewsBucket,
  CompetitorNewsStoryCategory,
} from "@/types/coverage";
import {
  Newspaper,
  Filter,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Filters & styling — aligned with `ecosystem-news-feed.tsx`
// ---------------------------------------------------------------------------

const COMPETITOR_ORDER: readonly CompetitorNewsBucket[] = [
  "riot",
  "coinbase",
  "cleanspark",
  "ethzilla",
  "kraken",
  "marathon",
  "miscellaneous",
  "strategy",
] as const;

const COMPETITOR_LABELS: Record<CompetitorNewsBucket, string> = {
  riot: "Riot",
  coinbase: "Coinbase",
  cleanspark: "CleanSpark",
  ethzilla: "ETHZilla",
  kraken: "Kraken",
  marathon: "Marathon Digital",
  miscellaneous: "Miscellaneous",
  strategy: "Strategy",
};

const CATEGORY_ORDER: readonly CompetitorNewsStoryCategory[] = [
  "Partnership",
  "Technology",
  "Yield",
  "Strategy",
  "Regulatory",
  "Financial",
  "Acquisition",
  "Funding",
] as const;

const categoryColors: Record<CompetitorNewsStoryCategory, string> = {
  Partnership:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Technology:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  Yield:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Strategy:
    "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  Regulatory:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  Financial:
    "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  Acquisition:
    "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  Funding:
    "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
};

/** Same tone as ecosystem `sentimentConfig`; labels match comps implication copy */
const implicationPresentation: Record<
  CompetitorNewsItem["implication"],
  { label: string; color: string }
> = {
  positive: {
    label: "+ Good for BMNR",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  neutral: {
    label: "~ Neutral",
    color: "text-gray-500 dark:text-gray-400",
  },
  negative: {
    label: "- Threat",
    color: "text-red-600 dark:text-red-400",
  },
};

function buildCompetitorPills(items: CompetitorNewsItem[]) {
  const counts = new Map<CompetitorNewsBucket, number>();
  for (const n of items) {
    counts.set(n.competitor, (counts.get(n.competitor) ?? 0) + 1);
  }
  const pills: { id: CompetitorNewsBucket; label: string; count: number }[] =
    [];
  for (const id of COMPETITOR_ORDER) {
    const c = counts.get(id) ?? 0;
    if (c > 0) pills.push({ id, label: COMPETITOR_LABELS[id], count: c });
  }
  for (const [id, c] of counts) {
    if (c > 0 && !COMPETITOR_ORDER.includes(id)) {
      pills.push({ id, label: id, count: c });
    }
  }
  return pills;
}

function buildCategoryPills(items: CompetitorNewsItem[]) {
  const counts = new Map<CompetitorNewsStoryCategory, number>();
  for (const n of items) {
    counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
  }
  return CATEGORY_ORDER.filter((cat) => (counts.get(cat) ?? 0) > 0).map(
    (cat) => ({
      id: cat,
      count: counts.get(cat) ?? 0,
    })
  );
}

function summaryFromBullets(bullets: string[]): string {
  return bullets.join(" · ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CompetitorIntelligenceFeed({
  items,
}: {
  items: CompetitorNewsItem[];
}) {
  const [competitorFilter, setCompetitorFilter] = useState<
    CompetitorNewsBucket | "all"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    CompetitorNewsStoryCategory | "all"
  >("all");
  const [showCount, setShowCount] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const competitorPills = useMemo(() => buildCompetitorPills(items), [items]);
  const categoryPills = useMemo(() => buildCategoryPills(items), [items]);

  const indexed = useMemo(
    () => items.map((item, i) => ({ item, id: `comp-news-${i}` })),
    [items]
  );

  const filtered = useMemo(() => {
    return indexed.filter(({ item }) => {
      const okComp =
        competitorFilter === "all" || item.competitor === competitorFilter;
      const okCat =
        categoryFilter === "all" || item.category === categoryFilter;
      return okComp && okCat;
    });
  }, [indexed, competitorFilter, categoryFilter]);

  const visible = filtered.slice(0, showCount);

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">
            Competitor Intelligence
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Peer headlines with BMNR read-through — treasuries, exchanges, product,
          regulatory, and capital markets.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <button
              type="button"
              onClick={() => {
                setCompetitorFilter("all");
                setShowCount(10);
              }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                competitorFilter === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              All ({items.length})
            </button>
            {competitorPills.map(({ id, label, count }) => (
              <button
                type="button"
                key={id}
                onClick={() => {
                  setCompetitorFilter(
                    competitorFilter === id ? "all" : id
                  );
                  setShowCount(10);
                }}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  competitorFilter === id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all");
                setShowCount(10);
              }}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                categoryFilter === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              All ({items.length})
            </button>
            {categoryPills.map(({ id: cat, count }) => (
              <button
                type="button"
                key={cat}
                onClick={() => {
                  setCategoryFilter(
                    categoryFilter === cat ? "all" : cat
                  );
                  setShowCount(10);
                }}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  categoryFilter === cat
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat} ({count})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items match the selected filters.
            </p>
          ) : (
            visible.map(({ item, id }) => {
              const isExpanded = expandedId === id;
              const sent = implicationPresentation[item.implication];
              const fullSummary = summaryFromBullets(item.bullets);
              const summaryPreview =
                fullSummary.length > 200
                  ? fullSummary.slice(0, 200) + "…"
                  : fullSummary;

              return (
                <div
                  key={id}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/20"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {item.date}
                        </span>
                        <Badge
                          className={cn(
                            "text-[10px]",
                            categoryColors[item.category]
                          )}
                        >
                          {item.category}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.competitorLabel}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-xs font-medium",
                          sent.color
                        )}
                      >
                        {sent.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-medium leading-snug text-foreground">
                      {item.headline}
                    </h4>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isExpanded ? fullSummary : summaryPreview}
                    </p>

                    {isExpanded && (
                      <div className="space-y-2 border-t border-border pt-2">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Details
                          </p>
                          <ul className="mt-0.5 list-none space-y-1 text-xs text-muted-foreground leading-relaxed">
                            {item.bullets.map((b, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-muted-foreground/60">
                                  •
                                </span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            BMNR comparison
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                            {item.bmnrComparison}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60">
                          Source:{" "}
                          {item.sourceUrl ? (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline underline-offset-2 hover:text-foreground"
                            >
                              {item.source}
                            </a>
                          ) : (
                            item.source
                          )}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : id)
                      }
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

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
        {showCount > 10 && showCount >= filtered.length && filtered.length > 0 && (
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
