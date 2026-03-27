export default function ScreenerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Stock Screener
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Filter and rank stocks by fundamentals, valuation, and AI scores.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters Panel */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Filters
          </h2>
          <div className="mt-4 space-y-4">
            {[
              "Sector",
              "Market Cap",
              "P/E Ratio",
              "ROE",
              "Dividend Yield",
              "Value Score",
              "Growth Score",
              "Sentiment",
            ].map((filter) => (
              <div key={filter}>
                <label className="text-xs font-medium text-zinc-500">
                  {filter}
                </label>
                <div className="mt-1 h-9 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800" />
              </div>
            ))}
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="lg:col-span-3 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Results
            </h2>
            <p className="text-xs text-zinc-500">0 stocks found</p>
          </div>
          <div className="mt-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  {[
                    "Stock",
                    "Price",
                    "Change",
                    "Market Cap",
                    "P/E",
                    "Score",
                    "Sentiment",
                  ].map((header) => (
                    <th
                      key={header}
                      className="pb-3 text-xs font-medium text-zinc-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-zinc-400"
                  >
                    Apply filters to search for stocks
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
