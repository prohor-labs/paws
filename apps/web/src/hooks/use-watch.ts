"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  incrementVideoView,
  postWatchComment,
  syncWatchProgress,
  toggleCommentLike,
  toggleWatchInteraction,
  watchChannelQueryOptions,
  watchCommentsQueryOptions,
  watchFeedQueryOptions,
  watchPlaylistQueryOptions,
  watchQueryKeys,
  watchSavedQueryOptions,
  watchVideoQueryOptions,
} from "@/lib/watch/query-options";
import type { WatchChannel, WatchPlaylist, WatchVideo } from "@/types";

export function useWatchFeed(category?: string) {
  return useQuery(watchFeedQueryOptions(category));
}

export function useWatchVideo(id: string, initialData?: WatchVideo) {
  return useQuery({
    ...watchVideoQueryOptions(id),
    initialData: initialData
      ? {
          video: initialData,
          userProgress: null,
          userInteraction: null,
        }
      : undefined,
  });
}

export function useWatchChannel(
  handle: string,
  initialData?: { channel: WatchChannel; videos: WatchVideo[]; playlists: WatchPlaylist[] },
) {
  return useQuery({
    ...watchChannelQueryOptions(handle),
    initialData,
  });
}

export function useWatchPlaylist(
  slugOrId: string,
  initialData?: { playlist: WatchPlaylist; videos: WatchVideo[] },
) {
  return useQuery({
    ...watchPlaylistQueryOptions(slugOrId),
    initialData,
  });
}

export function useWatchComments(videoId: string) {
  return useQuery(watchCommentsQueryOptions(videoId));
}

export function useWatchSaved() {
  return useQuery(watchSavedQueryOptions());
}

export function useWatchMutations(videoId?: string) {
  const queryClient = useQueryClient();

  const syncProgressMutation = useMutation({
    mutationFn: (progress: {
      lastPositionSeconds: number;
      durationSeconds: number;
      completed?: boolean;
    }) => {
      if (!videoId) throw new Error("videoId is required for syncing progress");
      return syncWatchProgress(videoId, progress);
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: watchQueryKeys.feed() });
      }
    },
  });

  const interactionMutation = useMutation({
    mutationFn: (interaction: { isLiked?: boolean; isSaved?: boolean }) => {
      if (!videoId) throw new Error("videoId is required for interaction");
      return toggleWatchInteraction(videoId, interaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchQueryKeys.saved() });
      queryClient.invalidateQueries({ queryKey: watchQueryKeys.feed() });
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: watchQueryKeys.video(videoId) });
      }
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!videoId) throw new Error("videoId is required to post comment");
      return postWatchComment(videoId, content, parentId);
    },
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: watchQueryKeys.comments(videoId) });
      }
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => toggleCommentLike(commentId),
    onSuccess: () => {
      if (videoId) {
        queryClient.invalidateQueries({ queryKey: watchQueryKeys.comments(videoId) });
      }
    },
  });

  const recordView = (idToView?: string) => {
    const targetId = idToView || videoId;
    if (targetId) {
      incrementVideoView(targetId).catch(() => {});
    }
  };

  return {
    syncProgress: syncProgressMutation,
    toggleInteraction: interactionMutation,
    postComment: commentMutation,
    toggleCommentLike: likeCommentMutation,
    recordView,
  };
}
