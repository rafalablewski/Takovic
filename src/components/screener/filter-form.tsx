"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Filter, Search, ChevronDown } from "lucide-react";

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function ScreenerFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleApply = useCallback(
    (formData: FormData) => {
      const params = new URLSearchParams();

      const search = (formData.get("search") as string)?.trim();
      const region = formData.get("region") as string;
      const sector = formData.get("sector") as string;
      const marketCap = formData.get("marketCap") as string;
      const peMin = (formData.get("peMin") as string)?.trim();
      const peMax = (formData.get("peMax") as string)?.trim();
      const roeMin = (formData.get("roeMin") as string)?.trim();
      const dividendMin = (formData.get("dividendMin") as string)?.trim();
      const minScore = formData.get("minScore") as string;

      if (search) params.set("search", search);
      if (region && region !== "all") params.set("region", region);
      if (sector && sector !== "All Sectors") params.set("sector", sector);
      if (marketCap && marketCap !== "Any") params.set("marketCap", marketCap);
      if (peMin) params.set("peMin", peMin);
      if (peMax) params.set("peMax", peMax);
      if (roeMin) params.set("roeMin", roeMin);
      if (dividendMin) params.set("dividendMin", dividendMin);
      if (minScore && minScore !== "Any") params.set("minScore", minScore);

      // Reset to page 1 when filters change
      const query = params.toString();
      router.push(query ? `/screener?${query}` : "/screener");
    },
    [router]
  );

  const handleReset = useCallback(() => {
    router.push("/screener");
  }, [router]);

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-medium">Filters</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-4 space-y-4">
        <form action={handleApply}>
          {/* Search */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.get("search") ?? ""}
                  placeholder="Ticker or company..."
                  className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Region
              </label>
              <div className="relative">
                <select
                  name="region"
                  defaultValue={searchParams.get("region") ?? "all"}
                  className={selectClass}
                >
                  <option value="all">All regions</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="EU">Europe</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Sector
              </label>
              <div className="relative">
                <select
                  name="sector"
                  defaultValue={searchParams.get("sector") ?? "All Sectors"}
                  className={selectClass}
                >
                  <option>All Sectors</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Financial Services</option>
                  <option>Energy</option>
                  <option>Consumer Cyclical</option>
                  <option>Consumer Defensive</option>
                  <option>Industrials</option>
                  <option>Utilities</option>
                  <option>Real Estate</option>
                  <option>Basic Materials</option>
                  <option>Communication Services</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Market Cap */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Market Cap
              </label>
              <div className="relative">
                <select
                  name="marketCap"
                  defaultValue={searchParams.get("marketCap") ?? "Any"}
                  className={selectClass}
                >
                  <option>Any</option>
                  <option value="mega">Mega ($200B+)</option>
                  <option value="large">Large ($10B-$200B)</option>
                  <option value="mid">Mid ($2B-$10B)</option>
                  <option value="small">Small (&lt;$2B)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* P/E Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                P/E Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="peMin"
                  defaultValue={searchParams.get("peMin") ?? ""}
                  placeholder="Min"
                  className={inputClass}
                />
                <span className="text-xs text-muted-foreground">-</span>
                <input
                  type="number"
                  name="peMax"
                  defaultValue={searchParams.get("peMax") ?? ""}
                  placeholder="Max"
                  className={inputClass}
                />
              </div>
            </div>

            {/* ROE Min */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                ROE Min (%)
              </label>
              <input
                type="number"
                name="roeMin"
                defaultValue={searchParams.get("roeMin") ?? ""}
                placeholder="e.g. 15"
                className={inputClass}
              />
            </div>

            {/* Dividend Yield */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Div Yield Min (%)
              </label>
              <input
                type="number"
                name="dividendMin"
                step="0.1"
                defaultValue={searchParams.get("dividendMin") ?? ""}
                placeholder="e.g. 2.0"
                className={inputClass}
              />
            </div>

            {/* Min Score */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Min Score
              </label>
              <div className="relative">
                <select
                  name="minScore"
                  defaultValue={searchParams.get("minScore") ?? "Any"}
                  className={selectClass}
                >
                  <option>Any</option>
                  <option value="4.0">4.0+ (Excellent)</option>
                  <option value="3.5">3.5+ (Good)</option>
                  <option value="3.0">3.0+ (Average)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" size="sm">
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
