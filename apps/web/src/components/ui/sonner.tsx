"use client";

import {
  CheckCircle as CircleCheckIcon,
  InfoCircle as InfoIcon,
  Loader as Loader2Icon,
  XCircle as OctagonXIcon,
  TriangleWarning as TriangleAlertIcon,
} from "@/components/icons";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans",
          title: "font-sans",
          description: "font-sans",
          actionButton: "font-sans",
          cancelButton: "font-sans",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
