"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatLargeNumber } from "@/lib/utils";
import { importCoverageTickerModule } from "@/lib/coverage/import-coverage-module";
import type { CapitalMetric, CapitalStructureData } from "@/types/coverage";
import {
  Layers,
  Users,
  Landmark,
  FileText,
  Percent,
  Wallet,
  UserCircle,
} from "lucide-react";

const thClass =
  "px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground";
const tdClass = "px-3 py-2 text-xs text-foreground tabular-nums";
const tdTextClass = "px-3 py-2 text-xs text-foreground";

const DETAIL_TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "share-classes": Layers,
  "major-holders": Users,
  "equity-programs": Landmark,
  "warrant-types": FileText,
  dilution: Percent,
  liquidity: Wallet,
  "insider-activity": UserCircle,
};

function fmtHeadline(m: CapitalMetric): string {
  const v = m.value;
  if (typeof v === "string") return v;
  switch (m.format) {
    case "currency":
      if (Math.abs(v) >= 1e6) {
        return formatLargeNumber(v, {
          prefix: "$",
          decimals: Math.abs(v) >= 1e9 ? 2 : 1,
        });
      }
      return `$${v.toLocaleString()}`;
    case "number":
      if (Math.abs(v) >= 1e6) {
        return formatLargeNumber(v, { decimals: Math.abs(v) >= 1e9 ? 2 : 1 });
      }
      return v.toLocaleString();
    case "percent":
      return `${(v * 100).toFixed(1)}%`;
    default:
      return String(v);
  }
}

type CapitalState =
  | { status: "loading" }
  | { status: "ready"; data: CapitalStructureData }
  | { status: "empty" };

function isCapitalStructureData(x: unknown): x is CapitalStructureData {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (
    o.schemaVersion !== 2 ||
    typeof o.description !== "string" ||
    !Array.isArray(o.headlines) ||
    !Array.isArray(o.detailViews) ||
    !Array.isArray(o.shareClasses)
  ) {
    return false;
  }
  const first = o.detailViews[0] as { id?: string } | undefined;
  return typeof first?.id === "string";
}

