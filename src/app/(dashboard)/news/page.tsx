export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Financial News
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Aggregated news with AI-powered sentiment analysis.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {["All", "Watchlist", "Bullish", "Bearish", "Tech", "Finance", "Energy"].map(
          (filter) => (
            <button
              key={filter}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "All"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* AI Daily Digest */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            AI Digest
          </span>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Today&apos;s Market Summary
          </h2>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your AI-generated daily market digest will appear here each morning.
        </p>
      </div>

      {/* News feed */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="h-20 w-32 flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Bullish
                </span>
                <span className="text-xs text-zinc-400">Source Name</span>
              </div>
              <h3 className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                Sample news headline placeholder
              </h3>
              <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                Article summary will appear here with AI-powered sentiment tagging...
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
