# Takovic

AI-powered financial analysis platform combining the best of Seeking Alpha, MarketWatch, and Simply Wall St.

## Features

- **Stock Analysis Dashboard** — Snowflake scoring (Value, Growth, Profitability, Health, Dividend)
- **AI-Powered Insights** — Claude-generated stock summaries and sentiment analysis
- **Financial News** — Aggregated news with AI sentiment tagging
- **Stock Screener** — Filter by fundamentals, valuation, and AI scores
- **Portfolio Tracker** — Holdings, gain/loss, and portfolio-level analysis
- **Watchlists** — Track multiple lists with at-a-glance metrics

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js Route Handlers + Python FastAPI (AI services)
- **Database**: PostgreSQL (Neon) + Redis (Upstash)
- **AI**: Claude API (Anthropic)
- **Data**: Financial Modeling Prep API
- **Charts**: TradingView Lightweight Charts + Recharts
- **Auth**: Auth.js v5
- **ORM**: Drizzle

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture plan.

## Project Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # React components (ui, charts, stock, layout)
├── lib/           # Core logic (db, api clients, ai, analysis engine)
├── hooks/         # React hooks
├── types/         # TypeScript type definitions
└── stores/        # Zustand state management
```
