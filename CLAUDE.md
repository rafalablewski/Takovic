@AGENTS.md

# Takovic — Project Rules & Architecture Standards

> AI-powered financial analysis platform. These rules govern all development.

---

## Current State (as of 2026-03-27)

### What's Built
- **Next.js 15** app with App Router, TypeScript, Tailwind CSS 4
- **Theme system**: oklch() colors, light + dark modes, 18 semantic token pairs
- **Database**: 10-table Drizzle schema deployed to Neon PostgreSQL
- **API clients**: FMP (8 endpoints), Claude AI (summaries + sentiment), Redis cache (Upstash)
- **Scoring engine**: 5-dimension snowflake scores (value, growth, profitability, health, dividend)
- **UI library**: 9 shadcn/ui primitives (Button, Card, Badge, Tabs, Avatar, DropdownMenu, Tooltip, ScrollArea, Separator)
- **Layout**: Collapsible sidebar (240px/52px), sticky header with Cmd+K search, market status indicator
- **6 dashboard pages**: Dashboard, Stock `[ticker]`, Screener, Watchlist, Portfolio, News — all rendered with mock data
- **3 API routes**: `/api/stocks/[ticker]`, `/api/stocks/search`, `/api/analysis/[ticker]`
- **Drizzle migration**: Generated SQL for all tables, deployed to Neon

### What's NOT Built Yet
- Entity registry system (`src/lib/entities.ts`, `src/data/entity-context.ts`, `src/data/tab-registry.ts`)
- Stock-specific data files (`src/data/{ticker}/`)
- Real data wiring — all 6 pages use hardcoded mock data
- Auth.js v5 (login/register routes empty)
- Watchlist, Portfolio, News, Screener CRUD APIs (directories empty)
- Shared components (`src/components/shared/` empty)
- Chart components (`src/components/charts/` empty)
- React hooks (`src/hooks/` empty)
- Zustand stores (`src/stores/` empty)
- Error boundaries, loading skeletons, empty states
- Search functionality (UI exists, not wired)

### Known Debt
- `sentimentBadgeVariant()` and `sentimentLabel()` duplicated in 4+ page files — must consolidate into `src/lib/utils.ts`
- `scoreColor()` duplicated in 3 pages — must extract to utils
- Mock data hardcoded in page components — must wire to API routes

---

## 50 Rules for Stock Entities

All stock-specific entities (tickers, companies) follow these rules for structured, consistent, long-lived profiles. "Entity" = a stock/company tracked in the platform.

### Registry & Scaffolding (Rules 1–8)

1. **Every stock entity must exist in exactly four registries.** `src/lib/entities.ts` (EntityMeta), `src/data/entity-context.ts` (EntityContext), `src/data/tab-registry.ts` (TabConfig[]), and `src/data/{ticker}/index.ts` (barrel exports). Missing any registry causes silent feature breakage.

2. **The entity registry (`entities.ts`) is the single source of truth for "does this stock exist?".** API routes validate tickers against `VALID_ENTITIES`. Coverage pages read from `COVERAGE_ENTITIES`. Detail pages check `hasFullProfile`. Never hardcode ticker lists anywhere else.

3. **Use the scaffolding route to create new stock profiles, then fill in manually.** The `/api/profile/init` route creates the standard data files + barrel index. Never manually create entity data directories. Scaffolding guarantees consistent structure.

4. **Set `hasFullProfile: true` only when the stock has both complete data files AND a working analysis component.** A `GenericProfile.tsx` fallback renders for partial coverage. Do not enable the flag until the entity works end-to-end.

5. **Every new stock must have an EntityContext entry containing at minimum:** `id`, `name`, `category` (sector), `domain` (industry), `description`, `primaryFocus`. Empty arrays for `keyStakeholders`, `peers`, `domainSpecificMetrics`, `customSections` are acceptable at first. Use `createStarterContext()` for boilerplate.

6. **New stocks receive `defaultTabs` from the tab registry.** Stock-specific tabs are added to `tab-registry.ts` only after the corresponding custom component is implemented. Never place specialty tabs in `defaultTabs`.

7. **When adding a stock to advanced coverage, register its ticker in `COVERAGE_ENTITIES` exactly once.** All intelligence/analysis views import this single list. Never maintain separate entity lists per view or feature.

