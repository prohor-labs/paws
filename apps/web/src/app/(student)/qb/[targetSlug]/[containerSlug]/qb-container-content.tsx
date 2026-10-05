"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { BookOpen } from "@/components/icons";
import { EmptyState, GridCard, PageBreadcrumbs, PageLoading } from "@/components/shared";
import { useQBContainerDetail } from "@/hooks/use-question-bank";

export function QbContainerContent() {
  const params = useParams<{ targetSlug: string; containerSlug: string }>();
  const targetSlug = params?.targetSlug || "";
  const containerSlug = params?.containerSlug || "";
  const { data, isLoading, error } = useQBContainerDetail(targetSlug, containerSlug);
  const [query, setQuery] = React.useState("");

  const target = data?.target;
  const container = data?.container;
  const items = data?.items ?? [];

  const filteredItems = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (it) => it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q),
    );
  }, [items, query]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !target || !container) {
    return (
      <EmptyState
        icon={BookOpen}
        title="সেকশন পাওয়া যায়নি"
        description="অনুরোধকৃত সেকশনটি খুঁজে পাওয়া যায়নি অথবা বিদ্যমান নেই।"
        actionText="টার্গেটে ফিরে যান"
        actionHref={`/qb/${targetSlug}`}
      />
    );
  }

  return (
    <div className="relative w-full pb-10 space-y-4">
      <PageBreadcrumbs
        items={[
          { label: "প্রশ্নব্যাংক", href: "/qb" },
          { label: target.name, href: `/qb/${targetSlug}` },
          { label: container.name },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">{container.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} টি বিষয় / প্রশ্নব্যাংক</p>
        </div>
        <input
          type="text"
          aria-label="খুঁজো"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="খুঁজো..."
          className="w-full sm:w-64 rounded-full border border-border bg-background px-4 py-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[40px]"
        />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="কোনো আইটেম পাওয়া যায়নি"
          description="এই সেকশনে কোনো বিষয় বা প্রশ্নব্যাংক অন্তর্ভুক্ত নেই।"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredItems.map((item) => (
            <GridCard
              key={item.id}
              href={`/qb/${targetSlug}/${container.slug}/${item.slug}`}
              title={item.name}
              subtitle={container.name}
              category={target.name}
              badge={item.questionCount ? `${item.questionCount} টি প্রশ্ন` : undefined}
              eventLabel={`Item_${item.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
