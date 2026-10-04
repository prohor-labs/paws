"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, BookOpen, PenLine } from "@/components/icons";
import { ExamActionDialog, type ExamSet, ExamWiseView } from "@/components/qb";
import { EmptyState, GridCard, PageBreadcrumbs, PageLoading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCreateCustomExam, useQBItemDetail } from "@/hooks/use-question-bank";
import { EMPTY_CHAPTERS } from "@/lib/consts/empty";
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

  const target = data?.target;
  const container = data?.container;
  const item = data?.item;
  const subject = data?.subject;
  const chapters = data?.chapters ?? EMPTY_CHAPTERS;
  const examSheets = data?.examSheets ?? [];

  const hasChapters = chapters.length > 0;
  const hasExamSheets = examSheets.length > 0;

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

  const filteredChapters = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return chapters;
    return chapters.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [chapters, query]);

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
        questionCount: 25,
        durationMinutes: 20,
        subjectIds: subject?.id ? [subject.id] : undefined,
        chapterIds: chapters.map((c) => c.id),
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
    router.push(`/qb/${target?.slug || targetSlug}/${container?.slug || containerSlug}/${item?.slug || itemSlug}/${exam.slug || exam.id}`);
  };

  if (isLoading) return <PageLoading />;

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
            { label: container.name, href: `/qb/${target.slug}/${container.slug}` },
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
                {hasChapters ? `মোট ${toBengaliNumber(chapters.length)} টি অধ্যায়` : ""}
                {hasChapters && hasExamSheets ? " • " : ""}
                {hasExamSheets ? `${toBengaliNumber(examSheets.length)} টি প্রশ্নপত্র` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(`/qb/${target.slug}/${container.slug}/${item.slug}/all`)}
              className="rounded-xl px-4 h-9 text-xs font-bold border-border/80 bg-card hover:bg-muted/60 text-foreground shadow-2xs gap-2 cursor-pointer"
            >
              <BookOpen className="size-4 shrink-0 text-primary" />
              <span>টপিক ভিত্তিক</span>
            </Button>

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

      {hasExamSheets ? (
        <ExamWiseView
          examSearch={query}
          onSearchChange={setQuery}
          filteredExamSets={filteredExamSets}
          onStartSetExam={handleExamCardClick}
        />
      ) : hasChapters ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              অধ্যায় নির্বাচন করুন ({toBengaliNumber(filteredChapters.length)} টি)
            </h2>
            <input
              type="text"
              aria-label="অধ্যায় খুঁজুন"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="অধ্যায় খুঁজুন..."
              className="w-full sm:w-64 rounded-full border border-border bg-background px-4 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[38px]"
            />
          </div>

          {filteredChapters.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="কোনো অধ্যায় পাওয়া যায়নি"
              description="এই বিষয়ে কোনো অধ্যায় খুঁজে পাওয়া যায়নি।"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredChapters.map((ch) => (
                <GridCard
                  key={ch.id}
                  href={`/qb/${target.slug}/${container.slug}/${item.slug}/${ch.slug}`}
                  title={ch.name}
                  subtitle={item.name}
                  category={subject?.name || container.name}
                  badge={ch.questionCount ? `${toBengaliNumber(ch.questionCount)} টি প্রশ্ন` : undefined}
                  eventLabel={`Chapter_${ch.name}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <ExamWiseView
          examSearch={query}
          onSearchChange={setQuery}
          filteredExamSets={filteredExamSets}
          onStartSetExam={handleExamCardClick}
        />
      )}

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
