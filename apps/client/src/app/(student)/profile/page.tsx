"use client";

import { AppPreferences, ProfileCard } from "@/components/profile";
import { PageBreadcrumbs } from "@/components/shared";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <PageBreadcrumbs items={[{ label: "হোম", href: "/" }, { label: "প্রোফাইল" }]} />

      <div className="w-full flex flex-col lg:flex-row gap-5 md:gap-6 lg:gap-8 items-start">
        <aside className="shrink-0 w-full lg:w-[340px] flex flex-col gap-4">
          <ProfileCard />
        </aside>

        <div className="flex-1 w-full flex flex-col gap-4">
          <AppPreferences />
        </div>
      </div>
    </div>
  );
}
