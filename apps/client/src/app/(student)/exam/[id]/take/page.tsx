"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { ExamBottomBar } from "@/components/exam";
import { ArrowLeft, HelpCircle, Send, TriangleWarning } from "@/components/icons";
import { ConfirmDialog, EmptyState, PageLoading, QuestionCard } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomExamTake, useSubmitCustomExam } from "@/hooks/use-question-bank";
import { toBengaliNumber } from "@/lib/utils";

const QuestionPaletteDialog = dynamic(
  () => import("@/components/exam").then((m) => m.QuestionPaletteDialog),
  { ssr: false },
);

const ExamSubmittingOverlay = dynamic(
  () => import("@/components/exam").then((m) => m.ExamSubmittingOverlay),
  { ssr: false },
);

interface ActiveExamSessionProps {
  examId: string;
  exam: NonNullable<ReturnType<typeof useCustomExamTake>["data"]>["exam"];
  questions: NonNullable<ReturnType<typeof useCustomExamTake>["data"]>["questions"];
}

function ActiveExamSession({ examId, exam, questions }: ActiveExamSessionProps) {
  const router = useRouter();
  const submitMutation = useSubmitCustomExam(examId);
  const storageKey = `paws_exam_session_${examId}`;

  const [answers, setAnswers] = React.useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.answers || {};
      }
    } catch {}
    return {};
  });

  const [writtenAnswersState, setWrittenAnswersState] = React.useState<
    Record<string, Array<{ pageNumber: number; imageUrl: string }>>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.writtenAnswers || {};
      }
    } catch {}
    return {};
  });

  const [timeRemaining, setTimeRemaining] = React.useState<number>(() => {
    const totalSeconds = exam.durationMinutes * 60;
    if (typeof window === "undefined") return totalSeconds;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.timeRemaining === "number") {
          const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now();
          const elapsedSinceSave = Math.floor((Date.now() - savedAt) / 1000);
          return Math.max(0, parsed.timeRemaining - elapsedSinceSave);
        }
      }
    } catch {}
    return totalSeconds;
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = React.useState(false);
  const hasAutoSubmittedRef = React.useRef(false);

  // Auto-sync active state to localStorage on every change
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          answers,
          writtenAnswers: writtenAnswersState,
          timeRemaining,
          savedAt: Date.now(),
        }),
      );
    } catch {}
  }, [storageKey, answers, writtenAnswersState, timeRemaining]);

  React.useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleFinalSubmit = React.useCallback(async () => {
    if (submitMutation.isPending) return;

    const totalSeconds = exam.durationMinutes * 60;
    const timeSpentSeconds = Math.max(0, totalSeconds - timeRemaining);

    const flatWrittenAnswers = Object.entries(writtenAnswersState).flatMap(([qId, pages]) =>
      pages.map((p) => ({
        questionId: qId,
        pageNumber: p.pageNumber,
        imageUrl: p.imageUrl,
      })),
    );

    try {
      const res = await submitMutation.mutateAsync({
        answers,
        writtenAnswers: flatWrittenAnswers,
        timeSpentSeconds,
      });

      // Cleanup saved exam session from localStorage immediately upon successful submit
      try {
        localStorage.removeItem(storageKey);
      } catch {}

      if (res?.id) {
        router.push(`/exam/${examId}/solve?submissionId=${res.id}`);
      } else {
        router.push(`/exam/${examId}/solve`);
      }
    } catch {
      alert("উত্তর জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  }, [
    submitMutation,
    exam.durationMinutes,
    timeRemaining,
    answers,
    writtenAnswersState,
    storageKey,
    examId,
    router,
  ]);

  React.useEffect(() => {
    if (timeRemaining === 0 && !hasAutoSubmittedRef.current && questions.length > 0) {
      hasAutoSubmittedRef.current = true;
      handleFinalSubmit();
    }
  }, [timeRemaining, questions.length, handleFinalSubmit]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      if (prev[questionId]) return prev;
      return { ...prev, [questionId]: optionId };
    });
  };

  const scrollToQuestion = (idx: number) => {
    setIsQuickViewOpen(false);
    const element = document.getElementById(`q-card-${idx + 1}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const writtenAnsweredCount = Object.values(writtenAnswersState).filter(
    (pages) => pages.length > 0,
  ).length;
  const mcqAnsweredCount = Object.keys(answers).length;
  const answeredCount = mcqAnsweredCount + writtenAnsweredCount;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  return (
    <div className="flex flex-col gap-5 w-full pb-32">
      <ExamSubmittingOverlay
        isSubmitting={submitMutation.isPending}
        isExpired={timeRemaining === 0}
      />

      <div className="sticky top-0 z-30 -mt-3 sm:-mt-4 -mx-3 sm:-mx-6 lg:-mx-8 px-3.5 sm:px-6 py-3 bg-card/95 backdrop-blur-md border-b border-border/80 flex items-center justify-between gap-3 shadow-xs">
        <Link
          href="/qb"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors truncate min-w-0"
        >
          <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{exam.title}</span>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 font-bold">
            {toBengaliNumber(answeredCount)}/{toBengaliNumber(questions.length)} সম্পন্ন
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {questions.map((q, idx) => (
          <div key={q.id} id={`q-card-${idx + 1}`} className="scroll-mt-28">
            <QuestionCard
              question={q}
              index={idx}
              interactiveMode="live_exam"
              selectedOptionId={answers[q.id] || null}
              onSelectOption={(optId) => handleSelectOption(q.id, optId)}
              writtenPages={writtenAnswersState[q.id] || []}
              onWrittenPagesChange={(pages) =>
                setWrittenAnswersState((prev) => ({
                  ...prev,
                  [q.id]: pages,
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center pt-4 pb-8">
        <Button
          type="button"
          size="lg"
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={submitMutation.isPending}
          isLoading={submitMutation.isPending}
          className="h-12 px-8 rounded-xl font-bold shadow-md cursor-pointer gap-2"
        >
          <Send className="size-4" />
          <span>
            পরীক্ষা সাবমিট করুন ({toBengaliNumber(answeredCount)} / {toBengaliNumber(questions.length)})
          </span>
        </Button>
      </div>

      <ExamBottomBar
        timeRemaining={timeRemaining}
        onOpenQuickView={() => setIsQuickViewOpen(true)}
      />

      <QuestionPaletteDialog
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        questions={questions}
        answers={answers}
        writtenAnswers={writtenAnswersState}
        onSelectQuestion={scrollToQuestion}
        onRequestSubmit={() => setIsConfirmModalOpen(true)}
        isSubmitting={submitMutation.isPending}
      />

      <ConfirmDialog
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        title="পরীক্ষা সাবমিট নিশ্চিতকরণ"
        description="আপনি কি নিশ্চিতভাবে এই পরীক্ষাটি সাবমিট করতে চান?"
        confirmText="হ্যাঁ, সাবমিট করুন"
        cancelText="পরীক্ষায় ফিরুন"
        isLoading={submitMutation.isPending}
        onConfirm={handleFinalSubmit}
      >
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/60">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">উত্তর দেওয়া হয়েছে</span>
            <span className="text-lg font-bold text-foreground mt-0.5">
              {toBengaliNumber(answeredCount)} / {toBengaliNumber(questions.length)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">উত্তর দেওয়া বাকি</span>
            <span className="text-lg font-bold text-foreground mt-0.5">
              {toBengaliNumber(unansweredCount)} টি
            </span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
            <HelpCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>আপনার এখনও {toBengaliNumber(unansweredCount)} টি প্রশ্নের উত্তর দেওয়া বাকি রয়েছে।</span>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

export default function CustomExamTakePage() {
  const params = useParams<{ id: string }>();
  const examId = params?.id || "";

  const { data, isLoading, error } = useCustomExamTake(examId);

  const exam = data?.exam;
  const questions = data?.questions || [];

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !exam || questions.length === 0) {
    return (
      <EmptyState
        icon={TriangleWarning}
        title="পরীক্ষা লোড করা সম্ভব হয়নি"
        description="পরীক্ষাটি হয়তো খুঁজে পাওয়া যায়নি অথবা মেয়াদ শেষ হয়েছে।"
        actionText="নতুন পরীক্ষা তৈরি করুন"
        actionHref="/exam/custom"
      />
    );
  }

  return <ActiveExamSession examId={examId} exam={exam} questions={questions} />;
}
