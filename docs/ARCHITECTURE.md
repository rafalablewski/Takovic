# Takovic — Architecture Plan

> AI-powered financial analysis platform combining the best of Seeking Alpha, MarketWatch, and Simply Wall St.

## 1. Tech Stack

### Frontend
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 15** (App Router) | Server components, streaming, ISR for market data pages |
| Language | **TypeScript 5.x** | Type safety across the full stack |
| Styling | **Tailwind CSS 4** | Utility-first, fast iteration |
| UI Components | **shadcn/ui** (v4 + Radix UI) | Accessible, composable, themeable |
| Charts — Financial | **TradingView Lightweight Charts** | Purpose-built for candlestick/area/volume charts, tiny bundle (~40KB) |
| Charts — Dashboard | **Recharts** | Radar (snowflake), bar, pie charts for analysis dashboards |
| State Management | **Zustand** | Lightweight, no boilerplate |
| Data Fetching | **TanStack Query (React Query)** | Cache, background refetch, stale-while-revalidate for market data |

### Backend
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| API Layer | **Next.js Route Handlers** (App Router) | Colocated with frontend, edge-ready |
| AI Services | **Python FastAPI** microservice | Claude API integration, sentiment analysis, NLP pipelines |
| Auth | **Auth.js v5** (NextAuth) | OAuth providers + credentials, session management |
| ORM | **Drizzle ORM** | Type-safe, lightweight, great DX with PostgreSQL |
| Validation | **Zod** | Schema validation shared between client and server |

### Data & Infrastructure
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Primary DB | **PostgreSQL** (via Neon or Supabase) | Relational data: users, watchlists, analyses, stock metadata |
| Cache | **Redis** (Upstash) | Market data caching, rate limiting, session store |
| Financial Data | **Financial Modeling Prep (FMP)** | Best free tier (250 req/day), comprehensive fundamentals, earnings, news |
| Market Data (backup) | **Alpha Vantage** | Intraday/daily prices, technical indicators |
| AI | **Claude API** (Anthropic) | Stock summaries, sentiment analysis, earnings digest |
| Search | **Meilisearch** (or Algolia) | Fast stock/ticker search with typo tolerance |
| Deployment | **Vercel** (Next.js) + **Railway/Fly.io** (Python services) | Edge-optimized frontend, containerized AI backend |
| CI/CD | **GitHub Actions** | Lint, test, deploy pipeline |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│  Next.js App Router │ React Server Components │ TanStack Query   │
└────────────┬──────────────────┬──────────────────┬──────────────┘
             │                  │                  │
             ▼                  ▼                  ▼
