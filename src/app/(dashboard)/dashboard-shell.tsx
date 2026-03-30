"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/lib/auth/user";

function ShellInner({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserSession;
}) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-[52px]" : "lg:pl-[240px]"
        )}
      >
        <Header user={user} />
        <main className="flex-1 bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserSession;
}) {
  return (
    <SidebarProvider>
      <ShellInner user={user}>{children}</ShellInner>
    </SidebarProvider>
  );
}
