import type { ComponentType, ReactNode } from "react";

export type * from "@/lib/api/types";

export interface NavItem {
  name: string;
  path: string;
  icon: ComponentType<{
    size?: number | string;
    color?: string;
    weight?: "Outline" | "Filled";
    className?: string;
  }>;
}

export interface ResponsiveDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface GridCardProps {
  href: string;
  title: string;
  badge?: string | null;
  isLive?: boolean;
  eventLabel?: string;
  className?: string;
  showTitle?: boolean;
  actionText?: string;
  subtitle?: string;
  category?: string;
  variant?: string;
}

export interface RichTextProps {
  content: string;
  className?: string;
}
