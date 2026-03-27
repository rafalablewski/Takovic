import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";

const filterPills = [
  { label: "All", active: true },
  { label: "Watchlist", active: false },
  { label: "Bullish", active: false },
  { label: "Bearish", active: false },
  { label: "Tech", active: false },
  { label: "Finance", active: false },
  { label: "Energy", active: false },
];

function sentimentBadgeVariant(
  sentiment: string
): "success" | "danger" | "warning" | "secondary" {
  switch (sentiment) {
    case "bullish":
    case "somewhat_bullish":
      return "success";
    case "bearish":
    case "somewhat_bearish":
      return "danger";
    default:
      return "secondary";
  }
}

function sentimentLabel(sentiment: string): string {
  return sentiment
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const newsItems = [
  {
    headline: "Federal Reserve Signals Potential Rate Cut in Q2 as Inflation Eases",
    summary: "Fed Chair indicated the central bank could begin easing monetary policy sooner than expected, citing improving inflation metrics and cooling labor market data.",
    source: "Reuters",
    time: "32m ago",
    sentiment: "bullish",
    sector: "Finance",
    tickers: ["SPY", "QQQ"],
  },
  {
    headline: "NVIDIA Unveils Next-Generation AI Chip Architecture, Shares Surge 5%",
    summary: "The chipmaker announced its latest GPU platform at the annual developer conference, promising 30x improvement in AI inference performance.",
    source: "Bloomberg",
    time: "1h ago",
    sentiment: "bullish",
    sector: "Tech",
    tickers: ["NVDA", "AMD"],
  },
  {
    headline: "Apple Reports Mixed Q1 Results: Services Strong, iPhone Sales Flat",
    summary: "While services revenue hit a record $23.1B, iPhone units disappointed with flat year-over-year growth. Greater China revenue declined 8%.",
    source: "CNBC",
    time: "3h ago",
    sentiment: "neutral",
    sector: "Tech",
    tickers: ["AAPL"],
  },
  {
    headline: "Oil Prices Drop 4% as OPEC+ Considers Production Increase",
    summary: "Crude oil futures fell sharply as OPEC+ members discussed raising output quotas. Saudi Arabia signaled willingness to boost supply.",
    source: "Financial Times",
    time: "5h ago",
    sentiment: "bearish",
    sector: "Energy",
    tickers: ["XOM", "CVX"],
  },
  {
    headline: "JPMorgan Raises S&P 500 Target to 5,800, Cites Strong Earnings Momentum",
    summary: "Chief strategist raised the year-end target by 8%, pointing to resilient corporate earnings and AI-driven productivity gains.",
    source: "MarketWatch",
    time: "8h ago",
    sentiment: "somewhat_bullish",
    sector: "Finance",
    tickers: ["JPM", "SPY"],
  },
  {
    headline: "Pharmaceutical Giants Race to Develop Next-Gen GLP-1 Weight Loss Drugs",
    summary: "Multiple biotech firms are advancing clinical trials for oral GLP-1 agonists, potentially disrupting the $100B+ weight loss market.",
    source: "Wall Street Journal",
    time: "12h ago",
    sentiment: "somewhat_bullish",
    sector: "Healthcare",
    tickers: ["LLY", "NVO", "AMGN"],
  },
];

export default function NewsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Market News</h1>
        <p className="text-sm text-muted-foreground">
          AI-curated news with sentiment analysis
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => (
          <Button
            key={pill.label}
            variant={pill.active ? "default" : "outline"}
            size="sm"
            className="h-7 rounded-full px-3.5 text-xs"
          >
            {pill.label}
          </Button>
        ))}
      </div>

      {/* AI Daily Digest */}
      <Card className="border-primary/20">
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary/60" />
              AI Daily Digest
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Updated 15m ago
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Markets are trending higher today</span>{" "}
              as the Federal Reserve signaled a dovish pivot, sending major indices up across
              the board. The S&amp;P 500 gained 1.2% while the Nasdaq Composite rose 1.8%, led
              by semiconductor and AI-related stocks.
            </p>
            <p>
              <span className="font-medium text-foreground">Key themes:</span>{" "}
              Rate cut expectations are now priced at 78% probability for June.
              Tech earnings season kicks off next week. Oil volatility continues
              as OPEC+ debates production strategy. Your watchlist is up 1.4% today.
            </p>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">S&amp;P 500</p>
              <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+1.2%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nasdaq</p>
              <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+1.8%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dow Jones</p>
              <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+0.7%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Feed */}
      <div className="space-y-3">
        {newsItems.map((item, idx) => (
          <Card
            key={idx}
            className="transition-colors hover:bg-muted/30"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h3 className="text-sm font-medium leading-snug text-foreground">
                    {item.headline}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                    <span className="font-medium">{item.source}</span>
                    <span className="text-border">|</span>
                    <span>{item.time}</span>
                    <span className="text-border">|</span>
                    <span>{item.sector}</span>
                    <div className="flex gap-1">
                      {item.tickers.map((t) => (
                        <Badge key={t} variant="secondary" className="h-5 px-1.5 text-[10px]">
                          ${t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={sentimentBadgeVariant(item.sentiment)}
                  className="shrink-0 text-[10px]"
                >
                  {sentimentLabel(item.sentiment)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="outline" size="sm">
          Load More
        </Button>
      </div>
    </div>
  );
}
