# Contributing to Takovic

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (comes with Node.js)
- A **Neon** PostgreSQL database (free tier works)
- An **Upstash** Redis instance (free tier works)
- An **FMP** (Financial Modeling Prep) API key
- An **Anthropic** API key (for Claude AI features)

### Setup Steps

1. Clone the repository:

```bash
git clone <repo-url>
cd Takovic
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and fill in your values:

```bash
cp .env.example .env.local
```

4. Set up the database:

```bash
npx drizzle-kit push
```

5. Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Environment Variables

All required variables are listed in `.env.example`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string. Format: `postgresql://user:password@host/takovic?sslmode=require` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST API token |
| `FMP_API_KEY` | Financial Modeling Prep API key for stock data |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude AI summaries and sentiment |
| `AUTH_SECRET` | Auth.js session encryption secret (generate with `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_GITHUB_ID` | GitHub OAuth app ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app secret |
| `NEXT_PUBLIC_APP_URL` | Public-facing app URL (e.g., `http://localhost:3000` for dev) |

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Project Structure Overview

```
src/
  app/              Next.js App Router pages and API routes
  components/
    ui/             shadcn/ui primitives (Button, Card, Badge, etc.)
    charts/         Financial chart components (shared, prop-driven)
    stock/          Stock-specific composite components
    layout/         Sidebar, Header
    shared/         Reusable patterns extracted from pages
  lib/
    db/             Drizzle schema, connection, migrations
    api/            FMP client, Alpha Vantage client
    ai/             Claude API client, prompt templates
    analysis/       Snowflake score calculations, valuation models
    cache.ts        Redis cache helpers with TTL strategy
    utils.ts        cn(), formatCurrency(), sentimentColor(), etc.
  types/            Shared TypeScript interfaces (stock.ts, analysis.ts, news.ts)
  hooks/            React hooks (useStock, useWatchlist, useScreener)
  stores/           Zustand state management
  data/             Static entity data files organized by ticker
```

---

## Code Standards

### TypeScript

- Strict mode enabled
- All data arrays must be explicitly typed with shared interfaces from `src/types/`
- No `any` types without justification
- Prefer `interface` for object shapes, `type` for unions and intersections

### Tailwind CSS

- Use semantic token classes (`bg-card`, `text-muted-foreground`) instead of raw colors
- Class ordering: layout (flex, grid) > sizing (w, h) > spacing (p, m) > typography > colors > effects
- Use `cn()` from `src/lib/utils.ts` to merge classes
- Financial numbers always get `tabular-nums`

### Component File Structure

- Each component is a single file in the appropriate directory
- Components use `React.forwardRef` when wrapping Radix primitives
- Props are typed via exported interfaces
- `displayName` is set for all forwarded-ref components
- Components never exceed 500 lines (Rule 45)

### Formatting

- Format utilities (`formatCurrency`, `formatPercent`, `formatNumber`) from `src/lib/utils.ts` must be used for all displayed values
- Dates in data files: ISO format `YYYY-MM-DD` only (Rule 16)
- Positive values: `text-emerald-600 dark:text-emerald-400`
- Negative values: `text-red-600 dark:text-red-400`

---

## The 50 Rules

The project follows 50 mandatory rules for stock entity management, documented in detail in `CLAUDE.md` at the project root. The top 10 priorities are:

| Priority | Rule | Summary |
|----------|------|---------|
| 1 | 9 | **Barrel exports** -- every data file export MUST be re-exported in `index.ts` |
| 2 | 19 | **No hardcoding** tickers or identifiers in components |
| 3 | 25 | **Template-based AI prompts** with `{{PLACEHOLDER}}` syntax |
| 4 | 29 | **Use shared tab components** from `src/components/shared/` |
| 5 | 1 | **Four registries** per entity (entities.ts, entity-context.ts, tab-registry.ts, data barrel) |
| 6 | 11 | **Identical core file structure** across all stock entities |
| 7 | 39 | **Ingestion checklist** for every data update |
| 8 | 45 | **500 line cap** per component file |
| 9 | 13 | **Shared types** everywhere from `src/types/` |
| 10 | 43 | **Append-only** timeline and history |

Read `CLAUDE.md` in full before making structural changes.

---

## Git Workflow

### Branch Naming

- `feature/<short-description>` -- new features
- `fix/<short-description>` -- bug fixes
- `refactor/<short-description>` -- code restructuring
- `docs/<short-description>` -- documentation changes

### Commit Messages

Use conventional-style messages:

```
feat: add snowflake chart to AAPL profile
fix: correct P/E ratio calculation for negative earnings
refactor: extract shared tab component for financials view
docs: add API endpoint documentation
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make changes following the 50 Rules
3. Ensure `npm run build` passes without errors
4. Ensure `npm run lint` passes
5. Open a PR with a clear description of changes
6. If adding/modifying stock entities, confirm all 4 registries are updated

---

## Adding a New Stock Entity

Follow Rules 1-8 strictly. Step by step:

### 1. Use the scaffolding route (Rule 3)

Call `/api/profile/init` to create the standard data file structure. This generates:

- `src/data/{TICKER}/overview.ts`
- `src/data/{TICKER}/events.ts`
- `src/data/{TICKER}/thesis.ts`
- `src/data/{TICKER}/timeline.ts`
- `src/data/{TICKER}/resources.ts`
- `src/data/{TICKER}/metrics.ts`
- `src/data/{TICKER}/updates.ts`
- `src/data/{TICKER}/historical.ts`
- `src/data/{TICKER}/news.ts`
- `src/data/{TICKER}/benchmarks.ts`
- `src/data/{TICKER}/coverage.ts`
- `src/data/{TICKER}/related.ts`
- `src/data/{TICKER}/index.ts` (barrel)

### 2. Register in all four registries (Rule 1)

1. **`src/lib/entities.ts`** -- Add to `EntityMeta` with `hasFullProfile: false` initially
2. **`src/data/entity-context.ts`** -- Add `EntityContext` entry (use `createStarterContext()` for boilerplate)
3. **`src/data/tab-registry.ts`** -- Stock gets `defaultTabs` automatically
4. **`src/data/{TICKER}/index.ts`** -- Already created by scaffolding

### 3. Add to coverage list (Rule 7)

Register the ticker in `COVERAGE_ENTITIES` (one entry, one place).

### 4. Fill in data files

Populate each data file with real data. Include `DataMetadata` constant and freshness comment block (Rules 12, 18).

### 5. Update external ID mappings (Rule 8)

If the stock needs third-party API integration, update `src/lib/external-ids.ts`.

### 6. Update barrel exports (Rule 9)

After every data file change, ensure all exports are re-exported in `src/data/{TICKER}/index.ts`. This is the most common source of bugs.

### 7. Enable full profile (Rule 4)

Once the stock has complete data files AND a working analysis component, set `hasFullProfile: true` in entities.ts.

---

## Adding a New Page

### App Router Pages

1. Create the route file at `src/app/(dashboard)/your-page/page.tsx`
2. The `(dashboard)` route group applies the sidebar layout automatically
3. Keep the page component thin -- it should orchestrate data and delegate to shared components
4. Use URL search params for UI state (active tab, filters), not `useState` (Rule 47)

### Component Patterns

- Import shared components from `src/components/shared/`
- Import UI primitives from `src/components/ui/`
- Import chart components from `src/components/charts/`
- Use `cn()` for all conditional class merging
- Wrap analysis/data views in error boundaries (Rule 36)

---

## Testing

Testing infrastructure is planned but not yet implemented. The intended strategy:

- **Unit tests:** Utility functions (`formatCurrency`, `formatPercent`, scoring calculations)
- **Component tests:** Shared components with React Testing Library
- **API tests:** Route handler tests with mocked FMP/Redis
- **E2E tests:** Critical user flows (search, view stock, analysis) with Playwright
