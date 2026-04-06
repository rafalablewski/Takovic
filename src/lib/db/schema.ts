import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const planEnum = pgEnum("plan", ["free", "pro", "premium"]);
export const sentimentEnum = pgEnum("sentiment", [
  "bullish",
  "somewhat_bullish",
  "neutral",
  "somewhat_bearish",
  "bearish",
]);
export const periodEnum = pgEnum("period", ["Q1", "Q2", "Q3", "Q4", "FY"]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  plan: planEnum("plan").notNull().default("free"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Stocks
export const stocks = pgTable(
  "stocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticker: varchar("ticker", { length: 10 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    exchange: varchar("exchange", { length: 20 }).notNull(),
    sector: varchar("sector", { length: 100 }),
    industry: varchar("industry", { length: 100 }),
    marketCap: numeric("market_cap"),
    currency: varchar("currency", { length: 10 }).notNull().default("USD"),
    logoUrl: text("logo_url"),
    lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("stocks_ticker_idx").on(table.ticker),
    index("stocks_sector_idx").on(table.sector),
  ]
);

// Watchlists
export const watchlists = pgTable("watchlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const watchlistStocks = pgTable(
  "watchlist_stocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    watchlistId: uuid("watchlist_id")
      .notNull()
      .references(() => watchlists.id, { onDelete: "cascade" }),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    notes: text("notes"),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("watchlist_stock_unique").on(
      table.watchlistId,
      table.stockId
    ),
  ]
);

// Portfolios
export const portfolios = pgTable("portfolios", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioId: uuid("portfolio_id")
    .notNull()
    .references(() => portfolios.id, { onDelete: "cascade" }),
  stockId: uuid("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  shares: numeric("shares").notNull(),
  avgCostBasis: numeric("avg_cost_basis").notNull(),
  purchaseDate: timestamp("purchase_date"),
});

// Stock Analysis
export const stockAnalyses = pgTable(
  "stock_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    overallScore: numeric("overall_score").notNull(),
    valueScore: numeric("value_score").notNull(),
    growthScore: numeric("growth_score").notNull(),
    profitabilityScore: numeric("profitability_score").notNull(),
    dividendScore: numeric("dividend_score").notNull(),
    healthScore: numeric("health_score").notNull(),
    aiSummary: text("ai_summary"),
    aiSentiment: sentimentEnum("ai_sentiment"),
    strengths: text("strengths").array(),
    weaknesses: text("weaknesses").array(),
    generatedAt: timestamp("generated_at").notNull().defaultNow(),
  },
  (table) => [index("analyses_stock_idx").on(table.stockId)]
);

// Financial Data
export const financialData = pgTable(
  "financial_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    period: periodEnum("period").notNull(),
    year: integer("year").notNull(),
    revenue: numeric("revenue"),
    netIncome: numeric("net_income"),
    eps: numeric("eps"),
    peRatio: numeric("pe_ratio"),
    debtToEquity: numeric("debt_to_equity"),
    roe: numeric("roe"),
    freeCashFlow: numeric("free_cash_flow"),
    dividendYield: numeric("dividend_yield"),
    reportDate: timestamp("report_date"),
  },
  (table) => [
    index("financial_stock_idx").on(table.stockId),
    uniqueIndex("financial_stock_period_year").on(
      table.stockId,
      table.period,
      table.year
    ),
  ]
);

// News
export const newsArticles = pgTable(
  "news_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id").references(() => stocks.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    summary: text("summary"),
    sourceUrl: text("source_url").notNull(),
    sourceName: varchar("source_name", { length: 100 }),
    sentiment: sentimentEnum("sentiment"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("news_stock_idx").on(table.stockId),
    index("news_published_idx").on(table.publishedAt),
  ]
);

