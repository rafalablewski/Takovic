/**
 * Upsert rows from data/market-equities/universe.csv into Neon (market_equities).
 *
 * Usage: DATABASE_URL=... npm run db:seed:market-equities
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const CSV_PATH = fileURLToPath(
  new URL("../data/market-equities/universe.csv", import.meta.url)
);

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length !== headers.length) {
      console.warn(`Skipping line ${i + 1}: expected ${headers.length} columns`);
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = cols[j]?.trim() ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function num(s: string | undefined): string | null {
  if (s === undefined || s === "") return null;
  return s;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const raw = readFileSync(CSV_PATH, "utf-8");
  const parsed = parseCsv(raw);
  if (parsed.length === 0) {
    console.error("No rows in CSV:", CSV_PATH);
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  let n = 0;
  for (const r of parsed) {
    const row = {
      symbol: r.symbol?.toUpperCase() ?? "",
      name: r.name ?? "",
      exchange: r.exchange ?? "",
      country: (r.country ?? "").toUpperCase().slice(0, 2),
      region: (r.region ?? "US").toUpperCase().slice(0, 8),
      currency: (r.currency ?? "USD").toUpperCase().slice(0, 8),
      sector: r.sector || null,
      industry: r.industry || null,
      price: r.price ?? "0",
      changePct: num(r.change_pct),
      volume: num(r.volume),
      marketCap: num(r.market_cap),
      peRatio: num(r.pe_ratio),
      roe: num(r.roe),
      dividendYield: num(r.dividend_yield),
      compositeScore: num(r.composite_score),
      updatedAt: new Date(),
    };

    if (!row.symbol || !row.name || !row.exchange || !row.country) {
      console.warn("Skipping incomplete row:", r);
      continue;
    }

    await db
      .insert(schema.marketEquities)
      .values(row)
      .onConflictDoUpdate({
        target: [
          schema.marketEquities.symbol,
          schema.marketEquities.exchange,
        ],
        set: {
          name: row.name,
          country: row.country,
          region: row.region,
          currency: row.currency,
          sector: row.sector,
          industry: row.industry,
          price: row.price,
          changePct: row.changePct,
          volume: row.volume,
          marketCap: row.marketCap,
          peRatio: row.peRatio,
          roe: row.roe,
          dividendYield: row.dividendYield,
          compositeScore: row.compositeScore,
          updatedAt: new Date(),
        },
      });
    n++;
  }

  console.log(`Upserted ${n} market_equities rows from ${CSV_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
