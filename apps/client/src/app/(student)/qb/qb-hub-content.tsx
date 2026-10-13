"use client";

import * as React from "react";
import { BookSaved, Search } from "@/components/icons";
import { EmptyState, GridCard, PageLoading } from "@/components/shared";
import { useQBTree } from "@/hooks/use-question-bank";
import { useSession } from "@/lib/auth";
import { subjectLevelLabel } from "@/lib/consts/qb";

export function QbHubContent() {
  const { data: session } = useSession();
  const user = session?.user as
    | (NonNullable<typeof session>["user"] & {
        educationalStandard?: string | null;
        track?: string | null;
      })
    | undefined;

  const [searchQuery, setSearchQuery] = React.useState("");
  const { data, isLoading } = useQBTree();

  const targets = React.useMemo(() => data?.targets ?? [], [data]);
  const subjects = React.useMemo(() => data?.subjects ?? [], [data]);

  const userTrack = user?.track;
  const userStandard = user?.educationalStandard;

  const sections = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return targets
      .filter((target) => {
        if (q) return true;
        if (userStandard) {
          if (userStandard === "hsc") return target.slug === "hsc";
          if (userStandard === "ssc") return target.slug === "ssc";
          if (userStandard === "job") return target.slug === "job";
          if (userStandard === "admission") {
            if (userTrack === "engineering") return target.slug === "engineering-admission";
            if (userTrack === "medical") return target.slug === "medical-admission";
            if (userTrack === "varsity") return target.slug === "varsity-admission";
            return target.group === "admission";
          }
        }
        return true;
      })
      .map((target) => {
        let containers = target.containers ?? [];

        if (!q && userStandard && userTrack) {
          if (target.slug === "hsc" || target.slug === "ssc") {
            const prioritized = containers.filter((c) => c.slug.includes(userTrack));
            const others = containers.filter((c) => !c.slug.includes(userTrack));
            containers = [...prioritized, ...others];
          } else if (target.slug === "job") {
            if (userTrack === "bcs") {
              containers = [
                ...containers.filter((c) => c.slug === "bcs" || c.slug === "ministry-non-cadre"),
                ...containers.filter((c) => c.slug !== "bcs" && c.slug !== "ministry-non-cadre"),
              ];
            } else if (userTrack === "bank") {
              containers = [
                ...containers.filter((c) => c.slug === "bank-jobs"),
                ...containers.filter((c) => c.slug !== "bank-jobs"),
              ];
            } else if (userTrack === "teacher") {
              containers = [
                ...containers.filter((c) => c.slug === "primary-teacher" || c.slug === "ntrca"),
                ...containers.filter((c) => c.slug !== "primary-teacher" && c.slug !== "ntrca"),
              ];
            }
          }
        }

        if (q) {
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

          for (const s of subjects) {
            if (s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)) {
              matchingItems.push({
                id: s.id,
                title: s.name,
                subtitle: target.name,
                href: `/qb/${target.slug}/${s.slug}`,
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
          cards: subjects.map((s) => ({
            id: s.id,
            title: s.name,
            subtitle: target.name,
            href: `/qb/${target.slug}/${s.slug}`,
            badge: s.questionCount ? `${s.questionCount} টি প্রশ্ন` : undefined,
          })),
          countLabel: `${subjects.length} টি ${subjectLevelLabel(target.group)}`,
        };
      })
      .filter((section) => section.cards.length > 0);
  }, [targets, subjects, searchQuery, userStandard, userTrack]);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="relative w-full pb-10">
      <div className="sticky top-0 z-20 -mx-4 -mt-3 sm:-mt-5 border-b border-border/50 px-4 py-3 bg-background/95 backdrop-blur-md md:mx-0 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              প্রশ্নব্যাংক আর্কাইভ
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              আপনার প্রস্তুতি ট্র্যাক অনুযায়ী নির্বাচিত প্রশ্নব্যাংক
            </p>
          </div>

          <div className="w-full sm:w-72">
            <div className="relative text-muted-foreground focus-within:text-foreground">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="search"
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্নব্যাংক বা বিষয় খুঁজো..."
                className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-4 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary min-h-[38px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 w-full">
        {sections.length > 0 ? (
          <div className="flex flex-col gap-8 sm:gap-10">
            {sections.map((section) => (
              <section key={section.target.id} className="scroll-mt-24 space-y-3">
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
            description="ভিন্ন কি-ওয়ার্ড দিয়ে অনুসন্ধান করুন"
          />
        )}
      </div>
    </div>
  );
}