export function CapitalStructureTab({ ticker }: { ticker: string }) {
  const [state, setState] = useState<CapitalState>({ status: "loading" });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const lower = ticker.toLowerCase();
    setState({ status: "loading" });
    importCoverageTickerModule(lower)
      .then((mod) => {
        if (cancelled) return;
        const raw = mod.CAPITAL_STRUCTURE;
        if (isCapitalStructureData(raw)) {
          setState({ status: "ready", data: raw });
        } else {
          setState({ status: "empty" });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "empty" });
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const detailIds = useMemo(() => {
    if (state.status !== "ready") return new Set<string>();
    return new Set(state.data.detailViews.map((d) => d.id));
  }, [state]);

  const defaultCapId =
    state.status === "ready" ? state.data.detailViews[0]?.id ?? "share-classes" : "share-classes";

  const capParam = searchParams.get("cap");
  const activeCap =
    capParam && detailIds.has(capParam) ? capParam : defaultCapId;

  useEffect(() => {
    if (state.status !== "ready") return;
    if (capParam && detailIds.has(capParam)) return;
    const p = new URLSearchParams(searchParams.toString());
    p.set("cap", defaultCapId);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, [
    state.status,
    defaultCapId,
    capParam,
    detailIds,
    pathname,
    router,
    searchParams,
  ]);

  const setCap = useCallback(
    (id: string) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", "capital-structure");
      p.set("cap", id);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  if (state.status === "loading") {
    return (
      <p className="text-sm text-muted-foreground">Loading capital structure…</p>
    );
  }
  if (state.status === "empty") {
    return (
      <p className="text-sm text-muted-foreground">No capital structure data.</p>
    );
  }

  const { data } = state;
  const meta = data.metadata;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Last updated {meta.lastUpdated} · {meta.source}. Next: {meta.nextExpectedUpdate}
        {meta.notes ? ` · ${meta.notes}` : ""}
      </p>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-0">
          <div className="flex flex-wrap items-center gap-2">
            <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Key metrics</CardTitle>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              · Capital summary
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-4 space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.headlines.map((h) => (
              <div key={h.label} className="text-center">
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {fmtHeadline(h)}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {h.label}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 border-t border-border pt-4 sm:grid-cols-3">
            {data.info.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-sm font-medium">Capital structure</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Detail views</h3>
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
          {data.detailViews.map((t) => {
            const Icon = DETAIL_TAB_ICONS[t.id];
            const isActive = activeCap === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCap(t.id)}
                className={cn(
                  "flex shrink-0 flex-col items-start gap-0.5 border-b-2 px-3 py-2 text-left transition-colors sm:min-w-0",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1.5">
                  {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
                  <span className="text-xs font-medium leading-tight">{t.title}</span>
                </span>
                <span className="pl-0 text-[10px] tabular-nums text-muted-foreground sm:pl-[22px]">
                  {t.count} · {t.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-1">
          {activeCap === "share-classes" && (
            <TableCard title={data.shareClassTableTitle}>
              <ShareClassTable data={data} />
            </TableCard>
          )}

          {activeCap === "major-holders" && (
            <TableCard title={data.majorShareholdersTitle}>
              <MajorHoldersTable data={data} />
            </TableCard>
          )}

          {activeCap === "equity-programs" && (
            <TableCard title={data.equityOfferingsTitle}>
              <EquityOfferingsTable data={data} />
            </TableCard>
          )}

          {activeCap === "warrant-types" && (
            <TableCard title={data.warrantsTitle}>
              <WarrantsTable data={data} />
            </TableCard>
          )}

          {activeCap === "dilution" && (
            <div className="space-y-4">
              <TableCard title={data.equityPlansTitle}>
                <EquityPlansTable data={data} />
              </TableCard>
              <TableCard title={data.fullyDilutedTitle}>
                <FullyDilutedTable data={data} />
              </TableCard>
            </div>
          )}

          {activeCap === "liquidity" && <LiquidityPanel data={data} />}

          {activeCap === "insider-activity" && (
            <div className="space-y-4">
              <InsiderActivityPanel data={data} />
              <TableCard title={data.rsuSectionTitle}>
                <RsuTable data={data} />
              </TableCard>
              <TableCard title={data.earlyShareholdersTitle}>
                <EarlyHoldersTable data={data} />
              </TableCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TableCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-3">{children}</CardContent>
    </Card>
  );
}

function ShareClassTable({ data }: { data: CapitalStructureData }) {
  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={thClass}>Class</th>
              <th className={thClass}>Authorized</th>
              <th className={thClass}>Outstanding</th>
              <th className={thClass}>Voting</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.shareClasses.map((row) => (
              <tr
                key={row.class}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className={tdTextClass}>{row.class}</td>
                <td className={tdClass}>{row.authorized}</td>
                <td className={tdClass}>{row.outstanding}</td>
                <td className={tdTextClass}>{row.voting}</td>
                <td className={tdTextClass}>
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{data.shareClassFootnote}</p>
    </>
  );
}

function MajorHoldersTable({ data }: { data: CapitalStructureData }) {
  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={thClass}>Shareholder</th>
              <th className={thClass}>Shares (M)</th>
              <th className={thClass}>%</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Source</th>
            </tr>
          </thead>
          <tbody>
            {data.majorShareholders.map((row) => (
              <tr
                key={row.shareholder}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className={tdTextClass}>{row.shareholder}</td>
                <td className={tdClass}>{row.sharesM}</td>
                <td className={tdClass}>{row.pct}</td>
                <td className={tdTextClass}>{row.type}</td>
                <td className={tdTextClass}>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{data.majorShareholdersFootnote}</p>
    </>
  );
}

function EquityOfferingsTable({ data }: { data: CapitalStructureData }) {
  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={thClass}>Date</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.equityOfferings.map((row) => (
              <tr
                key={`${row.date}-${row.type}`}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className={tdClass}>{row.date}</td>
                <td className={tdTextClass}>{row.type}</td>
                <td className={tdClass}>{row.amount}</td>
                <td className={tdTextClass}>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs font-medium text-foreground">
        Total shelf capacity: {data.totalShelfCapacity}
      </p>
    </>
  );
}

function WarrantsTable({ data }: { data: CapitalStructureData }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className={thClass}>Type</th>
            <th className={thClass}>Shares</th>
            <th className={thClass}>Strike</th>
            <th className={thClass}>Source</th>
          </tr>
        </thead>
        <tbody>
          {data.warrants.map((row) => (
            <tr
              key={row.type}
              className="border-b border-border last:border-0 hover:bg-muted/50"
            >
              <td className={tdTextClass}>{row.type}</td>
              <td className={tdClass}>{row.shares}</td>
              <td className={tdClass}>{row.strike}</td>
              <td className={tdTextClass}>{row.source}</td>
            </tr>
          ))}
          <tr className="bg-muted/30 font-medium">
            <td className={tdTextClass}>{data.warrantsTotalLabel}</td>
            <td className={tdClass}>{data.warrantsTotalShares}</td>
            <td className={tdClass} colSpan={2} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function EquityPlansTable({ data }: { data: CapitalStructureData }) {
  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={thClass}>Plan</th>
              <th className={thClass}>Reserved</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.equityPlans.map((row) => (
              <tr
                key={row.plan}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className={tdTextClass}>{row.plan}</td>
                <td className={tdClass}>{row.reserved}</td>
                <td className={tdTextClass}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{data.equityPlansFootnote}</p>
    </>
  );
}

function FullyDilutedTable({ data }: { data: CapitalStructureData }) {
  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={thClass}>Component</th>
              <th className={thClass}>Shares (M)</th>
              <th className={thClass}>% of total</th>
            </tr>
          </thead>
          <tbody>
            {data.fullyDilutedComponents.map((row) => (
              <tr
                key={row.component}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/50",
                  row.component.includes("Total") && "bg-muted/30 font-medium"
                )}
              >
                <td className={tdTextClass}>{row.component}</td>
                <td className={tdClass}>{row.sharesM}</td>
                <td className={tdClass}>{row.pctOfTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{data.fullyDilutedFootnote}</p>
    </>
  );
}

function LiquidityPanel({ data }: { data: CapitalStructureData }) {
  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-medium">{data.liquiditySectionTitle}</CardTitle>
        <CardDescription className="text-xs">
          Staking yield {data.stakingYieldQ} · Net burn/Q {data.netBurnQ}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-4 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {data.liquidityHero.map((h) => (
            <div
              key={h.label}
              className="rounded-lg border border-border bg-muted/30 p-4 text-center transition-colors hover:bg-muted/40"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {h.label}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                {h.value}
              </p>
              {h.sublabel ? (
                <p className="mt-0.5 text-[10px] text-muted-foreground">{h.sublabel}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">{data.ethStressTitle}</h4>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className={thClass}>Case</th>
                  <th className={thClass}>ETH</th>
                  <th className={thClass}>Runway</th>
                  <th className={thClass}>Yield</th>
                  <th className={thClass}>Liquidity</th>
                </tr>
              </thead>
              <tbody>
                {data.ethStressRows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className={tdTextClass}>{row.label}</td>
                    <td className={tdClass}>{row.ethPrice}</td>
                    <td className={tdTextClass}>{row.runway}</td>
                    <td className={tdTextClass}>{row.yieldPerQ}</td>
                    <td className={tdTextClass}>{row.liquidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {data.ethStressFootnote}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">
            {data.runwayScenariosTitle}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {data.runwayScenariosIntro}
          </p>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className={thClass}>Scenario</th>
                  <th className={thClass}>Cash</th>
                  <th className={thClass}>Burn/Q</th>
                  <th className={thClass}>Yield/Q</th>
                  <th className={thClass}>Runway</th>
                </tr>
              </thead>
              <tbody>
                {data.runwayScenarios.map((row) => (
                  <tr
                    key={row.scenario}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className={tdTextClass}>{row.scenario}</td>
                    <td className={tdClass}>{row.cash}</td>
                    <td className={tdClass}>{row.burnQ}</td>
                    <td className={tdClass}>{row.yieldQ}</td>
                    <td className={tdTextClass}>{row.runway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.runwayScenariosFootnote ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {data.runwayScenariosFootnote}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">
            {data.treasuryFactorsTitle}
          </h4>
          <ul className="space-y-2">
            {data.treasuryFactors.map((f) => (
              <li key={f.title} className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">{f.title}. </span>
                {f.body}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MiniGrid title={data.cashPositionTitle} rows={data.cashPositionGrid} />
          <MiniGrid title={data.ethTreasuryTitle} rows={data.ethTreasuryGrid} />
        </div>
      </CardContent>
    </Card>
  );
}

function InsiderActivityPanel({ data }: { data: CapitalStructureData }) {
  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-sm font-medium">{data.insiderActivityTitle}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total shares sold" value={data.insiderTotals.totalSharesSold} />
          <StatTile label="Total proceeds" value={data.insiderTotals.totalProceeds} />
          <StatTile label="Avg price" value={data.insiderTotals.avgPrice} />
          <StatTile label="Period" value={data.insiderTotals.period} />
        </div>
        <p className="text-xs text-muted-foreground">{data.insiderSalesIntro}</p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className={thClass}>Insider</th>
                <th className={thClass}>Shares sold</th>
                <th className={thClass}>Proceeds</th>
                <th className={thClass}>Avg price</th>
                <th className={thClass}>Method</th>
                <th className={thClass}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.insiderSales.map((row) => (
                <tr
                  key={row.insider}
                  className="border-b border-border last:border-0 align-top hover:bg-muted/50"
                >
                  <td className={tdTextClass}>{row.insider}</td>
                  <td className={tdClass}>{row.sharesSold}</td>
                  <td className={tdClass}>{row.proceeds}</td>
                  <td className={tdClass}>{row.avgPrice}</td>
                  <td className={tdTextClass}>{row.method}</td>
                  <td className={cn(tdTextClass, "max-w-[220px]")}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RsuTable({ data }: { data: CapitalStructureData }) {
  return (
    <>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={thClass}>Insider</th>
              <th className={thClass}>RSUs granted</th>
              <th className={thClass}>Vested</th>
              <th className={thClass}>Tax withheld</th>
              <th className={thClass}>Unvested</th>
              <th className={thClass}>Vesting</th>
            </tr>
          </thead>
          <tbody>
            {data.rsuGrants.map((row) => (
              <tr
                key={row.insider}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                <td className={tdTextClass}>{row.insider}</td>
                <td className={tdClass}>{row.rsusGranted}</td>
                <td className={tdClass}>{row.vested}</td>
                <td className={tdClass}>{row.taxWithheld}</td>
                <td className={tdClass}>{row.unvested}</td>
                <td className={tdTextClass}>{row.vestingSchedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.rsuFootnote ? (
        <p className="mt-3 text-xs text-muted-foreground">{data.rsuFootnote}</p>
      ) : null}
    </>
  );
}

function EarlyHoldersTable({ data }: { data: CapitalStructureData }) {
  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">{data.earlyShareholdersIntro}</p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className={thClass}>Shareholder</th>
              <th className={thClass}>Shares</th>
              <th className={thClass}>%</th>
              <th className={thClass}>Source</th>
              <th className={thClass}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {data.earlyShareholders.map((row) => (
              <tr
                key={row.shareholder}
                className="border-b border-border last:border-0 align-top hover:bg-muted/50"
              >
                <td className={tdTextClass}>{row.shareholder}</td>
                <td className={tdClass}>{row.shares}</td>
                <td className={tdClass}>{row.pct}</td>
                <td className={tdTextClass}>{row.source}</td>
                <td className={cn(tdTextClass, "max-w-[240px]")}>{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MiniGrid({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/30">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <dl className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-2 text-xs">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-medium tabular-nums text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/40">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
