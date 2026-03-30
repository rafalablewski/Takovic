/**
 * BMNR ETH purchase log — weekly 8-K/PR-derived (Jul 2025 → present).
 *
 * LAST UPDATED: 2026-03-31
 * NEXT UPDATE: After next weekly holdings PR / 8-K (ingested Mar 23–30, 2026 PRs)
 */

export interface ETHPurchase {
  date: string;
  ethAcquired: number;
  ethPriceUsd: number;
  usdDeployed: number;
  stockPrevCloseUsd: number;
  periodRange: string;
  marketCapUsd: number;
  mnav: number;
  mnavRange: string;
  totalEthAfter: number;
  /** Exact “Total ETH” cell from export (e.g. 4.596M vs rounded compact number). */
  totalEthAfterDisplay: string;
  notes: string;
}

export const ETH_PURCHASE_HISTORY_TITLE = "PURCHASE HISTORY";
export const ETH_PURCHASE_HISTORY_DESCRIPTION =
  "ETH Purchases.\n\nComplete record of all ETH purchases from weekly 8-K/PR filings. Shows ETH acquired, price paid, mNAV at time of purchase, and total capital deployed. 37 purchase events tracked from Jul 2025 to present.";

export const ETH_ACCUMULATION_SUMMARY_HEADING = "ACCUMULATION SUMMARY";
export const ETH_PURCHASE_OVERVIEW_HEADING = "PURCHASE OVERVIEW";
export const ETH_PURCHASE_OVERVIEW_SOURCE_LINE = "Sourced from PRs — last reported 2026-03-30";

export const ETH_PURCHASE_LOG_HEADING = "PURCHASE LOG (NEWEST FIRST)";
export const ETH_PURCHASE_LOG_SUBHEADING = "ALL ETH PURCHASES";

/** Table header row — exact labels from export. */
export const ETH_PURCHASE_TABLE_HEADERS = [
  "Date",
  "ETH Bought",
  "ETH Price",
  "USD Deployed",
  "Stock (Prev Close)",
  "Period Range",
  "Mkt Cap",
  "mNAV",
  "mNAV Range",
  "Total ETH",
  "Notes",
] as const;

export const ETH_PURCHASE_SUMMARY = {
  totalPurchases: 37,
  lastReportedEth: 4_732_082,
  lastReportedEthDisplay: "4.732M",
  /** Cumulative USD deployed into ETH tranches (log); excludes non-ETH line items. */
  totalCapitalDeployedUsd: 17_649_500_000,
  totalCapitalDeployedDisplay: "$17.65B",
  averagePricePerEthUsd: 3_729,
  averagePriceDisplay: "$3,729",
  currentMnav: 0.88,
  currentMnavDisplay: "0.88x",
  currentEthPriceUsd: 2_005,
  currentEthPriceDisplay: "$2,005",
  unrealizedPLUsd: -8_162_190_838,
  unrealizedPLDisplay: "$-8.16B",
  unrealizedPLPercentDisplay: "-46.2%",
  navPerShareUsd: 22.9,
  navPerShareDisplay: "$22.90",
  stockPriceUsd: 17.65,
  stockPriceDisplay: "$17.65",
  totalEthAcquiredFromLog: 4_732_082,
  firstPurchase: "2025-07-14",
  lastPurchase: "2026-03-30",
};

