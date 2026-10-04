"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar, MobileNav } from "@/components/shared/app-sidebar";
import { Header } from "@/components/shared/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function AppShellBody({
  children,
  userRole = "student",
  isAdmin = false,
}: {
  children: ReactNode;
  userRole?: "student" | "admin" | "mentor";
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const hideBottomNav =
    (pathname?.startsWith("/qb/") && pathname.split("/").length > 3) ||
    pathname?.startsWith("/exam/") ||
    pathname?.startsWith("/exams/");

  return (
    <SidebarInset className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-background transition-colors duration-200 shadow-xs md:my-3 md:mr-3 md:h-[calc(100dvh-24px)] md:max-h-[calc(100dvh-24px)] md:rounded-xl md:border md:border-border">
      <Header />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 w-full h-full relative bg-background overscroll-none overflow-y-auto">
          <div
            className={cn(
              "w-full mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4",
              hideBottomNav
                ? "pb-6 sm:pb-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
                : "pb-28 md:pb-6 pb-[calc(7rem+env(safe-area-inset-bottom,0px))]",
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {!hideBottomNav ? <MobileNav userRole={userRole} isAdmin={isAdmin} /> : null}
    </SidebarInset>
  );
}

export function AppShell({
  children,
  userRole = "student",
  isAdmin = false,
}: {
  children: ReactNode;
  userRole?: "student" | "admin" | "mentor";
  isAdmin?: boolean;
}) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div
          className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary"
          suppressHydrationWarning
        >
          <AppSidebar userRole={userRole} isAdmin={isAdmin} />
          <AppShellBody userRole={userRole} isAdmin={isAdmin}>
            {children}
          </AppShellBody>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
