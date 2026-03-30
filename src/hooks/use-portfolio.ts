"use client";

import { useState, useEffect, useCallback } from "react";

export interface Holding {
  id: string;
  ticker: string;
  shares: number;
  avgCostBasis: number;
  purchaseDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: Holding[];
}

const STORAGE_KEY = "takovic-portfolio";

const DEFAULT_PORTFOLIOS: Portfolio[] = [
  {
    id: "default-portfolio",
    name: "My Portfolio",
    holdings: [],
  },
];

function generateId(): string {
  return `pf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadPortfolios(): Portfolio[] {
  if (typeof window === "undefined") return DEFAULT_PORTFOLIOS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Corrupted localStorage — fall through to defaults
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PORTFOLIOS));
  return DEFAULT_PORTFOLIOS;
}

function persist(portfolios: Portfolio[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
}

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setPortfolios(loadPortfolios());
    setIsLoaded(true);
  }, []);

  const update = useCallback(
    (updater: (prev: Portfolio[]) => Portfolio[]) => {
      setPortfolios((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    []
  );

  const addPortfolio = useCallback(
    (name: string) => {
      const id = generateId();
      update((prev) => [...prev, { id, name, holdings: [] }]);
      return id;
    },
    [update]
  );

  const removePortfolio = useCallback(
    (id: string) => {
      update((prev) => prev.filter((p) => p.id !== id));
    },
    [update]
  );

  const renamePortfolio = useCallback(
    (id: string, name: string) => {
      update((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name } : p))
      );
    },
    [update]
  );

  const addHolding = useCallback(
    (
      portfolioId: string,
      holding: Omit<Holding, "id">
    ) => {
      const id = generateId();
      update((prev) =>
        prev.map((p) => {
          if (p.id !== portfolioId) return p;
          return {
            ...p,
            holdings: [...p.holdings, { ...holding, id, ticker: holding.ticker.toUpperCase().trim() }],
          };
        })
      );
      return id;
    },
    [update]
  );

  const updateHolding = useCallback(
    (
      portfolioId: string,
      holdingId: string,
      updates: Partial<Omit<Holding, "id">>
    ) => {
      update((prev) =>
        prev.map((p) => {
          if (p.id !== portfolioId) return p;
          return {
            ...p,
            holdings: p.holdings.map((h) =>
              h.id === holdingId
                ? {
                    ...h,
                    ...updates,
                    ticker: updates.ticker
                      ? updates.ticker.toUpperCase().trim()
                      : h.ticker,
                  }
                : h
            ),
          };
        })
      );
    },
    [update]
  );

  const removeHolding = useCallback(
    (portfolioId: string, holdingId: string) => {
      update((prev) =>
        prev.map((p) => {
          if (p.id !== portfolioId) return p;
          return {
            ...p,
            holdings: p.holdings.filter((h) => h.id !== holdingId),
          };
        })
      );
    },
    [update]
  );

  return {
    portfolios,
    isLoaded,
    addPortfolio,
    removePortfolio,
    renamePortfolio,
    addHolding,
    updateHolding,
    removeHolding,
  };
}
