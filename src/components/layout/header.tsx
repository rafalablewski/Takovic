"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MARKET_OPEN_MINUTES, MARKET_CLOSE_MINUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { UserSession } from "@/lib/auth/user";

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
  "/dev-guide": "Developer Guide",
  "/settings": "Settings",
  "/help": "Help",
};

function getPageTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "stock" && segments[1]) {
    return segments[1].toUpperCase();
  }
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
      setOpen(day >= 1 && day <= 5 && mins >= MARKET_OPEN_MINUTES && mins < MARKET_CLOSE_MINUTES);
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return open;
}

export function Header({ user }: { user?: UserSession }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const marketOpen = useMarketStatus();
  const router = useRouter();
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
    <header className="glass-panel sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-white/10 px-4 sm:px-6">
      {/* Left: Page title */}
      <h1 className="text-display tabular-hero max-w-[40%] truncate sm:max-w-none">
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
              "glass-input h-9 w-full pl-9 pr-16",
            )}
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground backdrop-blur-sm sm:inline-flex">
            <span className="text-[10px]">&#8984;</span>K
          </kbd>
        </div>
      </div>

      {/* Right: status + notifications + avatar */}
      <div className="flex items-center gap-2">
        {/* Market status */}
        <Badge
          variant={marketOpen ? "success" : "secondary"}
          className="hidden gap-1.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium tracking-wide backdrop-blur-sm sm:inline-flex"
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
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-foreground/95 text-[11px] font-medium text-background shadow-[0_0_24px_-6px_oklch(0.68_0.16_259/0.35)] outline-none transition-premium hover:scale-[1.03] hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              {user?.initials ?? "??"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="mr-2 h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <CreditCard className="mr-2 h-3.5 w-3.5" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/help")}>
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
