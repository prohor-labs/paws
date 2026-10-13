import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends Omit<ComponentPropsWithoutRef<typeof Image>, "src" | "alt"> {
  alt?: string;
  invertInLight?: boolean;
}

export function Logo({
  alt = "Prohor",
  width = 120,
  height = 40,
  className,
  invertInLight = true,
  priority = false,
  ...props
}: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "h-auto w-auto object-contain select-none",
        invertInLight && "invert dark:invert-0",
        className,
      )}
      {...props}
    />
  );
}
