"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "@/components/icons";
import { EmptyState, PageLoading } from "@/components/shared";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { PlaylistCard } from "@/components/watch/playlist-card";
import { WatchCard } from "@/components/watch/watch-card";
import { useWatchInfiniteFeed } from "@/hooks/use-watch";
import { EMPTY_WATCH_FEED_ITEMS } from "@/lib/consts/empty";
import type { WatchFeedItem } from "@/types";

export function WatchFeed() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input for backend search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useWatchInfiniteFeed({
    search: debouncedSearch,
    limit: 20,
  });

  // Flatten all pages of videos & playlists
  const items: readonly WatchFeedItem[] = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) {
      return EMPTY_WATCH_FEED_ITEMS;
    }

    const allVideos: WatchFeedItem[] = [];
    const allPlaylists: WatchFeedItem[] = [];

    for (let i = 0; i < data.pages.length; i++) {
      const page = data.pages[i];
      if (page.videos) {
        for (const v of page.videos) {
          allVideos.push(v as WatchFeedItem);
        }
      }
      if (page.playlists && page.playlists.length > 0) {
        for (const p of page.playlists) {
          allPlaylists.push(p as WatchFeedItem);
        }
      }
    }

    // Playlists first, then video feed ranked by algorithmic score
    return [...allPlaylists, ...allVideos];
  }, [data]);

  const progressMap = useMemo(() => {
    const map = new Map<
      string,
      {
        lastPositionSeconds: number;
        durationSeconds: number;
        completed: boolean;
      }
    >();
    if (data?.pages) {
      for (const page of data.pages) {
        if (page.videos) {
          for (const v of page.videos) {
            if (v.userProgress) {
              map.set(v.id, v.userProgress);
            }
          }
        }
      }
    }
    return map;
  }, [data]);

  // Infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "600px", // Pre-fetch before user reaches the bottom
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1800px] mx-auto w-full pb-16 px-2 sm:px-6">
      {/* Top Search Bar using shadcn InputGroup */}
      <div className="flex justify-center w-full pt-1 pb-1">
        <div className="w-full max-w-xl">
          <InputGroup className="h-10 rounded-full bg-card/80 border-border/80 text-sm shadow-xs px-1">
            <InputGroupAddon align="inline-start">
              <Search className="size-4 text-muted-foreground ml-2" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="ভিডিও, বিষয় বা চ্যানেল খুঁজুন..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="text-sm placeholder:text-muted-foreground"
            />
          </InputGroup>
        </div>
      </div>

      {/* YouTube Native Grid Feed with Infinite Scroll */}
      {items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="কোনো ভিডিও পাওয়া যায়নি"
          description="অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন বা বানান পরীক্ষা করুন।"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8">
            {items.map((item) => {
              if (item.type === "playlist") {
                return <PlaylistCard key={item.id} playlist={item} />;
              }
              return <WatchCard key={item.id} video={item} progress={progressMap.get(item.id)} />;
            })}
          </div>

          {/* Infinite Scroll Sentinel & Loader */}
          <div ref={observerRef} className="w-full flex justify-center items-center py-8">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner className="size-4 text-primary" />
                <span>আরও ভিডিও লোড হচ্ছে...</span>
              </div>
            )}
            {!hasNextPage && items.length > 0 && (
              <div className="text-xs text-muted-foreground/60 py-4 font-medium">
                সব ভিডিও প্রদর্শিত হয়েছে
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
