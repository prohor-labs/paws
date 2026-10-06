"use client";

import type React from "react";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { cn } from "@/lib/utils";

export interface ActionSheetItem {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ActionSheetGroup {
  items: ActionSheetItem[];
}

export interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  trigger?: React.ReactNode;
  items?: ActionSheetItem[];
  groups?: ActionSheetGroup[];
  headerContent?: React.ReactNode;
  className?: string;
}

/**
 * Instagram Threads-styled ActionSheet.
 * Clean, grouped pill cards with high-contrast active states, subtle borders, and rounded corners.
 */
export function ActionSheet({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  items,
  groups,
  headerContent,
  className,
}: ActionSheetProps) {
  // Normalize items into groups if only items are provided
  const normalizedGroups: ActionSheetGroup[] = groups ?? (items ? [{ items }] : []);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      className={cn("sm:max-w-[380px] p-4 bg-background/95 backdrop-blur-xl", className)}
    >
      <div className="flex flex-col gap-3 py-1">
        {headerContent && (
          <div className="rounded-2xl bg-muted/40 p-3.5 border border-border/40">
            {headerContent}
          </div>
        )}

        {normalizedGroups.map((group, groupIndex) => {
          const groupKey = `group-${groupIndex}`;
          return (
            <div
              key={groupKey}
              className="flex flex-col rounded-2xl bg-muted/40 dark:bg-muted/30 border border-border/40 overflow-hidden divide-y divide-border/30"
            >
              {group.items.map((item) => {
                const Icon = item.icon;
                const itemKey = item.label;
                return (
                  <button
                    key={itemKey}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      onOpenChange(false);
                    }}
                    className={cn(
                      "group flex items-center justify-between gap-3 w-full px-4 py-3.5 text-sm font-semibold transition-all text-left cursor-pointer",
                      "hover:bg-muted/80 active:bg-muted/90 active:scale-[0.995]",
                      item.destructive
                        ? "text-destructive hover:bg-destructive/10 active:bg-destructive/15"
                        : "text-foreground",
                      item.disabled && "opacity-40 pointer-events-none",
                    )}
                  >
                    <div className="flex flex-col flex-1 min-w-0 pr-1">
                      <span className="truncate leading-snug">{item.label}</span>
                      {item.description && (
                        <span className="text-[11px] text-muted-foreground font-normal leading-tight mt-0.5 truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                    {Icon && (
                      <Icon
                        className={cn(
                          "size-4.5 shrink-0 transition-transform group-hover:scale-110 opacity-70 group-hover:opacity-100",
                          item.destructive ? "text-destructive" : "text-foreground",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </ResponsiveDialog>
  );
}
