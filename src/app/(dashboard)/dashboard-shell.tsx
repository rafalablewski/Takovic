"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
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
    <div className="relative z-10 flex min-h-screen min-w-0 bg-transparent">
      <Sidebar user={user} />
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-[52px]" : "lg:pl-[240px]"
        )}
      >
        <Header user={user} />
        <main className="research-main dashboard-page-enter min-w-0 flex-1">
          <PageContainer>{children}</PageContainer>
        </main>
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
