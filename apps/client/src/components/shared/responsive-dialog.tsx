"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ResponsiveDialogProps } from "@/types";

export type { ResponsiveDialogProps };

export function ResponsiveDialog({
  open,
  onOpenChange,
  onOpenChangeComplete,
  trigger,
  title,
  description,
  children,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const justClosedRef = React.useRef(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      justClosedRef.current = true;
      setTimeout(() => {
        justClosedRef.current = false;
        onOpenChangeComplete?.(false);
      }, 300);
    } else {
      setTimeout(() => {
        onOpenChangeComplete?.(true);
      }, 300);
    }
    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        {trigger && <DrawerTrigger render={<button type="button" />}>{trigger}</DrawerTrigger>}
        <DrawerContent
          className={cn(
            "px-4 pb-6 pt-2 max-h-[90vh] flex flex-col outline-none rounded-t-3xl border-t border-border/80 shadow-2xl",
            className,
          )}
        >
          {(title || description) && (
            <DrawerHeader className="text-center px-0 pt-1 pb-3 shrink-0">
              {title && (
                <DrawerTitle className="text-lg font-bold text-foreground">{title}</DrawerTitle>
              )}
              {description && (
                <DrawerDescription className="text-xs text-muted-foreground">
                  {description}
                </DrawerDescription>
              )}
            </DrawerHeader>
          )}
          <div className="overflow-y-auto overscroll-contain flex-1 -mx-2 px-2 pb-2">
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger render={<button type="button" />}>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "sm:max-w-lg sm:p-6 sm:rounded-3xl flex flex-col max-h-[88vh] overflow-hidden gap-3 border border-border/80 shadow-2xl",
          className,
        )}
      >
        {(title || description) && (
          <DialogHeader className="text-center sm:text-center px-0 pb-1 shrink-0">
            {title && (
              <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-center text-xs text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="overflow-y-auto overscroll-contain flex-1 -mx-2 px-2 pb-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
