import { cn } from "cn";
import Link from "next/link";
import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbStep {
  label: string;
  href?: string;
}

export interface PageBreadcrumbsProps {
  items: readonly BreadcrumbStep[];
  className?: string;
  centered?: boolean;
}

export function PageBreadcrumbs({ items, className, centered = true }: PageBreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  const hasMiddle = items.length > 2;

  return (
    <Breadcrumb className={cn("w-full", className)}>
      {/* Mobile view: Only First ... Last */}
      <BreadcrumbList className={cn("sm:hidden", centered && "justify-center text-center")}>
        {/* First Item */}
        <BreadcrumbItem>
          {items.length === 1 || !firstItem.href ? (
            <BreadcrumbPage>{firstItem.label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink render={<Link href={firstItem.href} />}>
              {firstItem.label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {/* Middle Ellipsis (if more than 2 items) */}
        {hasMiddle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </>
        )}

        {/* Last Item (if more than 1 item) */}
        {items.length > 1 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {!lastItem.href ? (
                <BreadcrumbPage>{lastItem.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={lastItem.href} />}>
                  {lastItem.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>

      {/* Desktop view: Full Breadcrumb trail */}
      <BreadcrumbList className={cn("hidden sm:flex", centered && "justify-center text-center")}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.href ?? item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.href} />}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
