"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";
import type { UserSession } from "@/lib/auth/user";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  SlidersHorizontal,
  Star,
  PieChart,
  Newspaper,
  Search,
  GitCompareArrows,
  Calculator,
  Settings,
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shield,
  LayoutGrid,
} from "lucide-react";

const showAdminNav = process.env.NEXT_PUBLIC_SHOW_ADMIN === "true";

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Screener", href: "/screener", icon: SlidersHorizontal },
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Portfolio", href: "/portfolio", icon: PieChart },
  { name: "News", href: "/news", icon: Newspaper },
];

const analysisTools = [
  { name: "Stock Lookup", href: "/lookup", icon: Search },
  { name: "Compare Stocks", href: "/compare", icon: GitCompareArrows },
  { name: "Valuation", href: "/valuation", icon: Calculator },
  { name: "Intelligence", href: "/intelligence", icon: Shield },
  { name: "Coverage", href: "/coverage", icon: BookOpen },
];

const secondaryLinks = [
  { name: "Dev Guide", href: "/dev-guide", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar({ user }: { user?: UserSession }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "glass-panel hidden border-r transition-all duration-300 ease-out lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
          collapsed ? "lg:w-[52px]" : "lg:w-[240px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center gap-2.5 px-3",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/95 shadow-[0_0_20px_-4px_oklch(0.68_0.16_259/0.35)]">
            <TrendingUp className="h-3.5 w-3.5 text-background" strokeWidth={1.75} />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-medium tracking-tight text-foreground">
              Takovic
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <div className="flex flex-col gap-6 py-2">
            {/* Main */}
            <NavSection label="Navigation" collapsed={collapsed}>
              {mainNavigation.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </NavSection>

            {/* Analysis */}
            <NavSection label="Analysis" collapsed={collapsed}>
              {analysisTools.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </NavSection>

            {/* Admin (optional) */}
            {showAdminNav && (
              <NavSection label="System" collapsed={collapsed}>
                <NavItem
                  href="/admin"
                  icon={LayoutGrid}
                  label="Admin"
                  active={
                    pathname === "/admin" ||
                    (pathname.startsWith("/admin/") &&
                      !pathname.startsWith("/admin/login"))
                  }
                  collapsed={collapsed}
                />
              </NavSection>
            )}

            {/* Secondary */}
            <NavSection label="Account" collapsed={collapsed}>
              {secondaryLinks.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </NavSection>
          </div>
        </ScrollArea>

        {/* Bottom: profile + collapse */}
        <div className="mt-auto px-2 py-4">
          <div className="soft-divider mb-4" aria-hidden />
          {/* Profile */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2 py-2 transition-premium hover:bg-white/[0.06]",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
              {user?.initials ?? "??"}
            </div>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between overflow-hidden">
                <div className="flex flex-col">
                  <span className="truncate text-[13px] font-medium leading-tight tracking-tight text-foreground">
                    {user?.name ?? "User"}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : "Free"}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Collapse toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className={cn(
                  "mt-2 flex h-8 w-full items-center justify-center rounded-xl text-muted-foreground transition-premium hover:bg-white/[0.06] hover:text-foreground",
                  collapsed && "w-full"
                )}
              >
                {collapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronLeft className="h-3.5 w-3.5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {collapsed ? "Expand" : "Collapse"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  NavSection                                                         */
/* ------------------------------------------------------------------ */

function NavSection({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {!collapsed && (
        <span className="label-caps mb-2 px-2 opacity-80">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NavItem                                                            */
/* ------------------------------------------------------------------ */

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  const content = (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] font-medium transition-premium",
        collapsed && "justify-center px-0 py-2",
        active
          ? "bg-white/[0.1] text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.06)]"
          : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-[15px] w-[15px] shrink-0 stroke-[1.5]",
          active
            ? "text-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