export const ETH_MNAV_METHODOLOGY = {
  title: "MNAV METHODOLOGY",
  subtitle: "NAV Multiple (mNAV) Calculation",
  intro:
    "mNAV measures premium or discount to net asset value at time of each ETH purchase. Uses previous trading day's closing price and interpolated shares outstanding.",
  steps: [
    {
      label: "Step 1",
      title: "NAV per Share",
      formulaLabel: "Formula",
      formula: "NAV/Share = (Total ETH After × ETH Price) ÷ Shares Outstanding",
      example: "Example (Feb 9)",
      exampleCalc: "(4,325,738 × $2,125) ÷ 460M = $19.97",
      result: "$19.97",
    },
    {
      label: "Step 2",
      title: "mNAV Multiple",
      formulaLabel: "Formula",
      formula: "mNAV = Stock Price ÷ NAV/Share",
      example: "Example (Feb 9)",
      exampleCalc: "$27.15 ÷ $19.97 = 1.36x",
      result: "1.36x",
    },
  ],
  interpretationHeading: "Interpretation",
  interpretation: [
    "mNAV < 1.0x — Discount: stock trades below ETH value per share",
    "mNAV 1.0–1.5x — Moderate premium: ATM issuance is accretive",
    "mNAV > 1.5x — High premium: highly accretive to existing shareholders",
  ],
  dataSourcesHeading: "Data Sources & Reliability",
  dataSources: `ETH Holdings & Price — from weekly 8-K/PR filings. High reliability.

Stock price — Only 4 of 32 confirmed from SEC filings (Sep 22 8-K, Dec 29 market data, Feb 9 market data, Feb 17 Form 4/A). Other 28 are estimates marked with ≈.

Shares outstanding — 7 confirmed anchors (10-K, 10-Q, PRs). Other dates linearly interpolated. Inaccurate for Jul–Sep 2025 when shares grew from 5M to 235M in ~8 weeks.

NAV/Share — Simplified: (ETH × price) ÷ shares. Excludes cash ($400M–$988M), BTC, and other assets. This overstates mNAV by ~0.03–0.15x.`,
  accuracyByPeriodHeading: "Accuracy by Period",
  accuracyByPeriod: `Jul 2025 — Very low confidence. Stock in freefall ($161→~$38), shares growing ~5M/day. mNAV 3–7x is directional but could be ±50%.

Aug–Sep 2025 — Low–moderate. Sep 22 confirmed ($61.29). Others interpolated. Shares interpolation crude.

Oct–Nov 2025 — Moderate. Oct 10 crash makes prices unreliable. Nov $42–44 corroborated by multiple sources.

Dec 2025–Feb 2026 — Moderate–high. Two confirmed prices, shares anchored by filings. mNAV likely within ±0.05x.`,
};

