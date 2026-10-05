import type { Metadata } from "next";
import { ChannelDetailView } from "@/components/watch/channel-detail-view";

export const metadata: Metadata = {
  title: "চ্যানেল | Paws Academy",
};

export default function ChannelDetailPage() {
  return <ChannelDetailView />;
}
