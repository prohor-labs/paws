"use client";

import { Spinner } from "@/components/ui/spinner";

interface ExamSubmittingOverlayProps {
  isSubmitting: boolean;
  isExpired?: boolean;
}

export function ExamSubmittingOverlay({
  isSubmitting,
  isExpired = false,
}: ExamSubmittingOverlayProps) {
  if (!isSubmitting && !isExpired) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300 select-none">
      <Spinner className="size-14 sm:size-16 text-primary" />
      <div className="flex flex-col items-center gap-1.5 text-center px-4 max-w-sm">
        <h3 className="text-lg sm:text-xl font-black text-primary tracking-tight">
          {isExpired ? "সময় শেষ!" : "সাবমিট হচ্ছে..."}
        </h3>
        <p className="text-muted-foreground font-medium text-xs sm:text-sm">
          {isExpired
            ? "আপনার উত্তরগুলো স্বয়ংক্রিয়ভাবে জমা দেওয়া হচ্ছে"
            : "আপনার উত্তরপত্র মূল্যায়ন করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন"}
        </p>
      </div>
    </div>
  );
}
