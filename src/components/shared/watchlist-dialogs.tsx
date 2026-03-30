"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Add Stock Dialog                                                   */
/* ------------------------------------------------------------------ */

export function AddStockDialog({
  onAdd,
  onClose,
}: {
  onAdd: (ticker: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState<
    { symbol: string; name: string; exchangeShortName: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/stocks/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(
            (
              data as {
                symbol: string;
                name: string;
                exchangeShortName: string;
              }[]
            ).slice(0, 8)
          );
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    doSearch(v);
  }

  function handleSelect(symbol: string) {
    onAdd(symbol);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && value.trim()) {
      onAdd(value.trim().toUpperCase());
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search ticker or company name..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {searching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {results.length > 0 && (
          <div className="max-h-64 overflow-y-auto p-1">
            {results.map((r) => (
              <button
                key={r.symbol}
                onClick={() => handleSelect(r.symbol)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
              >
                <span className="font-medium text-foreground">{r.symbol}</span>
                <span className="truncate text-muted-foreground">{r.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {r.exchangeShortName}
                </span>
              </button>
            ))}
          </div>
        )}
        {value.length > 0 && results.length === 0 && !searching && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Press Enter to add{" "}
            <strong className="text-foreground">{value.toUpperCase()}</strong>{" "}
            directly
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Create Watchlist Dialog                                            */
/* ------------------------------------------------------------------ */

export function CreateWatchlistDialog({
  onCreate,
  onClose,
}: {
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-lg">
        <h3 className="mb-3 text-sm font-medium text-foreground">
          New Watchlist
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Watchlist name..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim()}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
