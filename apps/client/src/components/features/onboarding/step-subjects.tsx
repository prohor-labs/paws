"use client";

import { Check, Sparkle } from "@/components/icons";
import { type EducationalStandard, STREAM_OPTIONS_BY_STANDARD } from "@/lib/consts/onboarding";
import { cn } from "@/lib/utils";

interface StepSubjectsProps {
  selectedLevel: EducationalStandard;
  selectedStream: string;
  onSelectStream: (streamId: string) => void;
}

export function StepSubjects({
  selectedLevel,
  selectedStream,
  onSelectStream,
}: StepSubjectsProps) {
  const streamOptions = STREAM_OPTIONS_BY_STANDARD[selectedLevel] ?? STREAM_OPTIONS_BY_STANDARD.hsc;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-3">
        {streamOptions.map((stream) => {
          const isSelected = selectedStream === stream.id;

          return (
            <button
              key={stream.id}
              type="button"
              onClick={() => onSelectStream(stream.id)}
              className={cn(
                "flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-colors outline-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
                  : "border-border/80 bg-card hover:bg-muted/30 hover:border-border",
              )}
            >
              <div className="flex flex-col gap-1.5 min-w-0 pr-3">
                <span className="text-sm font-bold text-foreground">{stream.label}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {stream.subtitle}
                </span>
                <div className="pt-1 text-xs font-medium text-foreground/80">
                  {stream.subjectsSummary}
                </div>
              </div>

              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors mt-0.5",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-transparent",
                )}
              >
                {isSelected ? <Check size={12} /> : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
        <Sparkle size={13} className="text-primary shrink-0" />
        <span>নির্বাচিত বিভাগ অনুযায়ী আপনার প্রশ্নব্যাংক এবং কাস্টম পরীক্ষা স্বয়ংক্রিয়ভাবে ফিল্টার হবে।</span>
      </div>
    </div>
  );
}
