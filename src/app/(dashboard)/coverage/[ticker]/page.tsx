"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCoveredStock, getTabsForStock } from "@/data/coverage/registry";
import { OverviewTab } from "@/components/coverage/overview-tab";
import { AnalysisTab } from "@/components/coverage/analysis-tab";
import { ComparablesTab } from "@/components/coverage/comparables-tab";
import { FinancialsTab } from "@/components/coverage/financials-tab";
import { WallStreetTab } from "@/components/coverage/wall-street-tab";
import { CapitalStructureTab } from "@/components/coverage/capital-structure-tab";
import { TimelineTab } from "@/components/coverage/timeline-tab";
import { ValuationTab } from "@/components/coverage/valuation-tab";
import { OperationsTab } from "@/components/coverage/operations-tab";
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  Layers,
  Clock,
  GitCompareArrows,
  DollarSign,
  Calculator,
  Briefcase,
  FileText,
  Megaphone,
} from "lucide-react";
import { useIntelligenceData } from "@/components/stock/use-intelligence-data";
import { EdgarContent, PressWireContent } from "@/components/stock/intelligence";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  Building2,
  Layers,
  Briefcase,
  Clock,
  GitCompareArrows,
  DollarSign,
  Calculator,
  FileText,
  Megaphone,
};

function CoverageEdgarTab({ ticker }: { ticker: string }) {
  const { data, loading, error, refetch } = useIntelligenceData(ticker);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading EDGAR filings…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (!data) return null;

  return (
    <EdgarContent
      filings={data.filings}
      ticker={ticker}
      companyName={data.company?.name ?? null}
      savedFilingAnalyses={data.savedFilingAnalyses}
      onRefreshSec={() => refetch("sec")}
    />
  );
}

function CoverageNewsTab({ ticker }: { ticker: string }) {
  const { data, loading, error, refetch } = useIntelligenceData(ticker);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading press wire…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (!data || data.pressReleases.length === 0) {
    return <p className="text-sm text-muted-foreground">No press wire releases available.</p>;
  }

  return (
    <PressWireContent
      pressReleases={data.pressReleases}
      ticker={ticker}
      onRefreshPress={() => refetch("press")}
    />
  );
}

export default function CoveragePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Loading coverage…</div>
      }
    >
      <CoveragePageInner />
    </Suspense>
  );
}

function CoveragePageInner() {
  const routeParams = useParams();
  const rawTicker = routeParams.ticker;
  const ticker =
    typeof rawTicker === "string"
      ? rawTicker
      : Array.isArray(rawTicker)
        ? rawTicker[0] ?? ""
        : "";
  const upperTicker = ticker.toUpperCase();
  const stock = getCoveredStock(upperTicker);
  const tabs = getTabsForStock(upperTicker);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabIds = useMemo(() => new Set(tabs.map((t) => t.id)), [tabs]);
  const defaultTabId = tabs[0]?.id ?? "overview";

  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam && tabIds.has(tabParam) ? tabParam : defaultTabId;

  const setTab = useCallback(
    (id: string) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", id);
      if (
        id === "operations" &&
        stock?.operationsSubTabs &&
        stock.operationsSubTabs.length > 0 &&
        !p.get("ops")
      ) {
        p.set("ops", stock.operationsSubTabs[0].id);
      }
      if (id === "capital-structure" && !p.get("cap")) {
        p.set("cap", "share-classes");
      }
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, stock]
  );

  if (!stock) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Coverage</h1>
          <p className="text-sm text-muted-foreground">
            No active coverage for {upperTicker}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{stock.name}</h1>
            <Badge variant="secondary" className="text-[10px]">{stock.ticker}</Badge>
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px]">
              Active Coverage
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{stock.sector}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Coverage initiated {stock.coverageDate} &middot; {stock.analyst}
          </p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map((tab) => {
          const Icon = ICON_MAP[tab.icon];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && <OverviewTab ticker={upperTicker} />}
      {activeTab === "operations" && (
        <OperationsTab
          ticker={upperTicker}
          intro={stock.operationsIntro}
          subTabs={stock.operationsSubTabs}
        />
      )}
      {activeTab === "analysis" && <AnalysisTab ticker={upperTicker} />}
      {activeTab === "comparables" && <ComparablesTab ticker={upperTicker} />}
      {activeTab === "financials" && <FinancialsTab ticker={upperTicker} />}
      {activeTab === "wall-street" && <WallStreetTab ticker={upperTicker} />}
      {activeTab === "edgar" && <CoverageEdgarTab ticker={upperTicker} />}
      {activeTab === "news" && <CoverageNewsTab ticker={upperTicker} />}
      {activeTab === "capital-structure" && <CapitalStructureTab ticker={upperTicker} />}
      {activeTab === "timeline" && <TimelineTab ticker={upperTicker} />}
      {activeTab === "valuation" && <ValuationTab ticker={upperTicker} />}
    </div>
  );
}