/** Newest first (matches “purchase log (newest first)”). */
export const ETH_PURCHASES: ETHPurchase[] = [
  {
    date: "2026-03-30",
    ethAcquired: 71_179,
    ethPriceUsd: 2_005,
    usdDeployed: 142.7e6,
    stockPrevCloseUsd: 20.35,
    periodRange: "$19.40–$21.10 (est.)",
    marketCapUsd: 9.55e9,
    mnav: 0.94,
    mnavRange: "0.90x–1.05x (est.)",
    totalEthAfter: 4_732_082,
    totalEthAfterDisplay: "4.732M",
    notes:
      "~472M shares (est.). PR Mar 30, 2026 — snapshot Mar 29, 6:00pm ET. 71,179 ETH past week (elevated vs ~45–50k prior). Total 4,732,082 ETH @ $2,005 (COIN). Cash $961M; ORBS $102M; Beast $200M; 197 BTC. Staked 3,142,643 (~66% of book). MAVAN launched Mar 25. CESR 2.79%; 7-day yield 2.80%. Rank #100 by $ volume ($920M 5-day). MSTR 762,099 BTC ~$51B.",
  },
  {
    date: "2026-03-23",
    ethAcquired: 65_341,
    ethPriceUsd: 2_072,
    usdDeployed: 135.4e6,
    stockPrevCloseUsd: 20.72,
    periodRange: "$19.80–$21.50 (est.)",
    marketCapUsd: 9.85e9,
    mnav: 0.97,
    mnavRange: "0.93x–1.04x (est.)",
    totalEthAfter: 4_660_903,
    totalEthAfterDisplay: "4.661M",
    notes:
      "~471M shares (est.). PR Mar 23, 2026 — snapshot Mar 22, 3:00pm ET. 65,341 ETH past week. Total 4,660,903 ETH @ $2,072 (COIN). Cash $1.1B; ORBS $95M; Beast $200M; 196 BTC. 3.86% of supply. Staked 3,142,643; annualized staking rev ~$184M. CESR 2.75%; 7-day 2.83%. MAVAN early 2026; 3 providers. Rank #101 ($1.2B 5-day). MSTR 761,068 BTC ~$52B.",
  },
  {
    date: "2026-03-16",
    ethAcquired: 60_999,
    ethPriceUsd: 2_185,
    usdDeployed: 133.3e6,
    stockPrevCloseUsd: 20.54,
    periodRange: "$19.27–$22.76",
    marketCapUsd: 9.7e9,
    mnav: 0.96,
    mnavRange: "0.90x–1.07x",
    totalEthAfter: 4_596_000,
    totalEthAfterDisplay: "4.596M",
    notes:
      "~470M shares. Period Mar 9–13. High $22.76 (Mar 13), low $19.27 (Mar 9). Mar 13 (Fri) close $20.54 (Yahoo).",
  },
  {
    date: "2026-03-09",
    ethAcquired: 60_976,
    ethPriceUsd: 1_965,
    usdDeployed: 119.8e6,
    stockPrevCloseUsd: 18.88,
    periodRange: "$18.82–$21.87",
    marketCapUsd: 8.8e9,
    mnav: 0.99,
    mnavRange: "0.99x–1.15x",
    totalEthAfter: 4_535_000,
    totalEthAfterDisplay: "4.535M",
    notes:
      "~468M shares. Period Mar 2–6. High $21.87 (Mar 4), low $18.82 (Mar 2). Mar 6 (Fri) close $18.88 (Yahoo).",
  },
  {
    date: "2026-03-02",
    ethAcquired: 50_928,
    ethPriceUsd: 1_976,
    usdDeployed: 100.6e6,
    stockPrevCloseUsd: 18.98,
    periodRange: "$18.65–$22.17",
    marketCapUsd: 8.8e9,
    mnav: 1.0,
    mnavRange: "0.98x–1.17x",
    totalEthAfter: 4_474_000,
    totalEthAfterDisplay: "4.474M",
    notes:
      "~466M shares. Period Feb 23–27. High $22.17 (Feb 25), low $18.65 (Feb 24). Feb 27 (Fri) close $18.98 (Yahoo).",
  },
  {
    date: "2026-02-23",
    ethAcquired: 51_162,
    ethPriceUsd: 1_958,
    usdDeployed: 100.2e6,
    stockPrevCloseUsd: 20.13,
    periodRange: "$19.25–$20.68",
    marketCapUsd: 9.3e9,
    mnav: 1.08,
    mnavRange: "1.03x–1.11x",
    totalEthAfter: 4_423_000,
    totalEthAfterDisplay: "4.423M",
    notes:
      "~464M shares. Period Feb 17–20. High $20.68 (Feb 17), low $19.25 (Feb 19). Feb 20 (Fri) close $20.13 (Yahoo). Tight $1.43 range.",
  },
  {
    date: "2026-02-17",
    ethAcquired: 45_759,
    ethPriceUsd: 1_998,
    usdDeployed: 91.4e6,
    stockPrevCloseUsd: 20.96,
    periodRange: "$18.68–$21.75",
    marketCapUsd: 9.7e9,
    mnav: 1.11,
    mnavRange: "0.99x–1.15x",
    totalEthAfter: 4_371_000,
    totalEthAfterDisplay: "4.371M",
    notes:
      "~462M shares. Period Feb 9–13. High $21.75 (Feb 9), low $18.68 (Feb 12). Feb 13 (Fri) close $20.96 (Yahoo). Presidents' Day Mon Feb 16.",
  },
  {
    date: "2026-02-09",
    ethAcquired: 40_613,
    ethPriceUsd: 2_125,
    usdDeployed: 86.3e6,
    stockPrevCloseUsd: 20.47,
    periodRange: "$17.19–$24.08",
    marketCapUsd: 9.4e9,
    mnav: 1.03,
    mnavRange: "0.86x–1.21x",
    totalEthAfter: 4_326_000,
    totalEthAfterDisplay: "4.326M",
    notes:
      "~460M shares. Period Feb 2–6. High $24.08 (Feb 2), low $17.19 (Feb 5). Feb 6 (Fri) close $20.47 (Yahoo). Widest Feb range — $6.89 spread.",
  },
  {
    date: "2026-02-02",
    ethAcquired: 41_787,
    ethPriceUsd: 2_317,
    usdDeployed: 96.8e6,
    stockPrevCloseUsd: 25.1,
    periodRange: "$24.55–$30.55",
    marketCapUsd: 11.4e9,
    mnav: 1.15,
    mnavRange: "1.12x–1.40x",
    totalEthAfter: 4_285_000,
    totalEthAfterDisplay: "4.285M",
    notes:
      "~454M shares. Period Jan 26–30. High $30.55 (Jan 28), low $24.55 (Jan 30). Jan 30 (Fri) close $25.10 (Yahoo).",
  },
  {
    date: "2026-01-26",
    ethAcquired: 40_302,
    ethPriceUsd: 2_839,
    usdDeployed: 114.4e6,
    stockPrevCloseUsd: 28.8,
    periodRange: "$26.76–$29.76",
    marketCapUsd: 12.9e9,
    mnav: 1.07,
    mnavRange: "0.99x–1.10x",
    totalEthAfter: 4_243_000,
    totalEthAfterDisplay: "4.243M",
    notes:
      "~447M shares. Period Jan 20–23. High $29.76 (Jan 23), low $26.76 (Jan 21). Jan 23 (Fri) close $28.80 (Yahoo). Tight $2.99 range.",
  },
  {
    date: "2026-01-20",
    ethAcquired: 35_268,
    ethPriceUsd: 3_211,
    usdDeployed: 113.3e6,
    stockPrevCloseUsd: 31.16,
    periodRange: "$29.71–$34.39",
    marketCapUsd: 13.7e9,
    mnav: 1.02,
    mnavRange: "0.97x–1.13x",
    totalEthAfter: 4_203_000,
    totalEthAfterDisplay: "4.203M",
    notes:
      "~441M shares. Period Jan 12–16. High $34.39 (Jan 14), low $29.71 (Jan 12). Jan 16 (Fri) close $31.16 (Yahoo). MLK Day Mon Jan 19.",
  },
  {
    date: "2026-01-12",
    ethAcquired: 24_266,
    ethPriceUsd: 3_119,
    usdDeployed: 75.7e6,
    stockPrevCloseUsd: 30.06,
    periodRange: "$29.16–$34.04",
    marketCapUsd: 13.0e9,
    mnav: 1.0,
    mnavRange: "0.97x–1.14x",
    totalEthAfter: 4_168_000,
    totalEthAfterDisplay: "4.168M",
    notes:
      "434M shares (PR). Period Jan 5–9. High $34.04 (Jan 6), low $29.16 (Jan 8). Jan 9 (Fri) close $30.06 (Yahoo).",
  },
  {
    date: "2026-01-05",
    ethAcquired: 32_977,
    ethPriceUsd: 3_196,
    usdDeployed: 105.4e6,
    stockPrevCloseUsd: 31.19,
    periodRange: "$26.84–$31.26",
    marketCapUsd: 13.4e9,
    mnav: 1.01,
    mnavRange: "0.87x–1.01x",
    totalEthAfter: 4_144_000,
    totalEthAfterDisplay: "4.144M",
    notes:
      "~430M shares. Period Dec 29–Jan 2. High $31.26 (Jan 2), low $26.84 (Dec 31). Jan 2 (Fri) close $31.19 (Yahoo). Holiday week — low volume.",
  },
  {
    date: "2025-12-29",
    ethAcquired: 44_463,
    ethPriceUsd: 2_948,
    usdDeployed: 131.1e6,
    stockPrevCloseUsd: 28.31,
    periodRange: "$27.90–$32.78",
    marketCapUsd: 12.1e9,
    mnav: 1.0,
    mnavRange: "0.98x–1.15x",
    totalEthAfter: 4_111_000,
    totalEthAfterDisplay: "4.111M",
    notes:
      "~426M shares. Period Dec 22–26. High $32.78 (Dec 22), low $27.90 (Dec 26). Dec 26 (Fri) close $28.31 (Yahoo).",
  },
  {
    date: "2025-12-22",
    ethAcquired: 98_852,
    ethPriceUsd: 2_991,
    usdDeployed: 295.7e6,
    stockPrevCloseUsd: 31.36,
    periodRange: "$28.40–$34.84",
    marketCapUsd: 13.2e9,
    mnav: 1.09,
    mnavRange: "0.99x–1.21x",
    totalEthAfter: 4_066_000,
    totalEthAfterDisplay: "4.066M",
    notes:
      "~422M shares. Period Dec 15–19. High $34.84 (Dec 15), low $28.40 (Dec 18). Dec 19 (Fri) close $31.36 (Yahoo).",
  },
  {
    date: "2025-12-15",
    ethAcquired: 102_259,
    ethPriceUsd: 3_074,
    usdDeployed: 314.3e6,
    stockPrevCloseUsd: 34.86,
    periodRange: "$33.80–$42.08",
    marketCapUsd: 14.6e9,
    mnav: 1.19,
    mnavRange: "1.16x–1.44x",
    totalEthAfter: 3_967_000,
    totalEthAfterDisplay: "3.967M",
    notes:
      "~418M shares. Period Dec 8–12. High $42.08 (Dec 10), low $33.80 (Dec 8). Dec 12 (Fri) close $34.86 (Yahoo). Dec 10 spike to $42 — possible $70 RD aftermarket.",
  },
  {
    date: "2025-12-08",
    ethAcquired: 138_452,
    ethPriceUsd: 3_139,
    usdDeployed: 434.6e6,
    stockPrevCloseUsd: 34.06,
    periodRange: "$28.81–$36.63",
    marketCapUsd: 14.1e9,
    mnav: 1.16,
    mnavRange: "0.98x–1.25x",
    totalEthAfter: 3_865_000,
    totalEthAfterDisplay: "3.865M",
    notes:
      "~414M shares. Period Dec 1–5. High $36.63 (Dec 5), low $28.81 (Dec 1). Dec 5 (Fri) close $34.06 (Yahoo).",
  },
  {
    date: "2025-12-01",
    ethAcquired: 166_620,
    ethPriceUsd: 3_008,
    usdDeployed: 501.3e6,
    stockPrevCloseUsd: 33.12,
    periodRange: "$24.33–$35.20",
    marketCapUsd: 13.6e9,
    mnav: 1.21,
    mnavRange: "0.89x–1.29x",
    totalEthAfter: 3_726_000,
    totalEthAfterDisplay: "3.726M",
    notes:
      "~410M shares (10-Q Nov 30: 409M). Period Nov 17–28. High $35.20 (Nov 28), low $24.33 (Nov 21). Nov 28 (Fri) close $33.12 (Yahoo). Wide 2-week range — Nov 20-21 sell-off to $24.",
  },
  {
    date: "2025-11-17",
    ethAcquired: 54_156,
    ethPriceUsd: 3_120,
    usdDeployed: 169.0e6,
    stockPrevCloseUsd: 34.4,
    periodRange: "$33.54–$43.77",
    marketCapUsd: 13.2e9,
    mnav: 1.19,
    mnavRange: "1.16x–1.51x",
    totalEthAfter: 3_560_000,
    totalEthAfterDisplay: "3.560M",
    notes:
      "~384M shares. Period Nov 10–14. High $43.77 (Nov 10), low $33.54 (Nov 14). Nov 14 (Fri) close $34.40 (Yahoo). Steep $10 decline over week.",
  },
  {
    date: "2025-11-10",
    ethAcquired: 110_301,
    ethPriceUsd: 3_639,
    usdDeployed: 401.4e6,
    stockPrevCloseUsd: 40.23,
    periodRange: "$35.79–$44.88",
    marketCapUsd: 14.9e9,
    mnav: 1.17,
    mnavRange: "1.04x–1.30x",
    totalEthAfter: 3_506_000,
    totalEthAfterDisplay: "3.506M",
    notes:
      "~371M shares. Period Nov 3–7. High $44.88 (Nov 3), low $35.79 (Nov 7). Nov 7 (Fri) close $40.23 (Yahoo).",
  },
  {
    date: "2025-11-03",
    ethAcquired: 82_353,
    ethPriceUsd: 3_903,
    usdDeployed: 321.4e6,
    stockPrevCloseUsd: 46.65,
    periodRange: "$44.47–$54.54",
    marketCapUsd: 16.7e9,
    mnav: 1.26,
    mnavRange: "1.20x–1.47x",
    totalEthAfter: 3_395_000,
    totalEthAfterDisplay: "3.395M",
    notes:
      "~357M shares. Period Oct 27–31. High $54.54 (Oct 27), low $44.47 (Oct 30). Oct 31 (Fri) close $46.65 (Yahoo).",
  },
  {
    date: "2025-10-27",
    ethAcquired: 77_055,
    ethPriceUsd: 4_164,
    usdDeployed: 320.9e6,
    stockPrevCloseUsd: 50.41,
    periodRange: "$46.56–$55.19",
    marketCapUsd: 17.3e9,
    mnav: 1.26,
    mnavRange: "1.16x–1.38x",
    totalEthAfter: 3_313_000,
    totalEthAfterDisplay: "3.313M",
    notes:
      "~344M shares. Period Oct 20–24. High $55.19 (Oct 21), low $46.56 (Oct 22). Oct 24 (Fri) close $50.41 (Yahoo).",
  },
  {
    date: "2025-10-20",
    ethAcquired: 203_826,
    ethPriceUsd: 4_022,
    usdDeployed: 819.8e6,
    stockPrevCloseUsd: 49.85,
    periodRange: "$48.51–$56.85",
    marketCapUsd: 16.5e9,
    mnav: 1.27,
    mnavRange: "1.23x–1.44x",
    totalEthAfter: 3_236_000,
    totalEthAfterDisplay: "3.236M",
    notes:
      "~331M shares. Period Oct 13–17. High $56.85 (Oct 13), low $48.51 (Oct 17). Oct 17 (Fri) close $49.85 (Yahoo).",
  },
  {
    date: "2025-10-13",
    ethAcquired: 202_037,
    ethPriceUsd: 4_154,
    usdDeployed: 839.3e6,
    stockPrevCloseUsd: 52.47,
    periodRange: "$52.37–$65.60",
    marketCapUsd: 16.6e9,
    mnav: 1.32,
    mnavRange: "1.32x–1.65x",
    totalEthAfter: 3_032_000,
    totalEthAfterDisplay: "3.032M",
    notes:
      "~317M shares. Period Oct 6–10. High $65.60 (Oct 7), low $52.37 (Oct 10 crash intraday). Oct 10 (Fri) close $52.47 (Yahoo). Largest ever crypto deleveraging.",
  },
  {
    date: "2025-10-06",
    ethAcquired: 179_251,
    ethPriceUsd: 4_535,
    usdDeployed: 812.9e6,
    stockPrevCloseUsd: 56.65,
    periodRange: "$50.65–$57.82",
    marketCapUsd: 17.2e9,
    mnav: 1.34,
    mnavRange: "1.20x–1.37x",
    totalEthAfter: 2_830_000,
    totalEthAfterDisplay: "2.830M",
    notes:
      "~304M shares. Period Sep 29–Oct 3. High $57.82 (Oct 3), low $50.65 (Sep 30). Oct 3 (Fri) close $56.65 (Yahoo). Relatively tight $7 range.",
  },
  {
    date: "2025-09-29",
    ethAcquired: 234_846,
    ethPriceUsd: 4_141,
    usdDeployed: 972.7e6,
    stockPrevCloseUsd: 50.5,
    periodRange: "$47.21–$59.28",
    marketCapUsd: 14.6e9,
    mnav: 1.34,
    mnavRange: "1.25x–1.57x",
    totalEthAfter: 2_651_000,
    totalEthAfterDisplay: "2.651M",
    notes:
      "~290M shares. Period Sep 22–26. High $59.28 (Sep 22), low $47.21 (Sep 25). Sep 26 (Fri) close $50.50 (Yahoo). Sharp pullback from $61 close on Sep 19.",
  },
  {
    date: "2025-09-22",
    ethAcquired: 264_378,
    ethPriceUsd: 4_497,
    usdDeployed: 1.19e9,
    stockPrevCloseUsd: 61.29,
    periodRange: "$50.71–$64.25",
    marketCapUsd: 17.0e9,
    mnav: 1.56,
    mnavRange: "1.29x–1.64x",
    totalEthAfter: 2_416_000,
    totalEthAfterDisplay: "2.416M",
    notes:
      "~277M shares. Period Sep 15–19. High $64.25 (Sep 19), low $50.71 (Sep 15). Sep 19 (Fri) close $61.29 (Yahoo, confirmed: $70 RD at 14% premium).",
  },
  {
    date: "2025-09-15",
    ethAcquired: 82_233,
    ethPriceUsd: 4_632,
    usdDeployed: 380.9e6,
    stockPrevCloseUsd: 55.09,
    periodRange: "$41.92–$55.29",
    marketCapUsd: 14.5e9,
    mnav: 1.46,
    mnavRange: "1.11x–1.46x",
    totalEthAfter: 2_152_000,
    totalEthAfterDisplay: "2.152M",
    notes:
      "~263M shares. Period Sep 8–12. High $55.29 (Sep 12), low $41.92 (Sep 8). Sep 12 (Fri) close $55.09 (Yahoo). Strong rally from $42→$55 during week.",
  },
  {
    date: "2025-09-08",
    ethAcquired: 202_469,
    ethPriceUsd: 4_312,
    usdDeployed: 873.0e6,
    stockPrevCloseUsd: 42.04,
    periodRange: "$39.70–$46.11",
    marketCapUsd: 10.5e9,
    mnav: 1.18,
    mnavRange: "1.11x–1.29x",
    totalEthAfter: 2_069_000,
    totalEthAfterDisplay: "2.069M",
    notes:
      "~250M shares. Period Sep 2–5. High $46.11 (Sep 3), low $39.70 (Sep 5). Sep 5 (Fri) close $42.04 (Yahoo). 2% ETH supply crossed.",
  },
  {
    date: "2025-09-02",
    ethAcquired: 153_075,
    ethPriceUsd: 4_458,
    usdDeployed: 682.4e6,
    stockPrevCloseUsd: 43.62,
    periodRange: "$43.45–$55.01",
    marketCapUsd: 10.4e9,
    mnav: 1.25,
    mnavRange: "1.25x–1.58x",
    totalEthAfter: 1_867_000,
    totalEthAfterDisplay: "1.867M",
    notes:
      "~239M shares. Period Aug 25–29. High $55.01 (Aug 25), low $43.45 (Aug 29). Aug 29 (Fri) close $43.62 (Yahoo). Labor Day Mon Sep 1. Steady decline through week.",
  },
  {
    date: "2025-08-25",
    ethAcquired: 190_526,
    ethPriceUsd: 4_808,
    usdDeployed: 916.4e6,
    stockPrevCloseUsd: 53.49,
    periodRange: "$47.02–$57.30",
    marketCapUsd: 11.1e9,
    mnav: 1.34,
    mnavRange: "1.18x–1.44x",
    totalEthAfter: 1_714_000,
    totalEthAfterDisplay: "1.714M",
    notes:
      "~207M shares. Period Aug 18–22. High $57.30 (Aug 18), low $47.02 (Aug 22). Aug 22 (Fri) close $53.49 (Yahoo). NAV/share $39.84 confirmed in PR.",
  },
  {
    date: "2025-08-18",
    ethAcquired: 373_110,
    ethPriceUsd: 4_326,
    usdDeployed: 1.61e9,
    stockPrevCloseUsd: 57.81,
    periodRange: "$54.10–$71.74",
    marketCapUsd: 10.7e9,
    mnav: 1.62,
    mnavRange: "1.52x–2.01x",
    totalEthAfter: 1_523_000,
    totalEthAfterDisplay: "1.523M",
    notes:
      "~185M shares. Period Aug 11–15. High $71.74 (Aug 13), low $54.10 (Aug 15). Aug 15 (Fri) close $57.81 (Yahoo). Extreme volatility — $17.64 spread.",
  },
  {
    date: "2025-08-11",
    ethAcquired: 317_126,
    ethPriceUsd: 4_311,
    usdDeployed: 1.37e9,
    stockPrevCloseUsd: 51.43,
    periodRange: "$30.67–$54.43",
    marketCapUsd: 8.4e9,
    mnav: 1.69,
    mnavRange: "1.01x–1.79x",
    totalEthAfter: 1_150_000,
    totalEthAfterDisplay: "1.150M",
    notes:
      "~163M shares. Period Aug 4–8. High $54.43 (Aug 8), low $30.67 (Aug 5). Aug 8 (Fri) close $51.43 (Yahoo). Massive rally $31→$51 in one week.",
  },
  {
    date: "2025-08-04",
    ethAcquired: 266_361,
    ethPriceUsd: 3_492,
    usdDeployed: 930.1e6,
    stockPrevCloseUsd: 31.68,
    periodRange: "$30.30–$45.70",
    marketCapUsd: 4.5e9,
    mnav: 1.53,
    mnavRange: "1.47x–2.21x",
    totalEthAfter: 833_000,
    totalEthAfterDisplay: "0.833M",
    notes:
      "~141M shares. Period Jul 24–Aug 1. High $45.70 (Jul 24), low $30.30 (Aug 1). Aug 1 (Fri) close $31.68 (Yahoo). Continued decline from Jul highs.",
  },
  {
    date: "2025-07-24",
    ethAcquired: 266_119,
    ethPriceUsd: 3_644,
    usdDeployed: 969.7e6,
    stockPrevCloseUsd: 39.5,
    periodRange: "$37.10–$48.59",
    marketCapUsd: 3.7e9,
    mnav: 1.77,
    mnavRange: "1.67x–2.18x",
    totalEthAfter: 567_000,
    totalEthAfterDisplay: "0.567M",
    notes:
      "~93M shares. Period Jul 17–23. High $48.59 (Jul 17), low $37.10 (Jul 22). Jul 23 (Wed) close $39.50 (Yahoo). +88% ETH in 1 week.",
  },
  {
    date: "2025-07-17",
    ethAcquired: 137_515,
    ethPriceUsd: 3_462,
    usdDeployed: 476.0e6,
    stockPrevCloseUsd: 44.8,
    periodRange: "$39.10–$59.00",
    marketCapUsd: 2.3e9,
    mnav: 2.23,
    mnavRange: "1.95x–2.94x",
    totalEthAfter: 301_000,
    totalEthAfterDisplay: "0.301M",
    notes:
      "~52M shares. Period Jul 14–16. High $59.00 (Jul 14), low $39.10 (Jul 15). Jul 16 (Wed) close $44.80 (Yahoo). Crashing from $161 peak.",
  },
  {
    date: "2025-07-14",
    ethAcquired: 163_142,
    ethPriceUsd: 3_073,
    usdDeployed: 501.3e6,
    stockPrevCloseUsd: 40.62,
    periodRange: "$12.38–$161.00",
    marketCapUsd: 1.4e9,
    mnav: 2.77,
    mnavRange: "0.85x–11.00x",
    totalEthAfter: 163_000,
    totalEthAfterDisplay: "0.163M",
    notes:
      "~34M shares. Period Jun 30–Jul 11 (IPO week through first PR). High $161.00 (Jul 3 — 52wk high), low $12.38 (Jun 30 IPO day open). Jul 11 (Fri) close $40.62 (Yahoo). First ETH purchase. Extreme range reflects IPO frenzy → crash.",
  },
];
