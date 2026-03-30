import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Landmark, AlertTriangle } from "lucide-react";
import {
  getEarningsCalendar,
  getEconomicCalendar,
  type FMPEarningsCalendarItem,
  type FMPEconomicEvent,
} from "@/lib/api/fmp";
import { formatCurrency, formatNumber } from "@/lib/utils";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByDate<T extends { date: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const date = item.date.slice(0, 10);
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(item);
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function impactBadgeVariant(impact: string): "danger" | "warning" | "secondary" {
  switch (impact?.toLowerCase()) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    default:
      return "secondary";
  }
}

function earningTimeLabel(time?: string): string {
  if (!time) return "";
  const t = time.toLowerCase();
  if (t.includes("bmo") || t.includes("before")) return "BMO";
  if (t.includes("amc") || t.includes("after")) return "AMC";
  return time;
}

export default async function CalendarPage() {
  const today = new Date();
  const from = ymd(today);
  const future = new Date(today);
  future.setDate(future.getDate() + 30);
  const to = ymd(future);

  let earnings: FMPEarningsCalendarItem[] = [];
  let economic: FMPEconomicEvent[] = [];
  let fetchError: string | null = null;

  try {
    [earnings, economic] = await Promise.all([
      getEarningsCalendar(from, to),
      getEconomicCalendar(from, to),
    ]);
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to fetch calendar data";
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Calendar</h2>
          <p className="text-sm text-muted-foreground">
            Earnings and economic events for the next 30 days.
          </p>
        </div>
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-6">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium">Unable to load calendar data</p>
              <p className="text-xs text-muted-foreground">{fetchError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const earningsByDate = groupByDate(earnings);
  const economicByDate = groupByDate(economic);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Earnings and economic events for the next 30 days.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Calendar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Earnings Calendar
            </h3>
          </div>

          {earningsByDate.size === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No upcoming earnings in the next 30 days.
                </p>
              </CardContent>
            </Card>
          ) : (
            [...earningsByDate.entries()].map(([date, items]) => (
              <Card key={date}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {formatDateLabel(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {items.map((item, i) => (
                      <div
                        key={`${item.symbol}-${i}`}
                        className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/stock/${item.symbol}`}
                              className="text-sm font-semibold text-primary hover:underline tabular-nums"
                            >
                              {item.symbol}
                            </Link>
                            {item.time && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {earningTimeLabel(item.time)}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
                            {item.epsEstimated != null && (
                              <span>
                                EPS Est: {formatCurrency(item.epsEstimated)}
                              </span>
                            )}
                            {item.revenueEstimated != null && (
                              <span>
                                Rev Est: {formatCurrency(item.revenueEstimated, "USD", true)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Economic Calendar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Economic Calendar
            </h3>
          </div>

          {economicByDate.size === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CalendarDays className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No upcoming economic events in the next 30 days.
                </p>
              </CardContent>
            </Card>
          ) : (
            [...economicByDate.entries()].map(([date, items]) => (
              <Card key={date}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {formatDateLabel(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {items.map((item, i) => {
                      const isHigh = item.impact?.toLowerCase() === "high";
                      return (
                        <div
                          key={`${item.event}-${i}`}
                          className={`py-2 first:pt-0 last:pb-0 ${isHigh ? "bg-red-50/50 dark:bg-red-950/10 -mx-2 px-2 rounded" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium uppercase text-muted-foreground">
                                  {item.country}
                                </span>
                                <span className={`text-sm ${isHigh ? "font-semibold" : "font-medium"}`}>
                                  {item.event}
                                </span>
                              </div>
                            </div>
                            <Badge variant={impactBadgeVariant(item.impact)} className="shrink-0 text-[10px]">
                              {item.impact || "Low"}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
                            {item.estimate != null && (
                              <span>Est: {formatNumber(item.estimate)}</span>
                            )}
                            {item.previous != null && (
                              <span>Prev: {formatNumber(item.previous)}</span>
                            )}
                            {item.actual != null && (
                              <span className="font-medium text-foreground">
                                Actual: {formatNumber(item.actual)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
