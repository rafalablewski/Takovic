import { NextResponse } from "next/server";
import {
  getHistoricalChart5Min,
  getHistoricalPriceFull,
  type FMPHistoricalBar,
  type FMPIntradayBar,
} from "@/lib/api/fmp";

export const dynamic = "force-dynamic";

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "MAX";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function barsToPoints(bars: FMPHistoricalBar[]): { time: number; value: number }[] {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((b) => ({
    time: Math.floor(new Date(b.date + "T12:00:00Z").getTime() / 1000),
    value: b.close,
  }));
}

function intradayToPoints(bars: FMPIntradayBar[]): { time: number; value: number }[] {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((b) => {
    const normalized = b.date.includes("T")
      ? b.date
      : b.date.replace(" ", "T");
    const ms = Date.parse(normalized.endsWith("Z") ? normalized : `${normalized}Z`);
    return {
      time: Math.floor(ms / 1000),
      value: b.close,
    };
  });
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
      from.setDate(from.getDate() - 10);
      const fromStr = ymd(from);
      const raw = await getHistoricalChart5Min(upper, fromStr, toStr);
      let points = intradayToPoints(Array.isArray(raw) ? raw : []);
      if (points.length > 400) {
        points = points.slice(-400);
      }
      return NextResponse.json({ range, points, resolution: "5min" as const });
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
    const points = barsToPoints(historical);
    return NextResponse.json({ range, points, resolution: "day" as const });
  } catch (e) {
    console.error(`Chart API ${upper} ${range}:`, e);
    return NextResponse.json(
      { error: "Failed to load chart", points: [] },
      { status: 502 }
    );
  }
}
