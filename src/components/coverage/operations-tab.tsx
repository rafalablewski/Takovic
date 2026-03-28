"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { EthereumTab } from "@/components/coverage/ethereum-tab";
import { ETHPurchasesTab } from "@/components/coverage/eth-purchases-tab";
import { Coins, ShoppingCart } from "lucide-react";

const SUB_TABS = [
  { id: "ethereum", label: "Ethereum", icon: Coins },
  { id: "eth-purchases", label: "ETH Purchases", icon: ShoppingCart },
] as const;

export function OperationsTab({ ticker }: { ticker: string }) {
  const [activeSubTab, setActiveSubTab] = useState<string>("ethereum");

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ethereum ecosystem, staking operations, and ETH acquisition history.
          </p>
        </CardContent>
      </Card>

      {/* Sub-tab navigation */}
      <div className="flex gap-1 border-b border-border pb-px">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      {activeSubTab === "ethereum" && <EthereumTab ticker={ticker} />}
      {activeSubTab === "eth-purchases" && <ETHPurchasesTab ticker={ticker} />}
    </div>
  );
}
