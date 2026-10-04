import { BookOpen, Clock, DocumentText, Play } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { toBengaliNumber } from "@/lib/utils";
import type { ExamSet } from "./exam-wise-view";

interface ExamActionDialogProps {
  exam: ExamSet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartExam: (exam: ExamSet) => void;
  onReadExam: (exam: ExamSet) => void;
  isStarting?: boolean;
}

function formatDurationBengali(minutes: number) {
  if (minutes === 60) return "১ ঘন্টা";
  if (minutes === 100) return "১ ঘন্টা ৪০ মিনিট";
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    if (remMinutes === 0) return `${toBengaliNumber(hours)} ঘন্টা`;
    return `${toBengaliNumber(hours)} ঘন্টা ${toBengaliNumber(remMinutes)} মিনিট`;
  }
  return `${toBengaliNumber(minutes)} মিনিট`;
}

export function ExamActionDialog({
  exam,
  open,
  onOpenChange,
  onStartExam,
  onReadExam,
  isStarting,
}: ExamActionDialogProps) {
  if (!exam) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={exam.title}
      description="আপনি কি সরাসরি পরীক্ষা দিতে চান নাকি সমাধানসহ প্রশ্ন দেখতে চান?"
    >
      <div className="flex flex-col items-center gap-5 pt-2 pb-2">
        <div className="flex flex-row items-center justify-center gap-6 w-full py-3.5 px-5 rounded-2xl bg-muted/40 border border-border/70 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="size-4.5 text-destructive shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              {formatDurationBengali(exam.durationMinutes)}
            </span>
          </div>

          <div className="h-4 w-px bg-border/80" />

          <div className="flex items-center gap-2">
            <DocumentText className="size-4.5 text-primary shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              {toBengaliNumber(exam.questionCount)} টি প্রশ্ন
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full gap-2.5 mt-1">
          <Button
            type="button"
            size="lg"
            onClick={() => onStartExam(exam)}
            disabled={isStarting}
            isLoading={isStarting}
            className="w-full h-11 rounded-xl text-sm font-bold shadow-xs cursor-pointer gap-2"
          >
            <Play className="size-4" />
            <span>পরীক্ষা শুরু করো</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onReadExam(exam)}
            disabled={isStarting}
            className="w-full h-11 rounded-xl text-sm font-semibold border-border bg-card/60 hover:bg-muted/50 cursor-pointer gap-2"
          >
            <BookOpen className="size-4" />
            <span>প্রশ্ন দেখো</span>
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
