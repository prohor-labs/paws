"use client";

import { Eye } from "@/components/icons";
import { cn, toBengaliNumber } from "@/lib/utils";

interface ExamBottomBarProps {
  timeRemaining: number | null;
  onOpenQuickView: () => void;
}

export function ExamBottomBar({ timeRemaining, onOpenQuickView }: ExamBottomBarProps) {
  const isLowTime = timeRemaining !== null && timeRemaining < 60;

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${toBengaliNumber(minsStr)}:${toBengaliNumber(secsStr)}`;
  };

  return (
    <div className="fixed bottom-6 sm:bottom-7 inset-x-0 z-40 flex justify-center pointer-events-none px-4 select-none">
      <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 h-11 sm:h-12 px-5 sm:px-6 rounded-full border border-border/80 bg-card/95 dark:bg-card/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-transform">
        <div
          className={cn(
            "font-mono font-bold text-sm sm:text-base tracking-wider",
            isLowTime ? "text-destructive animate-pulse" : "text-foreground",
          )}
        >
          {formatTimer(timeRemaining)}
        </div>

        <div className="h-4 w-px bg-border/80" />

        <button
          type="button"
          aria-label="প্রশ্নের তালিকা দেখুন"
          onClick={onOpenQuickView}
          className="flex items-center justify-center size-8 sm:size-9 -mr-1 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Eye className="size-4.5 sm:size-5" />
        </button>
      </div>
    </div>
  );
}
