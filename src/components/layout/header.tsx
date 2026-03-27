"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  LogOut,
  Settings,
  User,
  CreditCard,
  HelpCircle,
} from "lucide-react";

/** Map pathnames to page titles */
const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/screener": "Stock Screener",
  "/watchlist": "Watchlist",
  "/portfolio": "Portfolio",
  "/news": "News",
  "/lookup": "Stock Lookup",
  "/compare": "Compare Stocks",
  "/valuation": "Valuation",
  "/settings": "Settings",
  "/help": "Help",
};

function getPageTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  // Try to match a parent path
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const parent = "/" + segments[0];
    if (titleMap[parent]) return titleMap[parent];
  }
  return "Dashboard";
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
  const pageTitle = getPageTitle(pathname);
  const marketOpen = useMarketStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const notificationCount = 3;

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (!node) return;
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        node!.focus();
      }
    }
    document.addEventListener("keydown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background px-4 sm:px-6">
      {/* Left: Page title */}
      <h1 className="text-lg font-semibold text-foreground">
        {pageTitle}
      </h1>

      {/* Center: push search to center with flex */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stocks, news, analysis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-8 w-full rounded-lg border border-border bg-background pl-9 pr-16 text-[13px] outline-none transition-colors",
              "placeholder:text-muted-foreground/60",
              "focus:border-ring focus:ring-1 focus:ring-ring"
            )}
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <span className="text-[10px]">&#8984;</span>K
          </kbd>
        </div>
      </div>

      {/* Right: status + notifications + avatar */}
      <div className="flex items-center gap-2">
        {/* Market status */}
        <Badge
          variant={marketOpen ? "success" : "secondary"}
          className="hidden gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:inline-flex"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              marketOpen ? "bg-green-500" : "bg-muted-foreground/50"
            )}
          />
          {marketOpen ? "Open" : "Closed"}
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              RA
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Rafal</p>
                <p className="text-xs leading-none text-muted-foreground">
                  rafal@takovic.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-3.5 w-3.5" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-3.5 w-3.5" />
                Help
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
