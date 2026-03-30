import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPercent } from "@/lib/utils";
import {
  getQuote,
  getMarketNews,
  getHistoricalPriceFull,
  getEarningsCalendar,
  getStockMarketGainers,
  getStockMarketLosers,
  getStockMarketActives,
  fmpMoverSymbol,
} from "@/lib/api/yahoo";
import type { FMPQuote, FMPNews, FMPEarningsCalendarItem, FMPMoverQuote } from "@/lib/api/yahoo";
import { PortfolioSummary } from "@/components/shared/portfolio-summary";
import { getCurrentUser } from "@/lib/auth/user";
import { StockRow } from "@/components/research/stock-row";
import { MiniSparkline } from "@/components/research/mini-sparkline";
import { NewsCard } from "@/components/research/news-card";
import { Sparkles, ChevronRight } from "lucide-react";
import { Section } from "@/components/layout/section";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function sparklineCloses(ticker: string): Promise<number[]> {
  const to = new Date();
  const from = new Date(to);
  /* slice(-40) needs 40 trading closes; ~35 sessions fit in 50 calendar days — use 60d so daily rows reliably reach 40 */
  from.setDate(from.getDate() - 60);
  try {
    const full = await getHistoricalPriceFull(ticker.trim().toUpperCase(), {
      from: ymd(from),
      to: ymd(to),
    });
    const h = full?.historical ?? [];
    const asc = [...h].sort((a, b) => a.date.localeCompare(b.date));
    return asc.map((b) => b.close).slice(-40);
  } catch {
    return [];
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const displayName = user.name?.trim() || "there";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const watchlistTickers =
    process.env.DEFAULT_WATCHLIST_TICKERS?.split(",") || [
      "AAPL",
      "MSFT",
      "NVDA",
      "GOOGL",
      "AMZN",
      "TSLA",
    ];
  const cleanedWatchlistTickers = watchlistTickers
    .map((t) => t.trim())
    .filter(Boolean);
  const watchlistForNews = cleanedWatchlistTickers.join(",");

  const indexTickers = [
    { ticker: "SPY", name: "S&P 500" },
    { ticker: "QQQ", name: "NASDAQ 100" },
    { ticker: "DIA", name: "Dow" },
    { ticker: "IWM", name: "Russell 2000" },
  ];

  const fromE = new Date();
  const toE = new Date();
  toE.setDate(toE.getDate() + 10);

  let marketIndices: { name: string; quote: FMPQuote | null }[] = [];
  let watchlistQuotes: FMPQuote[] = [];
  let latestNews: FMPNews[] = [];
  let earnings: FMPEarningsCalendarItem[] = [];
  let gainers: FMPMoverQuote[] = [];
  let losers: FMPMoverQuote[] = [];
  let actives: FMPMoverQuote[] = [];
  const sparklines: Record<string, number[]> = {};

  try {
    const [indexQuotes, wlQuotes, newsData, earnRaw, g, l, a] =
      await Promise.all([
        Promise.all(indexTickers.map((idx) => getQuote(idx.ticker))),
        Promise.all(cleanedWatchlistTickers.map((t) => getQuote(t))),
        getMarketNews(24, watchlistForNews),
        getEarningsCalendar(ymd(fromE), ymd(toE)),
        getStockMarketGainers(),
        getStockMarketLosers(),
        getStockMarketActives(),
      ]);

    marketIndices = indexTickers.map((idx, i) => ({
      name: idx.name,
      quote: indexQuotes[i],
    }));
    watchlistQuotes = wlQuotes.filter(Boolean) as FMPQuote[];
    latestNews = newsData ?? [];
    earnings = Array.isArray(earnRaw) ? earnRaw : [];
    gainers = Array.isArray(g) ? g.slice(0, 5) : [];
    losers = Array.isArray(l) ? l.slice(0, 5) : [];
    actives = Array.isArray(a) ? a.slice(0, 6) : [];

    await Promise.all(
      cleanedWatchlistTickers.map(async (t) => {
        const sym = t.toUpperCase();
        sparklines[sym] = await sparklineCloses(sym);
      })
    );
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const watchSet = new Set(
    cleanedWatchlistTickers.map((t) => t.toUpperCase())
  );
  const earningsForList = [...earnings]
    .filter((e) => e.symbol && watchSet.has(e.symbol.toUpperCase()))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);
  const earningsFallback = [...earnings]
    .filter((e) => e.symbol)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);
  const earningsDisplay =
    earningsForList.length > 0 ? earningsForList : earningsFallback;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {getGreeting()}, {displayName}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{today}</p>
        </div>
        <Badge variant="secondary" className="text-[10px] tracking-wide">
          Market briefing
        </Badge>
      </div>

      {/* Indices strip */}
      <section className="surface-panel p-4 sm:p-5">
        <h2 className="label-caps mb-3">Indices</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {marketIndices.map((idx) => {
            if (!idx.quote) {
              return (
                <div
                  key={idx.name}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {idx.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Unavailable</p>
                </div>
              );
            }
            const q = idx.quote;
            const up = q.changesPercentage >= 0;
            return (
              <Link
                key={idx.name}
                href={`/stock/${q.symbol}`}
                className="min-h-11 rounded-lg border border-white/[0.06] bg-transparent px-3 py-3 transition-colors hover:bg-white/[0.03] sm:min-h-0 sm:py-2.5"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {idx.name}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
                  {q.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-xs font-medium tabular-nums ${
                    up ? "text-up" : "text-down"
                  }`}
                >
                  {formatPercent(q.changesPercentage)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Movers */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-panel p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label-caps">Top gainers</h2>
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" asChild>
              <Link href="/screener">Screener</Link>
            </Button>
          </div>
          <div className="space-y-0.5">
            {gainers.map((m, i) => {
              const sym = fmpMoverSymbol(m);
              if (!sym) return null;
              return (
                <StockRow
                  key={`${sym}-${i}`}
                  ticker={sym}
                  name={m.companyName}
                  price={m.price}
                  changesPercentage={m.changesPercentage}
                  href={`/stock/${sym}`}
                />
              );
            })}
            {gainers.length === 0 && (
              <p className="py-4 text-xs text-muted-foreground">No data</p>
            )}
          </div>
        </div>
        <div className="surface-panel p-4 sm:p-5">
          <h2 className="label-caps mb-3">Top losers</h2>
          <div className="space-y-0.5">
            {losers.map((m, i) => {
              const sym = fmpMoverSymbol(m);
              if (!sym) return null;
              return (
                <StockRow
                  key={`${sym}-${i}`}
                  ticker={sym}
                  name={m.companyName}
                  price={m.price}
                  changesPercentage={m.changesPercentage}
                  href={`/stock/${sym}`}
                />
              );
            })}
            {losers.length === 0 && (
              <p className="py-4 text-xs text-muted-foreground">No data</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="surface-panel p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="label-caps">Watchlist</h2>
              <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-[10px]" asChild>
                <Link href="/watchlist">
                  All <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {watchlistQuotes.length > 0 ? (
                watchlistQuotes.map((stock) => {
                  const sym = stock.symbol.toUpperCase();
                  const vals = sparklines[sym] ?? [];
                  return (
                    <StockRow
                      key={stock.symbol}
                      ticker={sym}
                      name={stock.name}
                      price={stock.price}
                      changesPercentage={stock.changesPercentage}
                      href={`/stock/${sym}`}
                      volumeLabel={
                        stock.volume
                          ? (stock.volume / 1e6).toFixed(2) + "M"
                          : undefined
                      }
                      sparkline={
                        <MiniSparkline
                          values={vals}
                          positive={stock.changesPercentage >= 0}
                        />
                      }
                    />
                  );
                })
              ) : (
                <p className="py-4 text-xs text-muted-foreground">
                  No watchlist data available.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-5">
          <div className="surface-panel p-4 sm:p-5">
            <h2 className="label-caps mb-3">Earnings (10d)</h2>
            <ul className="space-y-2 text-xs">
              {earningsDisplay.map((e, i) => (
                <li
                  key={`${e.symbol}-${e.date}-${i}`}
                  className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/stock/${e.symbol}`}
                    className="font-mono font-semibold text-foreground hover:text-primary"
                  >
                    {e.symbol}
                  </Link>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {e.date}
                  </span>
                </li>
              ))}
              {earningsDisplay.length === 0 && (
                <li className="text-muted-foreground">No upcoming earnings.</li>
              )}
            </ul>
          </div>

          <div className="surface-panel p-4 sm:p-5">
            <h2 className="label-caps mb-3">Trending (volume)</h2>
            <div className="space-y-0.5">
              {actives.map((m, i) => {
                const sym = fmpMoverSymbol(m);
                if (!sym) return null;
                return (
                  <StockRow
                    key={`a-${sym}-${i}`}
                    ticker={sym}
                    name={m.companyName}
                    price={m.price}
                    changesPercentage={m.changesPercentage}
                    href={`/stock/${sym}`}
                  />
                );
              })}
              {actives.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">No data</p>
              )}
            </div>
          </div>

          <Card>
            <CardHeader className="space-y-0 p-4 pb-0">
              <CardTitle className="text-xs font-medium tracking-wide">Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <PortfolioSummary />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-0 p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium tracking-wide">
                  AI Market Digest
                </CardTitle>
                <Badge variant="secondary" className="text-[9px] tracking-wide">
                  {today}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
                <Sparkles className="mb-2 h-5 w-5 stroke-[1.25] opacity-35" />
                <p className="text-xs">AI digest requires ANTHROPIC_API_KEY</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Section title="News & wires" className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-2">
          {latestNews.length > 0 ? (
            latestNews.slice(0, 8).map((item, idx) => (
              <NewsCard
                key={`${item.url}-${idx}`}
                title={item.title}
                site={item.site}
                publishedAt={new Date(item.publishedDate)}
                url={item.url}
              />
            ))
          ) : (
            <div className="surface-panel p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                No headlines returned for your watchlist symbols. If quotes load
                but this stays empty, try again later. After adding{" "}
                Yahoo Finance data source in your environment,
                redeploy so the server sees it.
              </p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
