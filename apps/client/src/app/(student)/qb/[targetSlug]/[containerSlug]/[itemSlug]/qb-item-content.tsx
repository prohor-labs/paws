"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, BookOpen, PenLine } from "@/components/icons";
import { ExamActionDialog, type ExamSet, ExamWiseView, type QuestionTypeFilter, TopicWiseView } from "@/components/qb";
import { EmptyState, GridCard, PageBreadcrumbs, PageLoading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCreateCustomExam, useQBChapterDetail, useQBItemDetail } from "@/hooks/use-question-bank";
import { EMPTY_CHAPTERS, EMPTY_QUESTIONS, EMPTY_TOPICS } from "@/lib/consts/empty";
import { toBengaliNumber } from "@/lib/utils";

export function QbItemContent() {
  const router = useRouter();
  const params = useParams<{
    targetSlug: string;
    containerSlug: string;
    itemSlug: string;
  }>();
  const targetSlug = params?.targetSlug || "";
  const containerSlug = params?.containerSlug || "";
  const itemSlug = params?.itemSlug || "";

  const { data, isLoading, error } = useQBItemDetail(targetSlug, containerSlug, itemSlug);
  const createExamMutation = useCreateCustomExam();

  const [query, setQuery] = React.useState("");
  const [selectedExam, setSelectedExam] = React.useState<ExamSet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [selectedSubjectSlug, setSelectedSubjectSlug] = React.useState<string>("all");
  const [selectedChapterSlug, setSelectedChapterSlug] = React.useState<string>("all");
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("all");
  const [qTypeFilter, setQTypeFilter] = React.useState<QuestionTypeFilter>("all");
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const target = data?.target;
  const container = data?.container;
  const item = data?.item;
  const subject = data?.subject;
  const examSheets = data?.examSheets ?? [];

  const chapterQueryParams = React.useMemo(
    () => ({
      page: currentPage,
      limit: 100,
      targetSlug,
      containerSlug,
      itemSlug,
      subjectSlug: selectedSubjectSlug !== "all" ? selectedSubjectSlug : undefined,
      chapterSlug: selectedChapterSlug !== "all" ? selectedChapterSlug : undefined,
      topicId: selectedTopicId !== "all" ? selectedTopicId : undefined,
      qType: qTypeFilter !== "all" ? qTypeFilter : undefined,
    }),
    [currentPage, targetSlug, containerSlug, itemSlug, selectedSubjectSlug, selectedChapterSlug, selectedTopicId, qTypeFilter],
  );

  const { data: chapterData, isLoading: isChapterLoading } = useQBChapterDetail(
    itemSlug,
    "all",
    chapterQueryParams,
  );

  const questions = chapterData?.questions ?? EMPTY_QUESTIONS;
  const topics = chapterData?.topics ?? EMPTY_TOPICS;
  const totalQuestions = chapterData?.pagination?.total ?? item?.questionCount ?? questions.length;
  const totalPages = chapterData?.pagination?.totalPages ?? 1;

  const examSets = React.useMemo<ExamSet[]>(() => {
    return examSheets
      .map((es) => ({
        id: es.id,
        slug: es.slug,
        title: es.title,
        orderIndex: es.orderIndex,
        type: es.examType,
        durationMinutes: es.durationMinutes,
        questionCount: es.questionCount,
        questions: [],
      }))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [examSheets]);

  const filteredExamSets = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return examSets;
    return examSets.filter((exam) => exam.title.toLowerCase().includes(q));
  }, [examSets, query]);

  const handleStartPractice = async () => {
    try {
      const res = await createExamMutation.mutateAsync({
        title: `${item?.name ?? subject?.name} প্র্যাকটিস`,
        examType: "mcq",
        questionCount: Math.min(100, totalQuestions || 25),
        durationMinutes: 20,
        subjectIds: subject?.id ? [subject.id] : undefined,
        chapterIds: item?.id ? [item.id] : undefined,
      });
      if (res?.id) router.push(`/exam/${res.id}/take`);
    } catch {
      router.push("/exam/custom");
    }
  };

  const handleExamCardClick = (exam: ExamSet) => {
    setSelectedExam(exam);
    setIsDialogOpen(true);
  };

  const handleConfirmStartExam = async (exam: ExamSet) => {
    try {
      const res = await createExamMutation.mutateAsync({
        title: exam.title,
        examType: exam.type,
        questionCount: exam.questionCount,
        durationMinutes: exam.durationMinutes,
        examSheetIds: [exam.id],
      });
      if (res?.id) {
        setIsDialogOpen(false);
        router.push(`/exam/${res.id}/take?mode=taking`);
      }
    } catch {
      router.push("/exam/custom");
    }
  };

  const handleConfirmReadExam = (exam: ExamSet) => {
    setIsDialogOpen(false);
    router.push(
      `/qb/${target?.slug || targetSlug}/${container?.slug || containerSlug}/${item?.slug || itemSlug}/questions?examSheet=${exam.slug || exam.id}`,
    );
  };

  if (isLoading || isChapterLoading) return <PageLoading />;

  if (error || !target || !container || !item) {
    return (
      <EmptyState
        icon={BookOpen}
        title="আইটেম পাওয়া যায়নি"
        description="অনুরোধকৃত বিষয় বা প্রশ্নব্যাংক খুঁজে পাওয়া যায়নি।"
        actionText="টার্গেটে ফিরে যান"
        actionHref={`/qb/${targetSlug}`}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col gap-2">
        <PageBreadcrumbs
          items={[
            { label: "প্রশ্নব্যাংক", href: "/qb" },
            { label: target.name, href: `/qb/${target.slug}` },
            {
              label: container.name,
              href: `/qb/${target.slug}/${container.slug}`,
            },
            { label: item.name },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/qb/${target.slug}/${container.slug}`}
              className="size-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shadow-2xs"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                {item.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {`মোট ${toBengaliNumber(totalQuestions)} টি প্রশ্ন`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              onClick={handleStartPractice}
              isLoading={createExamMutation.isPending}
              className="rounded-xl px-4 h-9 text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-xs gap-2 cursor-pointer"
            >
              <PenLine className="size-4 shrink-0" />
              <span>প্র্যাকটিস</span>
            </Button>
          </div>
        </div>
      </div>

      <TopicWiseView
        questions={questions}
        topics={topics}
        subjects={chapterData?.subjects}
        chapters={chapterData?.chapters}
        answers={answers}
        onSelectAnswer={(qId, optId) => setAnswers((prev) => ({ ...prev, [qId]: optId }))}
        page={currentPage}
        totalPages={totalPages}
        totalCount={totalQuestions}
        onPageChange={setCurrentPage}
        selectedSubjectSlug={selectedSubjectSlug}
        onSelectSubject={(subjSlug) => {
          setSelectedSubjectSlug(subjSlug);
          setSelectedChapterSlug("all");
          setSelectedTopicId("all");
          setCurrentPage(1);
        }}
        selectedChapterSlug={selectedChapterSlug}
        onSelectChapter={(chapSlug) => {
          setSelectedChapterSlug(chapSlug);
          setSelectedTopicId("all");
          setCurrentPage(1);
        }}
        selectedTopicId={selectedTopicId}
        onSelectTopic={(topId) => {
          setSelectedTopicId(topId);
          setCurrentPage(1);
        }}
        qTypeFilter={qTypeFilter}
        onSelectQType={(type) => {
          setQTypeFilter(type);
          setCurrentPage(1);
        }}
        hideTopics={false}
      />

      <ExamActionDialog
        exam={selectedExam}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onStartExam={handleConfirmStartExam}
        onReadExam={handleConfirmReadExam}
        isStarting={createExamMutation.isPending}
      />
    </div>
  );
}
