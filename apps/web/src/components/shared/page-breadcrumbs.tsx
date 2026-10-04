import { cn } from "cn";
import Link from "next/link";
import * as React from "react";
import {
  Breadcrumb,
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

  return (
    <Breadcrumb className={cn("w-full", className)}>
      <BreadcrumbList className={cn(centered && "justify-center text-center")}>
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
