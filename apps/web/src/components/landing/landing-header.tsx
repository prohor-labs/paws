"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, X as CloseIcon, PawsLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { LANDING_NAV_LINKS } from "@/lib/consts/landing";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroThreshold = window.innerHeight * 0.4;
      setScrolled(window.scrollY > heroThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "translate-y-0 opacity-100 border-b border-border/40 bg-background/80 backdrop-blur-md"
          : "-translate-y-full opacity-0 pointer-events-none border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="#home" className="group flex items-center outline-none" aria-label="PAWS হোম">
          <div className="relative flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/60 p-1.5 transition-transform duration-300 group-hover:scale-105">
            <PawsLogo className="size-6 text-foreground" />
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="প্রধান নেভিগেশন">
          {LANDING_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Button
            variant="default"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
            className="font-medium"
          >
            লগইন
            <ArrowRight data-icon="inline-end" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
          >
            {mobileMenuOpen ? <CloseIcon /> : <ArrowDown />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="flex flex-col gap-3 border-b border-border/50 bg-background/95 px-6 pt-2 pb-6 backdrop-blur-xl md:hidden">
          {LANDING_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-base font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
