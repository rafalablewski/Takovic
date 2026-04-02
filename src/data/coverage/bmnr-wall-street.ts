/**
 * BMNR sell-side coverage — B. Riley (DATCo) and Cantor (SOTP).
 * Expandable `detail` lives on the specific history row it describes.
 *
 * LAST UPDATED: 2026-04-02
 * NEXT UPDATE: After new initiations, estimate changes, or discontinuations
 */

import type {
  AnalystCoverage,
  WallStreetFirmCoverage,
} from "@/types/coverage";

export const WALL_STREET_NOTE =
  "Two sell-side firms cover BMNR as of January 2026. Summaries paraphrase published research; not investment advice.";

export const WALL_STREET_FIRMS: WallStreetFirmCoverage[] = [
  {
    id: "b-riley",
    firm: "B. Riley Securities",
    analystName: "Fedor Shabalin",
    coverageSinceLabel: "October 2025",
    reportCount: 3,
    rating: "Buy",
    priceTarget: 47,
    priceTargetHint: "Reiterated Jan 2026",
    blurb:
      "Part of B. Riley digital asset treasury company (DATCo) coverage universe. Uses mNAV-based methodology, viewing digital asset treasury companies as closed-end fund-like vehicles offering leveraged crypto exposure.",
    history: [
      {
        entryId: "b-riley-2026-01-16-reiterate",
        date: "2026-01-16",
        action: "REITERATE",
        ratingLabel: "Buy",
        priceTargetLine: "$47 ← $47",
        attribution: "B. Riley Securities Research",
        headline:
          "BMNR — Beast Industries Partnership Reinforces Strategic Capital Allocation",
        detail: {
          aiSummaryTitle: "AI Summary",
          aiSummaryParagraphs: [
            "This note (Jan 16, 2026) reiterates Buy and a $47 price target, unchanged from the prior publish. It frames the Beast Industries partnership as reinforcing strategic capital allocation within the DATCo / mNAV thesis.",
            "Broader framework: mNAV-based valuation; digital asset treasury companies treated as closed-end fund-like vehicles with leveraged crypto exposure.",
          ],
          methodology:
            "Modified Net Asset Value (mNAV) approach. DATCo companies function similarly to closed-end funds, providing leveraged exposure to underlying crypto assets.",
          coverageUniverse:
            "Part of broader B. Riley digital asset treasury company (DATCo) coverage universe including FGNX and NAKA.",
          institutionalContext:
            "57 funds/institutions reporting positions (up 2,750% QoQ). Put/call ratio 0.55 (bullish). ARK Innovation ETF holds 4,061K shares (1.43%).",
          keyAssumptions: [
            { label: "Price target", value: "$47" },
            { label: "Rating", value: "Buy" },
            { label: "Stock price (ref.)", value: "~$51.20 (context per published note)" },
            { label: "Methodology", value: "mNAV-based (DATCo framework)" },
            {
              label: "Implied upside (illustrative)",
              value: "~75.8% vs. ref. print at initiation-era framing (see firm model)",
            },
          ],
          catalysts: [
            "ETH price appreciation increasing mNAV",
            "Continued aggressive ETH accumulation",
            "Transition from NAV discount to NAV premium",
            "Leveraged crypto exposure appeal for bullish investors",
          ],
          risks: [
            "Crypto price decline reducing mNAV",
            "Persistent trading at NAV discount",
            "Regulatory uncertainty on crypto assets",
            "Concentration risk in ETH holdings",
          ],
          methodologyFooter:
            "Methodology: Modified Net Asset Value (mNAV). Digital asset treasury companies viewed as closed-end fund-like vehicles. Values based on underlying crypto holdings adjusted for leverage and accumulation trajectory.",
        },
      },
      {
        date: "2025-11-20",
        action: "PT CUT",
        ratingLabel: "Buy",
        priceTargetLine: "$47 ← $90",
        attribution: "B. Riley Securities Research",
        headline:
          "DATCo Coverage Update — mNAV and Accumulation Assumptions Reduced",
      },
      {
        date: "2025-10-16",
        action: "INITIATION",
        ratingLabel: "Buy",
        priceTargetLine: "$90",
        attribution: "B. Riley Securities Research",
        headline: "BitMine Immersion Technologies — Initiation of Coverage",
        excerpt:
          "Industrial-scale digital asset mining companies primarily hold cryptocurrencies, functioning similarly to closed-end funds. Such firms offer investors an opportunity for leveraged exposure to cryptocurrency returns. Investors optimistic about the future of the crypto market should consider these companies for potential gains.",
      },
    ],
  },
  {
    id: "cantor",
    firm: "Cantor Fitzgerald",
    analystName: "N/A",
    coverageSinceLabel: "January 2026",
    reportCount: 1,
    rating: "Buy",
    priceTarget: 39,
    blurb:
      "We value BMNR using a sum-of-the-parts (SOTP) valuation approach. Digital Asset NAV ($32.09/share) + Staking Business ($7.20/share) + Treasury Operations ($0/share) = $39 PT. Treasury ops valued at $0 because BMNR trades at discount to mNAV, so capital raises are not accretive to ETH/share.",
    history: [
      {
        entryId: "cantor-2026-01-05-initiation",
        date: "2026-01-05",
        action: "INITIATION",
        ratingLabel: "Buy",
        priceTargetLine: "$39",
        attribution: "Cantor Fitzgerald Research",
        headline: "BitMine Immersion Technologies - Initiation of Coverage",
        excerpt:
          "We value BMNR using a sum-of-the-parts (SOTP) valuation approach. Digital Asset NAV ($32.09/share) + Staking Business ($7.20/share) + Treasury Operations ($0/share) = $39 PT. Treasury ops valued at $0 because BMNR trades at discount to mNAV, so capital raises are not accretive to ETH/share.",
        detail: {
          aiSummaryTitle: "AI Summary",
          aiSummaryParagraphs: [
            "SOTP VALUATION FRAMEWORK — Digital Asset NAV ($32.09/share) + Staking Business ($7.20/share) + Treasury Operations ($0/share) = $39.00 PT.",
            "DIGITAL ASSET NAV — $32.09/share: total NAV $13,926m on 434.0m shares. ETH 4,110,525 @ $3,135; BTC $17m; EightCo $23m; cash $1,000m.",
            "STAKING BUSINESS — $7.20/share: 2026 staking/validator fees $369m less cash SG&A ($55m) → staking profit $314m; 10.0x multiple → $3,140m equity value / 434.0m shares.",
            "TREASURY OPERATIONS — $0/share: at NAV discount, modeled accretion from capital markets proceeds is nil; ETH yield on new issuance ~0% in framework.",
          ],
          methodology:
            "Sum-of-the-Parts (SOTP): Digital Asset NAV + 10x 2026E staking profit + Treasury ops ($0 due to NAV discount).",
          keyAssumptions: [
            { label: "ETH holdings", value: "4,110,525 ETH" },
            { label: "ETH price", value: "$3,135" },
            { label: "Digital asset NAV", value: "$13,926m" },
            { label: "NAV per share", value: "$32.09" },
            { label: "2026 staking revenue", value: "$369m" },
            { label: "2026 cash SG&A", value: "($55m)" },
            { label: "Staking profit", value: "$314m" },
            { label: "Staking multiple", value: "10.0x" },
            { label: "Shares outstanding", value: "434.0m" },
          ],
          catalysts: [
            "ETH price appreciation above $3,135 base case",
            "Staking revenue expansion beyond $369m",
            "Transition to trading at NAV premium (enabling accretive capital raises)",
            "Additional ETH accumulation via operating cash flow",
          ],
          risks: [
            "ETH price decline below $3,135 assumption",
            "Persistent NAV discount preventing accretive treasury operations",
            "Staking revenue compression from validator competition",
            "Regulatory uncertainty on crypto assets",
            "Dilution from capital raises at NAV discount",
          ],
          methodologyFooter:
            "Methodology: Sum-of-the-Parts (SOTP): Digital Asset NAV + 10x 2026E Staking Profit + Treasury Ops (valued at $0 due to NAV discount).",
          tableGroups: [
            {
              sectionTitle: "Detailed SOTP breakdown",
              tables: [
                {
                  title: "Digital asset value",
                  headers: ["Item", "Value"],
                  rows: [
                    ["ETH Holdings", "4,110,525"],
                    ["ETH Price", "$3,135"],
                    ["ETH Value", "$12,886m"],
                    ["BTC Value", "$17m"],
                    ["EightCo", "$23m"],
                    ["Cash", "$1,000m"],
                    ["ETH + Cash NAV", "$13,926m"],
                    ["Shares outstanding", "434.0m"],
                    ["NAV per share", "$32.09"],
                  ],
                },
                {
                  title: "Staking / validator",
                  headers: ["Item", "Value"],
                  rows: [
                    ["2026 Staking/Validator Fees", "$369m"],
                    ["2026 Cash SG&A", "($55m)"],
                    ["Staking Profit", "$314m"],
                    ["Multiple", "10.0x"],
                    ["Equity Value", "$3,140m"],
                    ["Shares", "434.0m"],
                    ["Per share value", "$7.20"],
                  ],
                },
                {
                  title: "Treasury operations",
                  headers: ["Item", "Value"],
                  rows: [
                    ["Current ETH + Cash Per Share", "0.01024"],
                    ["Annual Capital Markets Proceeds", "$1,000m"],
                    ["Avg ETH Price", "$3,135"],
                    ["ETH Acquired", "318,979"],
                    ["Total shares", "434.0m"],
                    ["Current ETH value per share", "$32.09"],
                    ["Average premium", "0%"],
                    ["New Shares", "31.2m"],
                    ["Total Shares - New", "465.1m"],
                    ["Total ETH - New", "4,761,197"],
                    ["ETH Per Share - New", "0.010236"],
                    ["ETH Yield", "0.0%"],
                    ["ETH Created", "0"],
                    ["Capital Markets Profits", "$m"],
                    ["Profit Multiple", "12.0x"],
                    ["Equity Value", "$m"],
                    ["New Shares", "465.1m"],
                    ["Share Price", "$0.00"],
                  ],
                },
              ],
            },
          ],
          sourceLine:
            "Source: Company Reports, Cantor Fitzgerald Research, Pricing as of 12/29/2025",
        },
      },
    ],
  },
];

function firmsToLegacyAnalystRows(
  firms: WallStreetFirmCoverage[]
): AnalystCoverage[] {
  return firms.map((f) => {
    const latest = f.history[0];
    return {
      firm: f.firm,
      analyst: f.analystName === "N/A" ? "Cantor Research" : f.analystName,
      rating: f.rating,
      priceTarget: f.priceTarget,
      date: latest?.date ?? "—",
      note: f.blurb.length > 300 ? `${f.blurb.slice(0, 297)}…` : f.blurb,
    };
  });
}

/** Legacy flat list for API / consumers expecting `AnalystCoverage[]`. */
export const WALL_STREET: AnalystCoverage[] =
  firmsToLegacyAnalystRows(WALL_STREET_FIRMS);
