"use client";

import * as React from "react";
import {
  createChart,
  LineSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { ChartRange } from "@/app/api/stocks/[ticker]/chart/route";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y", "MAX"];

function readCssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export function ChartContainer({
  ticker,
  className,
}: {
  ticker: string;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<IChartApi | null>(null);
  const seriesRef = React.useRef<ISeriesApi<"Line"> | null>(null);
  const [range, setRange] = React.useState<ChartRange>("1Y");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const textColor = readCssVar("--muted-foreground", "#888");
    const gridColor = readCssVar("--chart-grid", "rgba(255,255,255,0.06)");
    const lineColor = readCssVar("--chart-line", "#b8bcc4");

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        attributionLogo: false,
        fontSize: 11,
        textColor,
      },
      grid: {
        vertLines: { color: gridColor, visible: true, style: 0 },
        horzLines: { color: gridColor, visible: true, style: 0 },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      crosshair: {
        vertLine: {
          color: gridColor,
          labelBackgroundColor: readCssVar("--muted-foreground", "#888"),
        },
        horzLine: {
          color: gridColor,
          labelBackgroundColor: readCssVar("--muted-foreground", "#888"),
        },
      },
      width: el.clientWidth,
      height: el.clientHeight,
    });

    const series = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 1,
      crosshairMarkerVisible: true,
      lastValueVisible: true,
      priceLineVisible: true,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/stocks/${encodeURIComponent(ticker)}/chart?range=${range}`
        );
        const json = await res.json();
        if (cancelled) return;
        const s = seriesRef.current;
        const c = chartRef.current;
        if (!s || !c) return;
        const points = (json.points ?? []) as { time: number; value: number }[];
        s.setData(
          points.map((p) => ({
            time: p.time as UTCTimestamp,
            value: p.value,
          }))
        );
        c.timeScale().fitContent();
        if (points.length === 0) {
          setError("No price data for this range.");
        }
      } catch (e) {
        if (!cancelled) {
          const detail = e instanceof Error ? e.message : String(e);
          setError(
            process.env.NODE_ENV === "development"
              ? `Could not load chart: ${detail}`
              : "Could not load chart."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ticker, range]);

  return (
    <div className={cn("surface-panel flex flex-col gap-3 p-4 sm:p-5", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Price
          </h3>
          <p className="text-[10px] text-muted-foreground/80">
            FMP · delayed
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(v) => v && setRange(v as ChartRange)}
          variant="outline"
          size="sm"
          className="flex-wrap justify-start"
        >
          {RANGES.map((r) => (
            <ToggleGroupItem
              key={r}
              value={r}
              className="h-7 px-2 text-[11px] data-[state=on]:bg-secondary"
            >
              {r}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="relative h-[280px] w-full min-h-[200px]">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40 text-xs text-muted-foreground">
            Loading…
          </div>
        )}
        {error && !loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs text-muted-foreground">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
