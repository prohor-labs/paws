"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Play, Share, VerifiedBadge } from "@/components/icons";
import { PageLoading, ShareSheet } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { PlaylistCard } from "@/components/watch/playlist-card";
import { WatchCard } from "@/components/watch/watch-card";
import { useWatchChannel, useWatchMutations } from "@/hooks/use-watch";
import { EMPTY_WATCH_PLAYLISTS, EMPTY_WATCH_VIDEOS } from "@/lib/consts/empty";
import { cn, formatBengaliCount, toBengaliNumber } from "@/lib/utils";

export function ChannelDetailView() {
  const params = useParams<{ handle: string }>();
  const handle = params?.handle ? decodeURIComponent(params.handle) : "";
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Synced from backend via useWatchChannel
  const { data, isLoading } = useWatchChannel(handle);
  const { toggleSubscription } = useWatchMutations(undefined, handle);

  const channel = data?.channel;
  const videos = data?.videos ?? EMPTY_WATCH_VIDEOS;
  const playlists = data?.playlists ?? EMPTY_WATCH_PLAYLISTS;

  const isSubscribed = channel?.isSubscribed ?? false;
  const subscribersCount = channel?.subscribersCount ?? 0;
  const subscribersDisplay =
    subscribersCount > 0
      ? `${formatBengaliCount(subscribersCount)} জন সাবস্ক্রাইবার`
      : channel?.subscribers || "০ জন সাবস্ক্রাইবার";

  if (isLoading) {
    return <PageLoading />;
  }

  if (!channel) {
    return (
      <div className="py-24 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Play className="size-10 opacity-30 stroke-[1.5]" />
        <p className="font-medium text-sm">চ্যানেল পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1800px] mx-auto w-full pb-16 px-2 sm:px-6">
      {/* Back button */}
      <div className="py-2">
        <Link
          href="/watch"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>সব ভিডিওতে ফিরে যান</span>
        </Link>
      </div>

      {/* Channel Banner */}
      {channel.banner && (
        <div className="relative w-full h-36 sm:h-52 md:h-64 lg:h-72 rounded-3xl overflow-hidden bg-muted border border-border/40 mb-2 shadow-xs">
          <Image
            src={channel.banner}
            alt={channel.name}
            fill
            priority
            sizes="(max-width: 1800px) 100vw, 1800px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}

      {/* Channel Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative size-20 sm:size-28 md:size-32 rounded-full overflow-hidden border-2 border-background shadow-md bg-muted shrink-0">
            <Image
              src={channel.avatar}
              alt={channel.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>

          {/* Name & Handle & Counts */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {channel.name}
              </h1>
              {channel.verified && (
                <span title="যাচাইকৃত চ্যানেল">
                  <VerifiedBadge className="size-6 shrink-0" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
              <span className="font-semibold text-foreground/90">{channel.handle}</span>
              <span>•</span>
              <span>{subscribersDisplay}</span>
              <span>•</span>
              <span>
                {videos.length > 0
                  ? `${toBengaliNumber(videos.length)} টি ভিডিও`
                  : channel.videoCount}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 max-w-2xl mt-0.5 leading-relaxed">
              {channel.description}
            </p>
          </div>
        </div>

        {/* Channel Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end shrink-0">
          <Button
            type="button"
            variant={isSubscribed ? "secondary" : "default"}
            disabled={toggleSubscription.isPending}
            onClick={() => {
              toggleSubscription.mutate(channel.handle, {
                onSuccess: (res: { isSubscribed: boolean; subscribersCount: number }) => {
                  toast.success(
                    res.isSubscribed ? "চ্যানেল সাবস্ক্রাইব করা হয়েছে!" : "সাবস্ক্রিপশন বাতিল করা হয়েছে",
                  );
                },
                onError: () => {
                  toast.error("সাবস্ক্রাইব করতে অনুগ্রহ করে লগইন করুন");
                },
              });
            }}
            className={cn(
              "rounded-full px-6 text-sm font-semibold transition-all cursor-pointer",
              !isSubscribed && "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            {isSubscribed ? "সাবস্ক্রাইবড" : "সাবস্ক্রাইব"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsShareOpen(true)}
            className="rounded-full size-10 border-border/70 hover:bg-muted cursor-pointer"
            title="চ্যানেল শেয়ার করুন"
            aria-label="চ্যানেল শেয়ার করুন"
          >
            <Share className="size-4" />
          </Button>

          <ShareSheet
            open={isShareOpen}
            onOpenChange={setIsShareOpen}
            url={`/watch/channel/${(channel.handle || "").replace("@", "")}`}
            title={channel.name}
            shareText={`${channel.name} - ${channel.handle} on Paws Academy`}
          />
        </div>
      </div>

      {/* Videos Section */}
      <div className="pt-2">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((vid) => (
              <WatchCard key={vid.id} video={vid} layout="grid" />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Play className="size-10 opacity-30 stroke-[1.5]" />
            <p className="font-medium text-sm">কোনো ভিডিও পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Playlists Section */}
      {playlists.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/60">
          <h2 className="text-xl font-bold text-foreground mb-4">প্লেলিস্ট</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8">
            {playlists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} layout="grid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
