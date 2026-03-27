@AGENTS.md

# Takovic — Project Rules & Architecture Standards

> AI-powered financial analysis platform. These rules govern all development.

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
- **Backend**: Next.js Route Handlers + Python FastAPI (AI services)
- **Database**: PostgreSQL (Neon) via Drizzle ORM + Redis (Upstash) for caching
- **AI**: Claude API (Anthropic) for stock summaries and sentiment
- **Data**: Financial Modeling Prep API (primary), Alpha Vantage (backup)
- **Charts**: TradingView Lightweight Charts + Recharts
- **Auth**: Auth.js v5

### Key Directories
```
src/
├── app/              # Next.js App Router pages & API routes
├── components/
│   ├── ui/           # shadcn/ui primitives (Button, Card, Badge, etc.)
│   ├── charts/       # Financial chart components (shared, prop-driven)
│   ├── stock/        # Stock-specific composite components
│   ├── layout/       # Sidebar, Header
│   └── shared/       # Reusable patterns extracted from pages
├── lib/
│   ├── db/           # Drizzle schema, connection, migrations
│   ├── api/          # FMP client, Alpha Vantage client
│   ├── ai/           # Claude API client, prompt templates
│   ├── analysis/     # Snowflake score calculations, valuation models
│   ├── cache.ts      # Redis cache helpers with TTL strategy
│   └── utils.ts      # cn(), formatCurrency(), sentimentColor(), etc.
├── types/            # Shared TypeScript interfaces (stock.ts, analysis.ts, news.ts)
├── hooks/            # React hooks (useStock, useWatchlist, useScreener)
└── stores/           # Zustand state management
```

### Database Schema
Defined in `src/lib/db/schema.ts` using Drizzle ORM. 10 tables:
- `users`, `user_preferences`
- `stocks`, `stock_analyses`, `financial_data`
- `watchlists`, `watchlist_stocks`
- `portfolios`, `portfolio_holdings`
- `news_articles`

### CSS Theme System
- All colors use `oklch()` in `src/app/globals.css`
- Light (`:root`) and dark (`.dark`) themes fully defined
- Semantic tokens: `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--sidebar-*`, `--chart-*`
- Components use Tailwind classes mapped to these tokens (e.g. `bg-card`, `text-muted-foreground`)

### Design Principles
- Typography: `text-xl` for page titles, `text-sm` for data, `text-xs` for labels
- Numbers: Always use `tabular-nums` class for financial data
- Colors: `text-emerald-600 dark:text-emerald-400` for positive, `text-red-600 dark:text-red-400` for negative
- Cards: `bg-card` with `border-border` and `shadow-sm`. No colored backgrounds unless intentional accent
- Tables: `text-xs font-medium uppercase tracking-wider text-muted-foreground` for headers
- Spacing: `space-y-6` between sections, `gap-4` between cards, `p-5` card padding
