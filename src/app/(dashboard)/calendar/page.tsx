import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  DollarSign,
  Landmark,
  BarChart3,
  Megaphone,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Placeholder sections — will be replaced with live earnings + economic data
// ---------------------------------------------------------------------------

const sections = [
  {
    icon: DollarSign,
    title: "Earnings Calendar",
    description:
      "Upcoming and recent earnings reports with EPS estimates, actual results, and surprise percentages.",
  },
  {
    icon: Landmark,
    title: "Economic Events",
    description:
      "FOMC meetings, CPI releases, GDP reports, jobs data, and other market‑moving macro events.",
  },
  {
    icon: Megaphone,
    title: "IPO Calendar",
    description:
      "Upcoming IPOs and recent listings with pricing details, exchange, and sector information.",
  },
  {
    icon: BarChart3,
    title: "Dividend Calendar",
    description:
      "Ex‑dividend dates, payment dates, and yield information for stocks in your watchlist and portfolio.",
  },
];

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Earnings, economic events, IPOs, and dividend dates in one place.
        </p>
      </div>

      {/* Coming soon banner */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 py-4">
          <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Calendar — Coming Soon</p>
            <p className="text-xs text-muted-foreground">
              Unified earnings, economic, IPO, and dividend calendar with filtering and alerts.
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
