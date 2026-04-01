"use client";

import { useState, useEffect, useCallback } from "react";

export type AlertType = "price_above" | "price_below" | "pct_change";

export interface Alert {
  id: string;
  ticker: string;
  type: AlertType;
  value: number;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

const STORAGE_KEY = "takovic-alerts";

function generateId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadAlerts(): Alert[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupted localStorage — fall through to empty
  }
  return [];
}

function persist(alerts: Alert[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAlerts(loadAlerts());
    setIsLoaded(true);
  }, []);

  const update = useCallback(
    (updater: (prev: Alert[]) => Alert[]) => {
      setAlerts((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    []
  );

  const addAlert = useCallback(
    (ticker: string, type: AlertType, value: number): string => {
      const id = generateId();
      const alert: Alert = {
        id,
        ticker: ticker.toUpperCase().trim(),
        type,
        value,
        createdAt: new Date().toISOString(),
        triggered: false,
      };
      update((prev) => [alert, ...prev]);
      return id;
    },
    [update]
  );

  const removeAlert = useCallback(
    (id: string) => {
      update((prev) => prev.filter((a) => a.id !== id));
    },
    [update]
  );

  const clearTriggered = useCallback(() => {
    update((prev) => prev.filter((a) => !a.triggered));
  }, [update]);

  const markTriggered = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      update((prev) =>
        prev.map((a) =>
          idSet.has(a.id)
            ? { ...a, triggered: true, triggeredAt: new Date().toISOString() }
            : a
        )
      );
    },
    [update]
  );

  return {
    alerts,
    isLoaded,
    addAlert,
    removeAlert,
    clearTriggered,
    markTriggered,
  };
}