8. **Any external identifier mapping (e.g. `src/lib/external-ids.ts`) must be updated when a stock requires integration with a third-party source** (FMP, Alpha Vantage, etc.). Missing mappings = no data from that source.

### Data Files & Barrel Exports (Rules 9–18)

9. **Barrel export rule is ABSOLUTE: every export in `src/data/{ticker}/*.ts` MUST be re-exported in that entity's `index.ts`.** Unexported items are invisible to the rest of the app. This is the #1 cause of "data exists but does not appear" bugs. Run the barrel checker script after every data file change.

10. **Never add a data file without immediately updating the barrel.** This is not a "later" task.

11. **Data file structure must be identical across all stock entities.** Every entity receives the same core files: `overview.ts`, `events.ts`, `thesis.ts`, `timeline.ts`, `resources.ts`, `metrics.ts`, `updates.ts`, `historical.ts`, `news.ts`, `benchmarks.ts`, `coverage.ts`, `related.ts`. Domain-specific files are additive only — never replacements.

12. **Every data file must export a `DataMetadata` constant first.** `{ lastUpdated: 'YYYY-MM-DD', source: string, nextExpectedUpdate: string, notes?: string }` — powers freshness indicators throughout the UI.

13. **Use shared types from `src/types/` for all structures.** Specifically `src/types/stock.ts`, `src/types/analysis.ts`, `src/types/news.ts`. No one-off interfaces in entity files. Add new types to the shared type files first.

14. **Truly entity-unique types live in `src/types/` with descriptive names that reveal their scope.** Naming clarity prevents confusion.

15. **All data arrays must be explicitly typed with shared interfaces.** `const UPCOMING_EVENTS: Event[] = [...]` — catches drift at compile time.

16. **Dates in data files use ISO format only: `YYYY-MM-DD`.** Enables reliable sorting, comparison, and formatting.

17. **Quantitative financial values follow a consistent unit convention** (documented in JSDoc). Never mix units (e.g. millions vs billions) within one stock's data set.

18. **Every data file begins with a structured freshness comment block:**
```ts
/**
 * LAST UPDATED: 2026-03-27
 * NEXT UPDATE: After Q2 2026 earnings (~July 2026)
 */
```
AI-assisted maintenance tools rely on this.

### No Hardcoding (Rules 19–28)

19. **Never hardcode stock tickers in components.** Always read from EntityContext via prop or registry lookup.

20. **Never hardcode company names in components.** Read from EntityContext or API response.

21. **Never hardcode sectors, industries, or categories in components.** Read from EntityContext.

22. **Never hardcode stakeholders, executives, or key people in components.** Read from EntityContext.

23. **Never hardcode peer/competitor lists in components.** Read from EntityContext.

24. **Never hardcode financial metrics labels or thresholds in components.** Read from config or EntityContext.

25. **Analysis prompts and AI workflows use `{{PLACEHOLDER}}` templates.** One template per workflow type. A resolver populates placeholders from EntityContext at runtime. See `src/lib/ai/prompts.ts`.

26. **Shared visual/style mappings (sentiment colors, sector badges, score colors, icons) live in one central config file** (`src/lib/utils.ts`). Never duplicate per entity.

27. **Important financial numbers/values belong in data files — never hardcoded in JSX or logic.**

28. **All magic numbers appearing in calculations must be named constants with explanatory comments.** See `src/lib/analysis/scores.ts` for the pattern.

### Shared Components (Rules 29–38)

29. **Every standard tab/analysis view has exactly one shared component in `src/components/shared/`.** Use it. Never duplicate tab implementations per stock.

30. **Shared tab components are pure and receive prepared data via props.** Stock-specific pages import + transform data, then pass it down.

31. **Stock-specific tabs are the only acceptable place for truly unique UI/logic.** If a pattern applies to 2+ stocks, extract it to `src/components/shared/`.

32. **Core UI building blocks** (header, chart, navigation, price indicators, freshness display) **are shared and prop-driven.** Located in `src/components/ui/`, `src/components/charts/`, `src/components/layout/`.

33. **Chart components are shared and configurable.** `src/components/charts/snowflake-chart.tsx`, `price-chart.tsx`, `financials-chart.tsx`, `sentiment-gauge.tsx`. Never create one-off chart components per stock.

34. **Extract repeating patterns from stock-specific pages into `src/components/shared/`.** If you copy-paste, you're doing it wrong.

