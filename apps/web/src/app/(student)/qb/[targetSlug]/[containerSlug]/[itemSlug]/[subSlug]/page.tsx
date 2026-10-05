"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, BookOpen, PenLine } from "@/components/icons";
import type { QuestionTypeFilter } from "@/components/qb";
import { TopicWiseView } from "@/components/qb";
import { EmptyState, PageBreadcrumbs, PageLoading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  useCreateCustomExam,
  useQBChapterDetail,
  useQBItemDetail,
} from "@/hooks/use-question-bank";
import { EMPTY_QUESTIONS, EMPTY_TOPICS } from "@/lib/consts/empty";
import { toBengaliNumber } from "@/lib/utils";

export default function QBSubSlugPage() {
  const router = useRouter();
  const params = useParams<{
    targetSlug: string;
    containerSlug: string;
    itemSlug: string;
    subSlug: string;
  }>();
  const targetSlug = params?.targetSlug || "";
  const containerSlug = params?.containerSlug || "";
  const itemSlug = params?.itemSlug || "";
  const subSlug = params?.subSlug || "all";

  const { data: itemData } = useQBItemDetail(targetSlug, containerSlug, itemSlug);
  const target = itemData?.target;
  const container = itemData?.container;
  const item = itemData?.item;
  const subject = itemData?.subject;

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = React.useState<string>("all");
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("all");
  const [qTypeFilter, setQTypeFilter] = React.useState<QuestionTypeFilter>("all");
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const matchedExamSheet = React.useMemo(() => {
    return itemData?.examSheets?.find((es) => es.slug === subSlug || es.id === subSlug) ?? null;
  }, [itemData?.examSheets, subSlug]);

  const matchedChapter = React.useMemo(() => {
    return itemData?.chapters?.find((ch) => ch.slug === subSlug || ch.id === subSlug) ?? null;
  }, [itemData?.chapters, subSlug]);

  const effectiveSubjectSlug = subject?.slug || itemSlug;
  const effectiveChapterSlug = matchedChapter?.slug || "all";

  const queryParams = React.useMemo(
    () => ({
      page: currentPage,
      limit: 100,
      targetSlug,
      examSheet: matchedExamSheet ? matchedExamSheet.slug || matchedExamSheet.id : undefined,
      subjectSlug: selectedSubjectSlug !== "all" ? selectedSubjectSlug : undefined,
      topicId: selectedTopicId !== "all" ? selectedTopicId : undefined,
      qType: qTypeFilter !== "all" ? qTypeFilter : undefined,
    }),
    [currentPage, targetSlug, matchedExamSheet, selectedSubjectSlug, selectedTopicId, qTypeFilter],
  );

  const { data, isLoading, error } = useQBChapterDetail(
    effectiveSubjectSlug,
    effectiveChapterSlug,
    queryParams,
  );
  const createExamMutation = useCreateCustomExam();

  const topics = data?.topics ?? EMPTY_TOPICS;
  const questions = data?.questions ?? EMPTY_QUESTIONS;
  const totalQuestions = data?.pagination?.total ?? questions.length;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const activeLabel =
    matchedExamSheet?.title ??
    matchedChapter?.name ??
    (subSlug === "all" ? (item?.name ?? "টপিক ভিত্তিক") : (item?.name ?? "অনুশীলন"));

  const handleStartExam = async () => {
    try {
      const examCount = Math.min(100, totalQuestions || 10);
      const res = await createExamMutation.mutateAsync({
        title: `${activeLabel} পরীক্ষা`,
        examType: matchedExamSheet?.examType ?? "mcq",
        questionCount: examCount,
        durationMinutes:
          matchedExamSheet?.durationMinutes ?? Math.max(15, Math.round(examCount * 0.75)),
        chapterIds: matchedChapter ? [matchedChapter.id] : undefined,
        examSheetIds: matchedExamSheet ? [matchedExamSheet.id] : undefined,
      });
      if (res?.id) router.push(`/exam/${res.id}/take`);
    } catch {
      router.push("/exam/custom");
    }
  };

  if (isLoading) return <PageLoading />;

  if (error || !target || !container || !item) {
    return (
      <EmptyState
        icon={BookOpen}
        title="প্রশ্ন পাওয়া যায়নি"
        description="এই ইউনিটটি খুঁজে পাওয়া যায়নি।"
        actionText="প্রশ্ন ব্যাংকে ফিরে যান"
        actionHref="/qb"
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col gap-2">
        <PageBreadcrumbs
          items={[
            { label: "প্রশ্নব্যাংক", href: "/qb" },
            { label: target.name, href: `/qb/${targetSlug}` },
            {
              label: container.name,
              href: `/qb/${targetSlug}/${containerSlug}`,
            },
            {
              label: item.name,
              href: `/qb/${targetSlug}/${containerSlug}/${itemSlug}`,
            },
            { label: activeLabel },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/qb/${targetSlug}/${containerSlug}/${itemSlug}`}
              className="size-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shadow-2xs"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                {activeLabel}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                মোট {toBengaliNumber(totalQuestions)} টি প্রশ্ন
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(`/qb/${targetSlug}/${containerSlug}/${itemSlug}`)}
              className="rounded-xl px-4 h-9 text-xs font-bold border-border/80 bg-card hover:bg-muted/60 text-foreground shadow-2xs gap-2 cursor-pointer"
            >
              <BookOpen className="size-4 shrink-0 text-primary" />
              <span>প্রশ্নপত্রসমূহ</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleStartExam}
              isLoading={createExamMutation.isPending}
              className="rounded-xl px-4 h-9 text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-xs gap-2 cursor-pointer"
            >
              <PenLine className="size-4 shrink-0" />
              <span>পরীক্ষা দিন</span>
            </Button>
          </div>
        </div>
      </div>

      <TopicWiseView
        questions={questions}
        topics={topics}
        subjects={data?.subjects}
        answers={answers}
        onSelectAnswer={(qId, optId) => setAnswers((prev) => ({ ...prev, [qId]: optId }))}
        page={currentPage}
        totalPages={totalPages}
        totalCount={totalQuestions}
        onPageChange={setCurrentPage}
        selectedSubjectSlug={selectedSubjectSlug}
        onSelectSubject={(sSlug) => {
          setSelectedSubjectSlug(sSlug);
          setSelectedTopicId("all");
          setCurrentPage(1);
        }}
        selectedTopicId={selectedTopicId}
        onSelectTopic={(tId) => {
          setSelectedTopicId(tId);
          setCurrentPage(1);
        }}
        qTypeFilter={qTypeFilter}
        onSelectQType={(type) => {
          setQTypeFilter(type);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
