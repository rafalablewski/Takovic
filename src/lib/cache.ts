/**
 * Redis cache helpers using Upstash.
 */

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    return await client.get<T>(key);
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.set(key, value, { ex: ttlSeconds });
  } catch {
    /* ignore */
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    /* ignore */
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
  coverageLiveQuotes: (ticker: string) =>
    `coverage:live:v2:${ticker.toUpperCase()}`,
};
