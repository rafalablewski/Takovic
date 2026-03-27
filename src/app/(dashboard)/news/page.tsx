import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Newspaper,
  Sparkles,
  Clock,
  Building2,
  ImageIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
} from "lucide-react";

const filterPills = [
  { label: "All", active: true },
  { label: "Watchlist", active: false },
  { label: "Bullish", active: false },
  { label: "Bearish", active: false },
  { label: "Tech", active: false },
  { label: "Finance", active: false },
  { label: "Energy", active: false },
];

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config: Record<string, { label: string; variant: "success" | "warning" | "danger" | "secondary"; icon: typeof TrendingUp }> = {
    bullish: { label: "Bullish", variant: "success", icon: TrendingUp },
    somewhat_bullish: { label: "Somewhat Bullish", variant: "success", icon: TrendingUp },
    neutral: { label: "Neutral", variant: "secondary", icon: Minus },
    somewhat_bearish: { label: "Somewhat Bearish", variant: "warning", icon: TrendingDown },
    bearish: { label: "Bearish", variant: "danger", icon: TrendingDown },
  };
  const c = config[sentiment] ?? { label: "Neutral", variant: "secondary" as const, icon: Minus };
  const Icon = c.icon;
  return (
    <Badge variant={c.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}

const newsItems = [
  {
    headline: "Federal Reserve Signals Potential Rate Cut in Q2 as Inflation Eases",
    summary: "Fed Chair indicated the central bank could begin easing monetary policy sooner than expected, citing improving inflation metrics and cooling labor market data. Markets rallied on the dovish commentary.",
    source: "Reuters",
    time: "32m ago",
    sentiment: "bullish",
    sector: "Finance",
    tickers: ["SPY", "QQQ"],
  },
  {
    headline: "NVIDIA Unveils Next-Generation AI Chip Architecture, Shares Surge 5%",
    summary: "The chipmaker announced its latest GPU platform at the annual developer conference, promising 30x improvement in AI inference performance. Cloud providers have already placed massive pre-orders.",
    source: "Bloomberg",
    time: "1h ago",
    sentiment: "bullish",
    sector: "Tech",
    tickers: ["NVDA", "AMD"],
  },
  {
    headline: "Apple Reports Mixed Q1 Results: Services Strong, iPhone Sales Flat",
    summary: "While services revenue hit a record $23.1B, iPhone units disappointed with flat year-over-year growth. Greater China revenue declined 8% amid increasing competition from Huawei.",
    source: "CNBC",
    time: "3h ago",
    sentiment: "neutral",
    sector: "Tech",
    tickers: ["AAPL"],
  },
  {
    headline: "Oil Prices Drop 4% as OPEC+ Considers Production Increase",
    summary: "Crude oil futures fell sharply as OPEC+ members discussed raising output quotas in the next meeting. Saudi Arabia signaled willingness to boost supply if prices remain elevated.",
    source: "Financial Times",
    time: "5h ago",
    sentiment: "bearish",
    sector: "Energy",
    tickers: ["XOM", "CVX"],
  },
  {
    headline: "JPMorgan Raises S&P 500 Target to 5,800, Cites Strong Earnings Momentum",
    summary: "Chief strategist raised the year-end target by 8%, pointing to resilient corporate earnings, AI-driven productivity gains, and stabilizing interest rate expectations as key catalysts.",
    source: "MarketWatch",
    time: "8h ago",
    sentiment: "somewhat_bullish",
    sector: "Finance",
    tickers: ["JPM", "SPY"],
  },
  {
    headline: "Pharmaceutical Giants Race to Develop Next-Gen GLP-1 Weight Loss Drugs",
    summary: "Multiple biotech firms are advancing clinical trials for oral GLP-1 agonists, potentially disrupting the $100B+ weight loss market currently dominated by injectable treatments.",
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
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-blue-500" />
          Market News
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-curated financial news with sentiment analysis
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => (
          <Button
            key={pill.label}
            variant={pill.active ? "default" : "outline"}
            size="sm"
            className="h-8 rounded-full px-4 text-xs"
          >
            {pill.label}
          </Button>
        ))}
      </div>

      {/* AI Daily Digest */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent dark:border-blue-900 dark:from-blue-950/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/50">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Daily Digest
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Zap className="h-3 w-3" />
                    Updated 15m ago
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Your personalized market summary powered by Claude
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Markets are trending higher today</span>{" "}
              as the Federal Reserve signaled a dovish pivot, sending major indices up across
              the board. The S&amp;P 500 gained 1.2% while the Nasdaq Composite rose 1.8%, led
              by semiconductor and AI-related stocks. The 10-year Treasury yield dropped 8 basis
              points to 4.15%.
            </p>
            <p>
              <span className="font-semibold text-foreground">Key themes to watch:</span>{" "}
              Rate cut expectations are now priced at 78% probability for the June meeting.
              Tech earnings season kicks off next week with major reports from Microsoft,
              Meta, and Amazon. Oil volatility continues as OPEC+ debates production strategy.
              Your watchlist is up an average of 1.4% today, outperforming the broader market.
            </p>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">S&amp;P 500</p>
              <p className="text-lg font-bold text-emerald-600">+1.2%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nasdaq</p>
              <p className="text-lg font-bold text-emerald-600">+1.8%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dow Jones</p>
              <p className="text-lg font-bold text-emerald-600">+0.7%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Feed */}
      <div className="space-y-4">
        {newsItems.map((item, idx) => (
          <Card
            key={idx}
            className="transition-colors hover:bg-muted/20"
          >
            <CardContent className="p-5">
              <div className="flex gap-4">
                {/* Image placeholder */}
                <div className="hidden shrink-0 sm:block">
                  <div className="flex h-24 w-36 items-center justify-center rounded-lg bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug line-clamp-2">
                      {item.headline}
                    </h3>
                    <SentimentBadge sentiment={item.sentiment} />
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span className="font-medium">{item.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.time}</span>
                    </div>
                    <Badge variant="outline" className="h-5 text-[10px] font-normal">
                      {item.sector}
                    </Badge>
                    <div className="flex gap-1">
                      {item.tickers.map((t) => (
                        <Badge key={t} variant="secondary" className="h-5 px-1.5 text-[10px]">
                          ${t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-2">
        <Button variant="outline" className="w-full max-w-xs">
          Load More Articles
        </Button>
      </div>
    </div>
  );
}
