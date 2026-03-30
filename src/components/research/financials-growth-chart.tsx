"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function FinancialsGrowthChart({
  data,
}: {
  data: { period: string; yoyRevenuePct: number | null }[];
}) {
  const chartData = data.filter((d) => d.yoyRevenuePct != null);

  if (chartData.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        Not enough history for YoY revenue growth.
      </p>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={40}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) =>
              typeof value === "number"
                ? [`${value.toFixed(1)}%`, "YoY revenue"]
                : ["", ""]
            }
          />
          <ReferenceLine y={0} stroke="var(--border)" />
          <Bar
            dataKey="yoyRevenuePct"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
