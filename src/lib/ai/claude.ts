/**
 * Claude AI client for stock analysis and sentiment.
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateStockSummary(
  ticker: string,
  companyName: string,
  context: {
    sector: string;
    marketCap: number;
    peRatio: number | null;
    roe: number | null;
    revenueGrowth: number | null;
    debtToEquity: number | null;
    dividendYield: number | null;
    recentNews: string[];
  }
): Promise<{ summary: string; sentiment: string; strengths: string[]; weaknesses: string[] }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this stock and provide a concise investment summary.

Company: ${companyName} (${ticker})
Sector: ${context.sector}
Market Cap: $${(context.marketCap / 1e9).toFixed(1)}B
P/E Ratio: ${context.peRatio ?? "N/A"}
ROE: ${context.roe ? (context.roe * 100).toFixed(1) + "%" : "N/A"}
Revenue Growth: ${context.revenueGrowth ? (context.revenueGrowth * 100).toFixed(1) + "%" : "N/A"}
Debt/Equity: ${context.debtToEquity?.toFixed(2) ?? "N/A"}
Dividend Yield: ${context.dividendYield ? (context.dividendYield * 100).toFixed(2) + "%" : "N/A"}

Recent headlines:
${context.recentNews.slice(0, 5).map((n) => `- ${n}`).join("\n")}

Respond in JSON format:
{
  "summary": "2-3 paragraph plain-English analysis covering what the company does, valuation assessment, and key outlook",
  "sentiment": "bullish|somewhat_bullish|neutral|somewhat_bearish|bearish",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(text);
}

export async function analyzeNewsSentiment(
  title: string,
  summary: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 50,
    messages: [
      {
        role: "user",
        content: `Classify the sentiment of this financial news article. Respond with ONLY one of: bullish, somewhat_bullish, neutral, somewhat_bearish, bearish

Title: ${title}
Summary: ${summary}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text.trim().toLowerCase() : "neutral";
  const valid = [
    "bullish",
    "somewhat_bullish",
    "neutral",
    "somewhat_bearish",
    "bearish",
  ];
  return valid.includes(text) ? text : "neutral";
}
