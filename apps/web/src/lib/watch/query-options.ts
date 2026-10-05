import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/sdk";
import type { WatchChannel, WatchCommentItem, WatchPlaylist, WatchVideo } from "@/types";

export const watchQueryKeys = {
  all: ["watch"] as const,
  feed: (category?: string) => ["watch", "feed", category ?? "All"] as const,
  video: (id: string) => ["watch", "video", id] as const,
  channel: (handle: string) => ["watch", "channel", handle] as const,
  playlist: (slugOrId: string) => ["watch", "playlist", slugOrId] as const,
  comments: (id: string) => ["watch", "comments", id] as const,
  saved: () => ["watch", "library", "saved"] as const,
};

async function unwrap<T>(
  res: { ok: boolean; json: () => Promise<unknown> },
  message: string,
): Promise<T> {
  if (!res.ok) {
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export interface WatchFeedResponse {
  videos: (WatchVideo & {
    userProgress?: {
      lastPositionSeconds: number;
      durationSeconds: number;
      completed: boolean;
    } | null;
    userInteraction?: {
      isLiked: boolean;
      isSaved: boolean;
    } | null;
  })[];
  playlists: WatchPlaylist[];
}

export interface WatchVideoDetailResponse {
  video: WatchVideo;
  userProgress?: {
    lastPositionSeconds: number;
    durationSeconds: number;
    completed: boolean;
  } | null;
  userInteraction?: {
    isLiked: boolean;
    isSaved: boolean;
  } | null;
}

export interface WatchChannelDetailResponse {
  channel: WatchChannel;
  videos: WatchVideo[];
  playlists: WatchPlaylist[];
}

export interface WatchPlaylistDetailResponse {
  playlist: WatchPlaylist;
  videos: WatchVideo[];
}

export function watchFeedQueryOptions(category?: string) {
  return queryOptions({
    queryKey: watchQueryKeys.feed(category),
    queryFn: async () => {
      const res = await api.rpc.watch.feed.$get({
        query: category && category !== "All" ? { category } : undefined,
      });
      return unwrap<WatchFeedResponse>(res, "Failed to fetch watch feed");
    },
    staleTime: 60 * 1000,
  });
}

export function watchVideoQueryOptions(id: string) {
  return queryOptions({
    queryKey: watchQueryKeys.video(id),
    queryFn: async () => {
      const res = await api.rpc.watch.videos[":id"].$get({
        param: { id },
      });
      return unwrap<WatchVideoDetailResponse>(res, "Failed to fetch video");
    },
    staleTime: 60 * 1000,
  });
}

export function watchChannelQueryOptions(handle: string) {
  return queryOptions({
    queryKey: watchQueryKeys.channel(handle),
    queryFn: async () => {
      const res = await api.rpc.watch.channels[":handle"].$get({
        param: { handle },
      });
      return unwrap<WatchChannelDetailResponse>(res, "Failed to fetch channel details");
    },
    staleTime: 60 * 1000,
  });
}

export function watchPlaylistQueryOptions(slugOrId: string) {
  return queryOptions({
    queryKey: watchQueryKeys.playlist(slugOrId),
    queryFn: async () => {
      const res = await api.rpc.watch.playlists[":slugOrId"].$get({
        param: { slugOrId },
      });
      return unwrap<WatchPlaylistDetailResponse>(res, "Failed to fetch playlist details");
    },
    staleTime: 60 * 1000,
  });
}

export function watchCommentsQueryOptions(id: string) {
  return queryOptions({
    queryKey: watchQueryKeys.comments(id),
    queryFn: async () => {
      const res = await api.rpc.watch.videos[":id"].comments.$get({
        param: { id },
      });
      return unwrap<{ comments: WatchCommentItem[] }>(res, "Failed to fetch comments");
    },
    staleTime: 10 * 1000,
  });
}

export function watchSavedQueryOptions() {
  return queryOptions({
    queryKey: watchQueryKeys.saved(),
    queryFn: async () => {
      const res = await api.rpc.watch.library.saved.$get();
      return unwrap<{ items: { video: WatchVideo; savedAt: string }[] }>(
        res,
        "Failed to fetch saved videos",
      );
    },
    staleTime: 30 * 1000,
  });
}

// API Mutations
export async function syncWatchProgress(
  videoId: string,
  progress: { lastPositionSeconds: number; durationSeconds: number; completed?: boolean },
) {
  const res = await api.rpc.watch.videos[":id"].progress.$post({
    param: { id: videoId },
    json: progress,
  });
  return unwrap<{ success: boolean }>(res, "Failed to sync progress");
}

export async function toggleWatchInteraction(
  videoId: string,
  interaction: { isLiked?: boolean; isSaved?: boolean },
) {
  const res = await api.rpc.watch.videos[":id"].interact.$post({
    param: { id: videoId },
    json: interaction,
  });
  return unwrap<{ isLiked: boolean; isSaved: boolean }>(res, "Failed to update interaction");
}

export async function postWatchComment(videoId: string, content: string, parentId?: string) {
  const res = await api.rpc.watch.videos[":id"].comments.$post({
    param: { id: videoId },
    json: { content, parentId },
  });
  return unwrap<{ comment: WatchCommentItem }>(res, "Failed to post comment");
}

export async function toggleCommentLike(commentId: string) {
  const res = await api.rpc.watch.comments[":commentId"].like.$post({
    param: { commentId },
  });
  return unwrap<{ isLiked: boolean }>(res, "Failed to toggle comment like");
}

export async function incrementVideoView(videoId: string) {
  const res = await api.rpc.watch.videos[":id"].view.$post({
    param: { id: videoId },
  });
  return unwrap<{ success: boolean }>(res, "Failed to register view");
}
