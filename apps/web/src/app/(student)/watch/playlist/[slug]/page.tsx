import type { Metadata } from "next";
import { PlaylistDetailView } from "@/components/watch/playlist-detail-view";

export const metadata: Metadata = {
  title: "প্লেলিস্ট | Paws Academy",
};

export default function PlaylistDetailPage() {
  return <PlaylistDetailView />;
}
