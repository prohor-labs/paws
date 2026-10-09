"use client";

import { Check, Sparkle } from "@/components/icons";
import { TRACK_PRESETS } from "@/lib/consts/onboarding";
import { cn } from "@/lib/utils";

interface StepSubjectsProps {
  selectedSubjects: string[];
  onSetSubjects: (subjects: string[]) => void;
}

export function StepSubjects({ selectedSubjects, onSetSubjects }: StepSubjectsProps) {
  const selectedSubjectSet = new Set(selectedSubjects);
  const activePreset =
    TRACK_PRESETS.find(
      (preset) =>
        preset.subjects.length === selectedSubjects.length &&
        preset.subjects.every((s) => selectedSubjectSet.has(s)),
    ) || TRACK_PRESETS[0];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-3">
        {TRACK_PRESETS.map((preset) => {
          const isSelected = activePreset?.id === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSetSubjects([...preset.subjects])}
              className={cn(
                "flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-colors outline-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
                  : "border-border/80 bg-card hover:bg-muted/30 hover:border-border",
              )}
            >
              <div className="flex flex-col gap-1.5 min-w-0 pr-3">
                <span className="text-sm font-bold text-foreground">{preset.label}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {preset.subtitle}
                </span>
                <div className="pt-1 text-xs font-medium text-foreground/80">
                  {preset.subjectsSummary}
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
        <span>নির্বাচিত ট্র্যাক অনুযায়ী আপনার জন্য প্রশ্নব্যাংক ও পরীক্ষা তৈরি করা হবে।</span>
      </div>
    </div>
  );
}
