"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type OptionsTabProps = {
  ticker: string;
  currentPrice: number;
};

type SampleOption = {
  strike: number;
  last: number;
  bid: number;
  ask: number;
  volume: number;
  oi: number;
  iv: number;
  itm: boolean;
};

function generateSampleStrikes(currentPrice: number) {
  const roundedBase = Math.round(currentPrice / 5) * 5;
  const strikes: number[] = [];
  for (let i = -4; i <= 4; i++) {
    strikes.push(roundedBase + i * 5);
  }
  return strikes;
}

function generateSampleOption(
  strike: number,
  currentPrice: number,
  isCall: boolean
): SampleOption {
  const itm = isCall ? currentPrice > strike : currentPrice < strike;
  const intrinsic = isCall
    ? Math.max(0, currentPrice - strike)
    : Math.max(0, strike - currentPrice);
  const timeValue = 2 + Math.random() * 3;
  const last = +(intrinsic + timeValue).toFixed(2);
  return {
    strike,
    last,
    bid: +(last - 0.05 - Math.random() * 0.1).toFixed(2),
    ask: +(last + 0.05 + Math.random() * 0.1).toFixed(2),
    volume: Math.floor(Math.random() * 5000),
    oi: Math.floor(Math.random() * 20000),
    iv: +(0.2 + Math.random() * 0.3).toFixed(2),
    itm,
  };
}

const SAMPLE_EXPIRATIONS = [
  "2026-04-04",
  "2026-04-11",
  "2026-04-18",
  "2026-05-16",
];

const GREEKS = [
  { name: "Delta", symbol: "\u0394", sample: "0.55", description: "Rate of change of option price relative to a $1 change in the underlying asset." },
  { name: "Gamma", symbol: "\u0393", sample: "0.03", description: "Rate of change of delta relative to a $1 change in the underlying asset." },
  { name: "Theta", symbol: "\u0398", sample: "-0.08", description: "Rate of option price decay per day as expiration approaches." },
  { name: "Vega", symbol: "\u03BD", sample: "0.12", description: "Sensitivity of option price to a 1% change in implied volatility." },
];

const TABLE_HEADERS = ["Strike", "Last", "Bid", "Ask", "Vol", "OI", "IV"];

function OptionsTable({
  options,
  isCall,
  atmStrike,
}: {
  options: SampleOption[];
  isCall: boolean;
  atmStrike: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {TABLE_HEADERS.map((h) => (
              <th
                key={h}
                className={cn(
                  "px-2.5 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  h === "Strike" ? "text-left" : "text-right"
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.map((opt) => {
            const isAtm = opt.strike === atmStrike;
            return (
              <tr
                key={opt.strike}
                className={cn(
                  "border-b border-white/[0.04] transition-colors",
                  opt.itm && isCall && "bg-emerald-500/5",
                  opt.itm && !isCall && "bg-red-500/5",
                  isAtm && "border-l-2 border-l-primary",
                  !opt.itm && !isAtm && "hover:bg-muted/30"
                )}
              >
                <td className="px-2.5 py-2 tabular-nums font-medium">
                  {opt.strike.toFixed(0)}
                  {opt.itm && (
                    <Badge
                      variant={isCall ? "success" : "danger"}
                      className="ml-1.5 text-[9px] px-1 py-0"
                    >
                      ITM
                    </Badge>
                  )}
                </td>
                {[
                  opt.last.toFixed(2),
                  opt.bid.toFixed(2),
                  opt.ask.toFixed(2),
                  opt.volume.toLocaleString(),
                  opt.oi.toLocaleString(),
                  `${(opt.iv * 100).toFixed(1)}%`,
                ].map((val, i) => (
                  <td key={i} className="px-2.5 py-2 text-right tabular-nums opacity-60">{val}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function OptionsTab({ ticker, currentPrice }: OptionsTabProps) {
  const [selectedExpiry, setSelectedExpiry] = useState(SAMPLE_EXPIRATIONS[0]);

  const { strikes, atmStrike, calls, puts } = useMemo(() => {
    const s = generateSampleStrikes(currentPrice);
    const atm = Math.round(currentPrice / 5) * 5;
    const c = s.map((strike) => generateSampleOption(strike, currentPrice, true));
    const p = s.map((strike) => generateSampleOption(strike, currentPrice, false));
    return { strikes: s, atmStrike: atm, calls: c, puts: p };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice, selectedExpiry]);

  return (
    <div className="space-y-5 pt-1">
      {/* Premium Banner */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Options Chain data requires a premium market data subscription.
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Below is the options chain layout that will be available with
              premium access. Sample data is shown for demonstration purposes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Expiration Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Expiration:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_EXPIRATIONS.map((exp) => (
            <button
              key={exp}
              onClick={() => setSelectedExpiry(exp)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedExpiry === exp
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {new Date(exp + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </button>
          ))}
        </div>
      </div>

      {/* Options Chain - Two Panel Layout */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1 p-4 pb-0">
            <CardTitle className="text-sm font-medium">
              Calls
              <Badge variant="success" className="ml-2 text-[10px]">
                Bullish
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              {ticker} call options expiring {selectedExpiry}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <OptionsTable
              options={calls}
              isCall={true}
              atmStrike={atmStrike}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 p-4 pb-0">
            <CardTitle className="text-sm font-medium">
              Puts
              <Badge variant="danger" className="ml-2 text-[10px]">
                Bearish
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              {ticker} put options expiring {selectedExpiry}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <OptionsTable
              options={puts}
              isCall={false}
              atmStrike={atmStrike}
            />
          </CardContent>
        </Card>
      </div>

      {/* Greeks Reference Card */}
      <Card>
        <CardHeader className="space-y-1 p-4 pb-0">
          <CardTitle className="text-sm font-medium">
            The Greeks — Quick Reference
          </CardTitle>
          <CardDescription className="text-xs">
            Key risk measures for options pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {GREEKS.map((g) => (
              <div
                key={g.name}
                className="flex items-start gap-3 rounded-lg border border-border/50 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                  {g.symbol}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium">{g.name}</span>
                    <span className="tabular-nums text-xs text-muted-foreground opacity-60">
                      e.g. {g.sample}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {g.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
