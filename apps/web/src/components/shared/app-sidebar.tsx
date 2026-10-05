"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawsLogo } from "@/components/icons";
import { SidebarFooter } from "@/components/shared/sidebar-footer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ADMIN_NAV_ITEMS,
  MENTOR_NAV_ITEMS,
  type NavItem,
  USER_NAV_ITEMS,
} from "@/config/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar({
  userRole = "student",
  isAdmin = false,
}: {
  userRole?: "student" | "admin" | "mentor";
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const effectiveRole = isAdmin ? "admin" : userRole;
  const navItems =
    effectiveRole === "admin"
      ? ADMIN_NAV_ITEMS
      : effectiveRole === "mentor"
        ? MENTOR_NAV_ITEMS
        : USER_NAV_ITEMS;

  const activePath = navItems
    .filter(
      (item) =>
        pathname === item.path || (item.path !== "/" && pathname.startsWith(`${item.path}/`)),
    )
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  return (
    <aside className="hidden md:flex h-screen shrink-0 z-20 flex-col pt-5 pb-5 px-3 justify-between items-center overflow-x-hidden overflow-y-auto bg-transparent w-16">
      <div className="flex flex-col items-center gap-4 w-full">
        <Link
          href="/"
          className="flex items-center justify-center size-10 transition-transform hover:scale-110"
          aria-label="Home"
        >
          <PawsLogo className="size-9 text-foreground" />
        </Link>

        <div className="w-8 h-px bg-border/60" />
      </div>

      <div className="my-auto flex flex-col items-center gap-2 w-full py-4">
        {navItems.map((item: NavItem) => {
          const isExactActive = activePath === item.path;
          const Icon = item.icon;

          return (
            <Tooltip key={item.name}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.path}
                    className={cn(
                      "relative flex items-center justify-center size-10 rounded-xl transition-colors overflow-hidden shrink-0 outline-none",
                      isExactActive
                        ? "text-primary-foreground font-bold bg-primary shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                    )}
                  />
                }
              >
                <Icon size={20} weight={isExactActive ? "Filled" : "Outline"} />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {item.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <SidebarFooter />
    </aside>
  );
}

export function MobileNav({
  userRole = "student",
  isAdmin = false,
}: {
  userRole?: "student" | "admin" | "mentor";
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  const effectiveRole = isAdmin ? "admin" : userRole;
  const navItems =
    effectiveRole === "admin"
      ? ADMIN_NAV_ITEMS
      : effectiveRole === "mentor"
        ? MENTOR_NAV_ITEMS
        : USER_NAV_ITEMS;

  const activePath = navItems
    .filter(
      (item) =>
        pathname === item.path || (item.path !== "/" && pathname.startsWith(`${item.path}/`)),
    )
    .sort((a, b) => b.path.length - a.path.length)[0]?.path;

  return (
    <div
      className="block md:hidden fixed bottom-0 inset-x-0 z-50 px-3 pointer-events-none"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
      }}
    >
      <nav
        className="w-full bg-card/95 backdrop-blur-xl border border-border shadow-md rounded-2xl flex items-stretch px-1 pointer-events-auto max-w-md mx-auto"
        style={{ height: "3.75rem" }}
      >
        {navItems.map((item: NavItem) => {
          const isActive = activePath === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1.5 transition-transform active:scale-95 outline-none relative group min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "size-9 flex items-center justify-center rounded-lg transition-colors duration-200",
                  isActive ? "bg-primary/10" : "bg-transparent",
                )}
              >
                <Icon
                  size={18}
                  weight={isActive ? "Filled" : "Outline"}
                  className="transition-transform duration-200"
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none transition-opacity duration-200 font-medium",
                  isActive ? "opacity-100 font-bold text-primary" : "opacity-60",
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
