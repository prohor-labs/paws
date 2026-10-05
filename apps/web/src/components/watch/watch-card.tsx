import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { MoreH, VerifiedBadge } from "@/components/icons";
import { getYouTubeThumbnailUrl } from "@/lib/youtube";
import type { WatchVideo } from "@/types";
import { WatchThumbnail } from "./watch-thumbnail";

function PlayIconSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      focusable="false"
      aria-hidden="true"
      fill="currentColor"
      {...props}
    >
      <title>Play</title>
      <path d="M5 4.623v14.755a1.5 1.5 0 002.261 1.294l12.766-7.51L22 12.002l-1.973-1.162L7.26 3.33A1.5 1.5 0 005 4.623Zm2 13.88V5.497L18.056 12 7 18.503Z" />
    </svg>
  );
}

export function WatchCard({
  video,
  layout = "grid",
  progress,
}: {
  video: WatchVideo & {
    viewsCount?: number;
    durationSeconds?: number;
  };
  layout?: "grid" | "list";
  progress?: {
    lastPositionSeconds: number;
    durationSeconds: number;
    completed: boolean;
  } | null;
}) {
  const isList = layout === "list";
  const thumbnailUrl = getYouTubeThumbnailUrl(video.youtubeId, "max");
  const fallbackUrl = getYouTubeThumbnailUrl(video.youtubeId, "mq");

  // Calculate percentage of video watched
  const progressPercent =
    progress && progress.durationSeconds > 0
      ? Math.min(100, Math.round((progress.lastPositionSeconds / progress.durationSeconds) * 100))
      : 0;

  const displayViews =
    video.viewsCount !== undefined
      ? video.viewsCount >= 1000000
        ? `${(video.viewsCount / 1000000).toFixed(1)}M`
        : video.viewsCount >= 1000
          ? `${(video.viewsCount / 1000).toFixed(0)}K`
          : `${video.viewsCount}`
      : video.views;

  return (
    <div
      className={
        isList
          ? "group flex flex-col sm:flex-row gap-3 rounded-2xl p-1.5 transition-all hover:bg-muted/30"
          : "group flex flex-col gap-3 rounded-2xl transition-all"
      }
    >
      {/* Video Thumbnail with YouTube 16:9 aspect and exact badge */}
      <Link
        href={`/watch/${video.id}`}
        className={
          isList
            ? "relative aspect-video w-full sm:w-44 sm:min-w-44 shrink-0 overflow-hidden rounded-xl bg-zinc-900"
            : "relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900"
        }
      >
        <WatchThumbnail
          src={thumbnailUrl}
          fallbackSrc={fallbackUrl}
          sizes={
            isList
              ? "(max-width: 640px) 100vw, 176px"
              : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />

        {/* Duration badge at bottom right */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-white text-[12px] font-medium leading-none tracking-tight z-10">
          {video.duration}
        </div>

        {/* YouTube style Red Resume Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </Link>

      {/* Video Metadata Container */}
      <div className="flex gap-3 flex-1 min-w-0">
        {!isList && video.channel && (
          <Link
            href={`/watch/channel/${(video.channel.handle || "").replace("@", "")}`}
            onClick={(e) => e.stopPropagation()}
            className="relative size-9 shrink-0 overflow-hidden rounded-full mt-0.5 bg-muted"
          >
            {video.channel.avatar ? (
              <Image src={video.channel.avatar} alt="" fill sizes="36px" className="object-cover" />
            ) : (
              <div className="size-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
                {(video.channel.name || "C").charAt(0)}
              </div>
            )}
          </Link>
        )}

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <Link
              href={`/watch/${video.id}`}
              className="font-semibold text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors"
              title={video.title}
            >
              {video.title}
            </Link>
            {!isList && (
              <button
                type="button"
                className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
                aria-label="More actions"
              >
                <MoreH className="size-4" />
              </button>
            )}
          </div>

          {video.channel && (
            <div className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground truncate">
              <Link
                href={`/watch/channel/${(video.channel.handle || "").replace("@", "")}`}
                className="hover:text-foreground transition-colors truncate"
              >
                {video.channel.name}
              </Link>
              {video.channel.verified && <VerifiedBadge className="size-3.5 shrink-0" />}
            </div>
          )}

          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <PlayIconSmall className="size-3 shrink-0 text-muted-foreground/70" />
            <span>{displayViews} বার দেখা হয়েছে</span>
            <span className="mx-0.5">•</span>
            <span>{video.publishedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
