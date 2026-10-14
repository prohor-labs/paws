import type { Metadata } from "next";
import { UpgradeView } from "@/components/upgrade/upgrade-view";

export const metadata: Metadata = {
  title: "AI ক্রেডিট | Prohor",
  description:
    "পজ একাডেমির প্রশ্নব্যাংক ও AI মেন্টরের সাথে যেকোনো প্রশ্নের নির্ভুল স্টেপ-বাই-স্টেপ সমাধান ও ব্যাখ্যা পেতে ক্রেডিট যুক্ত করুন।",
};

export default function UpgradePage() {
  return <UpgradeView />;
}
