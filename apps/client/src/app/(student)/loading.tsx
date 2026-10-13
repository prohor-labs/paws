import { Logo } from "@/components/shared/logo";

export default function StudentSplashLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative animate-pulse flex items-center justify-center px-4">
          <Logo width={160} height={53} className="h-10 sm:h-12 w-auto" priority />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <span className="size-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}
