"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminLogoutButton } from "./admin-logout-button";

const NAV: { href: string; label: string; end?: boolean }[] = [
  { href: "/admin", label: "Overview", end: true },
  { href: "/admin/prompts", label: "Prompts & AI" },
  { href: "/admin/dev-guide", label: "Dev guide" },
  { href: "/admin/platform", label: "Platform" },
];

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function active(href: string, end?: boolean) {
    if (end) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <Link
            href="/admin"
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
          <nav className="flex flex-wrap gap-1" aria-label="Admin sections">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active(item.href, item.end)
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <AdminLogoutButton />
      </div>
      {children}
    </div>
  );
}
