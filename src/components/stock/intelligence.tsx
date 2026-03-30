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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { EdgarCompanyInfo } from "@/lib/api/edgar";
import type { FMPPressRelease } from "@/lib/api/fmp";
import type { IntelligenceFiling } from "@/app/api/intelligence/[ticker]/route";
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
  Hash,
  Globe,
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
  { value: "S-3", label: "S-3" },
  { value: "DEF 14A", label: "DEF 14A" },
  { value: "4", label: "Form 4" },
  { value: "SC 13", label: "SC 13" },
  { value: "424B", label: "424B" },
] as const;

const FILING_DESCRIPTIONS: Record<string, string> = {
  "10-K": "Annual report",
  "10-K/A": "Annual report (amended)",
  "10-Q": "Quarterly report",
  "10-Q/A": "Quarterly report (amended)",
  "8-K": "Current report (material event)",
  "8-K/A": "Current report (amended)",
  "S-1": "Registration statement (IPO)",
  "S-1/A": "Registration statement (amended)",
  "S-3": "Shelf registration",
  "S-3/A": "Shelf registration (amended)",
  "DEF 14A": "Proxy statement",
  "DEFA14A": "Additional proxy materials",
  "4": "Insider trading (change in ownership)",
  "3": "Initial insider ownership",
  "5": "Annual insider ownership",
  "SC 13D": "Beneficial ownership >5% (activist)",
  "SC 13D/A": "Beneficial ownership (amended)",
  "SC 13G": "Beneficial ownership >5% (passive)",
  "SC 13G/A": "Beneficial ownership (amended)",
  "13F-HR": "Institutional holdings",
  "424B2": "Prospectus supplement",
  "424B3": "Prospectus supplement",
  "424B4": "Prospectus (final)",
  "424B5": "Prospectus supplement",
  "FWP": "Free writing prospectus",
  "6-K": "Foreign issuer current report",
  "20-F": "Foreign issuer annual report",
  "EFFECT": "Registration effectiveness",
  "NT 10-K": "Late annual report notice",
  "NT 10-Q": "Late quarterly report notice",
};

function getFilingDescription(form: string): string {
  if (FILING_DESCRIPTIONS[form]) return FILING_DESCRIPTIONS[form];
  for (const [key, desc] of Object.entries(FILING_DESCRIPTIONS)) {
    if (form.startsWith(key)) return desc;
  }
  return "SEC filing";
}

const FILING_BADGE_COLORS: Record<string, string> = {
  "10-K": "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "10-Q": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  "8-K": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "S-1": "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "S-3": "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "DEF": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "4": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  "3": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  "5": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  "SC 13": "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "424": "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  "13F": "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  "EFFECT": "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
};

