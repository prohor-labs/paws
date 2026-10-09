import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | PAWS Academy",
  description: "Administrative controls and system overview",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">অ্যাডমিন ড্যাশবোর্ড</h1>
        <p className="text-sm text-muted-foreground">
          সিস্টেমের সামগ্রিক কার্যক্রম ও পরিসংখ্যান পরিচালনা করুন
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">মোট শিক্ষার্থী</p>
          <p className="text-2xl font-bold mt-2">১,২৪৮</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">মোট অর্ডার</p>
          <p className="text-2xl font-bold mt-2">৫৪২</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">মোট পরীক্ষা</p>
          <p className="text-2xl font-bold mt-2">৮৯</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-xs">
          <p className="text-sm font-medium text-muted-foreground">সক্রিয় প্রশ্ন</p>
          <p className="text-2xl font-bold mt-2">৩,৪৫০</p>
        </div>
      </div>
    </div>
  );
}
