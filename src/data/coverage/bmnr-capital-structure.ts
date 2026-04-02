/**
 * BMNR capital structure — share count, programs, dilution, liquidity, runway.
 *
 * Maintenance: update `BMNR_VALUATION_SNAPSHOT` for live price/ETH/cash/SO.
 * Edit the hoisted tables below (offerings, warrants, insiders); derived
 * fields (FD shares, shelf total, detail tile counts, insider totals) follow automatically.
 *
 * LAST UPDATED: 2026-04-02
 * NEXT UPDATE: After 10-K, DEF 14A, or material 8-K (shelf, insider)
 */

import type {
  CapitalEquityOfferingRow,
  CapitalInsiderSaleRow,
  CapitalStructureData,
  CapitalWarrantRow,
} from "@/types/coverage";
import { BMNR_VALUATION_SNAPSHOT as S } from "./bmnr-crypto-snapshot";

export const CAPITAL_STRUCTURE_METADATA = {
  lastUpdated: "2026-04-02",
  source: "SEC filings, company PR, BMNR_VALUATION_SNAPSHOT",
  nextExpectedUpdate: "After next 10-K or DEF 14A",
} as const;

function usdShort(n: number, decimals = 1): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`;
  return `$${n.toFixed(0)}`;
}

function usdPerShare(n: number): string {
  return `$${n.toFixed(2)}`;
}

function sharesM(n: number, d = 1): string {
  return `${(n / 1e6).toFixed(d)}M`;
}

function fmtWarrantShares(shareCount: number): string {
  return `${(shareCount / 1e6).toFixed(2)}M`;
}

/** Sum `shareCount` on warrant rows (BMNR: set on each line). */
function sumWarrantShares(rows: CapitalWarrantRow[]): number {
  return rows.reduce((a, w) => a + (w.shareCount ?? 0), 0);
}

function sumShelfBillions(offerings: CapitalEquityOfferingRow[]): number {
  return offerings.reduce((a, o) => a + (o.amountBillions ?? 0), 0);
}

function countAtmOfferings(offerings: CapitalEquityOfferingRow[]): number {
  return offerings.filter((o) => /ATM/i.test(o.type)).length;
}

function findActiveOffering(
  offerings: CapitalEquityOfferingRow[]
): CapitalEquityOfferingRow | undefined {
  return offerings.find((o) => o.status === "active");
}

function aggregateInsiderTotals(
  sales: CapitalInsiderSaleRow[],
  period: string
): CapitalStructureData["insiderTotals"] | null {
  if (sales.length === 0) return null;
  const complete = sales.every(
    (s) => s.sharesSoldNumber != null && s.proceedsUsd != null
  );
  if (!complete) return null;
  const totalShares = sales.reduce((a, s) => a + (s.sharesSoldNumber as number), 0);
  const totalProceeds = sales.reduce((a, s) => a + (s.proceedsUsd as number), 0);
  if (totalShares <= 0) return null;
  return {
    totalSharesSold: sharesM(totalShares, 1),
    totalProceeds: usdShort(totalProceeds, 0),
    avgPrice: usdPerShare(totalProceeds / totalShares),
    period,
  };
}

function buildWarrantsFromDefs(
  defs: readonly {
    type: string;
    shareCount: number;
    strike: string;
    source: string;
  }[]
): CapitalWarrantRow[] {
  return defs.map((d) => ({
    type: d.type,
    shares: fmtWarrantShares(d.shareCount),
    strike: d.strike,
    source: d.source,
    shareCount: d.shareCount,
  }));
}

function buildFullyDilutedRows(
  outstanding: number,
  fdTotal: number,
  warrantDefs: readonly { type: string; shareCount: number }[]
): CapitalStructureData["fullyDilutedComponents"] {
  const rows: CapitalStructureData["fullyDilutedComponents"] = [
    {
      component: "Common Outstanding",
      sharesM: (outstanding / 1e6).toFixed(1),
      pctOfTotal: `${((outstanding / fdTotal) * 100).toFixed(1)}%`,
    },
  ];
  for (const w of warrantDefs) {
    rows.push({
      component: `${w.type} Warrants`,
      sharesM: (w.shareCount / 1e6).toFixed(1),
      pctOfTotal: `${((w.shareCount / fdTotal) * 100).toFixed(1)}%`,
    });
  }
  rows.push(
    { component: "Stock Options", sharesM: "TBD", pctOfTotal: "—" },
    { component: "RSUs", sharesM: "TBD", pctOfTotal: "—" },
    {
      component: "Fully Diluted Total",
      sharesM: (fdTotal / 1e6).toFixed(1),
      pctOfTotal: "100%",
    }
  );
  return rows;
}

function build(): CapitalStructureData {
  const shareClasses = [
    {
      class: "Common Stock",
      authorized: "500M",
      outstanding: `${(S.sharesOutstanding / 1e6).toFixed(1)}M`,
      voting: "1 vote/share",
      status: "active",
    },
    {
      class: "Series A Preferred",
      authorized: "10M",
      outstanding: "0.0M",
      voting: "As-converted",
      status: "converted",
    },
    {
      class: "Series B Preferred",
      authorized: "10M",
      outstanding: "0.0M",
      voting: "As-converted",
      status: "converted",
    },
  ] as CapitalStructureData["shareClasses"];

  const equityOfferings: CapitalEquityOfferingRow[] = [
    {
      date: "Sep 22, 2025",
      type: "424B5",
      amount: "$0.365B",
      status: "completed",
      amountBillions: 0.365,
    },
    {
      date: "Aug 12, 2025",
      type: "ATM+",
      amount: "$24.5B",
      status: "active",
      amountBillions: 24.5,
    },
    {
      date: "Jul 28, 2025",
      type: "ATM+",
      amount: "$4.5B",
      status: "exhausted",
      amountBillions: 4.5,
    },
    {
      date: "Jul 2025",
      type: "ATM",
      amount: "$2B",
      status: "exhausted",
      amountBillions: 2,
    },
  ];

  const warrantDefs = [
    {
      type: "Pre-Funded",
      shareCount: 11_000_000,
      strike: "$0.0001",
      source: "Jul 2025 PIPE",
    },
    {
      type: "Advisor",
      shareCount: 3_190_000,
      strike: "$5.40",
      source: "Jul 2025 S-3",
    },
  ] as const;

  const warrants = buildWarrantsFromDefs(warrantDefs);
  const warrantShares = sumWarrantShares(warrants);
  const FD_SHARES = S.sharesOutstanding + warrantShares;

  const basicMcap = S.stockPriceUsd * S.sharesOutstanding;
  const fdMcap = S.stockPriceUsd * FD_SHARES;
  const dilutionPct =
    ((FD_SHARES - S.sharesOutstanding) / S.sharesOutstanding) * 100;
  const yieldQ = S.stakingRevenueAnnualized / 4;
  const totalLiq = S.cashUsd + S.totalEthValueUsd;
  const stakingApyOnStaked =
    S.ethStaked > 0 && S.ethPriceUsd > 0
      ? (S.stakingRevenueAnnualized / (S.ethStaked * S.ethPriceUsd)) * 100
      : 0;

  const shelfBillions = sumShelfBillions(equityOfferings);
  const totalShelfCapacity = `$${shelfBillions.toFixed(1)}B`;
  const activeOffering = findActiveOffering(equityOfferings);
  const hasActiveAtm = Boolean(activeOffering);
  const atmOnlyCount = countAtmOfferings(equityOfferings);

  const ethMults = [1, 0.75, 0.5, 0.25] as const;
  const ethStressLabels = ["CURRENT", "-25%", "-50%", "-75%"] as const;
  const ethStressRows = ethMults.map((m, i) => {
    const px = Math.round(S.ethPriceUsd * m);
    const liq = S.cashUsd + S.totalEthValueUsd * m;
    const yq = yieldQ * m;
    const runway = i === 3 ? "121Q" : "Infinite";
    return {
      label: ethStressLabels[i],
      ethPrice: `ETH $${px.toLocaleString()}`,
      runway,
      yieldPerQ: `Yield: ${usdShort(yq, 0)}/Q`,
      liquidity: `Liq: ${usdShort(liq, 1)}`,
    };
  });

  const cashStr = usdShort(S.cashUsd, 0);
  const burnQ = "$18M";
  const yieldHalf = usdShort(yieldQ * 0.5, 0);
  const yieldQuarter = usdShort(yieldQ * 0.25, 0);

  const runwayScenarios: CapitalStructureData["runwayScenarios"] = [
    {
      scenario: "Base Case (Current)",
      cash: cashStr,
      burnQ,
      yieldQ: usdShort(yieldQ, 0),
      runway: "Infinite",
    },
    {
      scenario: "ETH Price Stress (-50%)",
      cash: cashStr,
      burnQ,
      yieldQ: yieldHalf,
      runway: "Infinite",
    },
    {
      scenario: "ETH Price Stress (-75%)",
      cash: cashStr,
      burnQ,
      yieldQ: yieldQuarter,
      runway: "Infinite",
    },
    {
      scenario: "Crypto Winter (No Yield)",
      cash: cashStr,
      burnQ,
      yieldQ: "$0M",
      runway: "33Q",
    },
  ];

  const majorShareholders: CapitalStructureData["majorShareholders"] = [
    {
      shareholder: "Bill Miller III",
      sharesM: "—",
      pct: "—",
      type: "Individual",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "ARK Invest (Cathie Wood)",
      sharesM: "—",
      pct: "—",
      type: "Institution",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "MOZAYYX",
      sharesM: "—",
      pct: "—",
      type: "Institution",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "Founders Fund",
      sharesM: "—",
      pct: "—",
      type: "Institution",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "Pantera Capital",
      sharesM: "—",
      pct: "—",
      type: "Institution",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "Kraken",
      sharesM: "—",
      pct: "—",
      type: "Institution",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "DCG (Digital Currency Group)",
      sharesM: "—",
      pct: "—",
      type: "Institution",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "Galaxy Digital",
      sharesM: "—",
      pct: "—",
      type: "Institution",
      source: "Jan 15, 2026 8-K",
    },
    {
      shareholder: "Lori Love",
      sharesM: "0.04",
      pct: "—",
      type: "Individual",
      source: "Feb 25, 2026 Form 4",
    },
    {
      shareholder: "Tom Lee",
      sharesM: "0.73",
      pct: "—",
      type: "Individual",
      source: "Jan 27, 2026 Form 4/A",
    },
  ];

  const insiderSales: CapitalInsiderSaleRow[] = [
    {
      insider: "Jonathan Bates (CEO → Former CEO)",
      sharesSold: "2.8M",
      proceeds: "$70M",
      avgPrice: "$25.00",
      method: "Rule 10b5-1 Plan + Open Market",
      notes:
        "Reduced from ~41% to ~30%. Pledged ~800K shares to UBS. Stepped down as CEO Nov 14.",
      sharesSoldNumber: 2.8e6,
      proceedsUsd: 70e6,
    },
    {
      insider: "Raymond Mow (CFO → Former CFO)",
      sharesSold: "1.0M",
      proceeds: "$25M",
      avgPrice: "$25.00",
      method: "Open Market",
      notes: "Separated as CFO Dec 18, 2025. Resigned from board Dec 12.",
      sharesSoldNumber: 1.0e6,
      proceedsUsd: 25e6,
    },
    {
      insider: "Seth Bayles (Secretary → Former Director)",
      sharesSold: "0.7M",
      proceeds: "$17M",
      avgPrice: "$24.29",
      method: "Open Market",
      notes: "Left board Nov 11 restructuring.",
      sharesSoldNumber: 0.7e6,
      proceedsUsd: 17e6,
    },
  ];

  const rsuGrants = [
    {
      insider: "Tom Lee (Executive Chairman)",
      rsusGranted: "1.5M",
      vested: "500K",
      taxWithheld: "231.7K",
      unvested: "1.0M",
      vestingSchedule: "500K immediate, 500K at 1-yr, 500K at 2-yr",
    },
  ] as CapitalStructureData["rsuGrants"];

  const insiderPeriod = "Oct-Dec 2025";
  const computedInsiderTotals = aggregateInsiderTotals(insiderSales, insiderPeriod);
  const insiderTotals =
    computedInsiderTotals ?? {
      totalSharesSold: "4.5M",
      totalProceeds: "$112M",
      avgPrice: "$24.89",
      period: insiderPeriod,
    };

  const warrantTypesSubtitle = warrantDefs.map((w) => w.type).join(" + ");
  const atmSubtitle = activeOffering
    ? `${activeOffering.amount} shelf active`
    : "No active shelf filing";
  const offeringsSubtitle =
    atmOnlyCount > 0
      ? `${atmOnlyCount} ATM tranche${atmOnlyCount === 1 ? "" : "s"} · ${atmSubtitle}`
      : atmSubtitle;

  const detailViews: CapitalStructureData["detailViews"] = [
    {
      id: "share-classes",
      count: String(shareClasses.length),
      title: "Share Classes",
      subtitle: "Common + converted preferred",
    },
    {
      id: "major-holders",
      count: String(majorShareholders.length),
      title: "Major Holders",
      subtitle: "Bill Miller + institutions",
    },
    {
      id: "equity-programs",
      count: String(equityOfferings.length),
      title: "Equity programs",
      subtitle: offeringsSubtitle,
    },
    {
      id: "warrant-types",
      count: String(warrants.length),
      title: "Warrant Types",
      subtitle: warrantTypesSubtitle,
    },
    {
      id: "dilution",
      count: `${dilutionPct.toFixed(0)}%`,
      title: "Total Dilution",
      subtitle: `${(FD_SHARES / 1e6).toFixed(1)}M FD shares`,
    },
    {
      id: "liquidity",
      count: usdShort(S.cashUsd, 0),
      title: "Liquidity",
      subtitle: "Cash + ETH treasury",
    },
    {
      id: "insider-activity",
      count: String(insiderSales.length + rsuGrants.length),
      title: "Insider Activity",
      subtitle: "Form 4 filings",
    },
  ];

  const warrantsTotalShares = fmtWarrantShares(warrantShares);

  return {
    schemaVersion: 2,
    metadata: { ...CAPITAL_STRUCTURE_METADATA },
    description:
      "ETH treasury capital strategy, share structure, ATM programs, warrant detail, and dilution analysis. Single-class common stock with rapid execution capability.",

    headlines: [
      { label: "Shares Outstanding", value: S.sharesOutstanding, format: "number" },
      { label: "Fully Diluted", value: FD_SHARES, format: "number" },
      { label: "Basic Mkt Cap", value: basicMcap, format: "currency" },
      { label: "FD Mkt Cap", value: fdMcap, format: "currency" },
    ],

    info: [
      { label: "Stock Price", value: usdPerShare(S.stockPriceUsd) },
      { label: "Dilution", value: `+${dilutionPct.toFixed(1)}%` },
      { label: "Common Stock", value: sharesM(S.sharesOutstanding, 0) },
      { label: "Convertible Notes", value: "Various" },
      { label: "ATM Program", value: hasActiveAtm ? "Active" : "None" },
      { label: "Source", value: "SEC / Market" },
    ],

    summary: `ETH treasury company with ${(S.sharesOutstanding / 1e6).toFixed(0)}M shares outstanding. Active ATM program and convertible notes add dilution risk.`,

    detailViews,

    shareClassTableTitle: "Share class structure",
    shareClassFootnote:
      "Par value: $0.0001. Preferred shares converted to common. NYSE American: BMNR.",

    shareClasses,

    majorShareholdersTitle: "Major shareholders",
    majorShareholders,
    majorShareholdersFootnote:
      "Update from 13F (institutional) and DEF 14A (insiders) when available.",

    equityOfferingsTitle: "Equity offerings",
    equityOfferings,
    totalShelfCapacity,

    warrantsTitle: "Warrants outstanding",
    warrants,
    warrantsTotalLabel: "Total",
    warrantsTotalShares,

    equityPlansTitle: "Equity incentive plans",
    equityPlans: [
      {
        plan: "2024 Equity Incentive Plan",
        reserved: "TBD",
        status: "Pending 10-K",
      },
      {
        plan: "Employee Stock Purchase Plan",
        reserved: "TBD",
        status: "Pending 10-K",
      },
    ],
    equityPlansFootnote: "Data pending from 10-K or DEF 14A proxy filing.",

    fullyDilutedTitle: "Fully diluted share count",
    fullyDilutedComponents: buildFullyDilutedRows(
      S.sharesOutstanding,
      FD_SHARES,
      warrantDefs
    ),
    fullyDilutedFootnote: `Note: Jul 29, 2025 PR reported 121.7M fully diluted. Current calc uses known warrants only. Dilution impact: +${dilutionPct.toFixed(1)}% if all securities exercised.`,

    liquiditySectionTitle: "Liquidity & staking",
    liquidityHero: [
      { label: "Cash", value: usdShort(S.cashUsd, 0), sublabel: "Fiat reserves" },
      {
        label: "ETH value",
        value: usdShort(S.totalEthValueUsd, 1),
        sublabel: `${(S.totalEth / 1e6).toFixed(3)}M ETH`,
      },
      {
        label: "Total liquidity",
        value: usdShort(totalLiq, 1),
        sublabel: "Cash + ETH",
      },
    ],
    stakingYieldQ: `${usdShort(yieldQ, 0)}/Q`,
    netBurnQ: "+$34M",

    ethStressTitle: "Runway under ETH price stress",
    ethStressFootnote: `Cash runway remains positive even at -75% ETH because staking yield at that stress (${usdShort(yieldQ * 0.25, 0)}/Q) approximately covers operational expenses (${burnQ}). Only total yield collapse threatens runway.`,
    ethStressRows,

    runwayScenariosTitle: "Forward-looking runway scenarios",
    runwayScenariosIntro:
      "Yield/Q includes staking income as partial burn offset. Only in Crypto Winter (no yield) scenario does cash runway become finite.",
    runwayScenarios,

    treasuryFactorsTitle: "ETH treasury liquidity factors",
    treasuryFactors: [
      {
        title: "Unrealized Gains/Losses",
        body: "ETH marked-to-market per ASC 350. Price declines reduce book equity but not cash.",
      },
      {
        title: "Staking as Revenue Offset",
        body: `Staking yield (~${stakingApyOnStaked.toFixed(2)}% APY on ${((S.ethStaked / S.totalEth) * 100).toFixed(0)}% of holdings) generates ~${usdShort(S.stakingRevenueAnnualized, 0)}/yr revenue.`,
      },
      {
        title: "Capital Raises Purpose",
        body: "ATM raises fund ETH purchases, not operating losses. Accretive if sold above NAV.",
      },
      {
        title: "Mining Wind-Down",
        body: "Legacy BTC mining operations wound down. Focus shifted to ETH treasury strategy.",
      },
    ],

    cashPositionTitle: "Cash position",
    cashPositionGrid: [
      { label: "Cash & Equivalents", value: usdShort(S.cashUsd, 0) },
      { label: "Total Debt", value: "$0M" },
      {
        label: "ATM Capacity",
        value: activeOffering?.amount ?? "—",
      },
      { label: "Quarterly OpEx", value: "$18M" },
    ],

    ethTreasuryTitle: "ETH treasury",
    ethTreasuryGrid: [
      { label: "ETH Holdings", value: S.totalEth.toLocaleString() },
      { label: "ETH Price", value: usdPerShare(S.ethPriceUsd) },
      { label: "ETH Value", value: usdShort(S.totalEthValueUsd, 1) },
      {
        label: "Staked",
        value: `~${((S.ethStaked / S.totalEth) * 100).toFixed(0)}% (${(S.ethStaked / 1e6).toFixed(2)}M)`,
      },
    ],

    insiderActivityTitle: "Insider activity",
    insiderTotals,
    insiderSalesIntro:
      "Concentrated selling during Oct-Dec 2025. Most under Rule 10b5-1 plans or post-separation.",
    insiderSales,

    rsuSectionTitle: "RSU grants (Form 4)",
    rsuGrants,
    rsuFootnote:
      "Amendment corrects prior omission of 231,700 tax-withheld shares. Under 2025 Omnibus Incentive Plan.",

    earlyShareholdersTitle: "Early shareholders (2021 SC 13D)",
    earlyShareholdersIntro: "Pre-IPO shell era — Sandy Springs Holdings",
    earlyShareholders: [
      {
        shareholder: "Michael Maloney",
        shares: "1.5M",
        pct: "12.5%",
        source: "SC 13D (Sep 1, 2021)",
        notes:
          "Largest early holder, sole voting/dispositive power. Resigned from board Aug 29, 2022.",
      },
      {
        shareholder: "Abed Equities, Inc.",
        shares: "1.0M",
        pct: "9.3%",
        source: "SC 13D (Aug 19, 2021)",
        notes: "Passive investment. Signed by Johannes Hendrik Heyns.",
      },
      {
        shareholder: "Samuel P. Jorgensen",
        shares: "1.0M",
        pct: "9.0%",
        source: "SC 13D (Aug 10, 2021)",
        notes: "Passive investment.",
      },
      {
        shareholder: "Jonathan R. Bates",
        shares: "—",
        pct: "—",
        source: "SC 13D (Aug 3, 2021)",
        notes:
          "Via Innovative Digital Investors LP + BFAM Partners LLC. Control person. Later became CEO (~41% by 2024).",
      },
      {
        shareholder: "Ryan Ramnath",
        shares: "—",
        pct: "—",
        source: "SC 13D (Aug 6, 2021)",
        notes:
          "Via Bitflair Mining Corp. CEO/President of Bitflair. Mining expertise for crypto pivot.",
      },
    ],
  };
}

export const CAPITAL_STRUCTURE: CapitalStructureData = build();
