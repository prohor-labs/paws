"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import * as React from "react";
import type { ExamSolveFilter } from "@/components/exam";
import { ArrowLeft, TriangleWarning } from "@/components/icons";
import { EmptyState, PageBreadcrumbs, PageLoading, QuestionCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCustomExamSolve } from "@/hooks/use-question-bank";
import { EMPTY_QUESTIONS, EMPTY_STRING_MAP } from "@/lib/consts/empty";

const ExamResultSummary = dynamic(
  () => import("@/components/exam").then((m) => m.ExamResultSummary),
  { ssr: false },
);

function CustomExamSolveContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const examId = params?.id || "";
  const submissionId = searchParams?.get("submissionId") || undefined;
  const isReadingMode = searchParams?.get("mode") === "reading";

  const { data, isLoading, error } = useCustomExamSolve(examId, submissionId);
  const [filter, setFilter] = React.useState<ExamSolveFilter>("all");

  const exam = data?.exam;
  const submission = data?.submission;
  const questions = data?.questions ?? EMPTY_QUESTIONS;
  const studentAnswers = data?.studentAnswers ?? EMPTY_STRING_MAP;

  const correctQuestionIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const q of questions) {
      const selected = studentAnswers[q.id];
      const correctOpt = q.options?.find((o) => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.id) {
        ids.add(q.id);
      }
    }
    return ids;
  }, [questions, studentAnswers]);

  const wrongQuestionIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const q of questions) {
      const selected = studentAnswers[q.id];
      const correctOpt = q.options?.find((o) => o.isCorrect);
      if (selected && correctOpt && selected !== correctOpt.id) {
        ids.add(q.id);
      }
    }
    return ids;
  }, [questions, studentAnswers]);

  const unansweredQuestionIds = React.useMemo(() => {
    const ids = new Set<string>();
    for (const q of questions) {
      if (!studentAnswers[q.id]) {
        ids.add(q.id);
      }
    }
    return ids;
  }, [questions, studentAnswers]);

  const writtenSubmissionsByQuestion = React.useMemo(() => {
    const map: Record<string, NonNullable<typeof data>["writtenSubmissions"]> = {};
    if (data?.writtenSubmissions) {
      for (const w of data.writtenSubmissions) {
        if (!map[w.questionId]) {
          map[w.questionId] = [];
        }
        map[w.questionId]?.push(w);
      }
    }
    return map;
  }, [data?.writtenSubmissions]);

  const filteredQuestions = React.useMemo(() => {
    if (isReadingMode) {
      return questions;
    }
    if (filter === "correct") {
      return questions.filter((q) => correctQuestionIds.has(q.id));
    }
    if (filter === "wrong") {
      return questions.filter((q) => wrongQuestionIds.has(q.id));
    }
    if (filter === "unanswered") {
      return questions.filter((q) => unansweredQuestionIds.has(q.id));
    }
    return questions;
  }, [
    questions,
    filter,
    correctQuestionIds,
    wrongQuestionIds,
    unansweredQuestionIds,
    isReadingMode,
  ]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !exam || questions.length === 0) {
    return (
      <EmptyState
        icon={TriangleWarning}
        title={isReadingMode ? "প্রশ্ন পাওয়া যায়নি" : "ফলাফল পাওয়া যায়নি"}
        description={
          isReadingMode ? "এই পরীক্ষার প্রশ্নগুলো লোড করা সম্ভব হয়নি।" : "এই পরীক্ষার সমাধান লোড করা সম্ভব হয়নি।"
        }
        actionText="নতুন পরীক্ষা তৈরি করুন"
        actionHref="/exam/custom"
      />
    );
  }

  const accuracy =
    questions.length > 0 ? Math.round((correctQuestionIds.size / questions.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      {isReadingMode ? (
        <div className="sticky top-14 sm:top-16 z-30 -mt-2 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-background/95 backdrop-blur-md border-b border-border/50 flex items-center justify-between gap-3">
          <Link
            href="/qb"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className="truncate">{exam.title} (প্রশ্ন দেখুন)</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/exam/${examId}/take?mode=taking`}>
              <Button size="sm" className="h-8 rounded-lg text-xs font-bold gap-1.5 cursor-pointer">
                <span>পরীক্ষা দিন</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <PageBreadcrumbs
            items={[
              { label: "হোম", href: "/" },
              { label: "কাস্টম এক্সাম", href: "/exam/custom" },
              { label: "ফলাফল ও সমাধান" },
            ]}
          />

          <ExamResultSummary
            exam={exam}
            submission={submission || null}
            totalQuestions={questions.length}
            accuracy={accuracy}
            filter={filter}
            onFilterChange={setFilter}
            correctCount={correctQuestionIds.size}
            wrongCount={wrongQuestionIds.size}
            unansweredCount={unansweredQuestionIds.size}
          />
        </>
      )}

      <div className="flex flex-col gap-4">
        {filteredQuestions.length === 0 ? (
          <EmptyState
            icon={TriangleWarning}
            title="কোনো প্রশ্ন পাওয়া যায়নি"
            description="এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।"
          />
        ) : (
          filteredQuestions.map((q, idx) => {
            const originalIndex = questions.findIndex((orig) => orig.id === q.id);
            const selectedOptId = isReadingMode ? null : studentAnswers[q.id] || null;
            const scripts = writtenSubmissionsByQuestion[q.id] || [];

            return (
              <QuestionCard
                key={q.id}
                question={q}
                index={originalIndex >= 0 ? originalIndex : idx}
                interactiveMode="practice"
                showAnswer={true}
                selectedOptionId={selectedOptId}
                evaluatedScripts={scripts}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default function CustomExamSolvePage() {
  return (
    <React.Suspense fallback={<PageLoading />}>
      <CustomExamSolveContent />
    </React.Suspense>
  );
}
