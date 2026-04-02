"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { importCoverageTickerModule } from "@/lib/coverage/import-coverage-module";
import type {
  AnalystCoverage,
  WallStreetFirmCoverage,
} from "@/types/coverage";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
} from "lucide-react";

const th2 =
  "px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground";
const td2 = "px-3 py-2 text-xs text-foreground tabular-nums";
const td2t = "px-3 py-2 text-xs text-foreground";

type WallStreetState =
  | { status: "loading" }
  | {
      status: "ready";
      mode: "rich";
      firms: WallStreetFirmCoverage[];
      note: string | null;
    }
  | {
      status: "ready";
      mode: "legacy";
      analysts: AnalystCoverage[];
      note: string | null;
    }
  | { status: "empty" };

function isAnalystCoverageArray(x: unknown): x is AnalystCoverage[] {
  return (
    Array.isArray(x) &&
    x.every((a) => a && typeof a === "object" && "firm" in a && "rating" in a)
  );
}

function isWallStreetFirms(x: unknown): x is WallStreetFirmCoverage[] {
  if (!Array.isArray(x) || x.length === 0) return false;
  return x.every(
    (f) =>
      f &&
      typeof f === "object" &&
      typeof (f as WallStreetFirmCoverage).id === "string" &&
      Array.isArray((f as WallStreetFirmCoverage).history) &&
      (f as WallStreetFirmCoverage).detail != null &&
      typeof (f as WallStreetFirmCoverage).detail === "object"
  );
}

export function WallStreetTab({ ticker }: { ticker: string }) {
  const [state, setState] = useState<WallStreetState>({ status: "loading" });
  const [openDetail, setOpenDetail] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    const lower = ticker.toLowerCase();
    setState({ status: "loading" });
    importCoverageTickerModule(lower)
      .then((mod) => {
        if (cancelled) return;
        const note =
          typeof mod.WALL_STREET_NOTE === "string" ? mod.WALL_STREET_NOTE : null;
        const firmsRaw = mod.WALL_STREET_FIRMS;
        const firmsList = Array.isArray(firmsRaw) ? firmsRaw : [];
        if (isWallStreetFirms(firmsList)) {
          setState({ status: "ready", mode: "rich", firms: firmsList, note });
          return;
        }
        const raw = mod.WALL_STREET;
        const analysts = isAnalystCoverageArray(raw) ? raw : [];
        setState({ status: "ready", mode: "legacy", analysts, note });
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
      <p className="text-sm text-muted-foreground">Loading analyst coverage…</p>
    );
  }
  if (state.status === "empty") {
    return (
      <p className="text-sm text-muted-foreground">No analyst coverage data.</p>
    );
  }

  if (state.mode === "legacy") {
    const { analysts, note } = state;
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">Analyst coverage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-3">
            {analysts.length > 0 ? (
              <div className="divide-y divide-border/50">
                {analysts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.firm}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.analyst} &middot; {a.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{a.rating}</p>
                      {a.priceTarget != null && (
                        <p className="text-xs tabular-nums text-muted-foreground">
                          PT: ${a.priceTarget}
                        </p>
                      )}
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

  const { firms, note } = state;
  const coveringLabel =
    firms.length === 1 ? "1 firm covering" : `${firms.length} firms covering`;

  return (
    <div className="space-y-4">
      {note ? (
        <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Coverage by firm</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {coveringLabel}
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] font-medium">
          {firms.length} {firms.length === 1 ? "analyst" : "analysts"}
        </Badge>
      </div>

      <div className="space-y-4">
        {firms.map((firm) => {
          const expanded = openDetail[firm.id] ?? false;
          return (
            <Card key={firm.id}>
              <CardHeader className="p-5 pb-0 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {firm.firm}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {firm.analystName} · Since {firm.coverageSinceLabel} ·{" "}
                      {firm.reportCount}{" "}
                      {firm.reportCount === 1 ? "report" : "reports"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-semibold uppercase">
                      {firm.rating}
                    </Badge>
                    <span className="text-lg font-semibold tabular-nums text-foreground">
                      ${firm.priceTarget}
                    </span>
                    {firm.priceTargetHint ? (
                      <span className="text-[10px] text-muted-foreground">
                        {firm.priceTargetHint}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {firm.blurb}
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-4 space-y-4">
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Coverage history ({firm.history.length}{" "}
                    {firm.history.length === 1 ? "entry" : "entries"})
                  </h3>
                  <ul className="mt-3 space-y-4 border-l border-border pl-4">
                    {firm.history.map((h) => (
                      <li key={`${firm.id}-${h.date}-${h.action}`} className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-border" />
                        <p className="text-xs font-medium tabular-nums text-muted-foreground">
                          {h.date}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-foreground">
                          {h.action}{" "}
                          <span className="font-normal text-muted-foreground">
                            {h.ratingLabel}
                          </span>{" "}
                          <span className="tabular-nums">{h.priceTargetLine}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">{h.attribution}</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          &ldquo;{h.headline}&rdquo;
                        </p>
                        {h.excerpt ? (
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {h.excerpt}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpenDetail((o) => ({ ...o, [firm.id]: !expanded }))
                  }
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  {expanded ? (
                    <>
                      Less details <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      More details <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>

                {expanded ? (
                  <div className="space-y-5 border-t border-border pt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">
                        {firm.detail.aiSummaryTitle}
                      </h4>
                      <div className="mt-2 space-y-2">
                        {firm.detail.aiSummaryParagraphs.map((p, i) => (
                          <p
                            key={i}
                            className="text-xs text-muted-foreground leading-relaxed"
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Methodology
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {firm.detail.methodology}
                      </p>
                    </div>

                    {firm.detail.coverageUniverse ? (
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Coverage universe
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {firm.detail.coverageUniverse}
                        </p>
                      </div>
                    ) : null}

                    {firm.detail.institutionalContext ? (
                      <div>
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Institutional context
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {firm.detail.institutionalContext}
                        </p>
                      </div>
                    ) : null}

                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Key assumptions
                      </h4>
                      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                        {firm.detail.keyAssumptions.map((kv) => (
                          <div
                            key={kv.label}
                            className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/20 px-3 py-2"
                          >
                            <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {kv.label}
                            </dt>
                            <dd className="text-xs font-medium text-foreground">
                              {kv.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Catalysts
                      </h4>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                        {firm.detail.catalysts.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Risks
                      </h4>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                        {firm.detail.risks.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {firm.detail.tableGroups?.map((group) => (
                      <div key={group.sectionTitle} className="space-y-3">
                        <h4 className="text-xs font-semibold text-foreground">
                          {group.sectionTitle}
                        </h4>
                        {group.tables.map((tbl) => (
                          <div key={tbl.title} className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {tbl.title}
                            </p>
                            <div className="overflow-x-auto rounded-md border border-border">
                              <table className="w-full border-collapse text-sm">
                                <thead>
                                  <tr className="border-b border-border bg-muted/30">
                                    <th className={th2}>{tbl.headers[0]}</th>
                                    <th className={th2}>{tbl.headers[1]}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tbl.rows.map(([a, b], ri) => (
                                    <tr
                                      key={ri}
                                      className="border-b border-border last:border-0 hover:bg-muted/40"
                                    >
                                      <td className={td2t}>{a}</td>
                                      <td className={td2}>{b}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    {firm.detail.methodologyFooter ? (
                      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {firm.detail.methodologyFooter}
                      </p>
                    ) : null}

                    {firm.detail.sourceLine ? (
                      <p className="text-[10px] text-muted-foreground/80">
                        {firm.detail.sourceLine}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
