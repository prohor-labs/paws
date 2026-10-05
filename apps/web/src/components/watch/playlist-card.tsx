import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { MoreH } from "@/components/icons";
import type { WatchPlaylist } from "@/types";

function PlaylistCollectionIcon(props: SVGProps<SVGSVGElement>) {
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
      <title>Playlist</title>
      <path d="M3 3.657v16.689a1 1 0 001.466.883L8 19.369V4.632l-3.534-1.86A1 1 0 003 3.657ZM14 7.79l-4-2.105v12.631l4-2.106V7.79ZM22 12l-6-3.157v6.315L22 12Z" />
    </svg>
  );
}

export function PlaylistCard({
  playlist,
  layout = "grid",
}: {
  playlist: WatchPlaylist;
  layout?: "grid" | "list";
}) {
  const firstVideoId = playlist.videoIds[0] ?? "";
  const isList = layout === "list";

  return (
    <div
      className={
        isList
          ? "group flex flex-col sm:flex-row gap-3 rounded-2xl p-1.5 transition-all hover:bg-muted/30"
          : "group flex flex-col gap-3 rounded-2xl transition-all"
      }
    >
      {/* YouTube Collection Stack thumbnail wrapper */}
      <Link
        href={`/watch/${firstVideoId}?list=${playlist.id}`}
        className={
          isList
            ? "relative aspect-video w-full sm:w-44 sm:min-w-44 shrink-0 overflow-hidden rounded-xl bg-zinc-900"
            : "relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900"
        }
      >
        {/* Layer stack backgrounds mimicking YouTube collection stack */}
        <div className="absolute top-0 inset-x-2 h-1 -translate-y-1 bg-zinc-700/60 rounded-t-lg z-0" />
        <div className="absolute top-0 inset-x-1 h-1 -translate-y-0.5 bg-zinc-600/70 rounded-t-lg z-0" />

        <Image
          src={playlist.customCover}
          alt=""
          fill
          sizes={
            isList
              ? "(max-width: 640px) 100vw, 176px"
              : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />

        {/* YouTube style Mix / Playlist bottom right badge */}
        <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-xs text-white text-[12px] font-medium flex items-center gap-1">
          <PlaylistCollectionIcon className="size-3.5 fill-current" />
          <span>প্লেলিস্ট</span>
        </div>
      </Link>

      {/* Playlist Metadata */}
      <div className="flex gap-3 flex-1 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <Link
              href={`/watch/${firstVideoId}?list=${playlist.id}`}
              className="font-semibold text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors"
              title={playlist.title}
            >
              {playlist.title}
            </Link>
            {!isList && (
              <button
                type="button"
                className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer shrink-0"
                aria-label="আরও বিকল্প"
              >
                <MoreH className="size-4" />
              </button>
            )}
          </div>

          <div className="mt-1 text-[13px] text-muted-foreground truncate">
            <span>{playlist.channelName}</span>
          </div>

          <div className="text-[13px] text-muted-foreground">
            <span>প্লেলিস্ট</span>
          </div>
        </div>
      </div>
    </div>
  );
}
