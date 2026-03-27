export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Watchlist
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track your favorite stocks and monitor their performance.
          </p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          + New Watchlist
        </button>
      </div>

      {/* Watchlist tabs placeholder */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button className="border-b-2 border-blue-600 px-4 py-2 text-sm font-medium text-blue-600">
          My Stocks
        </button>
        <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          Tech
        </button>
        <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          Dividends
        </button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white py-16 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          No stocks yet
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Search for a stock and add it to your watchlist.
        </p>
      </div>
    </div>
  );
}
