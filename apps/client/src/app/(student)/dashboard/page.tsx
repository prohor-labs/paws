import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your studies and exam preparation on Paws Academy",
};

import { BangladeshMap } from "@/components/dashboard/bangladesh-map";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <BangladeshMap />
    </div>
  );
}