35. **Shared component props use typed interfaces** from dedicated type files in `src/types/`.

36. **Wrap every stock analysis root in an error boundary** (`src/components/shared/error-boundary.tsx`).

37. **Use a shared `UpdateIndicators` component for all freshness/last-updated display.** Never inline date formatting in pages.

38. **Global banners/disclaimers are imported from shared — never duplicated.**

### Content Ingestion & Updates (Rules 39–44)

39. **Follow the mandatory ingestion checklist for every data update.** When new financial data arrives (earnings, news, price changes):
   - [ ] Update relevant data files
   - [ ] Update `DataMetadata.lastUpdated`
   - [ ] Update barrel exports if new files added
   - [ ] Verify entity renders correctly
   - [ ] Update AI analysis cache if fundamentals changed

40. **Chronological content (news, events, earnings) is added newest-first** (reverse chronological order).

41. **New items default to untracked/advisory status.** Production tracking status comes from the database, not data files.

42. **Important ingested items include cross-references to affected data sections.** E.g., an earnings event references the financial data it updates.

43. **Timeline / historical entries are append-only and immutable.** Never edit or delete past entries — add clarifying follow-up entries when interpretation changes.

44. **When a tracked event completes/moves to history, relocate it to the completed section** rather than deleting it. Preserves context and accuracy history.

### Component Architecture (Rules 45–50)

45. **Entity detail components must not exceed 500 lines.** Break monoliths into data-prep, tab-dispatcher, and per-tab wrapper layers (each < 300 lines). The stock `[ticker]/page.tsx` should be a thin orchestrator.

46. **Stock pages are thin orchestrators:** import data, map to shared component props, render active tab. See `src/app/(dashboard)/stock/[ticker]/page.tsx`.

47. **Stock-specific UI state (active tab, filters, expanded sections) lives in URL search params — never local `useState`.** Enables deep linking and browser history.

48. **Every entity component follows the unified maintenance protocol** (documented update procedure in this file).

49. **Analysis archives are append-only.** Each update creates a dated, complete snapshot of prior state. Never overwrite or delete history in `stock_analyses` table.

50. **Structural improvements must be applied uniformly across ALL stock entities.** Divergence creates compounding maintenance debt. If you improve one stock's page, apply it to all.

---

## TL;DR Priority Order

If you can only follow 10 rules, prioritize these:

| Priority | Rule | Summary |
|----------|------|---------|
| 1 | **9** | Barrel exports — absolute must |
| 2 | **19** | No hardcoding tickers/identifiers |
| 3 | **25** | Template-based AI prompts |
| 4 | **29** | Use shared tab components |
| 5 | **1** | Four registries per entity |
| 6 | **11** | Identical core file structure |
| 7 | **39** | Ingestion checklist |
| 8 | **45** | 500 line cap per component |
| 9 | **13** | Shared types everywhere |
| 10 | **43** | Append-only timeline/history |

---

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js Route Handlers + Python FastAPI (AI services, planned)
- **Database**: PostgreSQL (Neon) via Drizzle ORM + Redis (Upstash) for caching
- **AI**: Claude API (Anthropic) — Sonnet 4.6 for summaries, Haiku 4.5 for sentiment
- **Data**: Financial Modeling Prep API (primary), Alpha Vantage (backup, planned)
- **Charts**: TradingView Lightweight Charts + Recharts (installed, not yet implemented)
- **Auth**: Auth.js v5 (planned, not yet implemented)

