"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Play } from "@/components/icons";
import { PageLoading } from "@/components/shared";
import { WatchCard } from "@/components/watch/watch-card";
import { useWatchPlaylist } from "@/hooks/use-watch";
import { EMPTY_WATCH_VIDEOS } from "@/lib/consts/empty";
import { formatBengaliRelativeTime } from "@/lib/utils";

export function PlaylistDetailView() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ? decodeURIComponent(params.slug) : "";

  const { data, isLoading } = useWatchPlaylist(slug);

  if (isLoading) {
    return <PageLoading />;
  }

  const playlist = data?.playlist;
  const videos = data?.videos ?? EMPTY_WATCH_VIDEOS;
  const firstVideoId = playlist?.videoIds[0] ?? "";

  if (!playlist) {
    return (
      <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
        <BookOpen className="size-10 opacity-30 stroke-[1.5]" />
        <p className="font-medium text-sm">প্লেলিস্ট পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 px-2 sm:px-4">
      {/* Back button */}
      <div className="py-3">
        <Link
          href="/watch"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>সব ভিডিও ও প্লেলিস্টে ফিরে যান</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
        {/* Left Side: Playlist Custom Cover & Metadata */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-muted border border-border/60 shadow-md">
            <Image
              src={playlist.customCover}
              alt={playlist.title}
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {playlist.title}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {playlist.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" />
                {playlist.videoIds.length} টি ভিডিও
              </span>
              <span>•</span>
              <span>তৈরি: {formatBengaliRelativeTime(playlist.createdAt)}</span>
            </div>

            {firstVideoId && (
              <Link
                href={`/watch/${firstVideoId}?list=${playlist.id}`}
                className="mt-3 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Play className="size-4 fill-current" />
                <span>প্রথম ভিডিওটি চালান</span>
              </Link>
            )}
          </div>
        </div>

        {/* Right Side: Playlist Video Items */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h2 className="text-base font-bold text-foreground pb-2 border-b border-border/60 flex items-center justify-between">
            <span>প্লেলিস্টের ভিডিও তালিকা</span>
            <span className="text-xs text-muted-foreground font-normal">ক্রম অনুযায়ী দেখুন</span>
          </h2>

          <div className="flex flex-col gap-3">
            {videos.map((vid, idx) => (
              <div key={vid.id} className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground w-6 text-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <WatchCard video={vid} layout="list" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
