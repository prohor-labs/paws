"use client";
import { Send } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { cn, toBengaliNumber } from "@/lib/utils";

interface QuestionPaletteItem {
  id: string;
  topicName?: string;
  subjectName?: string;
}

interface QuestionPaletteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: QuestionPaletteItem[];
  answers: Record<string, string>;
  writtenAnswers?: Record<string, Array<{ pageNumber: number; imageUrl: string }>>;
  currentIndex?: number;
  onSelectQuestion: (index: number) => void;
  onRequestSubmit?: () => void;
  isSubmitting?: boolean;
}

export function QuestionPaletteDialog({
  open,
  onOpenChange,
  questions,
  answers,
  writtenAnswers = {},
  currentIndex,
  onSelectQuestion,
  onRequestSubmit,
  isSubmitting = false,
}: QuestionPaletteDialogProps) {
  const answeredCount = questions.filter((q) => {
    const hasMcq = Boolean(answers[q.id]);
    const hasWritten = Boolean(writtenAnswers[q.id] && writtenAnswers[q.id].length > 0);
    return hasMcq || hasWritten;
  }).length;

  const unansweredCount = questions.length - answeredCount;

  const handleSelect = (idx: number) => {
    onSelectQuestion(idx);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="প্রশ্নের তালিকা ও অবস্থা"
      description="যে কোনো নম্বরে ক্লিক করে সরাসরি সেই প্রশ্নে চলে যান।"
    >
      <div className="flex flex-col gap-5 py-2">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/60">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-foreground">
              উত্তর প্রদানকৃত:{" "}
              <strong className="text-primary">{toBengaliNumber(answeredCount)}</strong> টি
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full border border-border bg-card" />
            <span className="text-xs font-semibold text-muted-foreground">
              বাকি: <strong className="text-foreground">{toBengaliNumber(unansweredCount)}</strong>{" "}
              টি
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-[46vh] overflow-y-auto p-1">
          {questions.map((q, idx) => {
            const isAnswered =
              Boolean(answers[q.id]) ||
              Boolean(writtenAnswers[q.id] && writtenAnswers[q.id].length > 0);
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelect(idx)}
                className={cn(
                  "size-11 sm:size-12 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center border-2 cursor-pointer",
                  isCurrent && "ring-2 ring-primary ring-offset-2 scale-105",
                  isAnswered
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border/80 bg-card hover:bg-muted text-foreground hover:border-primary/40",
                )}
              >
                <span>{toBengaliNumber(idx + 1)}</span>
              </button>
            );
          })}
        </div>

        {onRequestSubmit && (
          <div className="pt-3 border-t border-border/60">
            <Button
              type="button"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onClick={() => {
                onOpenChange(false);
                onRequestSubmit();
              }}
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold shadow-sm gap-2 cursor-pointer"
            >
              <Send className="size-4" />
              <span>
                পরীক্ষা সাবমিট করুন ({toBengaliNumber(answeredCount)}/
                {toBengaliNumber(questions.length)})
              </span>
            </Button>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}
