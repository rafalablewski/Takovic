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
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Calculator, ArrowUpRight, TrendingUp } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — pre-calculated DCF results
// ---------------------------------------------------------------------------

const inputs = {
  ticker: "AAPL",
  currentFCF: 99.6, // billions
  fcfGrowthRate: 8,
  terminalGrowthRate: 3,
  discountRate: 10,
  sharesOutstanding: 15.4, // billions
};

const results = {
  intrinsicValue: 198.45,
  currentPrice: 192.53,
  upsideDownside: 3.1,
  marginOfSafety: 3.1,
  verdict: "Fairly Valued" as const,
};

// Sensitivity matrix: rows = growth rates, cols = discount rates
const sensitivityGrowthRates = [6, 8, 10];
const sensitivityDiscountRates = [9, 10, 11];
const sensitivityValues = [
  [178.32, 162.14, 148.67],
  [215.88, 198.45, 183.21],
  [258.74, 239.12, 221.56],
];

// ---------------------------------------------------------------------------
// Shared input class
// ---------------------------------------------------------------------------

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ValuationPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Valuation Calculator
        </h1>
        <p className="text-sm text-muted-foreground">
          Estimate intrinsic value with DCF analysis
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Inputs */}
        <Card>
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">DCF Inputs</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Adjust assumptions to estimate intrinsic value
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-4 space-y-4">
            {/* Ticker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Stock Ticker
              </label>
              <input
                type="text"
                className={inputClass}
                defaultValue={inputs.ticker}
                placeholder="e.g. AAPL"
              />
            </div>

            {/* Current FCF */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Current Free Cash Flow
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  className={`${inputClass} pl-7`}
                  defaultValue={inputs.currentFCF}
                  step={0.1}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  B
                </span>
              </div>
            </div>

            {/* FCF Growth Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                FCF Growth Rate (5yr)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className={`${inputClass} pr-8`}
                  defaultValue={inputs.fcfGrowthRate}
                  step={0.5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* Terminal Growth Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Terminal Growth Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  className={`${inputClass} pr-8`}
                  defaultValue={inputs.terminalGrowthRate}
                  step={0.5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* Discount Rate (WACC) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Discount Rate (WACC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className={`${inputClass} pr-8`}
                  defaultValue={inputs.discountRate}
                  step={0.5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* Shares Outstanding */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Shares Outstanding
              </label>
              <div className="relative">
                <input
                  type="number"
                  className={`${inputClass} pr-8`}
                  defaultValue={inputs.sharesOutstanding}
                  step={0.1}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  B
                </span>
              </div>
            </div>

            <Button className="w-full mt-2">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate
            </Button>
          </CardContent>
        </Card>

        {/* Right: Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-5 pb-0">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  DCF Results
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
              {/* Intrinsic value — prominent */}
              <div className="text-center py-2">
                <p className="text-xs text-muted-foreground">
                  Intrinsic Value per Share
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(results.intrinsicValue)}
                </p>
              </div>

              <Separator />

              {/* Key metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Price</p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
                    {formatCurrency(results.currentPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Upside/Downside
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatPercent(results.upsideDownside)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Margin of Safety
                  </p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
                    {results.marginOfSafety.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verdict</p>
                  <div className="mt-0.5">
                    <Badge variant="secondary">{results.verdict}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sensitivity table */}
          <Card>
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-sm font-medium">
                Sensitivity Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Intrinsic value at different growth and discount rates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2 pr-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Growth / WACC
                      </th>
                      {sensitivityDiscountRates.map((dr) => (
                        <th
                          key={dr}
                          className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          {dr}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {sensitivityGrowthRates.map((gr, rowIdx) => (
                      <tr
                        key={gr}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="py-2.5 pr-3 text-xs font-medium text-muted-foreground">
                          {gr}%
                        </td>
                        {sensitivityValues[rowIdx].map((val, colIdx) => {
                          const isBase =
                            gr === inputs.fcfGrowthRate &&
                            sensitivityDiscountRates[colIdx] ===
                              inputs.discountRate;
                          return (
                            <td
                              key={colIdx}
                              className={`py-2.5 text-right tabular-nums ${
                                isBase
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatCurrency(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        This DCF valuation is an estimate based on the assumptions provided and
        should not be considered financial advice. Actual intrinsic value depends
        on many factors not captured in this simplified model, including
        competitive dynamics, management quality, and macroeconomic conditions.
        Always conduct thorough due diligence before making investment decisions.
      </p>
    </div>
  );
}
