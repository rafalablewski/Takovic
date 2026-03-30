import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Placeholder sections — will be replaced with live data + heatmaps
// ---------------------------------------------------------------------------

const sections = [
  {
    icon: Globe,
    title: "Sector Heatmap",
    description:
      "Visual treemap of S&P 500 sectors showing daily performance with color‑coded gains and losses.",
  },
  {
    icon: BarChart3,
    title: "Sector Performance",
    description:
      "Daily, weekly, monthly, and YTD performance bars for each GICS sector.",
  },
  {
    icon: Activity,
    title: "Market Indicators",
    description:
      "VIX, 10‑Year Treasury yield, US Dollar Index (DXY), crude oil, and gold — at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Major Indices",
    description:
      "Real‑time quotes for S&P 500, Nasdaq 100, Dow Jones, Russell 2000, and international benchmarks.",
  },
  {
    icon: TrendingDown,
    title: "Market Breadth",
    description:
      "Advance/decline ratio, new highs vs new lows, and put/call ratio for sentiment tracking.",
  },
];

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Markets</h2>
        <p className="text-sm text-muted-foreground">
          Broad market overview, sector performance, and macro indicators.
        </p>
      </div>

      {/* Coming soon banner */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 py-4">
          <Globe className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Markets Overview — Coming Soon</p>
            <p className="text-xs text-muted-foreground">
              Heatmaps, sector performance, macro indicators, and market breadth data are being built.
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            In Development
          </Badge>
        </CardContent>
      </Card>

      {/* Planned sections */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">
                {s.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
