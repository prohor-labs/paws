"use client";

import { Search } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface TabsWithSearchProps<T extends string = string> {
  tabs: readonly TabItem<T>[] | TabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export function TabsWithSearch<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "অনুসন্ধান করুন...",
  className,
}: TabsWithSearchProps<T>) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-4 -mt-3 sm:-mt-5 border-b border-border/50 px-4 py-3 bg-background/95 backdrop-blur-md md:mx-0 md:px-0",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div className="gap-2 flex flex-wrap items-center overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 shrink-0 select-none min-h-[36px]",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-card border border-border text-foreground/80 hover:text-foreground hover:bg-muted/60",
                )}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.2 text-[10px]",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="max-md:mt-2 w-full md:w-72">
          <div className="relative text-muted-foreground focus-within:text-foreground">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="search"
              name="search"
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-4 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary min-h-[40px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
