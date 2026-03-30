"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  sentimentBadgeVariant,
  sentimentLabel,
  cn,
} from "@/lib/utils";
import type { FMPQuote, FMPProfile, FMPIncomeStatement, FMPNews } from "@/lib/api/fmp";
import type { SnowflakeScores } from "@/types/analysis";
import { QuoteStrip } from "@/components/research/quote-strip";
import { ChartContainer } from "@/components/research/chart-container";
import { MetricCard } from "@/components/research/metric-card";
import { Tag } from "@/components/research/tag";
import { NewsCard } from "@/components/research/news-card";
import { DataTable, type DataTableColumn } from "@/components/research/data-table";
import { FinancialsGrowthChart } from "@/components/research/financials-growth-chart";
import { FilingsPanel } from "@/components/stock/filings-panel";
import {
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const VALID_TABS = new Set([
  "overview",
  "financials",
  "news",
  "analysis",
  "filings",
]);

const scoreColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];
const scoreLabels = ["Value", "Growth", "Profitability", "Health", "Dividend"];

export type AiAnalysisPayload = {
  summary: string;
  sentiment: string;
  strengths: string[];
  weaknesses: string[];
} | null;

export type StockDetailClientProps = {
  ticker: string;
  companyName: string;
  exchange: string;
  quote: FMPQuote;
  profile: FMPProfile | null;
  metricChips: { label: string; value: string; hint?: string }[];
  overviewMetrics: { label: string; value: string }[];
  incomeStatements: FMPIncomeStatement[];
  financialPeriod: "annual" | "quarter";
  news: FMPNews[];
  snowflakeScores: SnowflakeScores | null;
  aiAnalysis: AiAnalysisPayload;
};

function buildGrowthRows(statements: FMPIncomeStatement[]) {
  const sorted = [...statements].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.map((row, i) => {
    const older = sorted[i + 1];
    let yoyRevenuePct: number | null = null;
    if (older && older.revenue && row.revenue) {
      yoyRevenuePct = ((row.revenue - older.revenue) / older.revenue) * 100;
    }
    return {
      period: row.date.slice(0, 7),
      yoyRevenuePct,
    };
  });
}

