# Market equities (CSV seed)

This folder feeds the **Stock Screener** and **Lookup** “Trending” section. Data lives in Neon table `market_equities` (see `src/lib/db/schema.ts`).

## Coverage

Use one row per **symbol + exchange** so the same ticker can exist on different venues (e.g. US vs Canada vs Europe). Set:

- `country` — ISO 3166-1 alpha-2 (`US`, `CA`, `DE`, `GB`, …)
- `region` — `US`, `CA`, or `EU` (Europe-wide bucket for filtering)

Expand `universe.csv` with as many US, Canadian, and European listings as you need; the app does not pull this list from an external API.

## Columns (`universe.csv`)

| Column | Required | Notes |
|--------|----------|--------|
| `symbol` | yes | Uppercase ticker |
| `name` | yes | Avoid commas in names (simple CSV parser) |
| `exchange` | yes | e.g. NASDAQ, NYSE, TSX, LSE, XETR |
| `country` | yes | 2-letter code |
| `region` | yes | `US`, `CA`, or `EU` |
| `currency` | yes | ISO code for `price` display |
| `sector` | no | Matches screener sector filter |
| `industry` | no | |
| `price` | yes | Last price |
| `change_pct` | no | Day change % |
| `volume` | no | Share volume |
| `market_cap` | no | Full cap in **minor units** of `currency` (same convention as before: raw number) |
| `pe_ratio` | no | Trailing P/E |
| `roe` | no | ROE in **percent points** (e.g. `15` = 15%) |
| `dividend_yield` | no | Yield in **percent points** |
| `composite_score` | no | 0–5 for “Min score” filter |

## Import

1. Apply migrations (includes `market_equities`): `npx drizzle-kit migrate` with `DATABASE_URL` set, or run the SQL in `src/lib/db/migrations/0001_market_equities.sql` in the Neon SQL editor.
2. Seed / refresh from CSV:

```bash
DATABASE_URL="postgresql://..." npm run db:seed:market-equities
```

Re-run the same command after editing `universe.csv`; rows are **upserted** on `(symbol, exchange)`.
