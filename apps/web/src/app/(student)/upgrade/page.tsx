import type { Metadata } from "next";
import { UpgradeView } from "@/components/upgrade/upgrade-view";

export const metadata: Metadata = {
  title: "প্রিমিয়াম আপগ্রেড | Paws Academy",
  description:
    "পজ একাডেমি প্রিমিয়ামে আনলক করো আনলিমিটেড মডেল টেস্ট, বিগত বছরের প্রশ্ন ব্যাংক, এবং AI ডাউট সলভার।",
};

export default function UpgradePage() {
  return <UpgradeView />;
}
