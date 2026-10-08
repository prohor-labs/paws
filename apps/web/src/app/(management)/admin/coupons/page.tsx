import type { Metadata } from "next";
import { CouponsView } from "@/components/admin/coupons-view";

export const metadata: Metadata = {
  title: "কুপন ও ছাড় ব্যবস্থাপনা | PAWS Academy",
  description: "প্রো সাবস্ক্রিপশন ও এড-অনের ডিসকাউন্ট কুপন তৈরি ও পরিচালনা",
};

export default function AdminCouponsPage() {
  return <CouponsView />;
}
