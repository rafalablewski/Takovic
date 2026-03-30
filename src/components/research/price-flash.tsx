"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function PriceFlash({
  value,
  formatted,
  className,
}: {
  value: number;
  formatted: string;
  className?: string;
}) {
  const prev = React.useRef(value);
  const [flash, setFlash] = React.useState<"up" | "down" | null>(null);

  React.useEffect(() => {
    if (value !== prev.current) {
      setFlash(value > prev.current ? "up" : "down");
      prev.current = value;
      const t = window.setTimeout(() => setFlash(null), 320);
      return () => window.clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className={cn(
        className,
        flash === "up" && "animate-price-flash-up rounded px-0.5",
        flash === "down" && "animate-price-flash-down rounded px-0.5"
      )}
    >
      {formatted}
    </span>
  );
}

export function ChangePill({
  pct,
  changeAbs,
  formatPct,
  formatChange,
}: {
  pct: number;
  changeAbs: number;
  formatPct: (n: number) => string;
  formatChange: (n: number) => string;
}) {
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-mono text-sm font-medium tabular-nums",
        up ? "bg-up/10 text-up" : "bg-down/10 text-down"
      )}
    >
      {formatPct(pct)}{" "}
      <span className="text-xs opacity-80">({formatChange(changeAbs)})</span>
    </span>
  );
}
