import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { ETH_PURCHASES, ETH_PURCHASE_SUMMARY } from "@/data/coverage/bmnr";
import { ShoppingCart, TrendingUp, ChevronDown, ChevronUp, DollarSign, Coins, Hash } from "lucide-react";

export function ETHPurchasesTab({ ticker }: { ticker: string }) {
  const [showAll, setShowAll] = useState(false);

  if (ticker !== "BMNR") return <p className="text-sm text-muted-foreground">No ETH purchase data.</p>;

  const summary = ETH_PURCHASE_SUMMARY;
  const purchases = ETH_PURCHASES;
  const visible = showAll ? purchases : purchases.slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard icon={<Hash className="h-4 w-4" />} label="Purchases" value={String(summary.totalPurchases)} />
        <SummaryCard icon={<Coins className="h-4 w-4" />} label="Total ETH" value={summary.totalETHAcquired.toLocaleString()} />
        <SummaryCard icon={<DollarSign className="h-4 w-4" />} label="Capital Deployed" value={formatCurrency(summary.totalCapitalDeployed, "USD", true)} />
        <SummaryCard icon={<TrendingUp className="h-4 w-4" />} label="Avg Price/ETH" value={formatCurrency(summary.averagePricePerETH)} />
        <SummaryCard icon={<ShoppingCart className="h-4 w-4" />} label="Avg mNAV" value={`${summary.averageMNAV.toFixed(1)}x`} />
        <SummaryCard icon={<TrendingUp className="h-4 w-4" />} label="Period" value={`${purchases.length > 0 ? purchases[0].date.slice(5) : ""} → ${purchases.length > 0 ? purchases[purchases.length - 1].date.slice(5) : ""}`} />
      </div>

      {/* Purchases table */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Purchase History</CardTitle>
          </div>
          <CardDescription className="text-xs">
            {summary.totalPurchases} ETH purchases from 8-K filings ({summary.firstPurchase} to {summary.lastPurchase})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["Date", "ETH Acquired", "Avg Price", "Total Cost", "Cumulative ETH", "mNAV", "Source", "Note"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {visible.map((p, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-muted/50">
                    <td className="py-2 text-xs tabular-nums text-muted-foreground">{p.date}</td>
                    <td className="py-2 text-xs tabular-nums font-medium text-foreground">+{p.ethAcquired}</td>
                    <td className="py-2 text-xs tabular-nums text-muted-foreground">{formatCurrency(p.avgPrice)}</td>
                    <td className="py-2 text-xs tabular-nums text-muted-foreground">{formatCurrency(p.totalCost, "USD", true)}</td>
                    <td className="py-2 text-xs tabular-nums font-medium text-foreground">{p.cumulativeETH.toLocaleString()}</td>
                    <td className="py-2 text-xs tabular-nums">
                      <span className={cn(
                        p.mnavAtPurchase > 10 ? "text-red-600 dark:text-red-400" :
                        p.mnavAtPurchase > 8 ? "text-amber-600 dark:text-amber-400" :
                        "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {p.mnavAtPurchase.toFixed(1)}x
                      </span>
                    </td>
                    <td className="py-2">
                      <Badge variant="secondary" className="text-[9px]">{p.source}</Badge>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground/70 max-w-[150px] truncate">
                      {p.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {purchases.length > 15 && (
            <div className="flex justify-center pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show all ${purchases.length} purchases`}
                {showAll ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          <span className="text-[10px] font-medium">{label}</span>
        </div>
        <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
