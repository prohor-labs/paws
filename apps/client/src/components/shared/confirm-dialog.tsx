"use client";

import type * as React from "react";
import { Check, TriangleWarning } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "destructive";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "নিশ্চিত করুন",
  cancelText = "বাতিল",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <div className="flex flex-col gap-4 py-2">
        {children}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleCancel}
            className="w-full sm:w-auto h-11 sm:h-10 px-5 rounded-xl text-xs font-semibold cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleConfirm}
            className={cn(
              "w-full sm:w-auto h-11 sm:h-10 inline-flex items-center justify-center gap-1.5 px-6 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer",
              variant === "primary" && "bg-primary hover:bg-primary/90 text-primary-foreground",
            )}
          >
            {variant === "destructive" ? (
              <TriangleWarning className="size-4" />
            ) : (
              <Check className="size-4 stroke-[3]" />
            )}
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
