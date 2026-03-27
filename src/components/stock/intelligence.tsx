"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { FMPSECFiling, FMPPressRelease } from "@/lib/api/fmp";
import {
  FileText,
  Megaphone,
  ExternalLink,
  Loader2,
  AlertCircle,
  Filter,
  Clock,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Filing type config
// ---------------------------------------------------------------------------

const FILING_TYPES = [
  { value: "all", label: "All" },
  { value: "10-K", label: "10-K" },
  { value: "10-Q", label: "10-Q" },
  { value: "8-K", label: "8-K" },
  { value: "S-1", label: "S-1" },
  { value: "DEF 14A", label: "DEF 14A" },
  { value: "4", label: "Form 4" },
  { value: "SC 13", label: "SC 13" },
] as const;

const FILING_DESCRIPTIONS: Record<string, string> = {
  "10-K": "Annual report",
  "10-Q": "Quarterly report",
  "8-K": "Current report (material event)",
  "S-1": "Registration statement (IPO)",
  "S-3": "Shelf registration",
  "DEF 14A": "Proxy statement",
  "4": "Insider trading",
  "SC 13D": "Beneficial ownership (activist)",
  "SC 13G": "Beneficial ownership (passive)",
  "13F-HR": "Institutional holdings",
  "424B": "Prospectus",
};

function getFilingDescription(type: string): string {
  // Match partial types (e.g. "10-K/A" → "10-K")
  for (const [key, desc] of Object.entries(FILING_DESCRIPTIONS)) {
    if (type.startsWith(key)) return desc;
  }
  return "SEC filing";
}

const FILING_BADGE_COLORS: Record<string, string> = {
  "10-K": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "10-Q": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  "8-K": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "S-1": "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "DEF 14A": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "4": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
};

function getFilingBadgeColor(type: string): string {
  for (const [key, color] of Object.entries(FILING_BADGE_COLORS)) {
    if (type.startsWith(key)) return color;
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

// ---------------------------------------------------------------------------
// Intelligence component
// ---------------------------------------------------------------------------

interface IntelligenceData {
  ticker: string;
  filings: FMPSECFiling[];
  pressReleases: FMPPressRelease[];
}

export function Intelligence({ ticker }: { ticker: string }) {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/intelligence/${ticker}`);
      if (!res.ok) throw new Error("Failed to fetch intelligence data");
      const json: IntelligenceData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading intelligence...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-medium">Intelligence</CardTitle>
        <CardDescription className="text-xs">
          SEC filings and press releases for {ticker}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <Tabs defaultValue="sec-filings">
          <TabsList className="w-full">
            <TabsTrigger value="sec-filings" className="flex-1 gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              SEC Filings
              {data.filings.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {data.filings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="press-wire" className="flex-1 gap-1.5 text-xs">
              <Megaphone className="h-3.5 w-3.5" />
              Press Wire
              {data.pressReleases.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {data.pressReleases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sec-filings">
            <SECFilingsTab filings={data.filings} />
          </TabsContent>

          <TabsContent value="press-wire">
            <PressWireTab pressReleases={data.pressReleases} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SEC Filings Tab
// ---------------------------------------------------------------------------

function SECFilingsTab({ filings }: { filings: FMPSECFiling[] }) {
  const [filterType, setFilterType] = useState("all");
  const [showCount, setShowCount] = useState(15);

  const filtered =
    filterType === "all"
      ? filings
      : filings.filter((f) => f.type.startsWith(filterType));

  const visible = filtered.slice(0, showCount);

  if (filings.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No SEC filings found
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-3">
      {/* Filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {FILING_TYPES.map((ft) => {
          const count =
            ft.value === "all"
              ? filings.length
              : filings.filter((f) => f.type.startsWith(ft.value)).length;
          if (count === 0 && ft.value !== "all") return null;
          return (
            <button
              key={ft.value}
              onClick={() => {
                setFilterType(ft.value);
                setShowCount(15);
              }}
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

      {/* Filing list */}
      <div className="divide-y divide-border/50">
        {visible.map((filing, idx) => (
          <div
            key={`${filing.type}-${filing.fillingDate}-${idx}`}
            className="flex items-start justify-between gap-3 py-3 first:pt-0"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    "shrink-0 text-[10px] font-semibold",
                    getFilingBadgeColor(filing.type)
                  )}
                >
                  {filing.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {getFilingDescription(filing.type)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Filed {formatDate(filing.fillingDate)}</span>
                {filing.acceptedDate && (
                  <>
                    <span className="text-border">|</span>
                    <span>Accepted {formatDate(filing.acceptedDate)}</span>
                  </>
                )}
                {filing.cik && (
                  <>
                    <span className="text-border">|</span>
                    <Building className="h-3 w-3" />
                    <span>CIK {filing.cik}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {filing.finalLink && (
                <a
                  href={filing.finalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  View
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {filing.link && filing.link !== filing.finalLink && (
                <a
                  href={filing.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Index
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show more / less */}
      {filtered.length > 15 && (
        <div className="flex justify-center pt-1">
          {showCount < filtered.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount((c) => c + 15)}
            >
              Show more ({filtered.length - showCount} remaining)
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount(15)}
            >
              Show less
              <ChevronUp className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Press Wire Tab
// ---------------------------------------------------------------------------

function PressWireTab({
  pressReleases,
}: {
  pressReleases: FMPPressRelease[];
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showCount, setShowCount] = useState(10);

  const visible = pressReleases.slice(0, showCount);

  if (pressReleases.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No press releases found
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-3">
      {visible.map((pr, idx) => {
        const isExpanded = expandedIdx === idx;
        // Truncate text to ~300 chars for collapsed view
        const truncated =
          pr.text.length > 300 ? pr.text.slice(0, 300) + "..." : pr.text;

        return (
          <div
            key={`${pr.date}-${idx}`}
            className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-medium leading-snug text-foreground">
                  {pr.title}
                </h4>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatDate(pr.date)}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {isExpanded ? pr.text : truncated}
              </p>

              {pr.text.length > 300 && (
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Show more */}
      {pressReleases.length > 10 && (
        <div className="flex justify-center pt-1">
          {showCount < pressReleases.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount((c) => c + 10)}
            >
              Show more ({pressReleases.length - showCount} remaining)
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount(10)}
            >
              Show less
              <ChevronUp className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
