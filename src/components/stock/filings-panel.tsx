"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { EdgarCompanyInfo } from "@/lib/api/edgar";
import type { IntelligenceFiling } from "@/app/api/intelligence/[ticker]/route";
import {
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  Filter,
  Clock,
  Hash,
  Globe,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useIntelligenceData } from "@/components/stock/use-intelligence-data";
import {
  FILING_AI_PROVIDERS,
  FILING_AI_PROVIDER_LABELS,
  FILING_AI_PROVIDER_STORAGE_KEY,
  type FilingAiProvider,
  normalizeFilingAiProvider,
} from "@/lib/ai/filing-provider-prefs";
import { filingDedupeKey } from "@/lib/ai/filing-dedupe-key";
import type { SavedFilingAnalysesMap } from "@/app/api/intelligence/[ticker]/route";

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
  DEF: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "4": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  "3": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  "5": "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
  "SC 13": "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "424": "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  "13F": "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  EFFECT: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
};

function getFilingBadgeColor(form: string): string {
  if (FILING_BADGE_COLORS[form]) return FILING_BADGE_COLORS[form];
  for (const [key, color] of Object.entries(FILING_BADGE_COLORS)) {
    if (form.startsWith(key)) return color;
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function formatFilingFileSize(bytes: number): string {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`;
  return `${bytes} B`;
}

function formatFilingDate(dateStr: string): string {
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

export function CompanyInfoBar({ company }: { company: EdgarCompanyInfo }) {
  return (
    <div className="research-card border-border/70 p-3">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{company.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {company.tickers.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">
                {t}
              </Badge>
            ))}
            {company.exchanges.map((e) => (
              <Badge
                key={e}
                className="bg-muted text-[10px] text-muted-foreground"
              >
                {e}
              </Badge>
            ))}
          </div>
        </div>

        <Separator orientation="vertical" className="hidden h-10 sm:block" />

        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-4">
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
            <p className="font-medium">
              {company.sic} — {company.sicDescription}
            </p>
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
                  href={
                    /^https?:\/\//i.test(company.website)
                      ? company.website
                      : `https://${company.website}`
                  }
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
    </div>
  );
}

type RowStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "done"; summary: string; excerptTruncated?: boolean }
  | { state: "error"; message: string };

function stableFilingRowKey(
  ticker: string,
  filing: IntelligenceFiling
): string {
  return filingDedupeKey(ticker, {
    accessionNumber: filing.accessionNumber,
    viewUrl: filing.viewUrl,
    filingDate: filing.filingDate,
    form: filing.form,
  });
}

function resolveRowStatus(
  ticker: string,
  filing: IntelligenceFiling,
  local: RowStatus | undefined,
  saved: SavedFilingAnalysesMap | undefined
): RowStatus {
  if (local?.state === "loading" || local?.state === "error") return local;
  if (local?.state === "done") return local;
  const dedupe = stableFilingRowKey(ticker, filing);
  const fromDb = saved?.[dedupe];
  if (fromDb?.summary)
    return {
      state: "done",
      summary: fromDb.summary,
      excerptTruncated: Boolean(fromDb.excerptTruncated),
    };
  return { state: "idle" };
}

