/**
 * CSV export utilities.
 * All functions run client-side and trigger a browser download.
 */

function escapeCsvField(value: string): string {
  // Wrap in quotes if the value contains a comma, quote, or newline
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(
  filename: string,
  headers: string[],
  rows: string[][]
): void {
  const csvLines: string[] = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.map(escapeCsvField).join(",")),
  ];
  const csvString = csvLines.join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportWatchlistCSV(
  stocks: {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }[]
): void {
  const headers = ["Ticker", "Name", "Price", "Change", "Change %"];
  const rows = stocks.map((s) => [
    s.ticker,
    s.name,
    s.price.toFixed(2),
    s.change.toFixed(2),
    s.changePercent.toFixed(2),
  ]);
  downloadCSV("watchlist.csv", headers, rows);
}

export function exportPortfolioCSV(
  holdings: {
    ticker: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    marketValue: number;
    gainLoss: number;
    gainLossPercent: number;
    weight: number;
  }[]
): void {
  const headers = [
    "Ticker",
    "Shares",
    "Avg Cost",
    "Current Price",
    "Market Value",
    "Gain/Loss",
    "Gain/Loss %",
    "Weight %",
  ];
  const rows = holdings.map((h) => [
    h.ticker,
    h.shares.toString(),
    h.avgCost.toFixed(2),
    h.currentPrice.toFixed(2),
    h.marketValue.toFixed(2),
    h.gainLoss.toFixed(2),
    h.gainLossPercent.toFixed(2),
    h.weight.toFixed(1),
  ]);
  downloadCSV("portfolio.csv", headers, rows);
}

export function exportScreenerCSV(
  stocks: {
    symbol: string;
    name: string;
    sector: string;
    price: number;
    marketCap: number;
    volume: number;
    change: number;
  }[]
): void {
  const headers = [
    "Symbol",
    "Name",
    "Sector",
    "Price",
    "Market Cap",
    "Volume",
    "Change %",
  ];
  const rows = stocks.map((s) => [
    s.symbol,
    s.name,
    s.sector,
    s.price.toFixed(2),
    s.marketCap.toString(),
    s.volume.toString(),
    s.change.toFixed(2),
  ]);
  downloadCSV("screener.csv", headers, rows);
}
