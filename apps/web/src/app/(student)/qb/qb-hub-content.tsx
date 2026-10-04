"use client";

import * as React from "react";
import { BookSaved } from "@/components/icons";
import { EmptyState, GridCard, PageLoading, TabsWithSearch } from "@/components/shared";
import { useQBTree } from "@/hooks/use-question-bank";
import { QB_TARGET_GROUP_LABELS, QB_TARGET_GROUPS } from "@/lib/consts/custom-exam";
import { subjectLevelLabel } from "@/lib/consts/qb";

export function QbHubContent() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeGroup, setActiveGroup] = React.useState<string>("all");
  const { data, isLoading } = useQBTree();

  const targets = React.useMemo(() => data ?? [], [data]);

  const tabs = React.useMemo(() => {
    const groupTabs = QB_TARGET_GROUPS.filter((group) =>
      targets.some((target) => (target.group ?? "academic") === group),
    ).map((group) => ({
      id: group,
      label: QB_TARGET_GROUP_LABELS[group],
      count: targets.filter((target) => (target.group ?? "academic") === group).length,
    }));
    return [{ id: "all", label: "সকল", count: targets.length }, ...groupTabs];
  }, [targets]);

  const sections = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return targets
      .filter((target) => activeGroup === "all" || (target.group ?? "academic") === activeGroup)
      .map((target) => {
        const containers = target.containers ?? [];

        if (q) {
          // Flatten matching containers or matching items under containers
          const matchingItems: Array<{
            id: string;
            title: string;
            subtitle: string;
            href: string;
            badge?: string;
          }> = [];

          for (const ct of containers) {
            if (ct.name.toLowerCase().includes(q) || ct.slug.toLowerCase().includes(q)) {
              matchingItems.push({
                id: ct.id,
                title: ct.name,
                subtitle: target.name,
                href: `/qb/${target.slug}/${ct.slug}`,
                badge: ct.questionCount ? `${ct.questionCount} টি প্রশ্ন` : undefined,
              });
            }
            for (const it of ct.items ?? []) {
              if (it.name.toLowerCase().includes(q) || it.slug.toLowerCase().includes(q)) {
                matchingItems.push({
                  id: it.id,
                  title: it.name,
                  subtitle: `${target.name} • ${ct.name}`,
                  href: `/qb/${target.slug}/${ct.slug}/${it.slug}`,
                  badge: it.questionCount ? `${it.questionCount} টি প্রশ্ন` : undefined,
                });
              }
            }
          }

          // Also check subjects
          for (const s of target.subjects ?? []) {
            if (s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)) {
              matchingItems.push({
                id: s.id,
                title: s.name,
                subtitle: target.name,
                href: `/qb/${target.slug}/subjects/${s.slug}`,
                badge: s.questionCount ? `${s.questionCount} টি প্রশ্ন` : undefined,
              });
            }
          }

          return {
            target,
            cards: matchingItems,
            countLabel: `${matchingItems.length} টি ফলাফল`,
          };
        }

        if (containers.length > 0) {
          return {
            target,
            cards: containers.map((ct) => ({
              id: ct.id,
              title: ct.name,
              subtitle: target.name,
              href: `/qb/${target.slug}/${ct.slug}`,
              badge: ct.itemCount
                ? `${ct.itemCount} টি ব্যাংক • ${ct.questionCount ?? 0} টি প্রশ্ন`
                : ct.questionCount
                  ? `${ct.questionCount} টি প্রশ্ন`
                  : undefined,
            })),
            countLabel: `${containers.length} টি সেকশন`,
          };
        }

        return {
          target,
          cards: (target.subjects ?? []).map((s) => ({
            id: s.id,
            title: s.name,
            subtitle: target.name,
            href: `/qb/${target.slug}/${s.slug}`,
            badge: s.questionCount ? `${s.questionCount} টি প্রশ্ন` : undefined,
          })),
          countLabel: `${(target.subjects ?? []).length} টি ${subjectLevelLabel(target.group)}`,
        };
      })
      .filter((section) => section.cards.length > 0);
  }, [targets, activeGroup, searchQuery]);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="relative w-full pb-10">
      <TabsWithSearch
        tabs={tabs}
        activeTab={activeGroup}
        onTabChange={setActiveGroup}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="প্রশ্নব্যাংক বা বিষয় খুঁজো..."
      />

      <div className="mt-6 w-full">
        {sections.length > 0 ? (
          <div className="flex flex-col gap-8 sm:gap-10">
            {sections.map((section) => (
              <section
                key={section.target.id}
                className="scroll-mt-24 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-sans text-base sm:text-lg md:text-xl font-bold text-foreground">
                      {section.target.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.countLabel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {section.cards.map((card) => (
                    <GridCard
                      key={card.id}
                      href={card.href}
                      title={card.title}
                      subtitle={card.subtitle}
                      category={section.target.name}
                      badge={card.badge}
                      eventLabel={`Card_${card.title}`}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookSaved}
            title="কোন প্রশ্নব্যাংক পাওয়া যায়নি"
            description="ভিন্ন কি-ওয়ার্ড দিয়ে অনুসন্ধান করুন অথবা ফিল্টার পরিবর্তন করুন"
          />
        )}
      </div>
    </div>
  );
}
