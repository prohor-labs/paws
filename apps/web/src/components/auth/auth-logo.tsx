import Image from "next/image";
import { cn } from "@/lib/utils";

export function AuthLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex size-10 shrink-0 items-center justify-center", className)}
      aria-hidden="true"
    >
      <Image
        src="/icons/paws-logo.png"
        alt="Paws Academy Logo"
        width={40}
        height={40}
        className="size-10 object-contain invert dark:invert-0"
        priority
      />
    </div>
  );
}
