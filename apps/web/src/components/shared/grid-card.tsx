"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { GridCardProps } from "@/types";
import { GridCover } from "./grid-cover";

export type { GridCardProps };

export function GridCard({
  href,
  title,
  badge,
  isLive,
  eventLabel,
  className,
  showTitle = false,
  actionText,
  subtitle,
  category,
  variant,
}: GridCardProps) {
  return (
    <Link
      href={href}
      data-event={eventLabel || title}
      className={cn(
        "group relative block w-full outline-none transition-transform duration-200 active:scale-98",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card border border-border shadow-2xs transition-[border-color,box-shadow] duration-200 group-hover:border-primary/50 group-hover:shadow-xs">
        <GridCover
          title={title}
          subtitle={subtitle}
          category={category}
          variant={variant}
          className="transition-transform duration-300 group-hover:scale-105"
        />

        {isLive ? (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1.5 rounded-md bg-destructive px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs animate-pulse">
              <span className="size-1.5 rounded-full bg-white animate-ping" />
              Live
            </div>
          </div>
        ) : badge ? (
          <div className="absolute top-2 right-2 z-10">
            <span className="rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-white shadow-xs">
              {badge}
            </span>
          </div>
        ) : null}

        {actionText && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
            <div className="flex items-center justify-between rounded-lg bg-black/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-white/10 transition-colors duration-200 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground">
              <span>{actionText}</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {showTitle && (
        <div className="mt-2 flex flex-col">
          <h3 className="font-sans text-xs md:text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {subtitle && (
            <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
