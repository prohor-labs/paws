import type * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuickListTag {
  icon?: React.ReactNode;
  text: React.ReactNode;
  variant?: "destructive" | "secondary" | "default" | "primary" | "outline";
}

export interface QuickListItem {
  id?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  logoUrl?: string | null;
  icon?: React.ReactNode;
  fallbackText?: string;
  badgeText?: React.ReactNode;
  badgeVariant?: "success" | "destructive" | "warning" | "default" | "secondary" | "primary";
  tags?: QuickListTag[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

export interface QuickListProps {
  items: QuickListItem[];
  className?: string;
  emptyMessage?: string;
}

export function QuickList({ items, className, emptyMessage }: QuickListProps) {
  if (items.length === 0 && emptyMessage) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 border border-dashed border-border rounded-2xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {items.map((item) => {
        const isSuccess = item.badgeVariant === "success";
        const isDestructive = item.badgeVariant === "destructive";
        const isWarning = item.badgeVariant === "warning";
        const isPrimary = item.badgeVariant === "primary" || item.badgeVariant === "default";
        const itemKey =
          item.id != null ? String(item.id) : typeof item.title === "string" ? item.title : "item";

        return (
          <Card
            key={itemKey}
            onClick={item.onClick}
            className={cn(
              "group relative py-0 gap-0 rounded-2xl border border-border/80 bg-card/95 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-sm",
              isSuccess && "hover:border-emerald-500/50",
              isWarning && "hover:border-amber-500/50",
              isDestructive && "hover:border-destructive/50",
              item.onClick && "cursor-pointer active:scale-[0.995]",
            )}
          >
            <CardContent className="p-3.5 sm:p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {(item.logoUrl || item.icon || item.fallbackText) && (
                    <Avatar className="size-10 rounded-xl border border-border/70 shrink-0 mt-0.5 shadow-2xs group-hover:border-primary/40 transition-colors">
                      {item.logoUrl ? (
                        <AvatarImage
                          src={item.logoUrl}
                          alt={typeof item.title === "string" ? item.title : "Avatar"}
                        />
                      ) : null}
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary rounded-xl">
                        {item.icon || item.fallbackText?.[0] || "P"}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-foreground leading-snug break-words line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-muted-foreground font-normal leading-tight break-words line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {item.badgeText && (
                    <span
                      className={cn(
                        "text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 transition-colors",
                        isSuccess &&
                          "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                        isWarning &&
                          "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
                        isDestructive && "text-destructive bg-destructive/10 border-destructive/20",
                        isPrimary && "text-primary bg-primary/10 border-primary/20",
                        !isSuccess &&
                          !isWarning &&
                          !isDestructive &&
                          !isPrimary &&
                          "text-muted-foreground bg-muted/60 border-border/80",
                      )}
                    >
                      {item.badgeText}
                    </span>
                  )}
                  {item.actions}
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
                  {item.tags.map((tag, tagIndex) => {
                    const tagKey = typeof tag.text === "string" ? tag.text : `tag-${tagIndex}`;
                    return (
                      <span
                        key={tagKey}
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg border transition-colors",
                          tag.variant === "destructive"
                            ? "text-destructive bg-destructive/5 border-destructive/15"
                            : tag.variant === "primary"
                              ? "text-primary bg-primary/10 border-primary/20"
                              : "text-muted-foreground bg-muted/40 border-border/60",
                        )}
                      >
                        {tag.icon}
                        {tag.text}
                      </span>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default QuickList;
