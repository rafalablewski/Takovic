import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ETHEREUM_CONTEXT } from "@/data/coverage/bmnr";
import { Coins, Milestone, Building2, Activity } from "lucide-react";

export function EthereumTab({ ticker }: { ticker: string }) {
  const data = ticker === "BMNR" ? ETHEREUM_CONTEXT : null;
  if (!data) return <p className="text-sm text-muted-foreground">No Ethereum data for this stock.</p>;

  return (
    <div className="space-y-6">
      {/* Correlation */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">BMNR-ETH Correlation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.correlation}</p>
        </CardContent>
      </Card>

      {/* Protocol Milestones */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Milestone className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Protocol Roadmap</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="space-y-3">
            {data.protocolMilestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <Badge variant="secondary" className="shrink-0 text-[10px] tabular-nums">{m.date}</Badge>
                <div>
                  <p className="text-sm font-medium text-foreground">{m.event}</p>
                  <p className="text-xs text-muted-foreground">{m.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Institutional Adoption */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Institutional Adoption</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <ul className="space-y-2">
            {data.institutionalAdoption.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Ecosystem Metrics */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Ecosystem Fundamentals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.ecosystemMetrics.map((m) => (
              <div key={m.label}>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{m.value}</p>
                {m.source && <p className="text-[10px] text-muted-foreground/60">{m.source}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
