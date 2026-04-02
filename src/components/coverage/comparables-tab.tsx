"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  ComparableCompany,
  CompetitorNewsItem,
  PeerSnapshotBundle,
} from "@/types/coverage";
import { PeerSnapshotPanel } from "@/components/coverage/peer-snapshot-panel";
import { CompetitorIntelligenceFeed } from "@/components/coverage/competitor-intelligence-feed";
import { GitCompareArrows, Shield, Info } from "lucide-react";

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

type ComparablesState =
  | { status: "loading" }
  | {
      status: "ready";
      comparables: ComparableCompany[];
      insight: string | null;
      competitorNews: CompetitorNewsItem[];
      peerSnapshot: PeerSnapshotBundle | null;
    }
  | { status: "empty" };

export function ComparablesTab({ ticker }: { ticker: string }) {
  const [state, setState] = useState<ComparablesState>({ status: "loading" });

  useEffect(() => {
    setState({ status: "loading" });
    let cancelled = false;
    const lower = ticker.toLowerCase();

    import(`@/data/coverage/${lower}`)
      .then((mod) => {
        if (cancelled) return;
        const raw = "COMPARABLES" in mod ? mod.COMPARABLES : undefined;
        const comparables = Array.isArray(raw)
          ? (raw as ComparableCompany[])
          : [];
        const insight =
          "COMPARABLES_INSIGHT" in mod &&
          typeof mod.COMPARABLES_INSIGHT === "string"
            ? mod.COMPARABLES_INSIGHT
            : null;
        const newsRaw =
          "COMPETITOR_NEWS" in mod && Array.isArray(mod.COMPETITOR_NEWS)
            ? (mod.COMPETITOR_NEWS as CompetitorNewsItem[])
            : [];
        const peerSnapshot =
          "PEER_SNAPSHOT" in mod &&
          mod.PEER_SNAPSHOT &&
          typeof mod.PEER_SNAPSHOT === "object" &&
          "cards" in mod.PEER_SNAPSHOT &&
          Array.isArray((mod.PEER_SNAPSHOT as PeerSnapshotBundle).cards)
            ? (mod.PEER_SNAPSHOT as PeerSnapshotBundle)
            : null;
        if (
          comparables.length === 0 &&
          newsRaw.length === 0 &&
          !peerSnapshot
        ) {
          setState({ status: "empty" });
        } else {
          setState({
            status: "ready",
            comparables,
            insight,
            competitorNews: newsRaw,
            peerSnapshot,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "empty" });
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-muted-foreground">Loading comparables…</p>
    );
  }

  if (state.status === "empty") {
    return (
      <p className="text-sm text-muted-foreground">No comparable data.</p>
    );
  }

  const { comparables, insight, competitorNews, peerSnapshot } = state;

  return (
    <div className="space-y-8">
      {insight && !peerSnapshot ? (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {peerSnapshot ? (
        <PeerSnapshotPanel bundle={peerSnapshot} />
      ) : comparables.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Peer snapshot
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {comparables.map((comp) => (
              <CompCard key={comp.ticker} comp={comp} />
            ))}
          </div>
        </section>
      ) : null}

      <CompetitorIntelligenceFeed items={competitorNews} />
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
            <Badge variant="secondary" className="text-[10px]">
              {comp.ticker}
            </Badge>
          </div>
          <Badge className={cn("text-[10px]", assetColors[comp.asset])}>
            {comp.asset}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Metric label="Holdings" value={comp.holdings} />
          <Metric label="Holdings Value" value={comp.holdingsValue} />
          <Metric label="NAV Premium" value={comp.navPremium} />
          <Metric label="Staking Yield" value={comp.stakingYield} />
          <Metric label="Market Cap" value={comp.marketCap} />
          <div>
            <p className="text-[10px] text-muted-foreground">Threat Level</p>
            <Badge
              className={cn(
                "mt-0.5 text-[10px]",
                threatColors[comp.threatLevel]
              )}
            >
              {comp.threatLevel}
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-border pt-3">
          <div className="flex items-start gap-1.5">
            <Shield className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {comp.competitiveFocus}
            </p>
          </div>
          <div className="flex items-start gap-1.5">
            <GitCompareArrows className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Differentiator:</span>{" "}
              {comp.keyDifferentiator}
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
      <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
