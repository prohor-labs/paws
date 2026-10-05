"use client";

import { useMemo, useState } from "react";
import { Search } from "@/components/icons";
import { EmptyState, PageLoading } from "@/components/shared";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PlaylistCard } from "@/components/watch/playlist-card";
import { WatchCard } from "@/components/watch/watch-card";
import { useWatchFeed } from "@/hooks/use-watch";
import { EMPTY_WATCH_FEED_ITEMS } from "@/lib/consts/empty";
import type { WatchFeedItem } from "@/types";

const ITEMS_PER_PAGE = 100;

export function WatchFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: feedData, isLoading } = useWatchFeed();

  // Merge server data with fallback empty list
  const items: readonly WatchFeedItem[] = useMemo(() => {
    if (feedData?.videos && feedData.videos.length > 0) {
      return [...feedData.videos, ...(feedData.playlists || [])] as WatchFeedItem[];
    }
    return EMPTY_WATCH_FEED_ITEMS;
  }, [feedData]);

  const progressMap = useMemo(() => {
    const map = new Map<
      string,
      {
        lastPositionSeconds: number;
        durationSeconds: number;
        completed: boolean;
      }
    >();
    if (feedData?.videos) {
      for (const v of feedData.videos) {
        if (v.userProgress) {
          map.set(v.id, v.userProgress);
        }
      }
    }
    return map;
  }, [feedData]);

  const filteredItems = useMemo(() => {
    return items.filter((item: WatchFeedItem) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.type === "video" &&
          item.channel.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.type === "playlist" &&
          item.channelName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [items, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="text-sm placeholder:text-muted-foreground"
            />
          </InputGroup>
        </div>
      </div>

      {/* YouTube Native Grid Feed */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="কোনো ভিডিও পাওয়া যায়নি"
          description="অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন বা বানান পরীক্ষা করুন।"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-8">
            {paginatedItems.map((item) => {
              if (item.type === "playlist") {
                return <PlaylistCard key={item.id} playlist={item} />;
              }
              return <WatchCard key={item.id} video={item} progress={progressMap.get(item.id)} />;
            })}
          </div>

          {/* Pagination when total items exceed 100 */}
          {totalPages > 1 && (
            <div className="pt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text="পূর্ববর্তী"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      text="পরবর্তী"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
