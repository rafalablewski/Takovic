"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ComparableCompany,
  CompetitorNewsItem,
  CompetitorNewsBucket,
  CompetitorNewsStoryCategory,
} from "@/types/coverage";
import { GitCompareArrows, Shield, Info, ChevronDown, ChevronRight } from "lucide-react";

const threatColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const assetColors: Record<string, string> = {
  ETH: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  BTC: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  Mixed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const implicationStyles: Record<
  CompetitorNewsItem["implication"],
  { badge: string; label: string }
> = {
  positive: {
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    label: "+ Good for BMNR",
  },
  neutral: {
    badge: "bg-muted text-muted-foreground",
    label: "~ Neutral",
  },
  negative: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    label: "- Threat",
  },
};

/** Display order for competitor filter chips (subset may render — only buckets present in data). */
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

const CATEGORY_CHIP_ORDER: readonly CompetitorNewsStoryCategory[] = [
  "Partnership",
  "Technology",
  "Yield",
  "Strategy",
  "Regulatory",
  "Financial",
  "Acquisition",
  "Funding",
] as const;

function buildCompetitorFilterChips(news: CompetitorNewsItem[]) {
  const counts = new Map<CompetitorNewsBucket, number>();
  for (const n of news) {
    counts.set(n.competitor, (counts.get(n.competitor) ?? 0) + 1);
  }
  const chips: { id: CompetitorNewsBucket; label: string; count: number }[] =
    [];
  for (const id of COMPETITOR_ORDER) {
    const c = counts.get(id) ?? 0;
    if (c > 0) {
      chips.push({ id, label: COMPETITOR_LABELS[id], count: c });
    }
  }
  for (const [id, c] of counts) {
    if (c > 0 && !COMPETITOR_ORDER.includes(id)) {
      chips.push({ id, label: id, count: c });
    }
  }
  return { chips, total: news.length };
}

function buildCategoryFilterChips(news: CompetitorNewsItem[]) {
  const counts = new Map<CompetitorNewsStoryCategory, number>();
  for (const n of news) {
    counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
  }
  return CATEGORY_CHIP_ORDER.filter((cat) => (counts.get(cat) ?? 0) > 0).map(
    (cat) => ({
      id: cat,
      count: counts.get(cat) ?? 0,
    })
  );
}

type ComparablesState =
  | { status: "loading" }
  | {
      status: "ready";
      comparables: ComparableCompany[];
      insight: string | null;
      competitorNews: CompetitorNewsItem[];
    }
  | { status: "empty" };

