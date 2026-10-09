import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ListCardMetaItem {
  id?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  value: React.ReactNode;
}

export interface ListCardAction {
  id?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  href?: string;
  onClick?: () => void;
  target?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export interface ListCardProps {
  id?: string | number;
  title: React.ReactNode;
  icon?: React.ReactNode;
  badges?: Array<{
    id?: string;
    label: React.ReactNode;
    variant?: "default" | "secondary" | "outline" | "destructive";
    className?: string;
  }>;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  metaItems?: ListCardMetaItem[];
  footerNote?: React.ReactNode;
  actions?: ListCardAction[];
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
}

export function ListCard({
  title,
  icon,
  badges = [],
  subtitle,
  description,
  metaItems = [],
  footerNote,
  actions = [],
  className,
  contentClassName,
  onClick,
}: ListCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "py-0 gap-0 border-border/80 shadow-xs hover:border-primary/40 transition-colors bg-card",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <CardContent className={cn("p-4 sm:p-5 flex flex-col gap-3.5", contentClassName)}>
        <div className="flex items-start gap-3 w-full">
          {icon && <div className="shrink-0 pt-0.5">{icon}</div>}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-base font-bold text-foreground hover:text-primary transition-colors">
                {title}
              </div>
              {badges.map((badge) => {
                const bKey =
                  badge.id ||
                  (typeof badge.label === "string" || typeof badge.label === "number"
                    ? `badge-${badge.label}`
                    : `badge-${badge.variant || "default"}`);
                return (
                  <Badge
                    key={bKey}
                    variant={badge.variant || "secondary"}
                    className={cn("text-xs px-2 py-0.5 font-medium", badge.className)}
                  >
                    {badge.label}
                  </Badge>
                );
              })}
            </div>

            {subtitle && (
              <div className="text-xs text-muted-foreground line-clamp-2">{subtitle}</div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
            )}

            {metaItems.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5 flex-wrap">
                {metaItems.map((meta) => {
                  const mKey =
                    meta.id ||
                    (typeof meta.label === "string"
                      ? `meta-${meta.label}`
                      : typeof meta.value === "string" || typeof meta.value === "number"
                        ? `meta-${meta.value}`
                        : undefined);
                  return (
                    <div key={mKey} className="flex items-center gap-1.5 shrink-0">
                      {meta.icon && <span className="text-primary shrink-0">{meta.icon}</span>}
                      <span>
                        {meta.label && <span className="text-muted-foreground">{meta.label} </span>}
                        <strong className="text-foreground font-medium">{meta.value}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {footerNote && <div className="text-xs text-muted-foreground pt-0.5">{footerNote}</div>}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 pt-1 border-t border-border/40 sm:border-t-0 sm:pt-0">
            {actions.map((action, idx) => {
              const btnKey =
                action.id ||
                (typeof action.label === "string"
                  ? `action-${action.label}`
                  : action.href
                    ? `action-${action.href}`
                    : undefined);
              const btnContent = (
                <Button
                  key={btnKey}
                  size="sm"
                  variant={action.variant || (idx === actions.length - 1 ? "default" : "outline")}
                  disabled={action.disabled}
                  isLoading={action.isLoading}
                  onClick={action.onClick}
                  className="w-full sm:w-auto gap-1.5 font-medium text-xs cursor-pointer h-8.5"
                >
                  {action.icon && <span className="shrink-0">{action.icon}</span>}
                  <span>{action.label}</span>
                </Button>
              );

              if (action.href) {
                return (
                  <a
                    key={btnKey}
                    href={action.href}
                    target={action.target || "_blank"}
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto block"
                  >
                    {btnContent}
                  </a>
                );
              }

              return <React.Fragment key={btnKey}>{btnContent}</React.Fragment>;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ListCard;
