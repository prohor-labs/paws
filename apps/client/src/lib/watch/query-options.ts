import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { api, watchKeys } from "@/lib/api";
import type { WatchCommentItem } from "@/lib/api/types";

export const watchQueryKeys = watchKeys;

export type {
  WatchChannelDetailResponse,
  WatchFeedResponse,
  WatchPlaylistDetailResponse,
  WatchVideoDetailResponse,
} from "@/lib/api/types";

const ONE_MINUTE = 60 * 1000;
const TEN_SECONDS = 10 * 1000;

export function watchFeedInfiniteQueryOptions({
  category,
  search,
  limit = 20,
}: {
  category?: string;
  search?: string;
  limit?: number;
} = {}) {
  return infiniteQueryOptions({
    queryKey: watchQueryKeys.feed(category, search),
    queryFn: ({ pageParam = 0 }) =>
      api.watch.getFeed({
        category: category && category !== "All" ? category : undefined,
        search: search && search.trim().length > 0 ? search.trim() : undefined,
        cursor: pageParam,
        limit,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: ONE_MINUTE,
  });
}

export function watchVideoQueryOptions(id: string) {
  return queryOptions({
    queryKey: watchQueryKeys.video(id),
    queryFn: () => api.watch.getVideo(id),
    staleTime: ONE_MINUTE,
  });
}

export function watchChannelQueryOptions(handle: string) {
  return queryOptions({
    queryKey: watchQueryKeys.channel(handle),
    queryFn: () => api.watch.getChannel(handle),
    staleTime: ONE_MINUTE,
  });
}

export function watchPlaylistQueryOptions(slugOrId: string) {
  return queryOptions({
    queryKey: watchQueryKeys.playlist(slugOrId),
    queryFn: () => api.watch.getPlaylist(slugOrId),
    staleTime: ONE_MINUTE,
  });
}

export function watchCommentsQueryOptions(id: string) {
  return queryOptions({
    queryKey: watchQueryKeys.comments(id),
    queryFn: () => api.watch.getComments(id),
    staleTime: TEN_SECONDS,
  });
}

export function syncWatchProgress(
  videoId: string,
  progress: { lastPositionSeconds: number; durationSeconds: number; completed?: boolean },
) {
  return api.watch.syncProgress(videoId, progress);
}

export function toggleWatchInteraction(
  videoId: string,
  interaction: { isLiked?: boolean; isSaved?: boolean },
) {
  return api.watch.toggleInteraction(videoId, interaction);
}

export function postWatchComment(videoId: string, content: string, parentId?: string) {
  return api.watch.postComment(videoId, content, parentId);
}

export function toggleCommentLike(commentId: string) {
  return api.watch.toggleCommentLike(commentId);
}

export function incrementVideoView(videoId: string) {
  return api.watch.registerView(videoId);
}

export function toggleChannelSubscription(handle: string) {
  return api.watch.toggleSubscription(handle);
}

export type { WatchCommentItem };