┌────────────────────┐ ┌──────────────┐ ┌─────────────────────┐
│  Next.js API Routes│ │  Static/ISR  │ │  WebSocket (future)  │
│  /api/stocks/*     │ │  Pages       │ │  Real-time prices    │
│  /api/analysis/*   │ │  /stock/[id] │ │                     │
│  /api/watchlist/*  │ │  /screener   │ │                     │
│  /api/news/*       │ │              │ │                     │
└────────┬───────────┘ └──────────────┘ └─────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  Redis Cache     │  │  Python AI   │
│  (Neon)      │  │  (Upstash)       │  │  Service     │
│              │  │                  │  │  (FastAPI)   │
│  Users       │  │  Market prices   │  │              │
│  Watchlists  │  │  API responses   │  │  Claude API  │
│  Analyses    │  │  Rate limits     │  │  Sentiment   │
│  Stock meta  │  │  Sessions        │  │  Summaries   │
└──────────────┘  └──────────────────┘  └──────┬───────┘
                                               │
         ┌─────────────────────────────────────┘
         ▼
┌─────────────────────────────────────┐
│  External Financial Data APIs       │
│  • Financial Modeling Prep (primary)│
│  • Alpha Vantage (backup/technical) │
│  • News APIs (RSS, NewsAPI)         │
└─────────────────────────────────────┘
```

### Caching Strategy

| Data Type | Cache TTL | Strategy |
|-----------|-----------|----------|
| Stock quotes | 1-5 min | Redis + SWR on client |
| Company fundamentals | 24 hours | Redis + ISR (revalidate daily) |
| Financial statements | 24 hours | PostgreSQL + daily cron refresh |
| News articles | 15 min | Redis + background refresh |
| AI summaries | 7 days | PostgreSQL (regenerate on new data) |
| Stock screener results | 1 hour | Redis with query-based keys |

---

## 3. Data Model

### Core Entities

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   User       │────<│  Watchlist    │────<│ WatchlistStock   │
│─────────────│     │──────────────│     │─────────────────│
│ id (uuid)    │     │ id            │     │ watchlistId      │
│ email        │     │ userId        │     │ stockId          │
│ name         │     │ name          │     │ addedAt          │
│ avatarUrl    │     │ isDefault     │     │ notes            │
│ plan (enum)  │     │ createdAt     │     └─────────────────┘
│ createdAt    │     └──────────────┘
└──────┬──────┘
       │
       │     ┌──────────────────┐     ┌──────────────────────┐
       ├────<│  Portfolio        │────<│  PortfolioHolding     │
       │     │──────────────────│     │──────────────────────│
       │     │ id                │     │ portfolioId           │
       │     │ userId            │     │ stockId               │
       │     │ name              │     │ shares                │
       │     │ createdAt         │     │ avgCostBasis          │
       │     └──────────────────┘     │ purchaseDate          │
       │                               └──────────────────────┘
       │
       └────<┌──────────────────┐
             │  UserPreferences  │
             │──────────────────│
             │ userId            │
             │ theme             │
             │ defaultScreener   │
             │ notifications     │
             └──────────────────┘

┌──────────────────┐     ┌──────────────────────┐
│   Stock           │────<│  StockAnalysis        │
│──────────────────│     │──────────────────────│
│ id                │     │ id                    │
│ ticker            │     │ stockId               │
│ name              │     │ overallScore          │
│ exchange          │     │ valueScore            │
│ sector            │     │ growthScore           │
│ industry          │     │ profitabilityScore    │
│ marketCap         │     │ dividendScore         │
│ currency          │     │ healthScore           │
│ logoUrl           │     │ aiSummary             │
│ lastUpdated       │     │ aiSentiment (enum)    │
└──────┬───────────┘     │ generatedAt           │
       │                  └──────────────────────┘
       │
       ├────<┌──────────────────┐
       │     │  FinancialData    │
       │     │──────────────────│
       │     │ stockId           │
       │     │ period (Q/Y)      │
       │     │ revenue           │
       │     │ netIncome         │
       │     │ eps               │
       │     │ peRatio           │
       │     │ debtToEquity      │
       │     │ roe               │
       │     │ freeCashFlow      │
       │     │ dividendYield     │
       │     │ reportDate        │
       │     └──────────────────┘
       │
       └────<┌──────────────────┐
             │  NewsArticle      │
             │──────────────────│
             │ id                │
             │ stockId (nullable)│
             │ title             │
             │ summary           │
             │ sourceUrl         │
             │ sourceName        │
             │ sentiment (enum)  │
             │ publishedAt       │
             │ imageUrl          │
             └──────────────────┘
```

### Enums
- **Plan**: `free`, `pro`, `premium`
- **Sentiment**: `bullish`, `somewhat_bullish`, `neutral`, `somewhat_bearish`, `bearish`
- **Period**: `Q1`, `Q2`, `Q3`, `Q4`, `FY`

---

## 4. Project Structure

```
takovic/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Authenticated layout group
│   │   │   ├── layout.tsx            # Sidebar + header layout
│   │   │   ├── page.tsx              # Dashboard home (market overview)
│   │   │   ├── stock/
│   │   │   │   └── [ticker]/
│   │   │   │       ├── page.tsx      # Stock analysis dashboard
│   │   │   │       ├── financials/page.tsx
│   │   │   │       └── news/page.tsx
│   │   │   ├── screener/page.tsx     # Stock screener
│   │   │   ├── watchlist/page.tsx    # Watchlists
│   │   │   ├── portfolio/page.tsx    # Portfolio tracker
│   │   │   └── news/page.tsx         # News feed
│   │   ├── api/                      # API Route Handlers
│   │   │   ├── stocks/
│   │   │   │   ├── [ticker]/route.ts
│   │   │   │   ├── search/route.ts
│   │   │   │   └── screener/route.ts
│   │   │   ├── analysis/
│   │   │   │   └── [ticker]/route.ts
│   │   │   ├── watchlist/route.ts
│   │   │   ├── portfolio/route.ts
│   │   │   ├── news/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── charts/
│   │   │   ├── snowflake-chart.tsx   # Radar chart (analysis scores)
│   │   │   ├── price-chart.tsx       # TradingView lightweight chart
│   │   │   ├── financials-chart.tsx  # Revenue/earnings bars
│   │   │   └── sentiment-gauge.tsx   # AI sentiment indicator
│   │   ├── stock/
│   │   │   ├── stock-header.tsx      # Ticker, price, change
│   │   │   ├── stock-metrics.tsx     # Key financial metrics grid
│   │   │   ├── stock-summary.tsx     # AI-generated summary
│   │   │   └── stock-card.tsx        # Compact card for lists
│   │   ├── screener/
│   │   │   ├── filter-panel.tsx
│   │   │   └── results-table.tsx
│   │   ├── news/
│   │   │   ├── news-card.tsx
│   │   │   └── news-feed.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── search-command.tsx    # Cmd+K stock search
│   │   └── shared/
│   │       ├── loading-skeleton.tsx
│   │       └── error-boundary.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts            # Drizzle schema definitions
│   │   │   ├── index.ts             # DB connection
│   │   │   └── migrations/          # Drizzle migrations
│   │   ├── api/
│   │   │   ├── fmp.ts               # Financial Modeling Prep client
│   │   │   ├── alpha-vantage.ts     # Alpha Vantage client
│   │   │   └── news.ts              # News aggregation client
│   │   ├── ai/
│   │   │   ├── claude.ts            # Claude API client
│   │   │   ├── prompts.ts           # Prompt templates
│   │   │   └── sentiment.ts         # Sentiment analysis helpers
│   │   ├── analysis/
│   │   │   ├── scores.ts            # Snowflake score calculations
│   │   │   └── valuation.ts         # Valuation models (DCF, etc.)
│   │   ├── cache.ts                 # Redis cache helpers
│   │   ├── auth.ts                  # Auth.js config
│   │   └── utils.ts                 # Shared utilities
│   │
│   ├── hooks/
│   │   ├── use-stock.ts             # Stock data hook
│   │   ├── use-watchlist.ts         # Watchlist CRUD hook
│   │   └── use-screener.ts          # Screener filters hook
│   │
│   ├── types/
│   │   ├── stock.ts
│   │   ├── analysis.ts
│   │   └── news.ts
│   │
│   └── stores/
│       └── app-store.ts             # Zustand global store
│
├── services/
│   └── ai/                          # Python AI microservice
│       ├── main.py                  # FastAPI entry point
│       ├── routers/
│       │   ├── sentiment.py
│       │   └── summary.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .env.local                       # (gitignored)
└── docs/
    └── ARCHITECTURE.md              # This file
```

---

## 5. Core Features (MVP)

### 5.1 Stock Analysis Dashboard (`/stock/[ticker]`)
The centerpiece of the app. For any ticker:

- **Snowflake Chart** — Radar chart scoring: Value, Growth, Profitability, Health, Dividend (0-5 scale each, inspired by Simply Wall St)
- **AI Summary** — Claude-generated plain-English analysis: "What does this company do? Is it fairly valued? Key risks?"
- **Key Metrics Grid** — P/E, P/B, ROE, Debt/Equity, Revenue Growth, Free Cash Flow, Dividend Yield
- **Price Chart** — TradingView Lightweight Charts with 1D/1W/1M/1Y/5Y timeframes
- **Financial Statements** — Interactive bar charts for Revenue, Net Income, EPS over time
- **News Feed** — Recent articles with AI sentiment tags (bullish/bearish/neutral)

### 5.2 Stock Screener (`/screener`)
Filter and rank stocks by:
- Market cap range
- Sector/industry
- P/E ratio, dividend yield, ROE ranges
- Snowflake scores (e.g., "Value > 3 AND Growth > 4")
- AI sentiment filter

### 5.3 Watchlist (`/watchlist`)
- Multiple named watchlists
- Quick-add from any stock page
- At-a-glance: price, change %, mini snowflake, sentiment badge
- Drag-and-drop reorder

### 5.4 News Aggregation (`/news`)
- Aggregated from multiple sources (FMP news, RSS feeds)
- AI sentiment tagging per article
- Filter by watchlist, sector, or sentiment
- AI daily market digest (morning summary)

### 5.5 Portfolio Tracker (`/portfolio`)
- Add holdings (ticker, shares, cost basis)
- Portfolio snowflake (aggregated scores)
- Gain/loss tracking
- Sector allocation pie chart

---

## 6. MVP Phases

### Phase 1 — Foundation (Weeks 1-3)
> Get the skeleton running with real data for a single stock.

- [ ] Next.js project setup (App Router, TypeScript, Tailwind, shadcn/ui)
- [ ] Database schema + Drizzle ORM setup (PostgreSQL on Neon)
- [ ] Auth.js v5 (Google + GitHub OAuth)
- [ ] FMP API integration (stock quotes, company profile, financials)
- [ ] Redis caching layer (Upstash)
- [ ] Stock page: price chart + key metrics grid
- [ ] Global stock search (Cmd+K command palette)
- [ ] Dashboard layout (sidebar, header)

### Phase 2 — Analysis Engine (Weeks 4-6)
> The differentiator: AI-powered analysis with visual scoring.

- [ ] Snowflake score calculation engine (5 dimensions)
- [ ] Snowflake radar chart component (Recharts)
- [ ] Claude API integration for stock summaries
- [ ] AI sentiment analysis for news articles
- [ ] Financial statements charts (revenue, income, EPS over time)
- [ ] Stock analysis page fully wired up

### Phase 3 — Features & Polish (Weeks 7-9)
> Make it useful daily: watchlists, screener, news.

- [ ] Watchlist CRUD with optimistic updates
- [ ] Stock screener with filter panel + results table
- [ ] News aggregation feed with sentiment badges
- [ ] Portfolio tracker with holdings and gain/loss
- [ ] AI daily market digest
- [ ] Responsive design / mobile optimization
- [ ] Loading states, error boundaries, empty states

### Phase 4 — Scale & Launch (Weeks 10-12)
> Harden for real users.

- [ ] Rate limiting and API key rotation
- [ ] Background jobs (cron) for data refresh
- [ ] SEO optimization for stock pages
- [ ] Analytics (PostHog or Plausible)
- [ ] Freemium gating (free = 5 analyses/day, pro = unlimited)
- [ ] Landing page
- [ ] Deploy to production

---

## 7. Key Design Decisions

1. **FMP as primary data source** — Best free tier (250 req/day), comprehensive fundamentals, earnings, and news in one API. Alpha Vantage as backup for technical indicators.

2. **Snowflake scores computed server-side** — Scores are derived from financial data using a scoring model (inspired by Simply Wall St's open-source model on GitHub). Cached in PostgreSQL, recomputed on new earnings data.

3. **AI summaries are async** — Generated on first request, then cached for 7 days. Background regeneration when new financial data arrives.

4. **Python microservice only for heavy AI** — Keep the main app in the Next.js ecosystem. Python service handles Claude API calls, batch sentiment analysis, and any future ML models.

5. **TradingView Lightweight Charts over Recharts for price data** — Purpose-built for financial time series, much better performance and UX for candlestick/OHLC data. Recharts for everything else (radar, bar, pie).

6. **Drizzle over Prisma** — Lighter, faster, better SQL control. No heavy client generation step.
