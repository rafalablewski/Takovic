"use client";

import { useState } from "react";
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
import type { FMPPressRelease } from "@/lib/api/yahoo";
import {
  FileText,
  Megaphone,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCw,
  Sparkles,
  X,
} from "lucide-react";
import { useIntelligenceData } from "@/components/stock/use-intelligence-data";
import {
  CompanyInfoBar,
  SecFilingsList,
} from "@/components/stock/filings-panel";

export function PressWireContent({
  pressReleases,
  ticker,
  onRefreshPress,
}: {
  pressReleases: FMPPressRelease[];
  ticker: string;
  onRefreshPress: () => Promise<void>;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showCount, setShowCount] = useState(10);
  const [refreshingPress, setRefreshingPress] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [analyzeTarget, setAnalyzeTarget] = useState<FMPPressRelease | null>(null);
  const [analyzeText, setAnalyzeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const visible = pressReleases.slice(0, showCount);

  if (pressReleases.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No press releases found
      </div>
    );
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="space-y-3 pt-3">
      <div className="mb-3 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={refreshingPress}
          onClick={async () => {
            setRefreshingPress(true);
            try {
              await onRefreshPress();
            } finally {
              setRefreshingPress(false);
            }
          }}
        >
          <RotateCw
            className={`mr-1 h-3.5 w-3.5 ${refreshingPress ? "animate-spin" : ""}`}
          />
          Refresh Press Wire
        </Button>
      </div>
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

              {pr.source && (
                <p className="text-[11px] text-muted-foreground">
                  Source: {pr.source}
                </p>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                {isExpanded ? pr.text : truncated}
              </p>

              <div className="flex items-center gap-3">
                {pr.text.length > 300 && (
                  <button
                    type="button"
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {isExpanded ? "Show less" : "Read more"}
                  </button>
                )}
                {pr.url && (
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Open news
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    setAnalyzeTarget(pr);
                    setAnalyzeText("");
                    setAnalysisResult("");
                    setAnalysisError(null);
                    setAnalyzeOpen(true);
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  Analyze
                </button>
              </div>
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
              type="button"
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
              type="button"
              onClick={() => setShowCount(10)}
            >
              Show less
              <ChevronUp className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {analyzeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-lg border border-border bg-background p-4 shadow-lg">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Press Wire Analysis</h3>
                <p className="text-xs text-muted-foreground">
                  {analyzeTarget?.title || "Selected press release"}
                </p>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setAnalyzeOpen(false)}
                aria-label="Close analysis modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <textarea
                value={analyzeText}
                onChange={(e) => setAnalyzeText(e.target.value)}
                placeholder="Paste full press release text here..."
                className="min-h-44 w-full rounded-md border border-border bg-background p-3 text-xs text-foreground outline-none ring-ring focus:ring-1"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={analyzing || analyzeText.trim().length < 30 || !analyzeTarget}
                  onClick={async () => {
                    if (!analyzeTarget) return;
                    setAnalyzing(true);
                    setAnalysisError(null);
                    try {
                      const res = await fetch(
                        `/api/intelligence/${encodeURIComponent(ticker)}/press/analyze`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            title: analyzeTarget.title,
                            source: analyzeTarget.source ?? null,
                            publishedAt: analyzeTarget.date,
                            text: analyzeText,
                          }),
                        }
                      );
                      const data = (await res.json()) as { analysis?: string; error?: string };
                      if (!res.ok) throw new Error(data.error || "Analysis failed");
                      setAnalysisResult(data.analysis || "");
                    } catch (error) {
                      setAnalysisError(
                        error instanceof Error ? error.message : "Failed to analyze press release"
                      );
                    } finally {
                      setAnalyzing(false);
                    }
                  }}
                >
                  <Sparkles className={`mr-1 h-3.5 w-3.5 ${analyzing ? "animate-pulse" : ""}`} />
                  {analyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </div>
              {analysisError && (
                <p className="text-xs text-red-600 dark:text-red-400">{analysisError}</p>
              )}
              {analysisResult && (
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-xs text-foreground">
                  {analysisResult}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EdgarContent({
  filings,
  ticker,
  companyName,
  savedFilingAnalyses,
  onRefreshSec,
}: {
  filings: import("@/app/api/intelligence/[ticker]/route").IntelligenceFiling[];
  ticker: string;
  companyName?: string | null;
  savedFilingAnalyses?: import("@/app/api/intelligence/[ticker]/route").SavedFilingAnalysesMap;
  onRefreshSec: () => Promise<void>;
}) {
  const [refreshingSec, setRefreshingSec] = useState(false);
  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={refreshingSec}
          onClick={async () => {
            setRefreshingSec(true);
            try {
              await onRefreshSec();
            } finally {
              setRefreshingSec(false);
            }
          }}
        >
          <RotateCw className={`mr-1 h-3.5 w-3.5 ${refreshingSec ? "animate-spin" : ""}`} />
          Refresh SEC Filings
        </Button>
      </div>
      <SecFilingsList
        filings={filings}
        ticker={ticker}
        companyName={companyName ?? null}
        savedFilingAnalyses={savedFilingAnalyses}
      />
    </>
  );
}

export function Intelligence({ ticker }: { ticker: string }) {
  const { data, loading, error, refetch } = useIntelligenceData(ticker);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading EDGAR filings...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 p-12 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {data.company && <CompanyInfoBar company={data.company} />}

      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Intelligence</CardTitle>
          <CardDescription className="text-xs">
            {data.source === "edgar" ? "SEC EDGAR" : "FMP"} filings and press
            releases for {ticker}
            {data.source === "fmp" && (
              <span className="ml-1 text-amber-600 dark:text-amber-400">
                (EDGAR unavailable, using fallback)
              </span>
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
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {data.filings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="press-wire" className="flex-1 gap-1.5 text-xs">
                <Megaphone className="h-3.5 w-3.5" />
                Press Wire
                {data.pressReleases.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                    {data.pressReleases.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sec-filings">
              <EdgarContent
                filings={data.filings}
                ticker={ticker}
                companyName={data.company?.name ?? null}
                savedFilingAnalyses={data.savedFilingAnalyses}
                onRefreshSec={() => refetch("sec")}
              />
            </TabsContent>

            <TabsContent value="press-wire">
              <PressWireContent
                pressReleases={data.pressReleases}
                ticker={ticker}
                onRefreshPress={() => refetch("press")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
