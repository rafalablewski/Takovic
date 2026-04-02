"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  PeerLensId,
  PeerSnapshotBundle,
  PeerSnapshotCard,
} from "@/types/coverage";
import { TrendingUp } from "lucide-react";

const threatBadge: Record<NonNullable<PeerSnapshotCard["threat"]>, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const assetBadgeClass: Record<string, string> = {
  ETH: "bg-indigo-50 text-indigo-800 dark:bg-indigo-900/25 dark:text-indigo-300",
  BTC: "bg-orange-50 text-orange-800 dark:bg-orange-900/25 dark:text-orange-300",
  "BTC+ETH":
    "bg-violet-50 text-violet-800 dark:bg-violet-900/25 dark:text-violet-300",
};

function filterCards(
  lens: PeerLensId,
  cards: PeerSnapshotCard[]
): PeerSnapshotCard[] {
  if (lens === "all") return cards;
  return cards.filter((c) => c.lenses.includes(lens));
}

function PeerMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground truncate">
        {value}
      </p>
    </div>
  );
}

function PeerCard({ card }: { card: PeerSnapshotCard }) {
  const ac = assetBadgeClass[card.assetBadge] ?? "bg-muted text-foreground";

  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors",
        card.isSubject && "border-primary/40 ring-1 ring-primary/15"
      )}
    >
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold leading-tight">
              {card.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium tabular-nums">
              {card.tickerLine}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <Badge className={cn("text-[10px] font-medium", ac)}>
              {card.assetBadge}
            </Badge>
            {card.threat ? (
              <Badge
                className={cn("text-[10px] capitalize", threatBadge[card.threat])}
              >
                {card.threat}
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {card.role}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <PeerMetric label="Holdings" value={card.holdings} />
          <PeerMetric label="NAV/share" value={card.navPerShare} />
          <PeerMetric label="Price" value={card.price} />
          <PeerMetric label="Premium" value={card.premium} />
          <PeerMetric label="Yield" value={card.yieldDisplay} />
          <PeerMetric label="Mkt cap" value={card.marketCap} />
        </div>
        {card.status ? (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Status: </span>
            {card.status}
          </p>
        ) : null}
        {card.focus ? (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Focus: </span>
            {card.focus}
          </p>
        ) : null}
        {card.narrative ? (
          <p className="text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
            {card.narrative}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PeerSnapshotPanel({ bundle }: { bundle: PeerSnapshotBundle }) {
  const [lens, setLens] = useState<PeerLensId>("all");
  const visible = useMemo(() => filterCards(lens, bundle.cards), [lens, bundle.cards]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          Peer comparison
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {bundle.lenses.map((l) => (
            <Button
              key={l.id}
              type="button"
              size="sm"
              variant={lens === l.id ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setLens(l.id)}
            >
              {l.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((card) => (
          <PeerCard key={card.id} card={card} />
        ))}
      </div>

      <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {bundle.yieldAdvantage.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {bundle.yieldAdvantage.subtitle}
              </p>
            </div>
          </div>
          <div className="text-right sm:pl-4 shrink-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {bundle.yieldAdvantage.statLabel}
            </p>
            <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {bundle.yieldAdvantage.statValue}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Valuation framework
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {bundle.valuationFramework}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {bundle.impliedValuationTitle}
        </h3>
        <p className="text-xs text-muted-foreground">{bundle.impliedValuationCaption}</p>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider">
                Method
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">
                Peer basis
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">
                Multiple
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">
                Implied value
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">
                vs current
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundle.impliedValuationRows.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-medium">{row.method}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.peerBasis}
                </TableCell>
                <TableCell className="text-xs tabular-nums">{row.multiple}</TableCell>
                <TableCell className="text-xs tabular-nums text-right font-medium">
                  {row.impliedValue}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-xs tabular-nums text-right font-medium",
                    row.vsCurrent.startsWith("-")
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {row.vsCurrent}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">{bundle.sotpTitle}</h3>
        <p className="text-xs text-muted-foreground">
          Value each component separately
        </p>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider">
                Component
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">
                Metric
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider">
                Multiple
              </TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider text-right">
                Value
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundle.sotpRows.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-medium">{row.component}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.metric}
                </TableCell>
                <TableCell className="text-xs">{row.multiple}</TableCell>
                <TableCell className="text-xs tabular-nums text-right font-medium">
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/40 font-semibold hover:bg-muted/40">
              <TableCell colSpan={3} className="text-xs">
                {bundle.sotpTotalLabel}
              </TableCell>
              <TableCell className="text-xs tabular-nums text-right">
                {bundle.sotpTotalValue}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          {bundle.navSensitivity.caption}
        </h3>
        {bundle.navSensitivity.subtitle ? (
          <p className="text-xs text-muted-foreground">
            {bundle.navSensitivity.subtitle}
          </p>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase tracking-wider sticky left-0 bg-card z-10 min-w-[5.5rem]">
                ETH / NAV
              </TableHead>
              {bundle.navSensitivity.colLabels.map((c) => (
                <TableHead
                  key={c}
                  className="text-[10px] uppercase tracking-wider text-right tabular-nums whitespace-nowrap"
                >
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundle.navSensitivity.rowLabels.map((rowLabel, ri) => (
              <TableRow key={rowLabel}>
                <TableCell className="text-xs font-medium tabular-nums sticky left-0 bg-card z-10">
                  {rowLabel}
                </TableCell>
                {bundle.navSensitivity.colLabels.map((_, ci) => (
                  <TableCell
                    key={ci}
                    className="text-xs tabular-nums text-right text-muted-foreground"
                  >
                    {bundle.navSensitivity.values[ri]?.[ci] ?? "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
