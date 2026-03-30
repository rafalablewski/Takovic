/**
 * Application-wide display and pagination constants.
 */

// ---------------------------------------------------------------------------
// Market hours (US Eastern)
// ---------------------------------------------------------------------------

/** Market open time in minutes from midnight ET (9:30 AM = 570) */
export const MARKET_OPEN_MINUTES = 570;

/** Market close time in minutes from midnight ET (4:00 PM = 960) */
export const MARKET_CLOSE_MINUTES = 960;

// ---------------------------------------------------------------------------
// Pagination defaults
// ---------------------------------------------------------------------------

export const PAGINATION = {
  SEC_FILINGS_INITIAL: 20,
  SEC_FILINGS_INCREMENT: 20,
  PRESS_RELEASES_INITIAL: 10,
  PRESS_RELEASES_INCREMENT: 10,
  NEWS_FEED_INITIAL: 10,
  NEWS_FEED_INCREMENT: 10,
} as const;

// ---------------------------------------------------------------------------
// Text truncation limits
// ---------------------------------------------------------------------------

export const TRUNCATION = {
  PRESS_RELEASE_TEXT: 300,
  NEWS_SUMMARY: 200,
} as const;

// ---------------------------------------------------------------------------
// Default watchlist tickers (used when DB not available)
// ---------------------------------------------------------------------------

export const DEFAULT_WATCHLIST_TICKERS = (
  process.env.DEFAULT_WATCHLIST_TICKERS?.split(",") ?? [
    "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA",
  ]
);
