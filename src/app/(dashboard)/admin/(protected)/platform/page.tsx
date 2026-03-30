import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function loadEnvExample(): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), ".env.example");
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

function parseEnvLines(raw: string): { key: string; comment?: string }[] {
  const lines = raw.split("\n");
  const rows: { key: string; comment?: string }[] = [];
  const commentParts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      const c = trimmed.replace(/^#\s?/, "");
      if (c) commentParts.push(c);
      continue;
    }
    if (!trimmed || !trimmed.includes("=")) {
      if (!trimmed) commentParts.length = 0;
      continue;
    }
    const key = trimmed.split("=")[0]?.trim();
    if (key) {
      const comment =
        commentParts.length > 0 ? commentParts.join(" · ") : undefined;
      rows.push({ key, comment });
      commentParts.length = 0;
    }
  }
  return rows;
}

export default async function AdminPlatformPage() {
  const envRaw = await loadEnvExample();
  const envRows = envRaw ? parseEnvLines(envRaw) : [];

  const docLinks = [
    { path: "CLAUDE.md", note: "Project rules, architecture, entity standards" },
    { path: "AGENTS.md", note: "Next.js agent hints" },
    { path: "src/lib/ai/coverage-prompts/coverage-analyst-template.ts", note: "Coverage analyst template" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Platform</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Environment reference and in-repo documentation paths. Values are not
          read from your machine — only the checked-in{" "}
          <code className="text-xs">.env.example</code> keys are listed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account & app settings</CardTitle>
          <CardDescription>
            End-user preferences (theme, notifications, plan) live in the main
            dashboard Settings area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/settings"
            className="text-sm font-medium text-primary hover:underline"
          >
            Open Settings →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Repository docs</CardTitle>
          <CardDescription>
            Paths relative to the project root — open in your editor or VCS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {docLinks.map((d) => (
            <div
              key={d.path}
              className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <code className="text-xs font-mono text-foreground">{d.path}</code>
              <p className="text-xs text-muted-foreground">{d.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Environment variables</CardTitle>
          <CardDescription>
            From <code className="text-xs">.env.example</code> — set secrets in{" "}
            <code className="text-xs">.env.local</code> (not committed).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!envRaw ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Could not read .env.example.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Key</th>
                    <th className="px-5 py-3">Section / note</th>
                  </tr>
                </thead>
                <tbody>
                  {envRows.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-border/80 last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-foreground">
                        {row.key}
                        {row.key.startsWith("NEXT_PUBLIC_") ? (
                          <Badge
                            variant="outline"
                            className="ml-2 align-middle text-[9px]"
                          >
                            public
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {row.comment ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
