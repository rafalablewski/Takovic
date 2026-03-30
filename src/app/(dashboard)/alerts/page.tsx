"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Percent,
} from "lucide-react";
import { useAlerts, type AlertType } from "@/hooks/use-alerts";
import type { FMPQuote } from "@/lib/api/fmp";
import { formatCurrency } from "@/lib/utils";

const ALERT_TYPE_OPTIONS: { value: AlertType; label: string }[] = [
  { value: "price_above", label: "Price Above" },
  { value: "price_below", label: "Price Below" },
  { value: "pct_change", label: "% Change" },
];

function alertTypeIcon(type: AlertType) {
  switch (type) {
    case "price_above":
      return <TrendingUp className="h-3 w-3" />;
    case "price_below":
      return <TrendingDown className="h-3 w-3" />;
    case "pct_change":
      return <Percent className="h-3 w-3" />;
  }
}

function alertTypeLabel(type: AlertType): string {
  return ALERT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function formatAlertValue(type: AlertType, value: number): string {
  if (type === "pct_change") return `${value.toFixed(1)}%`;
  return formatCurrency(value);
}

export default function AlertsPage() {
  const { alerts, isLoaded, addAlert, removeAlert, clearTriggered, markTriggered } =
    useAlerts();

  const [ticker, setTicker] = React.useState("");
  const [alertType, setAlertType] = React.useState<AlertType>("price_above");
  const [value, setValue] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  // Check alerts against live prices on mount
  React.useEffect(() => {
    if (!isLoaded || alerts.length === 0) return;
    const untriggered = alerts.filter((a) => !a.triggered);
    if (untriggered.length === 0) return;

    const uniqueTickers = [...new Set(untriggered.map((a) => a.ticker))];
    if (uniqueTickers.length === 0) return;

    setChecking(true);
    fetch(`/api/stocks/batch?tickers=${uniqueTickers.join(",")}`)
      .then((res) => res.json())
      .then((data: { quotes: Record<string, FMPQuote> }) => {
        const toTrigger: string[] = [];
        for (const alert of untriggered) {
          const quote = data.quotes[alert.ticker];
          if (!quote) continue;

          if (
            alert.type === "price_above" &&
            quote.price >= alert.value
          ) {
            toTrigger.push(alert.id);
          } else if (
            alert.type === "price_below" &&
            quote.price <= alert.value
          ) {
            toTrigger.push(alert.id);
          } else if (
            alert.type === "pct_change" &&
            Math.abs(quote.changesPercentage) >= alert.value
          ) {
            toTrigger.push(alert.id);
          }
        }
        if (toTrigger.length > 0) {
          markTriggered(toTrigger);
        }
      })
      .catch((err) => console.error("Failed to check alerts:", err))
      .finally(() => setChecking(false));
    // Only run on mount once loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = ticker.trim().toUpperCase();
    const num = parseFloat(value);
    if (!trimmed || isNaN(num) || num <= 0) return;
    addAlert(trimmed, alertType, num);
    setTicker("");
    setValue("");
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Alerts</h2>
          <p className="text-sm text-muted-foreground">
            Price targets and notification rules.
          </p>
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Alerts</h2>
        <p className="text-sm text-muted-foreground">
          Price targets and notification rules.
        </p>
      </div>

      {/* Create Alert form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Create Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Ticker
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="AAPL"
                className="h-9 w-28 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as AlertType)}
                className="h-9 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {ALERT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {alertType === "pct_change" ? "Threshold (%)" : "Target Price ($)"}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={alertType === "pct_change" ? "5.0" : "150.00"}
                step="any"
                min="0"
                className="h-9 w-32 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>
            <Button type="submit" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add Alert
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Triggered Alerts
                <Badge variant="warning" className="text-[10px]">
                  {triggeredAlerts.length}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTriggered}
                className="text-xs text-muted-foreground"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ticker
                    </th>
                    <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Target
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Triggered
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {triggeredAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2.5 font-medium tabular-nums">
                        {alert.ticker}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="warning" className="gap-1 text-[10px]">
                          {alertTypeIcon(alert.type)}
                          {alertTypeLabel(alert.type)}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatAlertValue(alert.type, alert.value)}
                      </td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">
                        {alert.triggeredAt
                          ? new Date(alert.triggeredAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeAlert(alert.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Active Alerts
            {checking && (
              <span className="text-[10px] text-muted-foreground">
                Checking...
              </span>
            )}
            {activeAlerts.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {activeAlerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No active alerts. Create one above to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Ticker
                    </th>
                    <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Target
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Created
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2.5 font-medium tabular-nums">
                        {alert.ticker}
                      </td>
                      <td className="py-2.5">
                        <Badge variant="secondary" className="gap-1 text-[10px]">
                          {alertTypeIcon(alert.type)}
                          {alertTypeLabel(alert.type)}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatAlertValue(alert.type, alert.value)}
                      </td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge variant="success" className="text-[10px]">
                          Active
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeAlert(alert.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
