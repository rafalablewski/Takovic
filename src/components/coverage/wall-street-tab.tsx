"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { importCoverageTickerModule } from "@/lib/coverage/import-coverage-module";
import type {
  AnalystCoverage,
  WallStreetFirmCoverage,
} from "@/types/coverage";
import { ChevronDown, Info } from "lucide-react";

const sectionLabel =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

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
      <div className="mx-auto max-w-3xl">
        <header className="pb-8">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Analyst coverage
          </h1>
          <Separator className="mt-6 bg-border" />
        </header>
        {analysts.length > 0 ? (
          <div className="divide-y divide-border/80">
            {analysts.map((a, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <div>
                  <p className="text-lg font-medium tracking-tight text-foreground">
                    {a.firm}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.analyst} · {a.date}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={sectionLabel}>Rating</p>
                  <p className="mt-1 text-base font-medium">{a.rating}</p>
                  {a.priceTarget != null ? (
                    <>
                      <p className={cn(sectionLabel, "mt-5")}>Price target</p>
                      <p className="mt-1 text-3xl font-light tabular-nums tracking-tight text-foreground">
                        ${a.priceTarget}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex items-start gap-3 py-10 text-sm leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
            {note ?? "No analyst coverage available for this stock."}
          </p>
        )}
      </div>
    );
  }

  const { firms, note } = state;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="pb-10">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Sell-side coverage
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {firms.length === 1
            ? "One research firm currently publishes estimates on this name."
            : `${firms.length} research firms currently publish estimates on this name.`}
        </p>
        {note ? (
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground/90">
            {note}
          </p>
        ) : null}
        <Separator className="mt-8 bg-border" />
      </header>

      <div>
        {firms.map((firm, idx) => {
          const expanded = openDetail[firm.id] ?? false;
          return (
            <article key={firm.id}>
              {idx > 0 ? <Separator className="my-0 bg-border/80" /> : null}
              <div className="py-10 sm:py-12">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
                  <div className="min-w-0 flex-1 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        {firm.firm}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {firm.analystName === "N/A"
                          ? "Equity research"
                          : firm.analystName}{" "}
                        · Coverage since {firm.coverageSinceLabel} ·{" "}
                        {firm.reportCount}{" "}
                        {firm.reportCount === 1 ? "published note" : "published notes"}
                      </p>
                    </div>
                    <p className="max-w-xl text-sm leading-[1.65] text-foreground/90">
                      {firm.blurb}
                    </p>
                  </div>

                  <aside className="shrink-0 lg:w-[200px] lg:text-right">
                    <p className={sectionLabel}>Rating</p>
                    <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
                      {firm.rating}
                    </p>
                    <p className={cn(sectionLabel, "mt-8")}>Price target</p>
                    <p className="mt-2 text-4xl font-light tabular-nums tracking-tighter text-foreground sm:text-5xl">
                      ${firm.priceTarget}
                    </p>
                    {firm.priceTargetHint ? (
                      <p className="mt-3 text-xs leading-snug text-muted-foreground">
                        {firm.priceTargetHint}
                      </p>
                    ) : null}
                  </aside>
                </div>

                <div className="mt-12">
                  <h3 className={sectionLabel}>Coverage history</h3>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-foreground/15">
                          <th className="py-3 pr-6 font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="py-3 pr-6 font-medium text-muted-foreground">
                            Action
                          </th>
                          <th className="py-3 pr-6 font-medium text-muted-foreground">
                            View
                          </th>
                          <th className="py-3 pr-6 font-medium text-muted-foreground tabular-nums">
                            Target
                          </th>
                          <th className="py-3 font-medium text-muted-foreground">
                            Headline
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {firm.history.map((h) => (
                          <tr
                            key={`${firm.id}-${h.date}-${h.action}`}
                            className="border-b border-border/50 transition-colors hover:bg-muted/30"
                          >
                            <td className="py-4 pr-6 align-top tabular-nums text-muted-foreground">
                              {h.date}
                            </td>
                            <td className="py-4 pr-6 align-top font-medium text-foreground">
                              {h.action}
                            </td>
                            <td className="py-4 pr-6 align-top text-muted-foreground">
                              {h.ratingLabel}
                            </td>
                            <td className="py-4 pr-6 align-top tabular-nums text-foreground">
                              {h.priceTargetLine}
                            </td>
                            <td className="py-4 align-top">
                              <p className="max-w-md font-medium leading-snug text-foreground">
                                {h.headline}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {h.attribution}
                              </p>
                              {h.excerpt ? (
                                <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground">
                                  {h.excerpt}
                                </p>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDetail((o) => ({ ...o, [firm.id]: !expanded }))
                    }
                    className="group inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                  >
                    {expanded ? "Hide research detail" : "View research detail"}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>
                </div>

                {expanded ? (
                  <div className="mt-8 space-y-10 border border-border/60 bg-muted/20 px-6 py-10 sm:px-10">
                    <section>
                      <h4 className={sectionLabel}>{firm.detail.aiSummaryTitle}</h4>
                      <div className="mt-4 max-w-2xl space-y-4 text-sm leading-[1.65] text-foreground/90">
                        {firm.detail.aiSummaryParagraphs.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className={sectionLabel}>Methodology</h4>
                      <p className="mt-4 max-w-2xl text-sm leading-[1.65] text-foreground/90">
                        {firm.detail.methodology}
                      </p>
                    </section>

                    {firm.detail.coverageUniverse ? (
                      <section>
                        <h4 className={sectionLabel}>Coverage universe</h4>
                        <p className="mt-4 max-w-2xl text-sm leading-[1.65] text-foreground/90">
                          {firm.detail.coverageUniverse}
                        </p>
                      </section>
                    ) : null}

                    {firm.detail.institutionalContext ? (
                      <section>
                        <h4 className={sectionLabel}>Institutional context</h4>
                        <p className="mt-4 max-w-2xl text-sm leading-[1.65] text-foreground/90">
                          {firm.detail.institutionalContext}
                        </p>
                      </section>
                    ) : null}

                    <section>
                      <h4 className={sectionLabel}>Key assumptions</h4>
                      <dl className="mt-6 divide-y divide-border/60 border-t border-border/60">
                        {firm.detail.keyAssumptions.map((kv) => (
                          <div
                            key={kv.label}
                            className="grid gap-1 py-4 sm:grid-cols-[minmax(0,200px)_1fr] sm:gap-8"
                          >
                            <dt className="text-xs font-medium text-muted-foreground">
                              {kv.label}
                            </dt>
                            <dd className="text-sm leading-relaxed text-foreground">
                              {kv.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>

                    <div className="grid gap-10 sm:grid-cols-2 sm:gap-12">
                      <section>
                        <h4 className={sectionLabel}>Catalysts</h4>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
                          {firm.detail.catalysts.map((c) => (
                            <li key={c} className="flex gap-3">
                              <span
                                className="mt-2 h-px w-6 shrink-0 bg-foreground/25"
                                aria-hidden
                              />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                      <section>
                        <h4 className={sectionLabel}>Risks</h4>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
                          {firm.detail.risks.map((r) => (
                            <li key={r} className="flex gap-3">
                              <span
                                className="mt-2 h-px w-6 shrink-0 bg-foreground/25"
                                aria-hidden
                              />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    {firm.detail.tableGroups?.map((group) => (
                      <section key={group.sectionTitle} className="space-y-6">
                        <h4 className="text-sm font-semibold tracking-tight text-foreground">
                          {group.sectionTitle}
                        </h4>
                        {group.tables.map((tbl) => (
                          <div key={tbl.title}>
                            <p className={cn(sectionLabel, "mb-3")}>{tbl.title}</p>
                            <div className="overflow-x-auto border border-border/60 bg-background">
                              <table className="w-full min-w-[320px] border-collapse text-sm">
                                <thead>
                                  <tr className="border-b border-foreground/15 bg-muted/30">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                      {tbl.headers[0]}
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground tabular-nums">
                                      {tbl.headers[1]}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tbl.rows.map(([a, b], ri) => (
                                    <tr
                                      key={ri}
                                      className="border-b border-border/40 last:border-0"
                                    >
                                      <td className="px-4 py-3 text-foreground">
                                        {a}
                                      </td>
                                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                                        {b}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </section>
                    ))}

                    {firm.detail.methodologyFooter ? (
                      <p className="max-w-2xl border-t border-border/60 pt-8 text-xs leading-relaxed text-muted-foreground">
                        {firm.detail.methodologyFooter}
                      </p>
                    ) : null}

                    {firm.detail.sourceLine ? (
                      <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                        {firm.detail.sourceLine}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
