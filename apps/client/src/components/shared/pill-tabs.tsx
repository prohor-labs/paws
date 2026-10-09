"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export interface PillTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
}

export interface PillTabsProps<T extends string = string> {
  tabs: readonly PillTabItem<T>[] | PillTabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
  tabClassName?: string;
  size?: "sm" | "default" | "lg";
}

export function PillTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className,
  tabClassName,
  size = "default",
}: PillTabsProps<T>) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    default: "px-3.5 py-2 text-sm",
    lg: "px-4 py-2.5 text-sm md:text-base",
  };

  return (
    <div
      role="tablist"
      className={cn(
        "relative grid w-full rounded-full bg-muted/80 p-1 border border-border/60",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
      }}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative z-10 rounded-full font-semibold transition-all duration-200 cursor-pointer text-center select-none",
              sizeClasses[size],
              isSelected
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                : "text-muted-foreground hover:text-foreground",
              tabClassName,
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
