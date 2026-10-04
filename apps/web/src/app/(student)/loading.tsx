import Image from "next/image";

export default function StudentSplashLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative size-14 sm:size-16 animate-pulse">
          <Image
            src="/icons/paws-logo.png"
            alt="Paws Academy"
            fill
            priority
            sizes="64px"
            className="object-contain"
          />
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
