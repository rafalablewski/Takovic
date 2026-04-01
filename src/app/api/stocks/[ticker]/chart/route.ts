import { NextResponse } from "next/server";
import {
  getHistoricalChart5Min,
  getHistoricalPriceFull,
  type FMPHistoricalBar,
  type FMPIntradayBar,
} from "@/lib/api/yahoo";

export const dynamic = "force-dynamic";

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "MAX";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface ChartPoint { time: number; value: number }
interface OHLCPoint { time: number; open: number; high: number; low: number; close: number; volume: number }

function barsToPoints(bars: FMPHistoricalBar[]): { points: ChartPoint[]; ohlc: OHLCPoint[] } {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const points = sorted.map((b) => ({
    time: Math.floor(new Date(b.date + "T12:00:00Z").getTime() / 1000),
    value: b.close,
  }));
  const ohlc = sorted.map((b) => ({
    time: Math.floor(new Date(b.date + "T12:00:00Z").getTime() / 1000),
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
  }));
  return { points, ohlc };
}

/** FMP intraday: usually "YYYY-MM-DD HH:mm:ss" or ISO with T; normalize without relying on a single space. */
function parseIntradayBarMs(dateStr: string): number {
  const trimmed = dateStr.trim();
  const normalized = trimmed.includes("T")
    ? trimmed
    : trimmed.replace(/^(\d{4}-\d{2}-\d{2})\s+(\S+)/, "$1T$2");
  const withZone = normalized.endsWith("Z") ? normalized : `${normalized}Z`;
  return Date.parse(withZone);
}

function intradayToPoints(bars: FMPIntradayBar[]): { points: ChartPoint[]; ohlc: OHLCPoint[] } {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const valid = sorted
    .map((b) => {
      const ms = parseIntradayBarMs(b.date);
      if (!Number.isFinite(ms)) return null;
      const time = Math.floor(ms / 1000);
      return { bar: b, time };
    })
    .filter((v): v is { bar: FMPIntradayBar; time: number } => v != null);

  const points = valid.map((v) => ({ time: v.time, value: v.bar.close }));
  const ohlc = valid.map((v) => ({
    time: v.time,
    open: v.bar.open,
    high: v.bar.high,
    low: v.bar.low,
    close: v.bar.close,
    volume: v.bar.volume,
  }));
  return { points, ohlc };
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await ctx.params;
  const upper = ticker.toUpperCase();
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "1Y") as ChartRange;

  const to = new Date();
  const toStr = ymd(to);

  try {
    if (range === "1D") {
      const from = new Date(to);
      /* ~78 five-minute bars per US session; 400 bars ≈ 5 sessions — 8d covers weekends + holidays */
      from.setDate(from.getDate() - 8);
      const fromStr = ymd(from);
      const raw = await getHistoricalChart5Min(upper, fromStr, toStr);
      let { points, ohlc } = intradayToPoints(Array.isArray(raw) ? raw : []);
      if (points.length > 400) {
        points = points.slice(-400);
        ohlc = ohlc.slice(-400);
      }
      return NextResponse.json({ range, points, ohlc, resolution: "5min" as const });
    }

    const from = new Date(to);
    switch (range) {
      case "1W":
        from.setDate(from.getDate() - 14);
        break;
      case "1M":
        from.setMonth(from.getMonth() - 1);
        break;
      case "3M":
        from.setMonth(from.getMonth() - 3);
        break;
      case "1Y":
        from.setFullYear(from.getFullYear() - 1);
        break;
      case "MAX":
        from.setFullYear(from.getFullYear() - 20);
        break;
      default:
        from.setFullYear(from.getFullYear() - 1);
    }

    const fromStr = ymd(from);
    const full = await getHistoricalPriceFull(upper, {
      from: fromStr,
      to: toStr,
    });
    const historical = full?.historical ?? [];
    const { points, ohlc } = barsToPoints(historical);
    return NextResponse.json({ range, points, ohlc, resolution: "day" as const });
  } catch (e) {
    console.error(`Chart API ${upper} ${range}:`, e);
    return NextResponse.json(
      { error: "Failed to load chart", points: [] },
      { status: 502 }
    );
  }
}
