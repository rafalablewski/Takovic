"use client";

import { useState, useEffect, useCallback } from "react";
import type { EdgarCompanyInfo } from "@/lib/api/edgar";
import type { FMPPressRelease } from "@/lib/api/yahoo";
import type { IntelligenceFiling } from "@/app/api/intelligence/[ticker]/route";

export interface IntelligenceData {
  ticker: string;
  company: EdgarCompanyInfo | null;
  filings: IntelligenceFiling[];
  pressReleases: FMPPressRelease[];
  source: "edgar" | "fmp";
}

export function useIntelligenceData(ticker: string) {
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

  return { data, loading, error, refetch: fetchData };
}
