/**
 * Redis cache helpers using Upstash.
 */

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCached<T>(key: string): Promise<T | null> {
  const data = await redis.get<T>(key);
  return data;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  QUOTE: 60, // 1 minute
  PROFILE: 86400, // 24 hours
  FINANCIALS: 86400, // 24 hours
  KEY_METRICS: 86400, // 24 hours
  NEWS: 900, // 15 minutes
  AI_SUMMARY: 604800, // 7 days
  SCREENER: 3600, // 1 hour
  SEARCH: 300, // 5 minutes
} as const;

// Cache key builders
export const cacheKey = {
  quote: (ticker: string) => `quote:${ticker}`,
  profile: (ticker: string) => `profile:${ticker}`,
  financials: (ticker: string, period: string) =>
    `financials:${ticker}:${period}`,
  keyMetrics: (ticker: string) => `metrics:${ticker}`,
  news: (ticker: string) => `news:${ticker}`,
  marketNews: () => "news:market",
  aiSummary: (ticker: string) => `ai:summary:${ticker}`,
  screener: (hash: string) => `screener:${hash}`,
  search: (query: string) => `search:${query}`,
};

export default redis;
