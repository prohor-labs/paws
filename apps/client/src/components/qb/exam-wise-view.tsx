import { Clock, DocumentText, Search } from "@/components/icons";
import { EmptyState } from "@/components/shared";
import { toBengaliNumber } from "@/lib/utils";
import type { QBQuestion } from "@/types";

export interface ExamSet {
  id: string;
  slug?: string;
  title: string;
  year?: number;
  orderIndex?: number;
  type: "mcq" | "written" | "mixed";
  durationMinutes: number;
  questionCount: number;
  questions: QBQuestion[];
}

interface ExamWiseViewProps {
  examSearch: string;
  onSearchChange: (value: string) => void;
  filteredExamSets: ExamSet[];
  onStartSetExam: (exam: ExamSet) => void;
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

export function ExamWiseView({
  examSearch,
  onSearchChange,
  filteredExamSets,
  onStartSetExam,
}: ExamWiseViewProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-border/40">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="size-4" />
          </div>
          <input
            type="text"
            aria-label="পরীক্ষা খুঁজো"
            placeholder="পরীক্ষা খুঁজো..."
            value={examSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>
      </div>

      {filteredExamSets.length === 0 ? (
        <EmptyState
          title="কোনো পরীক্ষা পাওয়া যায়নি"
          description="অনুসন্ধানের সাথে মিলে এমন কোনো পরীক্ষা নেই।"
        />
      ) : (
        <div className="grid gap-2.5 mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredExamSets.map((exam) => (
            <button
              key={exam.id}
              type="button"
              onClick={() => onStartSetExam(exam)}
              className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 text-left transition-[border-color,box-shadow,transform] hover:border-primary/50 hover:shadow-xs active:translate-y-px group cursor-pointer"
            >
              <div className="w-full">
                <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {exam.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 pt-3 mt-2 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5 pr-3 border-r border-border/60">
                  <Clock className="size-4 text-destructive shrink-0" />
                  <span>{formatDurationBengali(exam.durationMinutes)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DocumentText className="size-4 text-primary shrink-0" />
                  <span>{toBengaliNumber(exam.questionCount)} টি প্রশ্ন</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
