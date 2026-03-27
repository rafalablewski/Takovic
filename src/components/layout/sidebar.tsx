"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  User,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
} from "lucide-react";

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
  { name: "Valuation Calculator", href: "/valuation", icon: Calculator },
];

const accountLinks = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
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
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
          "border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        )}
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 shadow-md shadow-blue-600/25">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">
                Takovic
              </span>
              <span className="text-[10px] font-medium leading-none text-muted-foreground">
                Financial Analytics
              </span>
            </div>
          )}
        </div>

        {/* Scrollable nav area */}
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-3">
            {/* Main Navigation */}
            <SidebarSection label="Main" collapsed={collapsed}>
              {mainNavigation.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </SidebarSection>

            <Separator className="my-2 bg-sidebar-border" />

            {/* Analysis Tools */}
            <SidebarSection label="Analysis Tools" collapsed={collapsed}>
              {analysisTools.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.name}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </SidebarSection>
          </div>
        </ScrollArea>

        {/* Bottom section: Account links + collapse toggle */}
        <div className="mt-auto border-t border-sidebar-border p-3">
          {/* Account links */}
          <div className="flex flex-col gap-1">
            {accountLinks.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.name}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>

          <Separator className="my-2 bg-sidebar-border" />

          {/* Profile row */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
              JD
            </div>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  John Doe
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Pro Plan
                </span>
              </div>
            )}
          </div>

          <Separator className="my-2 bg-sidebar-border" />

          {/* Collapse toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className={cn(
                  "w-full text-muted-foreground hover:text-sidebar-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                {collapsed ? (
                  <ChevronsRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="text-xs">Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>Expand sidebar</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function SidebarSection({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {!collapsed && (
        <span className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

function SidebarLink({
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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active
            ? "text-sidebar-accent-foreground"
            : "text-muted-foreground group-hover:text-sidebar-foreground"
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
