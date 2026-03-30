/**
 * Google News RSS feed client.
 * Fetches news articles via Google News RSS search feeds.
 */

import { XMLParser } from "fast-xml-parser";

const GOOGLE_NEWS_RSS_BASE = "https://news.google.com/rss/search";
const NEWS_REVALIDATE_SECONDS = 300; // 5 minutes

export interface GoogleNewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedDate: string;
  imageUrl?: string;
}

interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  source?: string | { "#text"?: string };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function buildRSSUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  });
  return `${GOOGLE_NEWS_RSS_BASE}?${params.toString()}`;
}

function extractSource(item: RSSItem): string {
  if (typeof item.source === "string") return item.source;
  if (item.source && typeof item.source === "object" && item.source["#text"]) {
    return item.source["#text"];
  }
  return "Google News";
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function parseRSSItems(items: RSSItem[], limit: number): GoogleNewsArticle[] {
  const list = Array.isArray(items) ? items : [items];
  return list.slice(0, limit).map((item) => ({
    title: item.title ? stripHtmlTags(String(item.title)) : "Untitled",
    description: item.description
      ? stripHtmlTags(String(item.description))
      : "",
    url: item.link ? String(item.link) : "",
    source: extractSource(item),
    publishedDate: item.pubDate ? String(item.pubDate) : new Date().toISOString(),
  }));
}

/**
 * Fetch Google News articles for a given search query.
 */
export async function getGoogleNews(
  query: string,
  limit: number = 20
): Promise<GoogleNewsArticle[]> {
  try {
    const url = buildRSSUrl(query);
    const response = await fetch(url, {
      next: { revalidate: NEWS_REVALIDATE_SECONDS },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Takovic/1.0)",
      },
    });

    if (!response.ok) {
      console.error(`Google News RSS error: ${response.status} ${response.statusText}`);
      return [];
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);
    const items: RSSItem[] = parsed?.rss?.channel?.item;

    if (!items) return [];
    return parseRSSItems(items, limit);
  } catch (error) {
    console.error("Failed to fetch Google News:", error);
    return [];
  }
}

/**
 * Fetch general stock market / financial news.
 */
export async function getMarketNews(
  limit: number = 20
): Promise<GoogleNewsArticle[]> {
  return getGoogleNews("stock market financial news", limit);
}

/**
 * Fetch news for a specific stock ticker.
 */
export async function getStockNews(
  ticker: string,
  limit: number = 20
): Promise<GoogleNewsArticle[]> {
  return getGoogleNews(`${ticker} stock`, limit);
}