### Key Directories
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login/Register (empty)
│   ├── (dashboard)/        # Authenticated app layout
│   │   ├── layout.tsx      # Sidebar + Header shell
│   │   ├── page.tsx        # Dashboard home
│   │   ├── stock/[ticker]/ # Stock analysis page
│   │   ├── screener/       # Stock screener
│   │   ├── watchlist/      # Watchlists
│   │   ├── portfolio/      # Portfolio tracker
│   │   └── news/           # News feed
│   └── api/                # Route Handlers
│       ├── stocks/         # Stock data + search (implemented)
│       ├── analysis/       # AI analysis (implemented)
│       ├── watchlist/      # CRUD (empty)
│       ├── portfolio/      # CRUD (empty)
│       └── news/           # Feed (empty)
├── components/
│   ├── ui/                 # 9 shadcn/ui primitives
│   ├── layout/             # Sidebar, Header, SidebarContext
│   ├── charts/             # Chart components (empty)
│   ├── stock/              # Stock composites (empty)
│   ├── shared/             # Reusable patterns (empty)
│   ├── screener/           # Screener components (empty)
│   └── news/               # News components (empty)
├── lib/
│   ├── db/                 # Drizzle schema + migrations
│   │   └── schema.ts       # 10 tables, 3 enums, relations
│   ├── api/
│   │   └── fmp.ts          # FMP client (8 endpoints, typed responses)
│   ├── ai/
│   │   └── claude.ts       # Claude summaries + sentiment
│   ├── analysis/
│   │   └── scores.ts       # Snowflake score engine (5 dimensions)
│   ├── cache.ts            # Redis helpers + TTL constants
│   └── utils.ts            # cn(), formatCurrency(), sentimentColor(), etc.
├── types/
│   ├── stock.ts            # Stock, StockQuote, StockProfile, KeyMetrics
│   ├── analysis.ts         # Sentiment, SnowflakeScores, ScreenerFilters
│   └── news.ts             # NewsArticle, MarketDigest
├── hooks/                  # React hooks (empty)
└── stores/                 # Zustand state (empty)
```

### Database Schema (Neon PostgreSQL)
Defined in `src/lib/db/schema.ts` using Drizzle ORM. 10 tables:
- `users` (id, email, name, plan enum), `user_preferences` (theme, notifications)
- `stocks` (ticker unique, name, exchange, sector, industry, marketCap)
- `stock_analyses` (5 snowflake scores, aiSummary, sentiment, strengths[], weaknesses[])
- `financial_data` (period enum, year, revenue, netIncome, eps, ratios — unique on stock+period+year)
- `watchlists` → `watchlist_stocks` (user's stock lists)
- `portfolios` → `portfolio_holdings` (shares, avgCostBasis)
- `news_articles` (title, summary, sourceUrl, sentiment, publishedAt)

### CSS Theme System
- All colors use `oklch()` in `src/app/globals.css`
- Light (`:root`) and dark (`.dark`) themes fully defined
- Semantic tokens: `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--sidebar-*`, `--chart-1` through `--chart-5`
- Components use Tailwind classes mapped to these tokens (e.g. `bg-card`, `text-muted-foreground`)
- Font: Inter with OpenType features cv02, cv03, cv04, cv11

### Design Principles
- Typography: `text-xl font-semibold` for page titles, `text-sm` for data, `text-xs text-muted-foreground` for labels
- Numbers: Always use `tabular-nums` class for financial data
- Colors: `text-emerald-600 dark:text-emerald-400` for positive, `text-red-600 dark:text-red-400` for negative
- Cards: `bg-card` with `border-border` and `shadow-sm`. No colored backgrounds unless intentional accent (e.g. `border-primary/20` on AI digest)
- Tables: `text-xs font-medium uppercase tracking-wider text-muted-foreground` for headers, `hover:bg-muted/50` for rows
- Spacing: `space-y-6` between sections, `gap-4` between cards, `p-5` card padding
- Page background: `bg-muted/30` (from dashboard layout)
- Sidebar: `bg-background` with `border-r border-border` (same as content, not a separate shade)

### Caching Strategy
| Data Type | TTL | Cache Key |
|-----------|-----|-----------|
| Stock quotes | 60s | `quote:{ticker}` |
| Company profiles | 24h | `profile:{ticker}` |
| Financial statements | 24h | `financials:{ticker}:{period}` |
| Key metrics | 24h | `metrics:{ticker}` |
| News articles | 15m | `news:{ticker}` |
| AI summaries | 7 days | `ai:summary:{ticker}` |
| Screener results | 1h | `screener:{hash}` |
| Search results | 5m | `search:{query}` |

### Scoring Engine
Five dimensions, each 0–5 scale:
- **Value**: P/E (inverted), P/B, FCF yield
- **Growth**: Revenue CAGR, EPS growth (needs 2+ years data)
- **Profitability**: ROE, ROA, net margin, gross margin
- **Health**: D/E (inverted), current ratio, cash position
- **Dividend**: Yield (0 if none)
- **Overall**: Weighted — growth 25%, profitability 25%, health 20%, value 20%, dividend 10%
