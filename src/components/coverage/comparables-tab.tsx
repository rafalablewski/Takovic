import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COMPARABLES, COMPARABLES_INSIGHT } from "@/data/coverage/bmnr";
import type { ComparableCompany } from "@/data/coverage/bmnr";
import { GitCompareArrows, AlertTriangle, Shield, Info } from "lucide-react";

const threatColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const assetColors: Record<string, string> = {
  ETH: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  BTC: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  Mixed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function ComparablesTab({ ticker }: { ticker: string }) {
  if (ticker !== "BMNR") return <p className="text-sm text-muted-foreground">No comparable data.</p>;

  return (
    <div className="space-y-4">
      {/* Insight */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground leading-relaxed">{COMPARABLES_INSIGHT}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comp cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {COMPARABLES.map((comp) => (
          <CompCard key={comp.ticker} comp={comp} />
        ))}
      </div>
    </div>
  );
}

function CompCard({ comp }: { comp: ComparableCompany }) {
  return (
    <Card className="transition-colors hover:bg-muted/20">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">{comp.name}</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{comp.ticker}</Badge>
          </div>
          <Badge className={cn("text-[10px]", assetColors[comp.asset])}>{comp.asset}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-3">
        {/* Quantitative metrics */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Metric label="Holdings" value={comp.holdings} />
          <Metric label="Holdings Value" value={comp.holdingsValue} />
          <Metric label="NAV Premium" value={comp.navPremium} />
          <Metric label="Staking Yield" value={comp.stakingYield} />
          <Metric label="Market Cap" value={comp.marketCap} />
          <div>
            <p className="text-[10px] text-muted-foreground">Threat Level</p>
            <Badge className={cn("mt-0.5 text-[10px]", threatColors[comp.threatLevel])}>{comp.threatLevel}</Badge>
          </div>
        </div>

        {/* Qualitative */}
        <div className="space-y-1.5 border-t border-border pt-3">
          <div className="flex items-start gap-1.5">
            <Shield className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">{comp.competitiveFocus}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <GitCompareArrows className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Differentiator:</span> {comp.keyDifferentiator}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">{value}</p>
    </div>
  );
}
