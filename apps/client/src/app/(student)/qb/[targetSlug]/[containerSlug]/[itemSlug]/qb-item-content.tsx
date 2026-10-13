"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { ArrowLeft, BookOpen, Clock, DocumentText, PenLine } from "@/components/icons";
import { EmptyState, GridCard, PageBreadcrumbs, PageLoading } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useCreateCustomExam, useQBItemDetail } from "@/hooks/use-question-bank";
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

  const target = data?.target;
  const container = data?.container;
  const item = data?.item;
  const subject = data?.subject;
  const chapters = data?.chapters ?? [];
  const sources = data?.sources ?? [];

  const isAdmissionOrJob =
    target?.group === "admission" ||
    target?.group === "job" ||
    ["varsity-admission", "engineering-admission", "medical-admission", "job"].includes(targetSlug);

  const subjects = data?.subjects ?? [];

  const [activeTab, setActiveTab] = React.useState<"years" | "subjects" | "chapters">("chapters");

  React.useEffect(() => {
    if (sources.length > 0 && isAdmissionOrJob) {
      setActiveTab("years");
    } else if (subjects.length > 0 && isAdmissionOrJob) {
      setActiveTab("subjects");
    } else {
      setActiveTab("chapters");
    }
  }, [sources.length, subjects.length, isAdmissionOrJob]);

  const filteredChapters = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return chapters;
    return chapters.filter(
      (ch) => ch.name.toLowerCase().includes(q) || ch.slug.toLowerCase().includes(q),
    );
  }, [chapters, query]);

  const filteredSubjects = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return subjects;
    return subjects.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
    );
  }, [subjects, query]);

  const filteredSources = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sources;
    return sources.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.year ? String(s.year).includes(q) : false),
    );
  }, [sources, query]);

  const totalQuestions =
    item?.questionCount ??
    (sources.length > 0
      ? sources.reduce((acc, s) => acc + (s.questionCount ?? 0), 0)
      : chapters.reduce((acc, c) => acc + (c.questionCount ?? 0), 0));

  const handleStartPractice = async () => {
    try {
      const res = await createExamMutation.mutateAsync({
        title: `${item?.name ?? subject?.name ?? "সম্পূর্ণ বিষয়"} প্র্যাকটিস`,
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

  const showTabs =
    (sources.length > 0 ? 1 : 0) +
    (subjects.length > 0 ? 1 : 0) +
    (chapters.length > 0 ? 1 : 0) >
    1;

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
                {activeTab === "years"
                  ? `${toBengaliNumber(sources.length)} টি প্রশ্নপত্র • মোট ${toBengaliNumber(totalQuestions)} টি প্রশ্ন`
                  : activeTab === "subjects"
                  ? `${toBengaliNumber(subjects.length)} টি বিষয় • মোট ${toBengaliNumber(totalQuestions)} টি প্রশ্ন`
                  : `${toBengaliNumber(chapters.length)} টি অধ্যায় • মোট ${toBengaliNumber(totalQuestions)} টি প্রশ্ন`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-wrap">
            <input
              type="text"
              aria-label="খুঁজো"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === "years"
                  ? "সাল বা প্রশ্নপত্র খুঁজুন..."
                  : activeTab === "subjects"
                  ? "বিষয় খুঁজুন..."
                  : "অধ্যায় খুঁজুন..."
              }
              className="w-full sm:w-56 rounded-full border border-border bg-background px-4 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary h-9"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleStartPractice}
              isLoading={createExamMutation.isPending}
              className="rounded-xl px-4 h-9 text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-xs gap-2 cursor-pointer"
            >
              <PenLine className="size-4 shrink-0" />
              <span>সম্পূর্ণ প্র্যাকটিস</span>
            </Button>
          </div>
        </div>

        {showTabs && (
          <div className="flex items-center gap-1.5 border-b border-border/60 pt-2">
            {sources.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("years")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                  activeTab === "years"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                সালভিত্তিক প্রশ্নপত্র ({toBengaliNumber(sources.length)})
              </button>
            )}
            {subjects.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("subjects")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                  activeTab === "subjects"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                বিষয়ভিত্তিক ({toBengaliNumber(subjects.length)})
              </button>
            )}
            {chapters.length > 0 && !isAdmissionOrJob && (
              <button
                type="button"
                onClick={() => setActiveTab("chapters")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                  activeTab === "chapters"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                অধ্যায়সমূহ ({toBengaliNumber(chapters.length)})
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab === "years" ? (
        filteredSources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="কোনো প্রশ্নপত্র পাওয়া যায়নি"
            description="এই বিষয়ে এখনো কোনো সালভিত্তিক প্রশ্নপত্র যোগ করা হয়নি।"
          />
        ) : (
          <div className="grid gap-2.5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredSources.map((s) => (
              <Link
                key={s.id}
                href={`/qb/${targetSlug}/${containerSlug}/${itemSlug}/${s.slug}`}
                className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 text-left transition-[border-color,box-shadow,transform] hover:border-primary/50 hover:shadow-xs active:translate-y-px group cursor-pointer"
              >
                <div className="w-full">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {s.year ? `${toBengaliNumber(s.year)} প্রশ্নব্যাংক` : s.name}
                  </h3>
                  {s.name !== (s.year ? `${toBengaliNumber(s.year)} প্রশ্নব্যাংক` : s.name) && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {s.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3 mt-2 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5 pr-3 border-r border-border/60">
                    <Clock className="size-4 text-destructive shrink-0" />
                    <span>{toBengaliNumber(s.year ?? "")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DocumentText className="size-4 text-primary shrink-0" />
                    <span>{toBengaliNumber(s.questionCount ?? 0)} টি প্রশ্ন</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : activeTab === "subjects" ? (
        filteredSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="কোনো বিষয় পাওয়া যায়নি"
            description="এই প্রশ্নব্যাংকে এখনো কোনো বিষয় পাওয়া যায়নি।"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredSubjects.map((subj) => (
              <GridCard
                key={subj.id}
                href={`/qb/${targetSlug}/${containerSlug}/${itemSlug}/${subj.slug}`}
                title={subj.name}
                subtitle={item.name}
                category={target.name}
                badge={subj.questionCount ? `${toBengaliNumber(subj.questionCount)} টি প্রশ্ন` : undefined}
                eventLabel={`Subject_${subj.name}`}
              />
            ))}
          </div>
        )
      ) : filteredChapters.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="কোনো অধ্যায় বা সেকশন পাওয়া যায়নি"
          description="এই বিষয়ে এখনো কোনো অধ্যায় যোগ করা হয়নি।"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredChapters.map((ch) => (
            <GridCard
              key={ch.id}
              href={`/qb/${targetSlug}/${containerSlug}/${itemSlug}/${ch.slug}`}
              title={ch.name}
              subtitle={item.name}
              category={target.name}
              badge={ch.questionCount ? `${toBengaliNumber(ch.questionCount)} টি প্রশ্ন` : undefined}
              eventLabel={`Section_${ch.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
