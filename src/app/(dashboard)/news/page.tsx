import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { timeAgo, formatPercent } from "@/lib/utils";
import { getQuote } from "@/lib/api/yahoo";
import type { FMPQuote } from "@/lib/api/yahoo";
import { getGoogleNews } from "@/lib/api/google-news";
import type { GoogleNewsArticle } from "@/lib/api/google-news";
import { Sparkles } from "lucide-react";
import Link from "next/link";

const FILTER_OPTIONS = [
  { label: "All", query: "stock market financial news" },
  { label: "Stocks", query: "stock market equities trading" },
  { label: "Crypto", query: "cryptocurrency bitcoin ethereum" },
  { label: "Economy", query: "economy inflation interest rates GDP" },
  { label: "Earnings", query: "earnings report quarterly results revenue" },
] as const;

interface NewsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const activeFilter = params.filter ?? "All";
  const filterConfig =
    FILTER_OPTIONS.find((f) => f.label === activeFilter) ?? FILTER_OPTIONS[0];

  let newsItems: GoogleNewsArticle[] = [];
  let indexQuotes: { name: string; quote: FMPQuote | null }[] = [];

  try {
    const [news, spy, qqq, dia] = await Promise.all([
      getGoogleNews(filterConfig.query, 20),
      getQuote("SPY"),
      getQuote("QQQ"),
      getQuote("DIA"),
    ]);
    newsItems = news ?? [];
    indexQuotes = [
      { name: "S&P 500", quote: spy },
      { name: "Nasdaq", quote: qqq },
      { name: "Dow Jones", quote: dia },
    ];
  } catch (error) {
    console.error("Failed to fetch news page data:", error);
    // Data unavailable
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Market News</h1>
        <p className="text-sm text-muted-foreground">
          Latest financial news from Google News
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((pill) => (
          <Link
            key={pill.label}
            href={
              pill.label === "All"
                ? "/news"
                : `/news?filter=${encodeURIComponent(pill.label)}`
            }
          >
            <Button
              variant={pill.label === activeFilter ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full px-3.5 text-xs"
            >
              {pill.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Market Summary */}
      <Card className="border-primary/20">
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary/60" />
              Market Summary
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          {indexQuotes.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                AI daily digest requires ANTHROPIC_API_KEY to enable AI-powered market summaries.
              </p>
              <Separator className="mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {indexQuotes.map((idx) => (
                  <div key={idx.name}>
                    <p className="text-xs text-muted-foreground">{idx.name}</p>
                    {idx.quote ? (
                      <p
                        className={`text-sm font-semibold tabular-nums ${
                          idx.quote.changesPercentage >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPercent(idx.quote.changesPercentage)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">—</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Market data unavailable. Check YAHOO_FINANCE configuration.
            </p>
          )}
        </CardContent>
      </Card>

      {/* News Feed */}
      <div className="space-y-3">
        {newsItems.length > 0 ? (
          newsItems.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="transition-colors hover:bg-muted/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h3 className="text-sm font-medium leading-snug text-foreground">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                        <span className="font-medium">{item.source}</span>
                        <span className="text-border">|</span>
                        <span>{timeAgo(new Date(item.publishedDate))}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))
        ) : (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                No news available. Try a different filter or check your connection.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Load More */}
      {newsItems.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
