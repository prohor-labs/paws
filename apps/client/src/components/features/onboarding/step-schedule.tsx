"use client";

import { Check, Clock } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { SCHEDULE_OPTIONS } from "@/lib/consts/onboarding";
import { cn } from "@/lib/utils";

interface StepScheduleProps {
  selectedSchedule: string;
  enableDailyReminder: boolean;
  onSelectSchedule: (scheduleId: string) => void;
  onToggleDailyReminder: (enable: boolean) => void;
}

export function StepSchedule({
  selectedSchedule,
  enableDailyReminder,
  onSelectSchedule,
  onToggleDailyReminder,
}: StepScheduleProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        {SCHEDULE_OPTIONS.map((option) => {
          const isSelected = selectedSchedule === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectSchedule(option.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all outline-none",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-2xs"
                  : "border-border/80 bg-card hover:bg-muted/30 hover:border-border",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Clock size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ml-2",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 bg-transparent",
                )}
              >
                {isSelected ? <Check size={12} /> : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card/60">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-foreground">দৈনিক স্টাডি রিমাইন্ডার</span>
          <span className="text-xs text-muted-foreground">
            পরীক্ষার প্রস্তুতি এবং স্ট্রিক বজায় রাখার জন্য বিজ্ঞপ্তি পাঠান
          </span>
        </div>
        <Switch
          checked={enableDailyReminder}
          onCheckedChange={onToggleDailyReminder}
          aria-label="দৈনিক রিমাইন্ডার চালু করুন"
        />
      </div>
    </div>
  );
}
