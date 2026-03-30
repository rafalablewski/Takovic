"use client";

import * as React from "react";
import {
  createChart,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { ChartRange } from "@/app/api/stocks/[ticker]/chart/route";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y", "MAX"];

type ChartType = "line" | "candle";

interface OHLCPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function readCssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

/** Calculate simple moving average from close prices. */
function computeSMA(
  data: { time: number; close: number }[],
  period: number
): { time: UTCTimestamp; value: number }[] {
  const result: { time: UTCTimestamp; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    result.push({
      time: data[i].time as UTCTimestamp,
      value: sum / period,
    });
  }
  return result;
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

  /* We track series refs loosely since they get recreated on type change */
  const priceSeriesRef = React.useRef<ISeriesApi<"Line"> | ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = React.useRef<ISeriesApi<"Histogram"> | null>(null);
  const smaSeriesRef = React.useRef<ISeriesApi<"Line"> | null>(null);

  const [range, setRange] = React.useState<ChartRange>("1Y");
  const [chartType, setChartType] = React.useState<ChartType>("line");
  const [showSMA, setShowSMA] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  /* Keep fetched data so we can re-render when chart type / SMA toggles change without refetching */
  const dataRef = React.useRef<{
    points: { time: number; value: number }[];
    ohlc: OHLCPoint[];
  } | null>(null);

  /* ---------- chart instance (created once) ---------- */
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const textColor = readCssVar("--muted-foreground", "#888");
    const gridColor = readCssVar("--chart-grid", "rgba(255,255,255,0.06)");

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

    chartRef.current = chart;

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
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
      smaSeriesRef.current = null;
    };
  }, []);

  /* ---------- fetch data when ticker/range changes ---------- */
  React.useEffect(() => {
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
        const points = (json.points ?? []) as { time: number; value: number }[];
        const ohlc = (json.ohlc ?? []) as OHLCPoint[];
        dataRef.current = { points, ohlc };
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

  /* ---------- render series when data, chartType, or showSMA changes ---------- */
  React.useEffect(() => {
    const chart = chartRef.current;
    const data = dataRef.current;
    if (!chart || !data || loading) return;

    /* Remove old series */
    if (priceSeriesRef.current) {
      try { chart.removeSeries(priceSeriesRef.current); } catch { /* already removed */ }
      priceSeriesRef.current = null;
    }
    if (volumeSeriesRef.current) {
      try { chart.removeSeries(volumeSeriesRef.current); } catch { /* already removed */ }
      volumeSeriesRef.current = null;
    }
    if (smaSeriesRef.current) {
      try { chart.removeSeries(smaSeriesRef.current); } catch { /* already removed */ }
      smaSeriesRef.current = null;
    }

    const lineColor = readCssVar("--chart-line", "#b8bcc4");

    /* --- Volume histogram (added first so it renders behind price) --- */
    if (data.ohlc.length > 0) {
      const volSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        drawTicks: false,
        borderVisible: false,
      });

      volSeries.setData(
        data.ohlc.map((bar: OHLCPoint) => ({
          time: bar.time as UTCTimestamp,
          value: bar.volume,
          color:
            bar.close >= bar.open
              ? "oklch(0.72 0.17 155 / 0.3)" /* emerald, 30% opacity */
              : "oklch(0.63 0.21 25 / 0.3)",  /* red, 30% opacity */
        }))
      );
      volumeSeriesRef.current = volSeries;
    }

    /* --- Price series --- */
    if (chartType === "candle" && data.ohlc.length > 0) {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "oklch(0.72 0.17 155)",
        downColor: "oklch(0.63 0.21 25)",
        borderUpColor: "oklch(0.72 0.17 155)",
        borderDownColor: "oklch(0.63 0.21 25)",
        wickUpColor: "oklch(0.72 0.17 155)",
        wickDownColor: "oklch(0.63 0.21 25)",
        lastValueVisible: true,
        priceLineVisible: true,
      });
      candleSeries.setData(
        data.ohlc.map((bar: OHLCPoint) => ({
          time: bar.time as UTCTimestamp,
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
        }))
      );
      priceSeriesRef.current = candleSeries;
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 1,
        crosshairMarkerVisible: true,
        lastValueVisible: true,
        priceLineVisible: true,
      });
      lineSeries.setData(
        data.points.map((p: { time: number; value: number }) => ({
          time: p.time as UTCTimestamp,
          value: p.value,
        }))
      );
      priceSeriesRef.current = lineSeries;
    }

    /* --- SMA overlay --- */
    if (showSMA && data.ohlc.length >= 20) {
      const smaSeries = chart.addSeries(LineSeries, {
        color: "oklch(0.62 0.19 250 / 0.5)", /* blue at 50% opacity */
        lineWidth: 1,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const smaData = computeSMA(data.ohlc, 20);
      smaSeries.setData(smaData);
      smaSeriesRef.current = smaSeries;
    }

    chart.timeScale().fitContent();
  }, [chartType, showSMA, loading]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart type toggle */}
          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={(v) => v && setChartType(v as ChartType)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem
              value="line"
              className="h-7 px-2 text-[11px] data-[state=on]:bg-secondary"
            >
              Line
            </ToggleGroupItem>
            <ToggleGroupItem
              value="candle"
              className="h-7 px-2 text-[11px] data-[state=on]:bg-secondary"
            >
              Candle
            </ToggleGroupItem>
          </ToggleGroup>

          {/* SMA toggle */}
          <button
            type="button"
            onClick={() => setShowSMA((p) => !p)}
            className={cn(
              "h-7 rounded-md border px-2 text-[11px] transition-colors",
              showSMA
                ? "border-primary/40 bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            SMA 20
          </button>

          {/* Range toggles */}
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
      </div>
      <div className="relative h-[280px] w-full min-h-[200px]">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40 text-xs text-muted-foreground">
            Loading...
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
