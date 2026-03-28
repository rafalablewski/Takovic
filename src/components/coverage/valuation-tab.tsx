import { Card, CardContent } from "@/components/ui/card";
import { CryptoTreasuryValuation } from "@/components/stock/crypto-treasury-valuation";
import { isCryptoTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { Info } from "lucide-react";

export function ValuationTab({ ticker }: { ticker: string }) {
  if (isCryptoTreasury(ticker)) {
    return <CryptoTreasuryValuation ticker={ticker} />;
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Valuation model not yet configured for {ticker}. Visit the{" "}
            <a href="/valuation" className="text-primary hover:underline font-medium">Valuation Calculator</a>{" "}
            to run a standard multi-model analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
