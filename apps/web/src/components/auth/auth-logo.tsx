import { PawsLogo } from "@/components/icons";
import { cn } from "@/lib/utils";

export function AuthLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex size-10 shrink-0 items-center justify-center", className)}
      aria-hidden="true"
    >
      <PawsLogo className="size-10 text-foreground" />
    </div>
  );
}
