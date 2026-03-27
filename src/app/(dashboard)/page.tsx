export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Market Overview
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          AI-powered insights across your watchlist and the broader market.
        </p>
      </div>

      {/* Market indices placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["S&P 500", "NASDAQ", "DOW", "Russell 2000"].map((index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-500">{index}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              --
            </p>
            <p className="mt-1 text-sm text-zinc-400">Loading...</p>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Watchlist summary */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Watchlist
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Add stocks to your watchlist to track them here.
          </p>
        </div>

        {/* AI Market Digest */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            AI Market Digest
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Your personalized daily market summary powered by AI.
          </p>
        </div>
      </div>

      {/* Recent news */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Latest News
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Financial news with AI-powered sentiment analysis.
        </p>
      </div>
    </div>
  );
}
