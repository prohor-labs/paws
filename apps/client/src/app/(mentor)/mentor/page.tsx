import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Dashboard | PAWS Academy",
  description: "Mentor controls and student evaluations overview",
};

export default function MentorDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">মেন্টর ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted-foreground">
          শিক্ষার্থীদের খাতা মূল্যায়ন এবং একাডেমিক সহায়তা প্রদান করুন
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">অপেক্ষমান খাতা</p>
          <p className="text-2xl font-bold mt-2">১৪</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">মূল্যায়িত খাতা</p>
          <p className="text-2xl font-bold mt-2">৩২৮</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">অ্যাসাইন করা শিক্ষার্থী</p>
          <p className="text-2xl font-bold mt-2">৮৫</p>
        </div>
      </div>
    </div>
  );
}
