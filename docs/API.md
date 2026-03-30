# Takovic API Documentation

---

## Implemented Endpoints

### GET `/api/stocks/[ticker]`

Fetches real-time quote, company profile, and key metrics for a single stock.

**Route file:** `src/app/api/stocks/[ticker]/route.ts`

**Path params:**

| Param | Type | Description |
|-------|------|-------------|
| `ticker` | `string` | Stock ticker symbol (case-insensitive, uppercased internally) |

**Response (200):**

```json
{
  "quote": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 178.52,
    "changesPercentage": 1.23,
    "change": 2.17,
    "dayLow": 176.01,
    "dayHigh": 179.43,
    "yearHigh": 199.62,
    "yearLow": 143.90,
    "marketCap": 2780000000000,
    "volume": 52341000,
    "avgVolume": 58900000,
    "open": 176.80,
    "previousClose": 176.35,
    "eps": 6.42,
    "pe": 27.81,
    "timestamp": 1711555200
  },
  "profile": {
    "symbol": "AAPL",
    "companyName": "Apple Inc.",
    "description": "...",
    "sector": "Technology",
    "industry": "Consumer Electronics",
    "exchange": "NASDAQ",
    "currency": "USD",
    "country": "US",
    "website": "https://www.apple.com",
    "image": "https://...",
    "fullTimeEmployees": "164000",
    "ipoDate": "1980-12-12",
    "ceo": "Tim Cook",
    "mktCap": 2780000000000
  },
  "metrics": {
    "date": "2025-09-30",
    "period": "FY",
    "peRatio": 27.81,
    "pbRatio": 45.2,
    "psRatio": 7.3,
    "roe": 1.71,
    "roa": 0.28,
    "debtToEquity": 1.87,
    "currentRatio": 0.99,
    "revenuePerShare": 24.32,
    "dividendYield": 0.0055,
    "freeCashFlowYield": 0.034,
    "grossProfitMargin": 0.462,
    "operatingProfitMargin": 0.335,
    "netProfitMargin": 0.267
  }
}
```

**Error responses:**

| Status | Body |
|--------|------|
| 404 | `{ "error": "Stock not found" }` |
| 500 | `{ "error": "Failed to fetch stock data" }` |

**Caching:** Redis key `quote:{TICKER}`, TTL 60 seconds (1 minute).

**Data sources:** FMP `/quote/{ticker}`, `/profile/{ticker}`, `/key-metrics/{ticker}`

---

### GET `/api/stocks/search?q=`

Searches for stocks by name or ticker symbol.

**Route file:** `src/app/api/stocks/search/route.ts`

**Query params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | `string` | Yes | Search query (min 1 character) |

**Response (200):**

```json
[
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "currency": "USD",
    "stockExchange": "NASDAQ Global Select",
    "exchangeShortName": "NASDAQ"
  }
]
```

Returns up to 10 results. Returns empty array `[]` if query is empty.

**Error responses:**

| Status | Body |
|--------|------|
| 500 | `{ "error": "Search failed" }` |

**Caching:** Redis key `search:{query}`, TTL 300 seconds (5 minutes).

**Data source:** FMP `/search?query={q}&limit=10`

---

### GET `/api/analysis/[ticker]`

Generates a full AI-powered stock analysis including snowflake scores and a Claude-generated summary.

**Route file:** `src/app/api/analysis/[ticker]/route.ts`

**Path params:**

| Param | Type | Description |
|-------|------|-------------|
| `ticker` | `string` | Stock ticker symbol (case-insensitive) |

**Response (200):**

```json
{
  "ticker": "AAPL",
  "scores": {
    "value": 3.2,
    "growth": 4.1,
    "profitability": 4.8,
    "health": 3.5,
    "dividend": 2.1,
    "overall": 3.5
  },
  "summary": "Apple continues to demonstrate...",
  "sentiment": "somewhat_bullish",
  "strengths": ["Strong brand ecosystem", "Consistent cash generation"],
  "weaknesses": ["Slowing iPhone growth", "China market risks"],
  "generatedAt": "2026-03-27T12:00:00.000Z"
}
```

**Error responses:**

| Status | Body |
|--------|------|
| 404 | `{ "error": "Insufficient data for analysis" }` |
| 500 | `{ "error": "Failed to generate analysis" }` |

**Caching:** Redis key `ai:summary:{TICKER}`, TTL 604800 seconds (7 days).

**Data sources:**
- FMP: `/profile/{ticker}`, `/key-metrics/{ticker}`, `/income-statement/{ticker}` (5 years annual), `/balance-sheet-statement/{ticker}` (1 year annual), `/stock_news` (5 articles)
- Claude API: AI summary generation via `generateStockSummary()`
- Internal: `calculateSnowflakeScores()` from `src/lib/analysis/scores.ts`

