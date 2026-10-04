import Link from "next/link";
import type * as React from "react";
import { Refresh, TriangleWarning } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = TriangleWarning,
  title,
  description,
  actionText,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center my-6">
      <Icon className="size-10 text-muted-foreground/80 mb-3" />
      <h2 className="text-sm sm:text-base font-bold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      {actionText && actionHref && (
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={actionHref} />}
          className="mt-4 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
        >
          <Refresh className="size-3.5" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
}
