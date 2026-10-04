import type { ReactNode } from "react";
import { Plus } from "@/components/icons";
import { cn } from "@/lib/utils";

export function PlusFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "bg-card/80 backdrop-blur-md border-border/80 relative w-full !rounded-none border border-dashed shadow-xs",
        className,
      )}
    >
      <Plus
        size={12}
        className="text-foreground/60 absolute -top-[6px] -left-[6px]"
        strokeWidth={1}
        aria-hidden="true"
      />
      <Plus
        size={12}
        className="text-foreground/60 absolute -top-[6px] -right-[6px]"
        strokeWidth={1}
        aria-hidden="true"
      />
      <Plus
        size={12}
        className="text-foreground/60 absolute -bottom-[6px] -left-[6px]"
        strokeWidth={1}
        aria-hidden="true"
      />
      <Plus
        size={12}
        className="text-foreground/60 absolute -bottom-[6px] -right-[6px]"
        strokeWidth={1}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export function PlusDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("border-input relative border-t border-dashed", className)}
    >
      <Plus
        size={12}
        className="text-foreground/60 absolute -top-[6px] -left-[6px]"
        strokeWidth={1}
      />
      <Plus
        size={12}
        className="text-foreground/60 absolute -top-[6px] -right-[6px]"
        strokeWidth={1}
      />
    </div>
  );
}
