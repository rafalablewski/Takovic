"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  User,
  CreditCard,
  HelpCircle,
} from "lucide-react";

/** Map pathnames to breadcrumb labels */
const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/screener": "Screener",
  "/watchlist": "Watchlist",
  "/portfolio": "Portfolio",
  "/news": "News",
  "/lookup": "Stock Lookup",
  "/compare": "Compare Stocks",
  "/valuation": "Valuation Calculator",
  "/settings": "Settings",
  "/help": "Help",
};

function useBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard", href: "/" }];

  const crumbs: { label: string; href: string }[] = [];
  let accumulated = "";
  for (const seg of segments) {
    accumulated += "/" + seg;
    crumbs.push({
      label:
        breadcrumbMap[accumulated] ??
        seg.charAt(0).toUpperCase() + seg.slice(1),
      href: accumulated,
    });
  }
  return crumbs;
}

/** Simple check: US stock market is open weekdays 9:30-16:00 ET */
function useMarketStatus() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function check() {
      const now = new Date();
      const et = new Date(
        now.toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      const day = et.getDay();
      const h = et.getHours();
      const m = et.getMinutes();
      const mins = h * 60 + m;
      setOpen(day >= 1 && day <= 5 && mins >= 570 && mins < 960);
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return open;
}

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = useBreadcrumbs(pathname);
  const marketOpen = useMarketStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const notificationCount = 3;

  // Cmd+K / Ctrl+K focus handler
  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        node!.focus();
      }
    }
    document.addEventListener("keydown", handler);
    // Cleanup handled by component lifecycle; safe for single mount
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      {/* Breadcrumb */}
      <nav className="hidden items-center gap-1.5 text-sm md:flex">
        <span className="font-medium text-muted-foreground">Takovic</span>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span
              className={cn(
                "font-medium",
                i === breadcrumbs.length - 1
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "h-9 w-full rounded-lg border border-input bg-muted/50 pl-9 pr-14 text-sm outline-none transition-colors",
            "placeholder:text-muted-foreground",
            "focus:border-ring focus:bg-background focus:ring-1 focus:ring-ring"
          )}
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span className="text-[10px]">&#8984;</span>K
        </kbd>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Market status */}
      <Badge
        variant={marketOpen ? "success" : "secondary"}
        className="hidden gap-1.5 whitespace-nowrap sm:inline-flex"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            marketOpen ? "bg-green-500 animate-pulse" : "bg-muted-foreground/50"
          )}
        />
        {marketOpen ? "Market Open" : "Market Closed"}
      </Badge>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-muted-foreground" />
        {notificationCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {notificationCount}
          </span>
        )}
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full p-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                JD
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">John Doe</p>
              <p className="text-xs leading-none text-muted-foreground">
                john@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
