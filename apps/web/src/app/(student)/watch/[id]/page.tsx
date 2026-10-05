import type { Metadata } from "next";
import { WatchPlayerView } from "@/components/watch/watch-player-view";

export const metadata: Metadata = {
  title: "ভিডিও | Paws Academy",
};

export default function WatchVideoDetailPage() {
  return <WatchPlayerView />;
}
