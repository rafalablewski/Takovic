"use client";

import { useState, useEffect, useCallback } from "react";

export interface WatchlistGroup {
  id: string;
  name: string;
  tickers: string[];
}

const STORAGE_KEY = "takovic-watchlists";

const DEFAULT_WATCHLISTS: WatchlistGroup[] = [
  {
    id: "default-my-stocks",
    name: "My Stocks",
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META"],
  },
  {
    id: "default-tech-giants",
    name: "Tech Giants",
    tickers: ["NVDA", "AVGO", "CRM", "ADBE", "ORCL"],
  },
  {
    id: "default-dividend-kings",
    name: "Dividend Kings",
    tickers: ["JNJ", "PG", "KO", "PEP", "MMM", "ABT"],
  },
];

function generateId(): string {
  return `wl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadWatchlists(): WatchlistGroup[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLISTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Corrupted localStorage — fall through to defaults
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WATCHLISTS));
  return DEFAULT_WATCHLISTS;
}

function persist(watchlists: WatchlistGroup[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists));
}

export function useWatchlist() {
  const [watchlists, setWatchlists] = useState<WatchlistGroup[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setWatchlists(loadWatchlists());
    setIsLoaded(true);
  }, []);

  const update = useCallback((updater: (prev: WatchlistGroup[]) => WatchlistGroup[]) => {
    setWatchlists((prev) => {
      const next = updater(prev);
      persist(next);
      return next;
    });
  }, []);

  const addWatchlist = useCallback(
    (name: string) => {
      const id = generateId();
      update((prev) => [...prev, { id, name, tickers: [] }]);
      return id;
    },
    [update]
  );

  const removeWatchlist = useCallback(
    (id: string) => {
      update((prev) => prev.filter((wl) => wl.id !== id));
    },
    [update]
  );

  const renameWatchlist = useCallback(
    (id: string, name: string) => {
      update((prev) =>
        prev.map((wl) => (wl.id === id ? { ...wl, name } : wl))
      );
    },
    [update]
  );

  const addStock = useCallback(
    (watchlistId: string, ticker: string) => {
      const upper = ticker.toUpperCase().trim();
      if (!upper) return;
      update((prev) =>
        prev.map((wl) => {
          if (wl.id !== watchlistId) return wl;
          if (wl.tickers.includes(upper)) return wl;
          return { ...wl, tickers: [...wl.tickers, upper] };
        })
      );
    },
    [update]
  );

  const removeStock = useCallback(
    (watchlistId: string, ticker: string) => {
      update((prev) =>
        prev.map((wl) => {
          if (wl.id !== watchlistId) return wl;
          return { ...wl, tickers: wl.tickers.filter((t) => t !== ticker) };
        })
      );
    },
    [update]
  );

  return {
    watchlists,
    isLoaded,
    addWatchlist,
    removeWatchlist,
    renameWatchlist,
    addStock,
    removeStock,
  };
}
