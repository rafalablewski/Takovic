import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CAPITAL_STRUCTURE } from "@/data/coverage/bmnr";
import { Layers, AlertTriangle } from "lucide-react";

export function CapitalStructureTab({ ticker }: { ticker: string }) {
  const data = ticker === "BMNR" ? CAPITAL_STRUCTURE : null;
  if (!data) return <p className="text-sm text-muted-foreground">No capital structure data.</p>;

  return (
    <div className="space-y-6">
      {/* Share structure */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Share Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Share Class</p>
              <p className="mt-0.5 text-sm font-medium">{data.shareClass}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">{(data.sharesOutstanding / 1e6).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Authorized</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">{(data.sharesAuthorized / 1e6).toFixed(0)}M</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">ATM Program</CardTitle>
              {data.atmProgram.active && (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px]">Active</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">{data.atmProgram.description}</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Facility</span>
              <span className="font-medium">{data.atmProgram.facility}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Usage</span>
              <span className="font-medium">{data.atmProgram.usage}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Registered Directs</CardTitle>
              {data.registeredDirects.active && (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px]">Active</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">{data.registeredDirects.description}</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Frequency</span>
              <span className="font-medium">{data.registeredDirects.frequency}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warrants + Dilution */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium">Dilution Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3 space-y-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Annual Dilution Rate</p>
              <p className="mt-0.5 text-sm font-semibold text-amber-600 dark:text-amber-400">{data.dilutionAnalysis.annualRate}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Warrants</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{data.warrants.description}</p>
            </div>
          </div>
          <div className="rounded-md bg-muted/40 p-3 space-y-1.5">
            <p className="text-xs"><span className="font-medium text-emerald-600 dark:text-emerald-400">Bull case:</span> <span className="text-muted-foreground">{data.dilutionAnalysis.mitigant}</span></p>
            <p className="text-xs"><span className="font-medium text-red-600 dark:text-red-400">Bear case:</span> <span className="text-muted-foreground">{data.dilutionAnalysis.riskScenario}</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
