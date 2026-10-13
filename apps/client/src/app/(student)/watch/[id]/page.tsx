import type { Metadata } from "next";
import { WatchPlayerView } from "@/components/watch/watch-player-view";

export const metadata: Metadata = {
  title: "ভিডিও | Prohor",
};

export default function WatchVideoDetailPage() {
  return <WatchPlayerView />;
}
