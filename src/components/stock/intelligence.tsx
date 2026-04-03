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
} from "lucide-react";
import { useIntelligenceData } from "@/components/stock/use-intelligence-data";
import {
  CompanyInfoBar,
  SecFilingsList,
} from "@/components/stock/filings-panel";

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
                  type="button"
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
    </div>
  );
}

export function Intelligence({ ticker }: { ticker: string }) {
  const { data, loading, error } = useIntelligenceData(ticker);

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
              <SecFilingsList
                filings={data.filings}
                ticker={ticker}
                companyName={data.company?.name ?? null}
              />
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