export function SecFilingsList({
  filings,
  ticker,
  companyName,
  savedFilingAnalyses = {},
}: {
  filings: IntelligenceFiling[];
  ticker: string;
  companyName?: string | null;
  savedFilingAnalyses?: SavedFilingAnalysesMap;
}) {
  const [filterType, setFilterType] = useState("all");
  const [showCount, setShowCount] = useState(20);
  const [aiProvider, setAiProvider] = useState<FilingAiProvider>(
    normalizeFilingAiProvider(undefined)
  );
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILING_AI_PROVIDER_STORAGE_KEY);
      setAiProvider(normalizeFilingAiProvider(raw ?? undefined));
    } catch {
      /* ignore */
    }
  }, []);

  const persistProvider = useCallback((p: FilingAiProvider) => {
    setAiProvider(p);
    try {
      localStorage.setItem(FILING_AI_PROVIDER_STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const runAnalyze = useCallback(
    async (filing: IntelligenceFiling) => {
      const key = stableFilingRowKey(ticker, filing);
      if (!filing.viewUrl) return;
      setRowStatus((s) => ({ ...s, [key]: { state: "loading" } }));
      try {
        const res = await fetch(
          `/api/intelligence/${encodeURIComponent(ticker)}/filings/analyze`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form: filing.form,
              filingDate: filing.filingDate,
              source: filing.source,
              viewUrl: filing.viewUrl,
              accessionNumber: filing.accessionNumber || null,
              primaryDocDescription: filing.primaryDocDescription || null,
              items: filing.items || null,
              companyName: companyName ?? null,
              aiProvider,
            }),
          }
        );
        const data = (await res.json()) as {
          error?: string;
          summary?: string;
          excerptTruncated?: boolean;
        };
        if (!res.ok) {
          setRowStatus((s) => ({
            ...s,
            [key]: { state: "error", message: data.error || "Request failed" },
          }));
          return;
        }
        setRowStatus((s) => ({
          ...s,
          [key]: {
            state: "done",
            summary: data.summary || "",
            excerptTruncated: Boolean(data.excerptTruncated),
          },
        }));
      } catch (e) {
        setRowStatus((s) => ({
          ...s,
          [key]: {
            state: "error",
            message: e instanceof Error ? e.message : "Network error",
          },
        }));
      }
    },
    [ticker, companyName, aiProvider]
  );

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
    <div className="space-y-4 pt-1">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">AI model</span>
        <select
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
          value={aiProvider}
          onChange={(e) =>
            persistProvider(normalizeFilingAiProvider(e.target.value))
          }
          aria-label="AI provider for filing analysis"
        >
          {FILING_AI_PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {FILING_AI_PROVIDER_LABELS[p]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
              type="button"
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

      <div className="divide-y divide-border/50">
        {visible.map((filing) => {
          const rk = stableFilingRowKey(ticker, filing);
          const status = resolveRowStatus(
            ticker,
            filing,
            rowStatus[rk],
            savedFilingAnalyses
          );
          return (
          <div
            key={rk}
            className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
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
                {filing.primaryDocDescription &&
                  filing.primaryDocDescription !== filing.form && (
                    <span className="text-xs text-foreground/70">
                      — {filing.primaryDocDescription}
                    </span>
                  )}
              </div>

              {filing.form.startsWith("8-K") && filing.items && (
                <p className="text-[11px] text-muted-foreground">
                  Items: {filing.items}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Filed {formatFilingDate(filing.filingDate)}</span>
                {filing.reportDate && (
                  <>
                    <span className="text-border">|</span>
                    <span>Report date {formatFilingDate(filing.reportDate)}</span>
                  </>
                )}
                <span className="text-border">|</span>
                <Hash className="h-3 w-3 shrink-0" />
                <span className="tabular-nums">{filing.accessionNumber}</span>
                <span className="text-border">|</span>
                <span>{formatFilingFileSize(filing.size)}</span>
                {filing.isXBRL && (
                  <Badge className="bg-sky-50 px-1 py-0 text-[9px] text-sky-700 dark:bg-sky-900/20 dark:text-sky-400">
                    XBRL
                  </Badge>
                )}
              </div>
              {status.state === "done" && status.summary && (
                <>
                  {status.excerptTruncated && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-500/35 bg-amber-500/10 px-2.5 py-2 text-[11px] leading-snug text-amber-950 dark:text-amber-100">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        This analysis used only the first portion of the filing text (size
                        cap). Open the filing for the full document.
                      </span>
                    </p>
                  )}
                  <ScrollArea className="mt-2 max-h-[min(70vh,28rem)] rounded-md border border-border/80 bg-muted/30">
                    <div className="p-3 pr-4 text-xs leading-relaxed text-foreground [&_h1]:mb-2 [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:scroll-mt-2 [&_h2]:border-b [&_h2]:border-border/60 [&_h2]:pb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-xs [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-2 [&_strong]:font-semibold [&_ul]:ml-4 [&_ul]:list-disc [&_hr]:my-3 [&_hr]:border-border">
                      <ReactMarkdown>{status.summary}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </>
              )}
              {status.state === "error" && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {status.message}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={!filing.viewUrl || status.state === "loading"}
                onClick={() => runAnalyze(filing)}
              >
                {status.state === "loading" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Analyze
              </Button>
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
          );
        })}
      </div>

      {filtered.length > 20 && (
        <div className="flex justify-center pt-1">
          {showCount < filtered.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              type="button"
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
              type="button"
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

export function FilingsPanel({ ticker }: { ticker: string }) {
  const { data, loading, error } = useIntelligenceData(ticker);

  if (loading) {
    return (
      <div className="research-card flex items-center justify-center gap-2 p-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading SEC filings…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="research-card flex items-center justify-center gap-2 p-12 text-down">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      {data.company && <CompanyInfoBar company={data.company} />}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="space-y-1 p-4 pb-0">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            SEC filings
          </CardTitle>
          <CardDescription className="text-xs">
            {data.source === "edgar" ? "SEC EDGAR" : "FMP"} · {ticker}
            {data.source === "fmp" && (
              <span className="ml-1 text-amber-600 dark:text-amber-400">
                (EDGAR fallback)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <SecFilingsList
            filings={data.filings}
            ticker={ticker}
            companyName={data.company?.name ?? null}
            savedFilingAnalyses={data.savedFilingAnalyses}
          />
        </CardContent>
      </Card>
    </div>
  );
}
