import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  TrendingUp,
  DollarSign,
  PieChart,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Placeholder sections — will be replaced with real alert management
// ---------------------------------------------------------------------------

const sections = [
  {
    icon: TrendingUp,
    title: "Price Alerts",
    description:
      "Get notified when a stock crosses above or below a target price, or moves by a certain percentage.",
  },
  {
    icon: DollarSign,
    title: "Earnings Alerts",
    description:
      "Reminders before earnings reports for stocks in your watchlist, with EPS estimate context.",
  },
  {
    icon: PieChart,
    title: "Portfolio Alerts",
    description:
      "Daily P&L summaries, significant position changes, and portfolio threshold notifications.",
  },
  {
    icon: Zap,
    title: "Volume & Momentum",
    description:
      "Alerts for unusual volume spikes, 52‑week highs/lows, and technical indicator crossovers.",
  },
];

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Alerts</h2>
        <p className="text-sm text-muted-foreground">
          Price targets, earnings reminders, and portfolio notifications.
        </p>
      </div>

      {/* Coming soon banner */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 py-4">
          <Bell className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Alerts — Coming Soon</p>
            <p className="text-xs text-muted-foreground">
              Custom alert rules with in‑app and email delivery. Set once, stay informed.
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            In Development
          </Badge>
        </CardContent>
      </Card>

      {/* Planned sections */}
      <div className="grid gap-4 sm:grid-cols-2">
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
