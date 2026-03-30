"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Intelligence } from "@/components/stock/intelligence";
import { Search, Loader2, Shield, BarChart3 } from "lucide-react";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50";

export default function IntelligencePage() {
  const [tickerInput, setTickerInput] = useState("");
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTicker = useCallback(() => {
    const ticker = tickerInput.trim().toUpperCase();
    if (!ticker) return;
    setLoading(true);
    setActiveTicker(ticker);
    // Loading state is managed by the Intelligence component itself;
    // we just flip it off after a tick so the button resets
    setTimeout(() => setLoading(false), 100);
  }, [tickerInput]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Intelligence</h1>
        <p className="text-sm text-muted-foreground">
          SEC filings and press releases for any public company
        </p>
      </div>

      {/* Ticker search */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Stock Ticker
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  className={`${inputClass} pl-9`}
                  placeholder="Enter ticker (e.g. AAPL, BMNR, MSFT)"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && loadTicker()}
                />
              </div>
            </div>
            <Button
              onClick={loadTicker}
              disabled={loading || !tickerInput.trim()}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Intelligence content */}
      {activeTicker && <Intelligence ticker={activeTicker} />}

      {/* Empty state */}
      {!activeTicker && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              Enter a stock ticker to view SEC filings and press releases
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Browse 10-K, 10-Q, 8-K, proxy statements, insider filings, and
              corporate press wire
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
