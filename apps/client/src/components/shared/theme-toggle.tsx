"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
  AnimatedThemeToggler,
  type TransitionVariant,
} from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

interface ThemeToggleProps {
  className?: string;
  variant?: TransitionVariant;
}

export function ThemeToggle({ className, variant = "circle" }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        className={cn("size-10 rounded-xl bg-muted/40 border border-border/40 shrink-0", className)}
      />
    );
  }

  const currentTheme = (resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark";

  return (
    <AnimatedThemeToggler
      theme={currentTheme}
      onThemeChange={(newTheme) => setTheme(newTheme)}
      variant={variant}
      className={cn(
        "relative flex size-10 items-center justify-center rounded-xl text-foreground transition-colors duration-200 hover:bg-accent/40 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 [&_svg]:size-4.5",
        className,
      )}
      aria-label="থিম পরিবর্তন করুন"
    />
  );
}
