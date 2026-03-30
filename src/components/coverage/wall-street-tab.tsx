import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { WALL_STREET, WALL_STREET_NOTE } from "@/data/coverage/bmnr";
import { Building2, Info } from "lucide-react";

export function WallStreetTab({ ticker }: { ticker: string }) {
  const analysts = isEthTreasury(ticker) ? WALL_STREET : [];
  const note = isEthTreasury(ticker) ? WALL_STREET_NOTE : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Analyst Coverage</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          {analysts.length > 0 ? (
            <div className="divide-y divide-border/50">
              {analysts.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-3 first:pt-0">
                  <div>
                    <p className="text-sm font-medium">{a.firm}</p>
                    <p className="text-xs text-muted-foreground">{a.analyst} &middot; {a.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{a.rating}</p>
                    {a.priceTarget && <p className="text-xs tabular-nums text-muted-foreground">PT: ${a.priceTarget}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-4">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {note ?? "No analyst coverage available for this stock."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