/** SEC filing AI analysis (one row per deduped filing fingerprint). */
export const filingAnalyses = pgTable(
  "filing_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    filingFingerprint: varchar("filing_fingerprint", { length: 128 }).notNull(),
    ticker: varchar("ticker", { length: 10 }).notNull(),
    accessionNumber: varchar("accession_number", { length: 32 }),
    form: varchar("form", { length: 32 }).notNull(),
    filingDate: varchar("filing_date", { length: 16 }).notNull(),
    source: varchar("source", { length: 8 }).notNull(),
    documentUrl: text("document_url").notNull(),
    companyName: text("company_name"),
    summary: text("summary").notNull(),
    keyPoints: text("key_points").array(),
    sentiment: sentimentEnum("sentiment"),
    aiProvider: varchar("ai_provider", { length: 20 }).notNull(),
    model: varchar("model", { length: 128 }),
    analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
    /** True when SEC document text was capped (FILING_AI_MAX_CHARS / fetch byte cap). */
    excerptTruncated: boolean("excerpt_truncated").notNull().default(false),
  },
  (table) => [
    uniqueIndex("filing_analyses_fingerprint_idx").on(table.filingFingerprint),
    index("filing_analyses_ticker_idx").on(table.ticker),
  ]
);

/** Normalized press-wire items for ticker intelligence. */
export const pressReleases = pgTable(
  "press_releases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticker: varchar("ticker", { length: 10 }).notNull(),
    source: varchar("source", { length: 100 }).notNull(),
    externalId: varchar("external_id", { length: 128 }).notNull(),
    headline: text("headline").notNull(),
    summary: text("summary"),
    publishedAt: timestamp("published_at").notNull(),
    url: text("url"),
    rawPayload: text("raw_payload"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("press_releases_ticker_source_external_idx").on(
      table.ticker,
      table.source,
      table.externalId
    ),
    index("press_releases_ticker_idx").on(table.ticker),
    index("press_releases_published_idx").on(table.publishedAt),
  ]
);

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: varchar("theme", { length: 10 }).notNull().default("system"),
  defaultScreenerFilters: text("default_screener_filters"), // JSON string
  notificationsEnabled: boolean("notifications_enabled")
    .notNull()
    .default(true),
});

/**
 * CSV-seeded market data for screener / lookup (US, Canada, Europe).
 * Unique per (symbol, exchange). Update via `npm run db:seed:market-equities`.
 */
export const marketEquities = pgTable(
  "market_equities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: varchar("symbol", { length: 32 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    exchange: varchar("exchange", { length: 64 }).notNull(),
    country: varchar("country", { length: 2 }).notNull(),
    /** US | CA | EU — used for regional filters */
    region: varchar("region", { length: 8 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    sector: varchar("sector", { length: 100 }),
    industry: varchar("industry", { length: 100 }),
    price: numeric("price").notNull(),
    changePct: numeric("change_pct"),
    volume: numeric("volume"),
    marketCap: numeric("market_cap"),
    peRatio: numeric("pe_ratio"),
    /** ROE as percentage points, e.g. 18.5 = 18.5% */
    roe: numeric("roe"),
    /** Dividend yield as percentage points, e.g. 2.5 = 2.5% */
    dividendYield: numeric("dividend_yield"),
    /** Optional 0–5 score for Min Score filter */
    compositeScore: numeric("composite_score"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("market_equities_symbol_exchange_idx").on(
      table.symbol,
      table.exchange
    ),
    index("market_equities_region_idx").on(table.region),
    index("market_equities_sector_idx").on(table.sector),
    index("market_equities_market_cap_idx").on(table.marketCap),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  watchlists: many(watchlists),
  portfolios: many(portfolios),
  preferences: one(userPreferences),
}));

export const stocksRelations = relations(stocks, ({ many }) => ({
  analyses: many(stockAnalyses),
  financials: many(financialData),
  news: many(newsArticles),
}));

export const watchlistsRelations = relations(watchlists, ({ one, many }) => ({
  user: one(users, { fields: [watchlists.userId], references: [users.id] }),
  stocks: many(watchlistStocks),
}));

export const watchlistStocksRelations = relations(
  watchlistStocks,
  ({ one }) => ({
    watchlist: one(watchlists, {
      fields: [watchlistStocks.watchlistId],
      references: [watchlists.id],
    }),
    stock: one(stocks, {
      fields: [watchlistStocks.stockId],
      references: [stocks.id],
    }),
  })
);