export function StockDetailClient({
  ticker,
  companyName,
  exchange,
  quote,
  profile,
  metricChips,
  overviewMetrics,
  incomeStatements,
  financialPeriod,
  news,
  snowflakeScores,
  aiAnalysis,
}: StockDetailClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab =
    rawTab && VALID_TABS.has(rawTab) ? rawTab : "overview";

  const growthRows = React.useMemo(
    () => buildGrowthRows(incomeStatements),
    [incomeStatements]
  );

  const snowflakeItems = snowflakeScores
    ? scoreLabels.map((label, i) => ({
        label,
        score: [
          snowflakeScores.value,
          snowflakeScores.growth,
          snowflakeScores.profitability,
          snowflakeScores.health,
          snowflakeScores.dividend,
        ][i],
        color: scoreColors[i],
      }))
    : null;

  function periodHref(next: "annual" | "quarter") {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", "financials");
    p.set("period", next);
    return `${pathname}?${p.toString()}`;
  }

  const incomeColumns: DataTableColumn<FMPIncomeStatement>[] = [
    {
      id: "date",
      header: "Period",
      sortValue: (r) => r.date,
      accessor: (r) => (
        <span className="font-mono text-xs">{r.date}</span>
      ),
    },
    {
      id: "revenue",
      header: "Revenue",
      numeric: true,
      sortValue: (r) => r.revenue,
      accessor: (r) =>
        r.revenue != null ? formatCurrency(r.revenue, "USD", true) : "—",
    },
    {
      id: "gross",
      header: "Gross profit",
      numeric: true,
      sortValue: (r) => r.grossProfit,
      accessor: (r) =>
        r.grossProfit != null
          ? formatCurrency(r.grossProfit, "USD", true)
          : "—",
    },
    {
      id: "op",
      header: "Op. income",
      numeric: true,
      sortValue: (r) => r.operatingIncome,
      accessor: (r) =>
        r.operatingIncome != null
          ? formatCurrency(r.operatingIncome, "USD", true)
          : "—",
    },
    {
      id: "net",
      header: "Net income",
      numeric: true,
      sortValue: (r) => r.netIncome,
      accessor: (r) =>
        r.netIncome != null
          ? formatCurrency(r.netIncome, "USD", true)
          : "—",
    },
    {
      id: "eps",
      header: "EPS",
      numeric: true,
      sortValue: (r) => r.eps,
      accessor: (r) =>
        r.eps != null ? r.eps.toFixed(2) : "—",
    },
  ];

  const description = profile?.description?.trim();
  const shortDesc =
    description && description.length > 420
      ? `${description.slice(0, 420).trim()}…`
      : description;

  return (
    <div className="space-y-3">
      <QuoteStrip
        ticker={ticker}
        companyName={companyName}
        exchange={exchange}
        initialQuote={quote}
        metricChips={metricChips}
      />

      {tab === "overview" && (
        <div className="space-y-3 pt-1">
          <ChartContainer ticker={ticker} />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {overviewMetrics.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
          <div className="research-card space-y-2 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {profile?.sector && <Tag>{profile.sector}</Tag>}
              {profile?.industry && (
                <Tag className="normal-case">{profile.industry}</Tag>
              )}
            </div>
            {shortDesc ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {shortDesc}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No company description available.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "financials" && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Income statement ({financialPeriod})
            </h2>
            <div className="flex gap-1 rounded-lg border border-border p-0.5">
              <Link
                href={periodHref("annual")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  financialPeriod === "annual"
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                scroll={false}
              >
                Annual
              </Link>
              <Link
                href={periodHref("quarter")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  financialPeriod === "quarter"
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                scroll={false}
              >
                Quarterly
              </Link>
            </div>
          </div>
          <div className="research-card overflow-hidden p-0">
            <DataTable<FMPIncomeStatement>
              columns={incomeColumns}
              data={incomeStatements}
              getRowKey={(r) => r.date}
              dense
              stickyHeader
              caption="USD · source FMP"
            />
          </div>
          <div className="research-card p-3">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              YoY revenue growth
            </h3>
            <FinancialsGrowthChart data={growthRows} />
          </div>
        </div>
      )}

      {tab === "news" && (
        <div className="space-y-2 pt-1">
          {news.length > 0 ? (
            news.map((item, idx) => (
              <NewsCard
                key={`${item.url}-${idx}`}
                title={item.title}
                site={item.site}
                publishedAt={new Date(item.publishedDate)}
                url={item.url}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent news available.
            </p>
          )}
        </div>
      )}

      {tab === "analysis" && (
        <div className="grid gap-3 pt-1 lg:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="space-y-1 p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Snowflake Analysis
                </CardTitle>
                <div className="text-right">
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {snowflakeScores ? snowflakeScores.overall.toFixed(1) : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground"> / 5.0</span>
                </div>
              </div>
              <CardDescription className="text-xs">
                Multi-factor scoring across 5 dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-3">
              {snowflakeItems ? (
                snowflakeItems.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {item.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary">
                      <div
                        className={`h-1.5 rounded-full ${item.color} transition-all`}
                        style={{ width: `${(item.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Insufficient data to calculate scores.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/25 shadow-sm">
            <CardHeader className="space-y-1 p-4 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Sparkles className="h-3 w-3" />
                  Claude
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-3">
              {aiAnalysis ? (
                <>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {aiAnalysis.summary}
                  </p>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-up">
                        Strengths
                      </h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {aiAnalysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-up" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-down">
                        Risks
                      </h4>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {aiAnalysis.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-down" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">Sentiment:</span>
                    <Badge
                      variant={sentimentBadgeVariant(aiAnalysis.sentiment)}
                      className="text-[10px]"
                    >
                      {sentimentLabel(aiAnalysis.sentiment)}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  AI analysis unavailable — configure ANTHROPIC_API_KEY to enable.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "filings" && (
        <div className="pt-1">
          <FilingsPanel ticker={ticker} />
        </div>
      )}
    </div>
  );
}
