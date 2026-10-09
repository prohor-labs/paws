import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your studies and exam preparation on Paws Academy",
};

export default function DashboardPage() {
  return <div className="flex flex-col gap-4" />;
}
