"use client";

import * as React from "react";
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
  Globe,
  SlidersHorizontal,
  CalendarDays,
  Star,
  PieChart,
  Bell,
  GitCompareArrows,
  Calculator,
  BookOpen,
  FileText,
  Newspaper,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  X,
} from "lucide-react";

const showAdminNav = process.env.NEXT_PUBLIC_SHOW_ADMIN === "true";

const marketsNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Markets", href: "/markets", icon: Globe },
  { name: "Screener", href: "/screener", icon: SlidersHorizontal },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
];

const investNav = [
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Portfolio", href: "/portfolio", icon: PieChart },
  { name: "Alerts", href: "/alerts", icon: Bell },
];

const analyzeNav = [
  { name: "Compare", href: "/compare", icon: GitCompareArrows },
  { name: "Valuation", href: "/valuation", icon: Calculator },
  { name: "Research", href: "/coverage", icon: BookOpen },
  { name: "Filings", href: "/intelligence", icon: FileText },
];

const learnNav = [
  { name: "News", href: "/news", icon: Newspaper },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar({ user }: { user?: UserSession }) {
  const pathname = usePathname();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const closeMobile = React.useCallback(() => setMobileOpen(false), [setMobileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, setMobileOpen]);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className="glass-panel absolute inset-y-0 left-0 flex w-[min(100vw-2.5rem,18rem)] max-w-[280px] flex-col border-r border-white/[0.07] shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/95">
                  <TrendingUp className="h-3.5 w-3.5 text-background" strokeWidth={1.75} />
                </div>
                <span className="truncate text-[15px] font-medium tracking-tight text-foreground">
                  Takovic
                </span>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-premium hover:bg-white/[0.06] hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 stroke-[1.5]" />
              </button>
            </div>
            <ScrollArea className="flex-1 px-2">
              <SidebarNavBody
                collapsed={false}
                pathname={pathname}
                isActive={isActive}
                onAfterNavigate={closeMobile}
              />
            </ScrollArea>
            <div className="mt-auto border-t border-white/[0.07] px-2 py-3">
              <Link
                href="/settings"
                onClick={closeMobile}
                className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-premium hover:bg-white/[0.06]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {user?.initials ?? "??"}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium leading-tight text-foreground">
                    {user?.name ?? "User"}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {user?.plan
                      ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
                      : "Free"}
                  </span>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "glass-panel hidden border-r transition-all duration-300 ease-out lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
          collapsed ? "lg:w-[52px]" : "lg:w-[240px]"
        )}
      >
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

        <ScrollArea className="flex-1 px-2">
          <SidebarNavBody
            collapsed={collapsed}
            pathname={pathname}
            isActive={isActive}
          />
        </ScrollArea>

        <div className="mt-auto px-2 py-4">
          <div className="soft-divider mb-4" aria-hidden />
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
                    {user?.plan
                      ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
                      : "Free"}
                  </span>
                </div>
              </div>
            )}
          </Link>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
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

function SidebarNavBody({
  collapsed,
  pathname,
  isActive,
  onAfterNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  isActive: (href: string) => boolean;
  onAfterNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 py-2">
      <NavSection label="Markets" collapsed={collapsed}>
        {marketsNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
            collapsed={collapsed}
            onAfterNavigate={onAfterNavigate}
          />
        ))}
      </NavSection>

      <NavSection label="Invest" collapsed={collapsed}>
        {investNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
            collapsed={collapsed}
            onAfterNavigate={onAfterNavigate}
          />
        ))}
      </NavSection>

      <NavSection label="Analyze" collapsed={collapsed}>
        {analyzeNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
            collapsed={collapsed}
            onAfterNavigate={onAfterNavigate}
          />
        ))}
      </NavSection>

      {showAdminNav && (
        <NavSection label="System" collapsed={collapsed}>
          <NavItem
            href="/admin"
            icon={LayoutGrid}
            label="Admin"
            active={
              pathname === "/admin" ||
              (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/login"))
            }
            collapsed={collapsed}
            onAfterNavigate={onAfterNavigate}
          />
        </NavSection>
      )}

      <NavSection label="Learn" collapsed={collapsed}>
        {learnNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={isActive(item.href)}
            collapsed={collapsed}
            onAfterNavigate={onAfterNavigate}
          />
        ))}
      </NavSection>
    </div>
  );
}

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
        <span className="label-caps mb-2 px-2 opacity-80">{label}</span>
      )}
      {children}
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  onAfterNavigate,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
  onAfterNavigate?: () => void;
}) {
  const content = (
    <Link
      href={href}
      onClick={() => onAfterNavigate?.()}
      className={cn(
        "group flex min-h-10 items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] font-medium transition-premium",
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
      {!collapsed && <span className="truncate">{label}</span>}
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
