import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 outline-none select-none"
            aria-label="Prohor"
          >
            <Logo width={110} height={36} className="h-7 sm:h-8 w-auto" priority />
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
              className="text-xs font-semibold"
            >
              লগইন
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">{children}</main>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Prohor. সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </div>
  );
}