export function ComparablesTab({ ticker }: { ticker: string }) {
  const [state, setState] = useState<ComparablesState>({ status: "loading" });
  const [competitorFilter, setCompetitorFilter] = useState<
    CompetitorNewsBucket | "all"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    CompetitorNewsStoryCategory | "all"
  >("all");
  /** Indices into COMPETITOR_NEWS that are collapsed (closed). Empty = none collapsed. */
  const [collapsedIndices, setCollapsedIndices] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    setState({ status: "loading" });
    let cancelled = false;
    const lower = ticker.toLowerCase();

    import(`@/data/coverage/${lower}`)
      .then((mod) => {
        if (cancelled) return;
        const raw = "COMPARABLES" in mod ? mod.COMPARABLES : undefined;
        const comparables = Array.isArray(raw)
          ? (raw as ComparableCompany[])
          : [];
        const insight =
          "COMPARABLES_INSIGHT" in mod &&
          typeof mod.COMPARABLES_INSIGHT === "string"
            ? mod.COMPARABLES_INSIGHT
            : null;
        const newsRaw =
          "COMPETITOR_NEWS" in mod && Array.isArray(mod.COMPETITOR_NEWS)
            ? (mod.COMPETITOR_NEWS as CompetitorNewsItem[])
            : [];
        if (comparables.length === 0 && newsRaw.length === 0) {
          setState({ status: "empty" });
        } else {
          setState({
            status: "ready",
            comparables,
            insight,
            competitorNews: newsRaw,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "empty" });
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const collapseAll = useCallback((total: number) => {
    setCollapsedIndices(new Set(Array.from({ length: total }, (_, i) => i)));
  }, []);

  const toggleCollapsed = useCallback((index: number) => {
    setCollapsedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const filteredNews = useMemo(() => {
    if (state.status !== "ready") return [];
    return state.competitorNews.filter((item) => {
      const okComp =
        competitorFilter === "all" || item.competitor === competitorFilter;
      const okCat =
        categoryFilter === "all" || item.category === categoryFilter;
      return okComp && okCat;
    });
  }, [state, competitorFilter, categoryFilter]);

  const indexMap = useMemo(() => {
    if (state.status !== "ready") return new Map<CompetitorNewsItem, number>();
    const m = new Map<CompetitorNewsItem, number>();
    state.competitorNews.forEach((item, i) => m.set(item, i));
    return m;
  }, [state]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-muted-foreground">Loading comparables…</p>
    );
  }

  if (state.status === "empty") {
    return (
      <p className="text-sm text-muted-foreground">No comparable data.</p>
    );
  }

  const { comparables, insight, competitorNews } = state;
  const { chips: competitorChips, total: newsTotal } =
    buildCompetitorFilterChips(competitorNews);
  const categoryChips = buildCategoryFilterChips(competitorNews);

  return (
    <div className="space-y-8">
      {insight ? (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {comparables.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Peer snapshot
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {comparables.map((comp) => (
              <CompCard key={comp.ticker} comp={comp} />
            ))}
          </div>
        </section>
      ) : null}

      {competitorNews.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Competitor news
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground self-start sm:self-auto"
              onClick={() => collapseAll(competitorNews.length)}
            >
              Collapse all
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              By competitor
            </p>
            <div className="flex flex-wrap gap-1.5">
              {competitorChips.map(({ id, label, count }) => {
                const active = competitorFilter === id;
                return (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 px-2 text-[11px] gap-1"
                    onClick={() =>
                      setCompetitorFilter(active ? "all" : id)
                    }
                  >
                    {label}
                    <span
                      className={cn(
                        "tabular-nums opacity-80",
                        active && "text-primary-foreground/90"
                      )}
                    >
                      ({count})
                    </span>
                  </Button>
                );
              })}
              <Button
                type="button"
                size="sm"
                variant={competitorFilter === "all" ? "default" : "outline"}
                className="h-7 px-2 text-[11px] gap-1"
                onClick={() => setCompetitorFilter("all")}
              >
                All
                <span
                  className={cn(
                    "tabular-nums opacity-80",
                    competitorFilter === "all" &&
                      "text-primary-foreground/90"
                  )}
                >
                  ({newsTotal})
                </span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              By category
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categoryChips.map(({ id: cat, count }) => {
                const active = categoryFilter === cat;
                return (
                  <Button
                    key={cat}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-7 px-2 text-[11px] gap-1"
                    onClick={() =>
                      setCategoryFilter(active ? "all" : cat)
                    }
                  >
                    {cat}
                    <span
                      className={cn(
                        "tabular-nums opacity-80",
                        active && "text-primary-foreground/90"
                      )}
                    >
                      ({count})
                    </span>
                  </Button>
                );
              })}
              <Button
                type="button"
                size="sm"
                variant={categoryFilter === "all" ? "default" : "outline"}
                className="h-7 px-2 text-[11px] gap-1"
                onClick={() => setCategoryFilter("all")}
              >
                All
                <span
                  className={cn(
                    "tabular-nums opacity-80",
                    categoryFilter === "all" &&
                      "text-primary-foreground/90"
                  )}
                >
                  ({newsTotal})
                </span>
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {filteredNews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items match the selected filters.
              </p>
            ) : (
              filteredNews.map((item) => {
                const globalIdx = indexMap.get(item) ?? 0;
                const isOpen = !collapsedIndices.has(globalIdx);
                return (
                  <CompetitorNewsCard
                    key={`${item.date}-${globalIdx}-${item.headline.slice(0, 48)}`}
                    item={item}
                    open={isOpen}
                    onToggle={() => toggleCollapsed(globalIdx)}
                  />
                );
              })
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CompetitorNewsCard({
  item,
  open,
  onToggle,
}: {
  item: CompetitorNewsItem;
  open: boolean;
  onToggle: () => void;
}) {
  const imp = implicationStyles[item.implication];
  return (
    <Card className="overflow-hidden border-border/80">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-2 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-medium tabular-nums text-muted-foreground">
            {item.date}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-medium">
              {item.category}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-medium">
              {item.competitorLabel}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {item.headline}
          </p>
          <Badge className={cn("text-[10px] font-normal", imp.badge)}>
            {imp.label}
          </Badge>
        </div>
      </button>
      {open ? (
        <CardContent className="px-4 pb-4 pt-0 space-y-4 border-0">
          <ul className="list-none space-y-1.5 text-xs text-muted-foreground leading-relaxed pl-6">
            {item.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-foreground/50">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-md bg-muted/40 p-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              BMNR comparison
            </p>
            <p className="text-xs text-foreground leading-relaxed">
              {item.bmnrComparison}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Source: </span>
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {item.source}
              </a>
            ) : (
              item.source
            )}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}

function CompCard({ comp }: { comp: ComparableCompany }) {
  return (
    <Card className="transition-colors hover:bg-muted/20">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">{comp.name}</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {comp.ticker}
            </Badge>
          </div>
          <Badge className={cn("text-[10px]", assetColors[comp.asset])}>
            {comp.asset}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Metric label="Holdings" value={comp.holdings} />
          <Metric label="Holdings Value" value={comp.holdingsValue} />
          <Metric label="NAV Premium" value={comp.navPremium} />
          <Metric label="Staking Yield" value={comp.stakingYield} />
          <Metric label="Market Cap" value={comp.marketCap} />
          <div>
            <p className="text-[10px] text-muted-foreground">Threat Level</p>
            <Badge
              className={cn(
                "mt-0.5 text-[10px]",
                threatColors[comp.threatLevel]
              )}
            >
              {comp.threatLevel}
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-border pt-3">
          <div className="flex items-start gap-1.5">
            <Shield className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {comp.competitiveFocus}
            </p>
          </div>
          <div className="flex items-start gap-1.5">
            <GitCompareArrows className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Differentiator:</span>{" "}
              {comp.keyDifferentiator}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
