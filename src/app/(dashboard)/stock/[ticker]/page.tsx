import { notFound } from "next/navigation";

interface StockPageProps {
  params: Promise<{ ticker: string }>;
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  // TODO: Fetch stock data from FMP API with caching
  // const [quote, profile, metrics] = await Promise.all([
  //   getQuote(upperTicker),
  //   getProfile(upperTicker),
  //   getKeyMetrics(upperTicker),
  // ]);

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {upperTicker}
              </h1>
              <p className="text-sm text-zinc-500">Company Name</p>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              $--
            </span>
            <span className="text-sm font-medium text-zinc-400">
              --% today
            </span>
          </div>
        </div>
        <button className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          + Watchlist
        </button>
      </div>

      {/* Snowflake + AI Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Snowflake Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Analysis Snowflake
          </h2>
          <div className="mt-4 flex h-64 items-center justify-center text-zinc-400">
            {/* TODO: SnowflakeChart component */}
            <p>Radar chart: Value, Growth, Profitability, Health, Dividend</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              AI Analysis
            </h2>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Powered by Claude
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>AI-generated analysis will appear here.</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Key Metrics
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "P/E Ratio", value: "--" },
            { label: "P/B Ratio", value: "--" },
            { label: "ROE", value: "--" },
            { label: "Debt/Equity", value: "--" },
            { label: "Dividend Yield", value: "--" },
            { label: "Revenue Growth", value: "--" },
            { label: "Net Margin", value: "--" },
            { label: "Free Cash Flow", value: "--" },
            { label: "Market Cap", value: "--" },
            { label: "EPS", value: "--" },
          ].map((metric) => (
            <div key={metric.label}>
              <p className="text-xs text-zinc-500">{metric.label}</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Price Chart
        </h2>
        <div className="mt-4 flex h-80 items-center justify-center text-zinc-400">
          {/* TODO: TradingView Lightweight Charts */}
          <p>Interactive price chart (1D / 1W / 1M / 1Y / 5Y)</p>
        </div>
      </div>

      {/* Recent News */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recent News
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          News articles with AI sentiment analysis for {upperTicker}.
        </p>
      </div>
    </div>
  );
}
