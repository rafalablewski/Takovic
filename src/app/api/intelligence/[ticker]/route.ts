import { NextResponse } from "next/server";
import { getSECFilings, getPressReleases } from "@/lib/api/fmp";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    const [filings, pressReleases] = await Promise.all([
      getSECFilings(upperTicker, undefined, 50),
      getPressReleases(upperTicker, 30),
    ]);

    return NextResponse.json({
      ticker: upperTicker,
      filings: filings ?? [],
      pressReleases: pressReleases ?? [],
    });
  } catch (error) {
    console.error("Intelligence API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch intelligence data" },
      { status: 500 }
    );
  }
}
