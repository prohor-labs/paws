"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, BookOpen, PenLine } from "@/components/icons";
import { type QuestionTypeFilter, TopicWiseView } from "@/components/qb";
import { EmptyState, PageBreadcrumbs, PageLoading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  useCreateCustomExam,
  useQBChapterDetail,
  useQBItemDetail,
} from "@/hooks/use-question-bank";
import { EMPTY_QUESTIONS, EMPTY_TOPICS } from "@/lib/consts/empty";
import { toBengaliNumber } from "@/lib/utils";

export function QbSectionContent() {
  const router = useRouter();
  const params = useParams<{
    targetSlug: string;
    containerSlug: string;
    itemSlug: string;
    sectionSlug: string;
  }>();
  const targetSlug = params?.targetSlug || "";
  const containerSlug = params?.containerSlug || "";
  const itemSlug = params?.itemSlug || "";
  const sectionSlug = params?.sectionSlug || "";

  const {
    data: itemData,
    isLoading: isItemLoading,
    error: itemError,
  } = useQBItemDetail(targetSlug, containerSlug, itemSlug);
  const createExamMutation = useCreateCustomExam();

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("all");
  const [qTypeFilter, setQTypeFilter] = React.useState<QuestionTypeFilter>("all");
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  const target = itemData?.target;
  const container = itemData?.container;
  const item = itemData?.item;
  const subject = itemData?.subject;

  const currentSection = React.useMemo(() => {
    return itemData?.chapters?.find(
      (c) => c.slug === sectionSlug || decodeURIComponent(sectionSlug) === c.slug,
    );
  }, [itemData?.chapters, sectionSlug]);

  const queryParams = React.useMemo(
    () => ({
      page: currentPage,
      limit: 100,
      targetSlug,
      containerSlug,
      itemSlug,
      subjectSlug: itemSlug,
      chapterSlug: sectionSlug,
      topicId: selectedTopicId !== "all" ? selectedTopicId : undefined,
      qType: qTypeFilter !== "all" ? qTypeFilter : undefined,
    }),
    [currentPage, targetSlug, containerSlug, itemSlug, sectionSlug, selectedTopicId, qTypeFilter],
  );

  const { data: sectionData, isLoading: isSectionLoading } = useQBChapterDetail(
    itemSlug,
    sectionSlug,
    queryParams,
  );

  const questions = sectionData?.questions ?? EMPTY_QUESTIONS;
  const topics = sectionData?.topics ?? EMPTY_TOPICS;
  const totalQuestions =
    sectionData?.pagination?.total ?? currentSection?.questionCount ?? questions.length;
  const totalPages = sectionData?.pagination?.totalPages ?? 1;

  const handleStartPractice = async () => {
    try {
      const res = await createExamMutation.mutateAsync({
        title: `${currentSection?.name ?? item?.name ?? "অনুশীলন"} প্র্যাকটিস`,
        examType: "mcq",
        questionCount: Math.min(100, totalQuestions || 25),
        durationMinutes: 20,
        subjectIds: subject?.id ? [subject.id] : undefined,
        chapterIds: currentSection?.id ? [currentSection.id] : undefined,
      });
      if (res?.id) router.push(`/exam/${res.id}/take`);
    } catch {
      router.push("/exam/custom");
    }
  };

  if (isItemLoading || isSectionLoading) return <PageLoading />;

  if (itemError || !target || !container || !item) {
    return (
      <EmptyState
        icon={BookOpen}
        title="সেকশন পাওয়া যায়নি"
        description="অনুরোধকৃত বিষয় বা সেকশন খুঁজে পাওয়া যায়নি।"
        actionText="তালিকায় ফিরে যান"
        actionHref={`/qb/${targetSlug}/${containerSlug}/${itemSlug}`}
      />
    );
  }

  const sectionTitle = currentSection?.name ?? decodeURIComponent(sectionSlug);

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
            {
              label: item.name,
              href: `/qb/${target.slug}/${container.slug}/${item.slug}`,
            },
            { label: sectionTitle },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/qb/${target.slug}/${container.slug}/${item.slug}`}
              className="size-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shadow-2xs"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                {sectionTitle}
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
        answers={answers}
        onSelectAnswer={(qId, optId) => setAnswers((prev) => ({ ...prev, [qId]: optId }))}
        page={currentPage}
        totalPages={totalPages}
        totalCount={totalQuestions}
        onPageChange={setCurrentPage}
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
    </div>
  );
}
