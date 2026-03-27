"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/sidebar-context";
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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shield,
  BookOpen,
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
  { name: "Valuation", href: "/valuation", icon: Calculator },
  { name: "Intelligence", href: "/intelligence", icon: Shield },
  { name: "Coverage", href: "/coverage", icon: BookOpen },
];

const secondaryLinks = [
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
          "border-r border-border bg-background transition-all duration-200 ease-in-out",
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
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-background" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
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
        <div className="mt-auto border-t border-border px-2 py-3">
          {/* Profile */}
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
              RA
            </div>
            {!collapsed && (
              <div className="flex flex-1 items-center justify-between overflow-hidden">
                <div className="flex flex-col">
                  <span className="truncate text-[13px] font-medium leading-tight text-foreground">
                    Rafal
                  </span>
                  <span className="text-[10px] font-medium leading-tight text-muted-foreground">
                    Professional
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
                  "mt-1.5 flex h-7 w-full items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
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
        <span className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
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
        "group flex items-center gap-2.5 rounded-md px-2 py-[7px] text-[13px] font-medium transition-colors duration-100",
        collapsed && "justify-center px-0 py-2",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-[14px] w-[14px] shrink-0",
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
