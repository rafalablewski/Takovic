"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { EthereumTab } from "@/components/coverage/ethereum-tab";
import { ETHPurchasesTab } from "@/components/coverage/eth-purchases-tab";
import { Coins, ShoppingCart } from "lucide-react";
import type { OperationsSubTab } from "@/data/coverage/registry";

const DEFAULT_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  ethereum: Coins,
  "eth-purchases": ShoppingCart,
};

interface OperationsTabProps {
  ticker: string;
  intro?: string;
  subTabs?: readonly OperationsSubTab[];
}

export function OperationsTab({ ticker, intro, subTabs }: OperationsTabProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sections = subTabs ?? [];
  const defaultSectionId = sections[0]?.id ?? "ethereum";

  const opsParam = searchParams.get("ops");
  const validIds = useMemo(() => new Set(sections.map((s) => s.id)), [sections]);
  const activeSubTab =
    opsParam && validIds.has(opsParam) ? opsParam : defaultSectionId;

  const setOps = useCallback(
    (id: string) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", "operations");
      p.set("ops", id);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  if (sections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No business operations sections configured for this coverage.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {intro ??
              "Operational detail and structured data for this coverage name."}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-1 border-b border-border pb-px">
        {sections.map((tab) => {
          const Icon = DEFAULT_ICON_MAP[tab.id];
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOps(tab.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeSubTab === "ethereum" && <EthereumTab ticker={ticker} />}
      {activeSubTab === "eth-purchases" && <ETHPurchasesTab ticker={ticker} />}
      {activeSubTab !== "ethereum" && activeSubTab !== "eth-purchases" && (
        <p className="text-sm text-muted-foreground">
          No UI component registered for operations view &quot;{activeSubTab}&quot;.
        </p>
      )}
    </div>
  );
}
