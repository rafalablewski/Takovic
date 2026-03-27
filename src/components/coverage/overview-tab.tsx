import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OVERVIEW } from "@/data/coverage/bmnr";
import { Lightbulb, Target } from "lucide-react";

export function OverviewTab({ ticker }: { ticker: string }) {
  const data = ticker === "BMNR" ? OVERVIEW : null;
  if (!data) return <p className="text-sm text-muted-foreground">No overview data.</p>;

  return (
    <div className="space-y-6">
      {/* Thesis */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Investment Thesis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{data.thesis}</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.keyMetrics.map((m) => (
              <div key={m.label}>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{m.value}</p>
                {m.note && <p className="text-[10px] text-muted-foreground/70">{m.note}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Catalysts */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Upcoming Catalysts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <ul className="space-y-2">
            {data.catalysts.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="mt-0.5 shrink-0 text-[10px] px-1.5 py-0">{i + 1}</Badge>
                {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
