import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency = "USD",
  compact = false
): string {
  if (compact) {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function sentimentColor(
  sentiment: string
): { text: string; bg: string } {
  switch (sentiment) {
    case "bullish":
      return { text: "text-green-700", bg: "bg-green-100" };
    case "somewhat_bullish":
      return { text: "text-green-600", bg: "bg-green-50" };
    case "neutral":
      return { text: "text-gray-600", bg: "bg-gray-100" };
    case "somewhat_bearish":
      return { text: "text-red-500", bg: "bg-red-50" };
    case "bearish":
      return { text: "text-red-700", bg: "bg-red-100" };
    default:
      return { text: "text-gray-600", bg: "bg-gray-100" };
  }
}

export function sentimentLabel(sentiment: string): string {
  return sentiment
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}