function getFilingBadgeColor(form: string): string {
  if (FILING_BADGE_COLORS[form]) return FILING_BADGE_COLORS[form];
  for (const [key, color] of Object.entries(FILING_BADGE_COLORS)) {
    if (form.startsWith(key)) return color;
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
  return `${bytes} B`;
}

// ---------------------------------------------------------------------------
// Intelligence component
// ---------------------------------------------------------------------------

interface IntelligenceData {
  ticker: string;
  company: EdgarCompanyInfo | null;
  filings: IntelligenceFiling[];
  pressReleases: FMPPressRelease[];
  source: "edgar" | "fmp";
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
          <span className="text-sm">Loading EDGAR filings...</span>
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
    <div className="space-y-6">
      {/* Company info from EDGAR */}
      {data.company && <CompanyInfoBar company={data.company} />}

      {/* Tabbed content */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Intelligence</CardTitle>
          <CardDescription className="text-xs">
            {data.source === "edgar" ? "SEC EDGAR" : "FMP"} filings and press releases for {ticker}
            {data.source === "fmp" && (
              <span className="ml-1 text-amber-600 dark:text-amber-400">(EDGAR unavailable, using fallback)</span>
            )}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Company Info Bar (from EDGAR)
// ---------------------------------------------------------------------------

function CompanyInfoBar({ company }: { company: EdgarCompanyInfo }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{company.name}</p>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {company.tickers.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {t}
                </Badge>
              ))}
              {company.exchanges.map((e) => (
                <Badge key={e} className="bg-muted text-muted-foreground text-[10px]">
                  {e}
                </Badge>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-10 hidden sm:block" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4 text-xs">
            <div>
              <span className="text-muted-foreground">CIK</span>
              <p className="font-medium tabular-nums">{company.cik}</p>
            </div>
            <div>
              <span className="text-muted-foreground">EIN</span>
              <p className="font-medium tabular-nums">{company.ein || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">SIC</span>
              <p className="font-medium">{company.sic} — {company.sicDescription}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Entity Type</span>
              <p className="font-medium">{company.entityType || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">State</span>
              <p className="font-medium">{company.stateOfIncorporation || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fiscal Year End</span>
              <p className="font-medium">{company.fiscalYearEnd || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Category</span>
              <p className="font-medium">{company.category || "—"}</p>
            </div>
            {company.website && (
              <div>
                <span className="text-muted-foreground">Website</span>
                <p className="font-medium">
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3 w-3" />
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// SEC Filings Tab (EDGAR data)
// ---------------------------------------------------------------------------

function SECFilingsTab({ filings }: { filings: IntelligenceFiling[] }) {
  const [filterType, setFilterType] = useState("all");
  const [showCount, setShowCount] = useState(20);

  const filtered =
    filterType === "all"
      ? filings
      : filings.filter((f) => f.form.startsWith(filterType));

  const visible = filtered.slice(0, showCount);

  if (filings.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No SEC filings found for this entity
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
              : filings.filter((f) => f.form.startsWith(ft.value)).length;
          if (count === 0 && ft.value !== "all") return null;
          return (
            <button
              key={ft.value}
              onClick={() => {
                setFilterType(ft.value);
                setShowCount(20);
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
            key={`${filing.accessionNumber}-${idx}`}
            className="flex items-start justify-between gap-3 py-3 first:pt-0"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Form type + description */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={cn(
                    "shrink-0 text-[10px] font-semibold",
                    getFilingBadgeColor(filing.form)
                  )}
                >
                  {filing.form}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {getFilingDescription(filing.form)}
                </span>
                {filing.primaryDocDescription && filing.primaryDocDescription !== filing.form && (
                  <span className="text-xs text-foreground/70">
                    — {filing.primaryDocDescription}
                  </span>
                )}
              </div>

              {/* 8-K items (material events) */}
              {filing.form.startsWith("8-K") && filing.items && (
                <p className="text-[11px] text-muted-foreground">
                  Items: {filing.items}
                </p>
              )}

              {/* Metadata row */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Filed {formatDate(filing.filingDate)}</span>
                {filing.reportDate && (
                  <>
                    <span className="text-border">|</span>
                    <span>Report date {formatDate(filing.reportDate)}</span>
                  </>
                )}
                <span className="text-border">|</span>
                <Hash className="h-3 w-3 shrink-0" />
                <span className="tabular-nums">{filing.accessionNumber}</span>
                <span className="text-border">|</span>
                <span>{formatFileSize(filing.size)}</span>
                {filing.isXBRL && (
                  <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 text-[9px] px-1 py-0">
                    XBRL
                  </Badge>
                )}
              </div>
            </div>

            {/* Action links */}
            <div className="flex shrink-0 gap-1.5">
              {filing.viewUrl && (
                <a
                  href={filing.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  View
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {filing.indexUrl && (
                <a
                  href={filing.indexUrl}
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
      {filtered.length > 20 && (
        <div className="flex justify-center pt-1">
          {showCount < filtered.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount((c) => c + 20)}
            >
              Show more ({filtered.length - showCount} remaining)
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowCount(20)}
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
// Press Wire Tab (FMP data)
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
  if (!dateStr) return "—";
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
