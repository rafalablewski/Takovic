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

export function sentimentBadgeVariant(
  sentiment: string
): "success" | "danger" | "warning" | "secondary" {
  switch (sentiment) {
    case "bullish":
    case "somewhat_bullish":
      return "success";
    case "bearish":
    case "somewhat_bearish":
      return "danger";
    default:
      return "secondary";
  }
}

export function scoreColor(score: number): string {
  if (score >= 4.0) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 3.5) return "text-blue-600 dark:text-blue-400";
  if (score >= 3.0) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
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

/**
 * Format a large number with appropriate suffix (T/B/M/K).
 * Use for financial values that need compact display.
 */
export function formatLargeNumber(
  value: number,
  options?: { decimals?: number; prefix?: string; suffix?: string }
): string {
  const { decimals = 1, prefix = "", suffix = "" } = options ?? {};
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${prefix}${(abs / 1e12).toFixed(decimals)}T${suffix}`;
  if (abs >= 1e9) return `${sign}${prefix}${(abs / 1e9).toFixed(decimals)}B${suffix}`;
  if (abs >= 1e6) return `${sign}${prefix}${(abs / 1e6).toFixed(decimals)}M${suffix}`;
  if (abs >= 1e3) return `${sign}${prefix}${(abs / 1e3).toFixed(decimals)}K${suffix}`;
  return `${sign}${prefix}${abs.toFixed(decimals)}${suffix}`;
}

/**
 * Format bytes into human-readable file size.
 */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
  return `${bytes} B`;
}
