"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useWatchlist, type WatchlistGroup } from "@/hooks/use-watchlist";
import type { FMPQuote } from "@/lib/api/fmp";
import { Plus, Trash2, X, Loader2, Search, FolderPlus, Pencil, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WatchlistStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  range52w: string;
}

/* ------------------------------------------------------------------ */
/*  Quote fetching                                                     */
/* ------------------------------------------------------------------ */

async function fetchBatchQuotes(
  tickers: string[]
): Promise<Record<string, WatchlistStock>> {
  if (tickers.length === 0) return {};
  try {
    const res = await fetch(
      `/api/stocks/batch?tickers=${tickers.join(",")}`
    );
    if (!res.ok) return {};
    const data: { quotes: Record<string, FMPQuote> } = await res.json();
    const mapped: Record<string, WatchlistStock> = {};
    for (const [ticker, q] of Object.entries(data.quotes)) {
      mapped[ticker] = {
        ticker: q.symbol,
        name: q.name,
        price: q.price,
        change: q.changesPercentage,
        range52w: `$${q.yearLow.toFixed(2)} - $${q.yearHigh.toFixed(2)}`,
      };
    }
    return mapped;
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/*  Add Stock Dialog                                                   */
/* ------------------------------------------------------------------ */

function AddStockDialog({
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
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(
            (data as { symbol: string; name: string; exchangeShortName: string }[]).slice(0, 8)
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
                <span className="font-medium text-foreground">
                  {r.symbol}
                </span>
                <span className="truncate text-muted-foreground">
                  {r.name}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {r.exchangeShortName}
                </span>
              </button>
            ))}
          </div>
        )}
        {value.length > 0 && results.length === 0 && !searching && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Press Enter to add <strong className="text-foreground">{value.toUpperCase()}</strong> directly
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Create Watchlist Dialog                                            */
/* ------------------------------------------------------------------ */

function CreateWatchlistDialog({
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

/* ------------------------------------------------------------------ */
/*  Watchlist Table                                                     */
/* ------------------------------------------------------------------ */

function WatchlistTable({
  stocks,
  loading,
  onRemove,
}: {
  stocks: WatchlistStock[];
  loading: boolean;
  onRemove: (ticker: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center px-5 py-8">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Loading quotes...
        </span>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-muted-foreground">
        No stocks in this watchlist. Click &quot;Add Stock&quot; to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stock
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Price
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Change
            </th>
            <th className="hidden px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
              52W Range
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Score
            </th>
            <th className="hidden px-5 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
              Signal
            </th>
            <th className="w-12 px-5 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr
              key={stock.ticker}
              className="border-b border-border/50 transition-colors hover:bg-muted/50"
            >
              <td className="px-5 py-3">
                <span className="font-medium text-foreground">
                  {stock.ticker}
                </span>
                <p className="text-xs text-muted-foreground">{stock.name}</p>
              </td>
              <td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
                {formatCurrency(stock.price)}
              </td>
              <td
                className={`px-5 py-3 text-right tabular-nums font-medium ${
                  stock.change >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatPercent(stock.change)}
              </td>
              <td className="hidden px-5 py-3 text-xs tabular-nums text-muted-foreground md:table-cell">
                {stock.range52w}
              </td>
              <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                —
              </td>
              <td className="hidden px-5 py-3 text-right lg:table-cell">
                <Badge variant="secondary" className="text-[10px]">
                  —
                </Badge>
              </td>
              <td className="px-5 py-3 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                  onClick={() => onRemove(stock.ticker)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Editable Watchlist Name                                            */
/* ------------------------------------------------------------------ */

function EditableName({
  name,
  onRename,
}: {
  name: string;
  onRename: (newName: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    } else {
      setValue(name);
    }
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        className="group flex items-center gap-1.5 text-sm font-medium text-foreground"
        onClick={() => setEditing(true)}
      >
        {name}
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setValue(name);
            setEditing(false);
          }
        }}
        className="rounded border border-border bg-background px-2 py-0.5 text-sm text-foreground outline-none focus:border-primary"
      />
      <button onClick={commit} className="text-muted-foreground hover:text-foreground">
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function WatchlistPage() {
  const {
    watchlists,
    isLoaded,
    addWatchlist,
    removeWatchlist,
    renameWatchlist,
    addStock,
    removeStock,
  } = useWatchlist();

  // Quotes cache: ticker -> WatchlistStock
  const [quotesMap, setQuotesMap] = useState<Record<string, WatchlistStock>>({});
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [showAddStock, setShowAddStock] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);

  // Set initial active tab once watchlists load
  useEffect(() => {
    if (isLoaded && watchlists.length > 0 && !activeTab) {
      setActiveTab(watchlists[0].id);
    }
  }, [isLoaded, watchlists, activeTab]);

  // Fetch quotes for all unique tickers across all watchlists
  useEffect(() => {
    if (!isLoaded) return;
    const allTickers = Array.from(
      new Set(watchlists.flatMap((wl) => wl.tickers))
    );
    if (allTickers.length === 0) {
      setLoadingQuotes(false);
      return;
    }

    setLoadingQuotes(true);

    // Batch in chunks of 20
    const chunks: string[][] = [];
    for (let i = 0; i < allTickers.length; i += 20) {
      chunks.push(allTickers.slice(i, i + 20));
    }

    Promise.all(chunks.map(fetchBatchQuotes))
      .then((results) => {
        const merged: Record<string, WatchlistStock> = {};
        for (const chunk of results) {
          Object.assign(merged, chunk);
        }
        setQuotesMap(merged);
      })
      .finally(() => setLoadingQuotes(false));
  }, [isLoaded, watchlists]);

  // Get stocks for a given watchlist
  function getStocksForWatchlist(wl: WatchlistGroup): WatchlistStock[] {
    return wl.tickers
      .map((t) => quotesMap[t])
      .filter((s): s is WatchlistStock => s !== undefined);
  }

  // Count of resolved stocks (for badge)
  function stockCount(wl: WatchlistGroup): number {
    if (loadingQuotes) return wl.tickers.length;
    return wl.tickers.length;
  }

  const activeWatchlist = watchlists.find((wl) => wl.id === activeTab);

  function handleAddStock(ticker: string) {
    if (activeWatchlist) {
      addStock(activeWatchlist.id, ticker);
    }
  }

  function handleRemoveStock(ticker: string) {
    if (activeWatchlist) {
      removeStock(activeWatchlist.id, ticker);
    }
  }

  function handleCreateWatchlist(name: string) {
    const id = addWatchlist(name);
    setActiveTab(id);
  }

  function handleDeleteWatchlist(id: string) {
    removeWatchlist(id);
    // Switch to first remaining list
    const remaining = watchlists.filter((wl) => wl.id !== id);
    if (remaining.length > 0) {
      setActiveTab(remaining[0].id);
    } else {
      setActiveTab("");
    }
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Watchlist</h1>
            <p className="text-sm text-muted-foreground">
              Track stocks and monitor performance
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            Track stocks and monitor performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowCreateList(true)}
          >
            <FolderPlus className="h-4 w-4" />
            New List
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddStock(true)}
          >
            <Plus className="h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Tabs */}
      {watchlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-3 text-sm text-muted-foreground">
              No watchlists yet.
            </p>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setShowCreateList(true)}
            >
              <FolderPlus className="h-4 w-4" />
              Create your first watchlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {watchlists.map((wl) => (
              <TabsTrigger key={wl.id} value={wl.id}>
                {wl.name}
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-[10px]"
                >
                  {stockCount(wl)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {watchlists.map((wl) => (
            <TabsContent key={wl.id} value={wl.id}>
              <Card>
                <CardHeader className="p-5 pb-0">
                  <div className="flex items-center justify-between">
                    <EditableName
                      name={wl.name}
                      onRename={(newName) => renameWatchlist(wl.id, newName)}
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {stockCount(wl)} stocks
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => handleDeleteWatchlist(wl.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 pt-3">
                  <WatchlistTable
                    stocks={getStocksForWatchlist(wl)}
                    loading={loadingQuotes}
                    onRemove={handleRemoveStock}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Dialogs */}
      {showAddStock && (
        <AddStockDialog
          onAdd={handleAddStock}
          onClose={() => setShowAddStock(false)}
        />
      )}
      {showCreateList && (
        <CreateWatchlistDialog
          onCreate={handleCreateWatchlist}
          onClose={() => setShowCreateList(false)}
        />
      )}
    </div>
  );
}
