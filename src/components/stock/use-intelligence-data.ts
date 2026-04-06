"use client";

import { useState, useEffect, useCallback } from "react";
import type { EdgarCompanyInfo } from "@/lib/api/edgar";
import type { FMPPressRelease } from "@/lib/api/yahoo";
import type {
  IntelligenceFiling,
  SavedFilingAnalysesMap,
  SavedPressAnalysesMap,
} from "@/app/api/intelligence/[ticker]/route";

export interface IntelligenceData {
  ticker: string;
  company: EdgarCompanyInfo | null;
  filings: IntelligenceFiling[];
  pressReleases: FMPPressRelease[];
  source: "edgar" | "fmp";
  savedFilingAnalyses: SavedFilingAnalysesMap;
  savedPressAnalyses: SavedPressAnalysesMap;
}

type RefreshTarget = "all" | "sec" | "press";

export function useIntelligenceData(ticker: string) {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (target: RefreshTarget = "all") => {
    setLoading(true);
    setError(null);
    try {
      const query =
        target === "sec"
          ? "?refreshSec=1"
          : target === "press"
            ? "?refreshPress=1"
            : "";
      const res = await fetch(`/api/intelligence/${ticker}${query}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch intelligence data");
      const json = (await res.json()) as IntelligenceData & {
        savedFilingAnalyses?: SavedFilingAnalysesMap;
        savedPressAnalyses?: SavedPressAnalysesMap;
      };
      setData({
        ...json,
        savedFilingAnalyses: json.savedFilingAnalyses ?? {},
        savedPressAnalyses: json.savedPressAnalyses ?? {},
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData("all");
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
