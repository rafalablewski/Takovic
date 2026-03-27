# Takovic Database Documentation

---

## Connection

| Property | Value |
|----------|-------|
| Provider | Neon PostgreSQL (serverless) |
| Driver | `@neondatabase/serverless` (HTTP mode via `neon()`) |
| ORM | Drizzle ORM (`drizzle-orm/neon-http`) |
| Connection String | `DATABASE_URL` environment variable |
| Schema File | `src/lib/db/schema.ts` |
| DB Instance | `src/lib/db/index.ts` exports `db` |

```ts
// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
export type Database = typeof db;
```

The `db` instance is imported throughout the app for all database operations. The Neon HTTP driver is used (not WebSocket), making it suitable for serverless environments like Vercel.

---

## Enums

### `plan`

Values: `"free"`, `"pro"`, `"premium"`

Used in: `users.plan`

### `sentiment`

Values: `"bullish"`, `"somewhat_bullish"`, `"neutral"`, `"somewhat_bearish"`, `"bearish"`

Used in: `stock_analyses.ai_sentiment`, `news_articles.sentiment`

### `period`

Values: `"Q1"`, `"Q2"`, `"Q3"`, `"Q4"`, `"FY"`

Used in: `financial_data.period`

---

## Tables

### `users`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `email` | `varchar(255)` | NOT NULL, UNIQUE | -- |
| `name` | `varchar(255)` | nullable | -- |
| `avatar_url` | `text` | nullable | -- |
| `plan` | `plan` enum | NOT NULL | `'free'` |
| `created_at` | `timestamp` | NOT NULL | `now()` |
| `updated_at` | `timestamp` | NOT NULL | `now()` |

**Relations:** has many `watchlists`, has many `portfolios`, has one `user_preferences`

---

### `user_preferences`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `user_id` | `uuid` | NOT NULL, UNIQUE, FK -> `users.id` ON DELETE CASCADE | -- |
| `theme` | `varchar(10)` | NOT NULL | `'system'` |
| `default_screener_filters` | `text` | nullable (JSON string) | -- |
| `notifications_enabled` | `boolean` | NOT NULL | `true` |

**Relations:** belongs to `users`

---

### `stocks`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `ticker` | `varchar(10)` | NOT NULL | -- |
| `name` | `varchar(255)` | NOT NULL | -- |
| `exchange` | `varchar(20)` | NOT NULL | -- |
| `sector` | `varchar(100)` | nullable | -- |
| `industry` | `varchar(100)` | nullable | -- |
| `market_cap` | `numeric` | nullable | -- |
| `currency` | `varchar(10)` | NOT NULL | `'USD'` |
| `logo_url` | `text` | nullable | -- |
| `last_updated` | `timestamp` | NOT NULL | `now()` |

**Indexes:**
- `stocks_ticker_idx` -- UNIQUE index on `ticker`
- `stocks_sector_idx` -- index on `sector`

**Relations:** has many `stock_analyses`, has many `financial_data`, has many `news_articles`

---

### `stock_analyses`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `stock_id` | `uuid` | NOT NULL, FK -> `stocks.id` ON DELETE CASCADE | -- |
| `overall_score` | `numeric` | NOT NULL | -- |
| `value_score` | `numeric` | NOT NULL | -- |
| `growth_score` | `numeric` | NOT NULL | -- |
| `profitability_score` | `numeric` | NOT NULL | -- |
| `dividend_score` | `numeric` | NOT NULL | -- |
| `health_score` | `numeric` | NOT NULL | -- |
| `ai_summary` | `text` | nullable | -- |
| `ai_sentiment` | `sentiment` enum | nullable | -- |
| `strengths` | `text[]` | nullable (array) | -- |
| `weaknesses` | `text[]` | nullable (array) | -- |
| `generated_at` | `timestamp` | NOT NULL | `now()` |

**Indexes:**
- `analyses_stock_idx` -- index on `stock_id`

**Notes:** Analysis archives are append-only (Rule 49). Each update creates a new row; old rows are never overwritten.

---

### `financial_data`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `stock_id` | `uuid` | NOT NULL, FK -> `stocks.id` ON DELETE CASCADE | -- |
| `period` | `period` enum | NOT NULL | -- |
| `year` | `integer` | NOT NULL | -- |
| `revenue` | `numeric` | nullable | -- |
| `net_income` | `numeric` | nullable | -- |
| `eps` | `numeric` | nullable | -- |
| `pe_ratio` | `numeric` | nullable | -- |
| `debt_to_equity` | `numeric` | nullable | -- |
| `roe` | `numeric` | nullable | -- |
| `free_cash_flow` | `numeric` | nullable | -- |
| `dividend_yield` | `numeric` | nullable | -- |
| `report_date` | `timestamp` | nullable | -- |

**Indexes:**
- `financial_stock_idx` -- index on `stock_id`
- `financial_stock_period_year` -- UNIQUE index on (`stock_id`, `period`, `year`)

---

### `watchlists`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `user_id` | `uuid` | NOT NULL, FK -> `users.id` ON DELETE CASCADE | -- |
| `name` | `varchar(100)` | NOT NULL | -- |
| `is_default` | `boolean` | NOT NULL | `false` |
| `created_at` | `timestamp` | NOT NULL | `now()` |

**Relations:** belongs to `users`, has many `watchlist_stocks`

