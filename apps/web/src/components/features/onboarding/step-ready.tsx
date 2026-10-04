"use client";

import { Sparkle, User as UserIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LEVEL_OPTIONS, SCHEDULE_OPTIONS, TRACK_PRESETS } from "@/lib/consts/onboarding";

interface StepReadyProps {
  fullName: string;
  email: string;
  avatarUrl: string;
  selectedLevel: string;
  selectedSubjects: string[];
  selectedSchedule: string;
  onGoToDashboard: () => void;
  isLoading?: boolean;
}

export function StepReady({
  fullName,
  email,
  avatarUrl,
  selectedLevel,
  selectedSubjects,
  selectedSchedule,
  onGoToDashboard,
  isLoading,
}: StepReadyProps) {
  const levelOption = LEVEL_OPTIONS.find((l) => l.id === selectedLevel);
  const scheduleOption = SCHEDULE_OPTIONS.find((s) => s.id === selectedSchedule);
  const selectedSubjectSet = new Set(selectedSubjects);
  const activeTrack =
    TRACK_PRESETS.find(
      (preset) =>
        preset.subjects.length === selectedSubjects.length &&
        preset.subjects.every((s) => selectedSubjectSet.has(s)),
    ) || TRACK_PRESETS[0];

  return (
    <div className="flex flex-col gap-6 py-1">
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          অভিনন্দন, {fullName || "শিক্ষার্থী"}!
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          আপনার প্রোফাইল ও পড়াশোনার ট্র্যাক প্রস্তুত করা হয়েছে। নিচে আপনার সারাংশ দেখে নিন।
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/90 bg-card p-5 shadow-xs">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          <Avatar className="size-14 border-2 border-border shadow-2xs">
            <AvatarImage src={avatarUrl || undefined} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
              {fullName?.[0] || <UserIcon size={18} />}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold text-foreground truncate">
              {fullName || "ব্যবহারকারী"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {email || "অ্যাকাউন্ট সক্রিয়"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              শিক্ষাগত স্তর
            </span>
            <p className="text-sm font-semibold text-foreground">
              {levelOption?.label || selectedLevel}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              দৈনিক লক্ষ্য
            </span>
            <p className="text-sm font-semibold text-foreground">
              {scheduleOption?.label || "১ ঘণ্টা / দিন"}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/60 space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            নির্বাচিত ট্র্যাক
          </span>
          <p className="text-sm font-bold text-foreground">{activeTrack.label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeTrack.subjectsSummary}
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={onGoToDashboard}
        disabled={isLoading}
        className="h-11 w-full rounded-xl gap-2 text-sm font-semibold shadow-xs"
      >
        {isLoading ? (
          <Spinner className="size-4" />
        ) : (
          <>
            <Sparkle size={16} />
            <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
          </>
        )}
      </Button>
    </div>
  );
}