---

## Planned Endpoints

These endpoints are not yet implemented but are anticipated based on the database schema and application architecture.

### Watchlist CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/watchlists` | List user's watchlists |
| POST | `/api/watchlists` | Create a new watchlist |
| PUT | `/api/watchlists/[id]` | Update watchlist name/settings |
| DELETE | `/api/watchlists/[id]` | Delete a watchlist |
| POST | `/api/watchlists/[id]/stocks` | Add stock to watchlist |
| DELETE | `/api/watchlists/[id]/stocks/[stockId]` | Remove stock from watchlist |

### Portfolio CRUD

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolios` | List user's portfolios |
| POST | `/api/portfolios` | Create a new portfolio |
| POST | `/api/portfolios/[id]/holdings` | Add a holding |
| PUT | `/api/portfolios/[id]/holdings/[holdingId]` | Update shares/cost basis |
| DELETE | `/api/portfolios/[id]/holdings/[holdingId]` | Remove a holding |

### News Feed

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/news` | General market news |
| GET | `/api/news/[ticker]` | Stock-specific news |

### Screener

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/screener` | Filter stocks by criteria (sector, market cap, P/E, etc.) |

---

## External APIs

### Financial Modeling Prep (FMP)

**Client:** `src/lib/api/fmp.ts`

**Base URL:** `https://financialmodelingprep.com/api/v3`

**Authentication:** API key via `FMP_API_KEY` env var, passed as `?apikey=` query parameter.

**Endpoints used:**

| FMP Endpoint | Wrapper Function | Returns |
|-------------|-----------------|---------|
| `/quote/{ticker}` | `getQuote(ticker)` | `FMPQuote` (single) |
| `/profile/{ticker}` | `getProfile(ticker)` | `FMPProfile` (single) |
| `/income-statement/{ticker}` | `getIncomeStatement(ticker, period?, limit?)` | `FMPIncomeStatement[]` |
| `/balance-sheet-statement/{ticker}` | `getBalanceSheet(ticker, period?, limit?)` | `FMPBalanceSheet[]` |
| `/key-metrics/{ticker}` | `getKeyMetrics(ticker, period?, limit?)` | `FMPKeyMetrics[]` |
| `/search` | `searchStocks(query, limit?)` | `FMPSearchResult[]` |
| `/stock_news` | `getStockNews(ticker, limit?)` | `FMPNews[]` |
| `/stock_news` (requires `tickers`) | `getMarketNews(limit?, tickers?)` — defaults to a broad symbol list if `tickers` omitted | `FMPNews[]` |
| `/stock-screener` (legacy) | `screenStocks(params)` in `fmp.ts` — unused by UI if you use CSV screener | `FMPScreenerResult[]` |
| — | Stock screener + lookup trending read **`market_equities`** in Neon (`searchMarketEquities`, etc.) | app-owned |

**Rate Limits:** Depends on FMP plan. Free tier allows 250 requests/day. All FMP fetches include `next: { revalidate: 300 }` (5-minute Next.js fetch cache).

**Error Handling:** Non-OK responses throw `Error` with status code and status text.

---

## Caching

**Provider:** Upstash Redis (`@upstash/redis`)

**Configuration:** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars.

**Client:** `src/lib/cache.ts`

### Key Patterns

| Key Pattern | TTL | Description |
|-------------|-----|-------------|
| `quote:{TICKER}` | 60s (1 min) | Stock quote + profile + metrics bundle |
| `profile:{TICKER}` | 86400s (24h) | Company profile |
| `financials:{TICKER}:{period}` | 86400s (24h) | Financial statements |
| `metrics:{TICKER}` | 86400s (24h) | Key metrics |
| `news:{TICKER}` | 900s (15 min) | Stock-specific news |
| `news:market` | 900s (15 min) | General market news |
| `ai:summary:{TICKER}` | 604800s (7 days) | AI-generated analysis |
| `screener:{hash}` | 3600s (1 hour) | Screener results |
| `search:{query}` | 300s (5 min) | Search results |

### Cache Helpers

```ts
getCached<T>(key: string): Promise<T | null>       // Get cached value
setCache<T>(key, value, ttlSeconds): Promise<void>  // Set with TTL
invalidateCache(pattern: string): Promise<void>      // Delete keys matching pattern (uses KEYS + DEL)
```

### Invalidation

`invalidateCache(pattern)` uses Redis `KEYS` command with glob patterns followed by `DEL`. Example: `invalidateCache("quote:*")` clears all quote caches.

---

## Error Handling

All API routes follow a consistent error response format:

```json
{
  "error": "Human-readable error description"
}
```

Standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | Resource not found / insufficient data |
| 500 | Internal server error (FMP failure, AI failure, etc.) |

All errors are logged to `console.error` with contextual information (ticker, operation type).
