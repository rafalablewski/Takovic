"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isEthTreasury } from "@/lib/analysis/crypto-treasury-registry";
import { TIMELINE_EVENTS, TIMELINE_DESCRIPTION } from "@/data/coverage/bmnr";
import type { TimelineEvent } from "@/data/coverage/bmnr";
import {
  Clock,
  FileText,
  ShoppingCart,
  Building,
  Flag,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  filing: { icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", label: "Filing" },
  purchase: { icon: ShoppingCart, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Purchase" },
  corporate: { icon: Building, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30", label: "Corporate" },
  milestone: { icon: Flag, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Milestone" },
  market: { icon: TrendingUp, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800", label: "Market" },
};

const SENTIMENT_BADGE: Record<TimelineEvent["sentiment"], string> = {
  bullish:
    "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  neutral: "border border-border bg-muted/60 text-muted-foreground",
  bearish: "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

export function TimelineTab({ ticker }: { ticker: string }) {
  const [filterTopic, setFilterTopic] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const topicOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of TIMELINE_EVENTS) {
      counts.set(e.topic, (counts.get(e.topic) ?? 0) + 1);
    }
    const topics = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return topics;
  }, []);

  if (!isEthTreasury(ticker)) return <p className="text-sm text-muted-foreground">No timeline data.</p>;

  const sorted = [...TIMELINE_EVENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered =
    filterTopic === "all" ? sorted : sorted.filter((e) => e.topic === filterTopic);
  const visible = showAll ? filtered : filtered.slice(0, 12);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{TIMELINE_DESCRIPTION}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <Filter className="h-3 w-3 shrink-0" />
          Filter by topic
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <TopicPill
            label="All"
            count={sorted.length}
            active={filterTopic === "all"}
            onClick={() => {
              setFilterTopic("all");
              setShowAll(false);
            }}
          />
          {topicOptions.map(([topic, count]) => (
            <TopicPill
              key={topic}
              label={topic}
              count={count}
              active={filterTopic === topic}
              onClick={() => {
                setFilterTopic(topic);
                setShowAll(false);
              }}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-0">
              {visible.map((event) => (
                <TimelineEventRow key={event.id} event={event} />
              ))}
            </div>
          </div>

          {filtered.length > 12 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show all ${filtered.length} events`}
                {showAll ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TopicPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {label}
      <span className="ml-1 opacity-60">{count}</span>
    </button>
  );
}

function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const config = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.market;
  const Icon = config.icon;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.bg)}>
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
      </div>

      <div className="min-w-0 flex-1 space-y-3 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">{formatDate(event.date)}</span>
          <Badge variant="outline" className="text-[10px] font-normal">
            {event.topic}
          </Badge>
          <Badge className={cn("text-[10px] font-normal", config.bg, config.color)}>{config.label}</Badge>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-medium tabular-nums",
              SENTIMENT_BADGE[event.sentiment]
            )}
          >
            {event.sentimentLabel}
          </span>
          {event.source && (
            <Badge variant="secondary" className="text-[9px]">
              {event.source}
            </Badge>
          )}
        </div>

        <p className="text-sm font-medium text-foreground leading-snug">{event.title}</p>

        {event.keyChanges.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Key changes</p>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-2 py-1.5 font-medium uppercase tracking-wider text-muted-foreground">Metric</th>
                    <th className="px-2 py-1.5 font-medium uppercase tracking-wider text-muted-foreground">Previous</th>
                    <th className="px-2 py-1.5 font-medium uppercase tracking-wider text-muted-foreground">New</th>
                    <th className="px-2 py-1.5 font-medium uppercase tracking-wider text-muted-foreground">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {event.keyChanges.map((row, idx) => (
                    <tr key={`${event.id}-kc-${idx}`} className="border-b border-border/80 last:border-0 hover:bg-muted/30">
                      <td className="px-2 py-1.5 align-top font-medium text-foreground">{row.metric}</td>
                      <td className="px-2 py-1.5 align-top tabular-nums text-muted-foreground">{row.previous}</td>
                      <td className="px-2 py-1.5 align-top tabular-nums text-foreground">{row.newValue}</td>
                      <td className="px-2 py-1.5 align-top text-muted-foreground">{row.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{event.notes}</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
