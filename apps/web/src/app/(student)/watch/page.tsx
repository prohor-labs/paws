import type { Metadata } from "next";
import { WatchFeed } from "@/components/watch/watch-feed";

export const metadata: Metadata = {
  title: "ক্লাস ও ভিডিও লাইব্রেরি | Paws Academy",
  description: "পদার্থবিজ্ঞান, রসায়ন, গণিত, জীববিজ্ঞান ও আইসিটির মাস্টারক্লাস ও সল্যুশন ভিডিও।",
};

export default function WatchPage() {
  return <WatchFeed />;
}
