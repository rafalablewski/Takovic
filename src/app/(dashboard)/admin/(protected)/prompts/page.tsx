import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AI_WORKFLOWS } from "@/lib/admin/ai-workflows";
import { getAllCoveredStocks } from "@/data/coverage/registry";
import { buildCoverageContext } from "@/lib/ai/prompts";
import { getSecEdgarFilingAnalysisPromptAdminPreview } from "@/lib/ai/filing-equity-research-prompt";
import { CopyCoveragePromptButton } from "../copy-coverage-prompt-button";

interface PromptsPageProps {
  searchParams: Promise<{ ticker?: string }>;
}

export default async function AdminPromptsPage({ searchParams }: PromptsPageProps) {
  const params = await searchParams;
  const stocks = getAllCoveredStocks();
  const defaultTicker = stocks[0]?.ticker ?? "";
  const requested = params.ticker?.toUpperCase() ?? "";
  const activeTicker =
    requested && stocks.some((s) => s.ticker === requested)
      ? requested
      : defaultTicker;

  const resolvedPrompt = activeTicker
    ? await buildCoverageContext(activeTicker)
    : null;

  const secEdgarFilingPrompt = getSecEdgarFilingAnalysisPromptAdminPreview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Prompts & AI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Workflow discovery, coverage registry, and resolved coverage analyst
          prompt per ticker.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI workflows</CardTitle>
          <CardDescription>
            Prompts remain in source; this table is for discovery only.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Workflow</th>
                  <th className="px-5 py-3">Purpose</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Model env</th>
                  <th className="px-5 py-3">Consumers</th>
                </tr>
              </thead>
              <tbody>
                {AI_WORKFLOWS.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-border/80 last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {w.name}
                      <div className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                        {w.id}
                      </div>
                    </td>
                    <td className="max-w-xs px-5 py-3 text-muted-foreground">
                      {w.purpose}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted-foreground">
                      {w.source}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {w.modelEnvKeys.length ? w.modelEnvKeys.join(", ") : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      <ul className="list-inside list-disc space-y-1">
                        {w.consumers.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coverage registry</CardTitle>
          <CardDescription>
            From <code className="text-xs">getAllCoveredStocks()</code> — links
            to public coverage pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {stocks.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No covered stocks in the registry yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Ticker</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Sector</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Preview prompt</th>
                    <th className="px-5 py-3">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr
                      key={s.ticker}
                      className="border-b border-border/80 last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-5 py-3 font-mono font-medium tabular-nums">
                        {s.ticker}
                      </td>
                      <td className="px-5 py-3">{s.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {s.sector}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/prompts?ticker=${encodeURIComponent(s.ticker)}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {activeTicker === s.ticker ? "Selected" : "Select"}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/coverage/${s.ticker}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="text-base">SEC/EDGAR file analysis</CardTitle>
            <CardDescription>
              Same template as{" "}
              <code className="text-xs">buildFilingPrompt</code> in{" "}
              <code className="text-xs">filing-analyze.ts</code>, without live
              filing text. Source:{" "}
              <code className="text-xs">
                filing-equity-research-prompt.ts
              </code>
              .
            </CardDescription>
          </div>
          <CopyCoveragePromptButton
            text={secEdgarFilingPrompt}
            copyLabel="Copy prompt"
            ariaLabel="Copy SEC EDGAR filing analysis prompt to clipboard"
          />
        </CardHeader>
        <CardContent>
          <pre className="max-h-[min(480px,60vh)] overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-xs whitespace-pre-wrap text-foreground">
            {secEdgarFilingPrompt}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="text-base">
              Coverage analyst prompt (resolved)
            </CardTitle>
            <CardDescription>
              Output of{" "}
              <code className="text-xs">
                buildCoverageContext(&quot;{activeTicker || "—"}&quot;)
              </code>
              . Stock-agnostic template:{" "}
              <code className="text-xs">COVERAGE_ANALYST_PROMPT</code> in{" "}
              <code className="text-xs">
                coverage-prompts/coverage-analyst-template.ts
              </code>{" "}
              (filled via registry + data modules).
            </CardDescription>
          </div>
          {resolvedPrompt ? (
            <CopyCoveragePromptButton text={resolvedPrompt} />
          ) : null}
        </CardHeader>
        <CardContent>
          {!activeTicker && (
            <p className="text-sm text-muted-foreground">
              Add a stock to the coverage registry to preview the prompt.
            </p>
          )}
          {activeTicker && !resolvedPrompt && (
            <p className="text-sm text-muted-foreground">
              No resolved prompt for this ticker (not in active coverage).
            </p>
          )}
          {resolvedPrompt && (
            <pre className="max-h-[min(480px,60vh)] overflow-auto rounded-md border border-border bg-muted/30 p-4 font-mono text-xs whitespace-pre-wrap text-foreground">
              {resolvedPrompt}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
