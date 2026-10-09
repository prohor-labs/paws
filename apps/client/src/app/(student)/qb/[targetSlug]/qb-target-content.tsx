"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { BookOpen } from "@/components/icons";
import { EmptyState, GridCard, PageBreadcrumbs, PageLoading } from "@/components/shared";
import { useQBTargetDetail } from "@/hooks/use-question-bank";
import { EMPTY_SUBJECTS } from "@/lib/consts/empty";
import { subjectLevelLabel } from "@/lib/consts/qb";

export function QbTargetContent() {
  const params = useParams<{ targetSlug: string }>();
  const targetSlug = params?.targetSlug || "";
  const { data, isLoading, error } = useQBTargetDetail(targetSlug);
  const [query, setQuery] = React.useState("");

  const target = data?.target;
  const containers = data?.containers ?? [];
  const subjects = data?.subjects ?? EMPTY_SUBJECTS;

  const filteredContainers = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return containers;
    return containers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [containers, query]);

  const filteredSubjects = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return subjects;
    return subjects.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
    );
  }, [subjects, query]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !target) {
    return (
      <EmptyState
        icon={BookOpen}
        title="প্রশ্নব্যাংক পাওয়া যায়নি"
        description="অনুরোধকৃত লক্ষ্য বিদ্যমান নেই অথবা অপসারিত হয়েছে।"
        actionText="প্রশ্নব্যাংকে ফিরে যান"
        actionHref="/qb"
      />
    );
  }

  const hasContainers = containers.length > 0;

  return (
    <div className="relative w-full pb-10 space-y-4">
      <PageBreadcrumbs items={[{ label: "প্রশ্নব্যাংক", href: "/qb" }, { label: target.name }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">{target.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasContainers
              ? `${containers.length} টি সেকশন`
              : `${subjects.length} টি ${subjectLevelLabel(target.group)}`}
          </p>
        </div>
        <input
          type="text"
          aria-label={hasContainers ? "সেকশন খুঁজো" : `${subjectLevelLabel(target.group)} খুঁজো`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={hasContainers ? "সেকশন খুঁজো..." : `${subjectLevelLabel(target.group)} খুঁজো...`}
          className="w-full sm:w-64 rounded-full border border-border bg-background px-4 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[40px]"
        />
      </div>

      {hasContainers ? (
        filteredContainers.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="কোনো সেকশন পাওয়া যায়নি"
            description="এই লক্ষ্যে কোনো সেকশন অন্তর্ভুক্ত নেই।"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredContainers.map((container) => (
              <GridCard
                key={container.id}
                href={`/qb/${targetSlug}/${container.slug}`}
                title={container.name}
                subtitle={target.name}
                category={target.name}
                badge={container.itemCount ? `${container.itemCount} টি বিষয়/ব্যাংক` : undefined}
                eventLabel={`Container_${container.name}`}
              />
            ))}
          </div>
        )
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="কোনো বিষয় পাওয়া যায়নি"
          description="এই লক্ষ্যে কোনো বিষয় অন্তর্ভুক্ত নেই।"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredSubjects.map((subject) => (
            <GridCard
              key={subject.id}
              href={`/qb/${targetSlug}/${subject.slug}`}
              title={subject.name}
              subtitle={target.name}
              category={target.name}
              badge={subject.questionCount ? `${subject.questionCount} টি প্রশ্ন` : undefined}
              eventLabel={`Subject_${subject.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
