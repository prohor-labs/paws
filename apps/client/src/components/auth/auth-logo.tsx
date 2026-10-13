import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function AuthLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center py-1", className)}
      aria-hidden="true"
    >
      <Logo width={140} height={46} className="h-9 sm:h-10 w-auto" priority />
    </div>
  );
}