---

### `watchlist_stocks`

Join table between watchlists and stocks.

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `watchlist_id` | `uuid` | NOT NULL, FK -> `watchlists.id` ON DELETE CASCADE | -- |
| `stock_id` | `uuid` | NOT NULL, FK -> `stocks.id` ON DELETE CASCADE | -- |
| `notes` | `text` | nullable | -- |
| `added_at` | `timestamp` | NOT NULL | `now()` |

**Indexes:**
- `watchlist_stock_unique` -- UNIQUE index on (`watchlist_id`, `stock_id`)

---

### `portfolios`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `user_id` | `uuid` | NOT NULL, FK -> `users.id` ON DELETE CASCADE | -- |
| `name` | `varchar(100)` | NOT NULL | -- |
| `created_at` | `timestamp` | NOT NULL | `now()` |

**Relations:** belongs to `users`, has many `portfolio_holdings`

---

### `portfolio_holdings`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `portfolio_id` | `uuid` | NOT NULL, FK -> `portfolios.id` ON DELETE CASCADE | -- |
| `stock_id` | `uuid` | NOT NULL, FK -> `stocks.id` ON DELETE CASCADE | -- |
| `shares` | `numeric` | NOT NULL | -- |
| `avg_cost_basis` | `numeric` | NOT NULL | -- |
| `purchase_date` | `timestamp` | nullable | -- |

---

### `news_articles`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | `uuid` | PRIMARY KEY | `gen_random_uuid()` |
| `stock_id` | `uuid` | nullable, FK -> `stocks.id` ON DELETE SET NULL | -- |
| `title` | `text` | NOT NULL | -- |
| `summary` | `text` | nullable | -- |
| `source_url` | `text` | NOT NULL | -- |
| `source_name` | `varchar(100)` | nullable | -- |
| `sentiment` | `sentiment` enum | nullable | -- |
| `image_url` | `text` | nullable | -- |
| `published_at` | `timestamp` | NOT NULL | -- |
| `created_at` | `timestamp` | NOT NULL | `now()` |

**Indexes:**
- `news_stock_idx` -- index on `stock_id`
- `news_published_idx` -- index on `published_at`

**Notes:** The `stock_id` foreign key uses `ON DELETE SET NULL` (not CASCADE) so news articles are preserved even if a stock is removed.

---

## Relations Summary

```
users
  |-- 1:many -> watchlists
  |-- 1:many -> portfolios
  |-- 1:1   -> user_preferences

watchlists
  |-- 1:many -> watchlist_stocks (join table)
                  |-- many:1 -> stocks

portfolios
  |-- 1:many -> portfolio_holdings
                  |-- many:1 -> stocks

stocks
  |-- 1:many -> stock_analyses
  |-- 1:many -> financial_data
  |-- 1:many -> news_articles
```

All user-owned entities (`watchlists`, `portfolios`, `user_preferences`) cascade-delete when a user is deleted. All stock-dependent data (`stock_analyses`, `financial_data`) cascade-deletes when a stock is deleted. News articles set `stock_id` to NULL on stock deletion.

---

## Migrations

### Configuration

Defined in `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
});
```

### Generate Migrations

After changing `schema.ts`:

```bash
npx drizzle-kit generate
```

Outputs SQL migration files to `src/lib/db/migrations/`.

### Apply Migrations

Option A -- Push directly (development):

```bash
npx drizzle-kit push
```

Option B -- Apply via Neon SQL Editor: copy the generated SQL migration file contents and run in the Neon console.

### Inspect Schema

```bash
npx drizzle-kit studio
```

Opens Drizzle Studio for browsing the database visually.

---

## Example Queries

### Insert a user

```ts
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const [user] = await db.insert(users).values({
  email: "user@example.com",
  name: "Jane Doe",
}).returning();
```

### Get a stock by ticker

```ts
import { eq } from "drizzle-orm";
import { stocks } from "@/lib/db/schema";

const stock = await db.query.stocks.findFirst({
  where: eq(stocks.ticker, "AAPL"),
});
```

### Add a stock to a watchlist

```ts
import { watchlistStocks } from "@/lib/db/schema";

await db.insert(watchlistStocks).values({
  watchlistId: "uuid-of-watchlist",
  stockId: "uuid-of-stock",
  notes: "Watching for earnings",
});
```

### Get stock analysis with relations

```ts
const stock = await db.query.stocks.findFirst({
  where: eq(stocks.ticker, "AAPL"),
  with: {
    analyses: {
      orderBy: (analyses, { desc }) => [desc(analyses.generatedAt)],
      limit: 1,
    },
  },
});
```

### Get user's watchlists with stocks

```ts
const userWatchlists = await db.query.watchlists.findMany({
  where: eq(watchlists.userId, userId),
  with: {
    stocks: {
      with: {
        stock: true,
      },
    },
  },
});
```

### Insert financial data

```ts
import { financialData } from "@/lib/db/schema";

await db.insert(financialData).values({
  stockId: "uuid-of-stock",
  period: "Q1",
  year: 2026,
  revenue: "95000000000",
  netIncome: "25000000000",
  eps: "1.58",
}).onConflictDoUpdate({
  target: [financialData.stockId, financialData.period, financialData.year],
  set: { revenue: "95000000000", netIncome: "25000000000", eps: "1.58" },
});
```
