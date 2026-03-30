import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getAllCoveredStocks } from "@/data/coverage/registry";
import { AI_WORKFLOWS } from "@/lib/admin/ai-workflows";
import {
  BookOpen,
  Bot,
  Layers,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function AdminOverviewPage() {
  const stocks = getAllCoveredStocks();

  const sections = [
    {
      href: "/admin/prompts",
      title: "Prompts & AI",
      description:
        "Workflow catalog, coverage registry, and resolved coverage analyst prompt with copy-to-clipboard.",
      icon: Bot,
    },
    {
      href: "/admin/dev-guide",
      title: "Dev guide",
      description:
        "Claude Code and Takovic engineering practices — same content as the dashboard Dev guide, reachable from here when you are in admin.",
      icon: BookOpen,
    },
    {
      href: "/admin/platform",
      title: "Platform",
      description:
        "Environment variables, repo docs paths, and links to account settings outside admin.",
      icon: Layers,
    },
    {
      href: "/settings",
      title: "Account settings",
      description:
        "Profile, notifications, and plan (dashboard Settings — not gated by admin secret).",
      icon: Settings,
      external: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Internal hub for prompts, developer reference, and platform notes.
          Use the tabs above or the cards below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="group block h-full">
              <Card className="h-full transition-colors hover:bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base">{s.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <CardDescription className="text-xs leading-relaxed">
                    {s.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="text-xs font-medium text-primary group-hover:underline">
                    Open
                    {s.external ? " (dashboard)" : ""}
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">At a glance</CardTitle>
          <CardDescription className="text-xs">
            Registry and workflow counts (read-only).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Covered tickers</p>
            <p className="mt-0.5 font-mono font-medium tabular-nums">
              {stocks.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">AI workflows listed</p>
            <p className="mt-0.5 font-mono font-medium tabular-nums">
              {AI_WORKFLOWS.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
