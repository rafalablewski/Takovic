import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SCORECARD } from "@/data/coverage/bmnr";
import { BarChart3, Shield, AlertTriangle } from "lucide-react";

const scoreColors = [
  "", // 0 unused
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-green-500",
];

const scoreLabelColors = [
  "",
  "text-red-600 dark:text-red-400",
  "text-orange-600 dark:text-orange-400",
  "text-amber-600 dark:text-amber-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-green-600 dark:text-green-400",
];

export function AnalysisTab({ ticker }: { ticker: string }) {
  const data = ticker === "BMNR" ? SCORECARD : null;
  if (!data) return <p className="text-sm text-muted-foreground">No analysis data.</p>;

  const weightedScore = data.reduce((sum, s) => sum + s.score * s.weight, 0) / data.reduce((sum, s) => sum + s.weight, 0);

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">8-Category Scorecard</CardTitle>
            </div>
            <div className="text-right">
              <span className={cn("text-lg font-semibold tabular-nums", scoreLabelColors[Math.round(weightedScore)])}>{weightedScore.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground"> / 5.0</span>
            </div>
          </div>
          <CardDescription className="text-xs">
            Weighted composite score across {data.length} categories
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4 space-y-4">
          {data.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <Badge variant="secondary" className="text-[10px]">{item.weight}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={cn(
                          "h-2 w-5 rounded-sm",
                          n <= item.score ? scoreColors[item.score] : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className={cn("text-sm font-semibold tabular-nums", scoreLabelColors[item.score])}>
                    {item.score}/5
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{item.assessment}</p>
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {item.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground/80">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
