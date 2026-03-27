export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Portfolio
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track your holdings and performance with AI insights.
          </p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          + Add Holding
        </button>
      </div>

      {/* Portfolio overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Value", value: "$0.00" },
          { label: "Total Gain/Loss", value: "$0.00" },
          { label: "Day Change", value: "$0.00" },
          { label: "Overall Return", value: "0.00%" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Portfolio Snowflake + Allocation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Portfolio Snowflake
          </h2>
          <div className="mt-4 flex h-48 items-center justify-center text-zinc-400">
            Aggregated analysis radar chart
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Sector Allocation
          </h2>
          <div className="mt-4 flex h-48 items-center justify-center text-zinc-400">
            Pie chart of sector allocation
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Holdings
        </h2>
        <div className="mt-4 flex flex-col items-center justify-center py-8 text-zinc-400">
          <p>Add holdings to see your portfolio breakdown.</p>
        </div>
      </div>
    </div>
  );
}
