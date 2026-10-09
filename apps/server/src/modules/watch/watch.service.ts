import { Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { DrizzleService } from '../../common/database/drizzle.service.js';
import {
  watchChannels,
  watchCommentLikes,
  watchComments,
  watchInteractions,
  watchPlaylists,
  watchProgress,
  watchSubscriptions,
  watchVideos,
} from '../../common/database/schema/index.js';
import { ApiError } from '../../common/errors/api-error.js';
import { formatDuration } from '../../common/utils/format.js';
import type { AuthUser } from '../../core/auth/auth.types.js';
import type {
  CreateWatchCommentDto,
  FeedQueryDto,
  WatchInteractionDto,
  WatchProgressDto,
} from './watch.dto.js';

function normalizeHandle(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
}

@Injectable()
export class WatchService {
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  async getFeed(user: AuthUser | null, query: FeedQueryDto) {
    const { category, search, cursor, limit } = query;

    const feedScore = sql<number>`(
      LOG(GREATEST(${watchVideos.viewsCount}, 1) + 1) * 2.0 +
      LOG(GREATEST(${watchVideos.likesCount}, 1) + 1) * 3.5 +
      (CASE
        WHEN ${watchVideos.publishedAt} >= now() - interval '1 day' THEN 20.0
        WHEN ${watchVideos.publishedAt} >= now() - interval '2 days' THEN 12.0
        WHEN ${watchVideos.publishedAt} >= now() - interval '7 days' THEN 7.0
        WHEN ${watchVideos.publishedAt} >= now() - interval '30 days' THEN 3.0
        ELSE 1.0
      END)
    )`;

    const conditions = [];

    if (category && category !== 'All') {
      conditions.push(eq(watchVideos.category, category));
    }

    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          sql`${watchVideos.title} ILIKE ${searchTerm}`,
          sql`${watchVideos.description} ILIKE ${searchTerm}`,
          sql`${watchChannels.name} ILIKE ${searchTerm}`,
          sql`${watchChannels.handle} ILIKE ${searchTerm}`,
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCountResult] = await this.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(watchVideos)
      .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
      .where(whereClause);

    const total = totalCountResult?.count ?? 0;

    const videoRows = await this.db
      .select({
        id: watchVideos.id,
        youtubeId: watchVideos.youtubeId,
        title: watchVideos.title,
        description: watchVideos.description,
        category: watchVideos.category,
        durationSeconds: watchVideos.durationSeconds,
        viewsCount: watchVideos.viewsCount,
        likesCount: watchVideos.likesCount,
        commentsCount: watchVideos.commentsCount,
        publishedAt: watchVideos.publishedAt,
        tags: watchVideos.tags,
        customThumbnail: watchVideos.customThumbnail,
        createdAt: watchVideos.createdAt,
        channel: {
          id: watchChannels.id,
          name: watchChannels.name,
          handle: watchChannels.handle,
          avatar: watchChannels.avatar,
          subscribers: watchChannels.subscribers,
          verified: watchChannels.verified,
        },
      })
      .from(watchVideos)
      .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
      .where(whereClause)
      .orderBy(desc(feedScore), desc(watchVideos.createdAt), desc(watchVideos.id))
      .offset(cursor)
      .limit(limit + 1);

    const channelIds = Array.from(new Set(videoRows.map((row) => row.channel.id).filter(Boolean)));
    const subCountsMap: Record<string, number> = {};
    if (channelIds.length > 0) {
      const subCounts = await this.db
        .select({
          channelId: watchSubscriptions.channelId,
          count: sql<number>`cast(count(*) as integer)`,
        })
        .from(watchSubscriptions)
        .where(inArray(watchSubscriptions.channelId, channelIds))
        .groupBy(watchSubscriptions.channelId);

      for (const subCount of subCounts) {
        subCountsMap[subCount.channelId] = subCount.count;
      }
    }

    const hasNextPage = videoRows.length > limit;
    const paginatedVideos = hasNextPage ? videoRows.slice(0, limit) : videoRows;
    const nextCursor = hasNextPage ? cursor + limit : null;

    const userProgressMap: Record<
      string,
      { lastPositionSeconds: number; durationSeconds: number; completed: boolean }
    > = {};
    const userInteractionsMap: Record<string, { isLiked: boolean; isSaved: boolean }> = {};

    if (user && paginatedVideos.length > 0) {
      const videoIds = paginatedVideos.map((row) => row.id);

      const progressRows = await this.db
        .select({
          videoId: watchProgress.videoId,
          lastPositionSeconds: watchProgress.lastPositionSeconds,
          durationSeconds: watchProgress.durationSeconds,
          completed: watchProgress.completed,
        })
        .from(watchProgress)
        .where(and(eq(watchProgress.userId, user.id), inArray(watchProgress.videoId, videoIds)));

      for (const progress of progressRows) {
        userProgressMap[progress.videoId] = {
          lastPositionSeconds: progress.lastPositionSeconds,
          durationSeconds: progress.durationSeconds,
          completed: progress.completed,
        };
      }

      const interactionRows = await this.db
        .select({
          videoId: watchInteractions.videoId,
          isLiked: watchInteractions.isLiked,
          isSaved: watchInteractions.isSaved,
        })
        .from(watchInteractions)
        .where(
          and(
            eq(watchInteractions.userId, user.id),
            inArray(watchInteractions.videoId, videoIds),
          ),
        );

      for (const interaction of interactionRows) {
        userInteractionsMap[interaction.videoId] = {
          isLiked: interaction.isLiked,
          isSaved: interaction.isSaved,
        };
      }
    }

    const playlists =
      cursor === 0
        ? await this.db
            .select({
              id: watchPlaylists.id,
              slug: watchPlaylists.slug,
              title: watchPlaylists.title,
              description: watchPlaylists.description,
              customCover: watchPlaylists.customCover,
              category: watchPlaylists.category,
              channelName: watchChannels.name,
              channelHandle: watchChannels.handle,
              videoIds: sql<string[]>`coalesce(array(select wpv.video_id from watch_playlist_videos wpv where wpv.playlist_id = ${watchPlaylists.id} order by wpv.position), '{}')`,
              createdAt: watchPlaylists.createdAt,
              updatedAt: watchPlaylists.updatedAt,
            })
            .from(watchPlaylists)
            .innerJoin(watchChannels, eq(watchPlaylists.channelId, watchChannels.id))
        : [];

    return {
      videos: paginatedVideos.map((video) => ({
        ...video,
        duration: formatDuration(video.durationSeconds),
        channel: {
          ...video.channel,
          subscribersCount: (video.channel.id && subCountsMap[video.channel.id]) || 0,
        },
        userProgress: userProgressMap[video.id] ?? null,
        userInteraction: userInteractionsMap[video.id] ?? null,
      })),
      playlists,
      nextCursor,
      total,
    };
  }

  async getVideo(id: string, user: AuthUser | null) {
    const [video] = await this.db
      .select({
        id: watchVideos.id,
        youtubeId: watchVideos.youtubeId,
        title: watchVideos.title,
        description: watchVideos.description,
        category: watchVideos.category,
        durationSeconds: watchVideos.durationSeconds,
        viewsCount: watchVideos.viewsCount,
        likesCount: watchVideos.likesCount,
        commentsCount: watchVideos.commentsCount,
        publishedAt: watchVideos.publishedAt,
        tags: watchVideos.tags,
        customThumbnail: watchVideos.customThumbnail,
        createdAt: watchVideos.createdAt,
        channel: {
          id: watchChannels.id,
          name: watchChannels.name,
          handle: watchChannels.handle,
          avatar: watchChannels.avatar,
          subscribers: watchChannels.subscribers,
          verified: watchChannels.verified,
        },
      })
      .from(watchVideos)
      .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
      .where(eq(watchVideos.id, id))
      .limit(1);

    if (!video) {
      throw ApiError.notFound('Video not found');
    }

    const [subsCountRes] = await this.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(watchSubscriptions)
      .where(eq(watchSubscriptions.channelId, video.channel.id));

    const subscribersCount = subsCountRes?.count ?? 0;

    let isSubscribed = false;
    let userProgress: {
      lastPositionSeconds: number;
      durationSeconds: number;
      completed: boolean;
    } | null = null;
    let userInteraction: { isLiked: boolean; isSaved: boolean } | null = null;

    if (user) {
      const [subResult, progressResult, interactionResult] = await Promise.all([
        this.db
          .select({ id: watchSubscriptions.id })
          .from(watchSubscriptions)
          .where(
            and(
              eq(watchSubscriptions.userId, user.id),
              eq(watchSubscriptions.channelId, video.channel.id),
            ),
          )
          .limit(1),
        this.db
          .select({
            lastPositionSeconds: watchProgress.lastPositionSeconds,
            durationSeconds: watchProgress.durationSeconds,
            completed: watchProgress.completed,
          })
          .from(watchProgress)
          .where(and(eq(watchProgress.userId, user.id), eq(watchProgress.videoId, id)))
          .limit(1),
        this.db
          .select({
            isLiked: watchInteractions.isLiked,
            isSaved: watchInteractions.isSaved,
          })
          .from(watchInteractions)
          .where(and(eq(watchInteractions.userId, user.id), eq(watchInteractions.videoId, id)))
          .limit(1),
      ]);

      if (subResult[0]) {
        isSubscribed = true;
      }

      const progress = progressResult[0];
      if (progress) {
        userProgress = {
          lastPositionSeconds: progress.lastPositionSeconds,
          durationSeconds: progress.durationSeconds,
          completed: progress.completed,
        };
      }

      const interaction = interactionResult[0];
      if (interaction) {
        userInteraction = {
          isLiked: interaction.isLiked,
          isSaved: interaction.isSaved,
        };
      }
    }

    return {
      video: {
        ...video,
        duration: formatDuration(video.durationSeconds),
        channel: {
          ...video.channel,
          subscribersCount,
          isSubscribed,
        },
      },
      userProgress,
      userInteraction,
    };
  }

  async getChannel(handleParam: string, user: AuthUser | null) {
    const normalizedHandle = normalizeHandle(handleParam);

    const [channel] = await this.db
      .select({
        id: watchChannels.id,
        name: watchChannels.name,
        handle: watchChannels.handle,
        avatar: watchChannels.avatar,
        banner: watchChannels.banner,
        description: watchChannels.description,
        subscribers: watchChannels.subscribers,
        verified: watchChannels.verified,
        createdAt: watchChannels.createdAt,
      })
      .from(watchChannels)
      .where(eq(watchChannels.handle, normalizedHandle))
      .limit(1);

    if (!channel) {
      throw ApiError.notFound('Channel not found');
    }

    const [subsCountRes] = await this.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(watchSubscriptions)
      .where(eq(watchSubscriptions.channelId, channel.id));

    const subscribersCount = subsCountRes?.count ?? 0;
    let isSubscribed = false;

    if (user) {
      const [subRow] = await this.db
        .select({ id: watchSubscriptions.id })
        .from(watchSubscriptions)
        .where(
          and(
            eq(watchSubscriptions.userId, user.id),
            eq(watchSubscriptions.channelId, channel.id),
          ),
        )
        .limit(1);
      if (subRow) {
        isSubscribed = true;
      }
    }

    const videos = await this.db
      .select({
        id: watchVideos.id,
        youtubeId: watchVideos.youtubeId,
        title: watchVideos.title,
        description: watchVideos.description,
        category: watchVideos.category,
        durationSeconds: watchVideos.durationSeconds,
        viewsCount: watchVideos.viewsCount,
        likesCount: watchVideos.likesCount,
        commentsCount: watchVideos.commentsCount,
        publishedAt: watchVideos.publishedAt,
        tags: watchVideos.tags,
        customThumbnail: watchVideos.customThumbnail,
        createdAt: watchVideos.createdAt,
        channel: {
          id: watchChannels.id,
          name: watchChannels.name,
          handle: watchChannels.handle,
          avatar: watchChannels.avatar,
          subscribers: watchChannels.subscribers,
          verified: watchChannels.verified,
        },
      })
      .from(watchVideos)
      .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
      .where(eq(watchChannels.handle, normalizedHandle))
      .limit(100);

    const playlists = await this.db
      .select({
        id: watchPlaylists.id,
        slug: watchPlaylists.slug,
        title: watchPlaylists.title,
        description: watchPlaylists.description,
        customCover: watchPlaylists.customCover,
        category: watchPlaylists.category,
        channelName: watchChannels.name,
        channelHandle: watchChannels.handle,
        videoIds: sql<string[]>`coalesce(array(select wpv.video_id from watch_playlist_videos wpv where wpv.playlist_id = ${watchPlaylists.id} order by wpv.position), '{}')`,
        createdAt: watchPlaylists.createdAt,
        updatedAt: watchPlaylists.updatedAt,
      })
      .from(watchPlaylists)
      .innerJoin(watchChannels, eq(watchPlaylists.channelId, watchChannels.id))
      .where(eq(watchChannels.handle, normalizedHandle));

    return {
      channel: {
        ...channel,
        videoCount: videos.length,
        subscribersCount,
        isSubscribed,
      },
      videos: videos.map((video) => ({
        ...video,
        duration: formatDuration(video.durationSeconds),
      })),
      playlists,
    };
  }

  async toggleSubscription(handleParam: string, user: AuthUser) {
    const normalizedHandle = normalizeHandle(handleParam);

    const [channel] = await this.db
      .select({ id: watchChannels.id })
      .from(watchChannels)
      .where(eq(watchChannels.handle, normalizedHandle))
      .limit(1);

    if (!channel) {
      throw ApiError.notFound('Channel not found');
    }

    const [existing] = await this.db
      .select({ id: watchSubscriptions.id })
      .from(watchSubscriptions)
      .where(
        and(
          eq(watchSubscriptions.userId, user.id),
          eq(watchSubscriptions.channelId, channel.id),
        ),
      )
      .limit(1);

    let isSubscribed = false;
    if (existing) {
      await this.db
        .delete(watchSubscriptions)
        .where(
          and(
            eq(watchSubscriptions.userId, user.id),
            eq(watchSubscriptions.channelId, channel.id),
          ),
        );
      isSubscribed = false;
    } else {
      await this.db.insert(watchSubscriptions).values({
        userId: user.id,
        channelId: channel.id,
      });
      isSubscribed = true;
    }

    const [subsCountRes] = await this.db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(watchSubscriptions)
      .where(eq(watchSubscriptions.channelId, channel.id));

    return {
      isSubscribed,
      subscribersCount: subsCountRes?.count ?? 0,
    };
  }

  async getPlaylist(slugOrId: string) {
    const [playlist] = await this.db
      .select({
        id: watchPlaylists.id,
        slug: watchPlaylists.slug,
        title: watchPlaylists.title,
        description: watchPlaylists.description,
        customCover: watchPlaylists.customCover,
        category: watchPlaylists.category,
        channelName: watchChannels.name,
        channelHandle: watchChannels.handle,
        videoIds: sql<string[]>`coalesce(array(select wpv.video_id from watch_playlist_videos wpv where wpv.playlist_id = ${watchPlaylists.id} order by wpv.position), '{}')`,
        createdAt: watchPlaylists.createdAt,
        updatedAt: watchPlaylists.updatedAt,
      })
      .from(watchPlaylists)
      .innerJoin(watchChannels, eq(watchPlaylists.channelId, watchChannels.id))
      .where(or(eq(watchPlaylists.slug, slugOrId), eq(watchPlaylists.id, slugOrId)))
      .limit(1);

    if (!playlist) {
      throw ApiError.notFound('Playlist not found');
    }

    const videoSelect = {
      id: watchVideos.id,
      youtubeId: watchVideos.youtubeId,
      title: watchVideos.title,
      description: watchVideos.description,
      category: watchVideos.category,
      durationSeconds: watchVideos.durationSeconds,
      viewsCount: watchVideos.viewsCount,
      likesCount: watchVideos.likesCount,
      commentsCount: watchVideos.commentsCount,
      publishedAt: watchVideos.publishedAt,
      tags: watchVideos.tags,
      customThumbnail: watchVideos.customThumbnail,
      channel: {
        name: watchChannels.name,
        handle: watchChannels.handle,
        avatar: watchChannels.avatar,
        subscribers: watchChannels.subscribers,
        verified: watchChannels.verified,
      },
    } as const;

    let videos: Array<Record<string, unknown>> = [];
    if (playlist.videoIds && playlist.videoIds.length > 0) {
      videos = await this.db
        .select(videoSelect)
        .from(watchVideos)
        .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
        .where(inArray(watchVideos.id, playlist.videoIds));
    }

    return {
      playlist,
      videos: videos.map((video) => ({
        ...video,
        duration: formatDuration(video.durationSeconds as number),
      })),
    };
  }

  async registerView(id: string) {
    await this.db
      .update(watchVideos)
      .set({
        viewsCount: sql`${watchVideos.viewsCount} + 1`,
      })
      .where(eq(watchVideos.id, id));

    return { success: true };
  }

  async syncProgress(videoId: string, user: AuthUser, body: WatchProgressDto) {
    const { lastPositionSeconds, durationSeconds, completed } = body;

    await this.db
      .insert(watchProgress)
      .values({
        userId: user.id,
        videoId,
        lastPositionSeconds,
        durationSeconds,
        completed: completed ?? false,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [watchProgress.userId, watchProgress.videoId],
        set: {
          lastPositionSeconds,
          durationSeconds,
          completed: completed ?? false,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  async toggleInteraction(videoId: string, user: AuthUser, body: WatchInteractionDto) {
    const { isLiked, isSaved } = body;

    const [existing] = await this.db
      .select({
        isLiked: watchInteractions.isLiked,
        isSaved: watchInteractions.isSaved,
      })
      .from(watchInteractions)
      .where(and(eq(watchInteractions.userId, user.id), eq(watchInteractions.videoId, videoId)))
      .limit(1);

    const nextLiked = isLiked !== undefined ? isLiked : (existing?.isLiked ?? false);
    const nextSaved = isSaved !== undefined ? isSaved : (existing?.isSaved ?? false);

    await this.db
      .insert(watchInteractions)
      .values({
        userId: user.id,
        videoId,
        isLiked: nextLiked,
        isSaved: nextSaved,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [watchInteractions.userId, watchInteractions.videoId],
        set: {
          isLiked: nextLiked,
          isSaved: nextSaved,
          updatedAt: new Date(),
        },
      });

    if (isLiked !== undefined && (!existing || existing.isLiked !== isLiked)) {
      await this.db
        .update(watchVideos)
        .set({
          likesCount: isLiked
            ? sql`${watchVideos.likesCount} + 1`
            : sql`GREATEST(0, ${watchVideos.likesCount} - 1)`,
        })
        .where(eq(watchVideos.id, videoId));
    }

    return {
      isLiked: nextLiked,
      isSaved: nextSaved,
    };
  }

  async getSavedLibrary(user: AuthUser) {
    const savedRows = await this.db
      .select({
        id: watchVideos.id,
        youtubeId: watchVideos.youtubeId,
        title: watchVideos.title,
        description: watchVideos.description,
        category: watchVideos.category,
        durationSeconds: watchVideos.durationSeconds,
        viewsCount: watchVideos.viewsCount,
        likesCount: watchVideos.likesCount,
        commentsCount: watchVideos.commentsCount,
        publishedAt: watchVideos.publishedAt,
        tags: watchVideos.tags,
        customThumbnail: watchVideos.customThumbnail,
        channelName: watchChannels.name,
        channelHandle: watchChannels.handle,
        channelAvatar: watchChannels.avatar,
        channelSubscribers: watchChannels.subscribers,
        channelVerified: watchChannels.verified,
        savedAt: watchInteractions.updatedAt,
      })
      .from(watchInteractions)
      .innerJoin(watchVideos, eq(watchInteractions.videoId, watchVideos.id))
      .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
      .where(and(eq(watchInteractions.userId, user.id), eq(watchInteractions.isSaved, true)))
      .orderBy(desc(watchInteractions.updatedAt));

    return {
      items: savedRows.map((row) => ({
        video: {
          id: row.id,
          youtubeId: row.youtubeId,
          title: row.title,
          description: row.description,
          category: row.category,
          duration: formatDuration(row.durationSeconds),
          durationSeconds: row.durationSeconds,
          views: `${row.viewsCount}`,
          likes: `${row.likesCount}`,
          commentsCount: `${row.commentsCount}`,
          publishedAt: row.publishedAt,
          tags: row.tags,
          type: 'video' as const,
          channel: {
            name: row.channelName,
            handle: row.channelHandle,
            avatar: row.channelAvatar,
            subscribers: row.channelSubscribers,
            verified: row.channelVerified,
          },
        },
        savedAt: row.savedAt.toISOString(),
      })),
    };
  }

  async getComments(videoId: string, user: AuthUser | null) {
    const comments = await this.db.query.watchComments.findMany({
      where: eq(watchComments.videoId, videoId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
        likes: true,
      },
      orderBy: [desc(watchComments.createdAt)],
    });

    return {
      comments: comments.map((comment) => ({
        id: comment.id,
        videoId: comment.videoId,
        content: comment.content,
        likesCount: comment.likesCount,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        author: {
          id: comment.user?.id,
          name: comment.user?.name ?? 'Student',
          avatar: comment.user?.image ?? '',
        },
        isLikedByUser: user ? comment.likes.some((like) => like.userId === user.id) : false,
      })),
    };
  }

  async createComment(videoId: string, user: AuthUser, body: CreateWatchCommentDto) {
    const [newComment] = await this.db
      .insert(watchComments)
      .values({
        videoId,
        userId: user.id,
        content: body.content,
        parentId: body.parentId ?? null,
      })
      .returning();

    await this.db
      .update(watchVideos)
      .set({
        commentsCount: sql`${watchVideos.commentsCount} + 1`,
      })
      .where(eq(watchVideos.id, videoId));

    return {
      comment: {
        ...newComment,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.image,
        },
        isLikedByUser: false,
      },
    };
  }

  async toggleCommentLike(commentId: string, user: AuthUser) {
    const [existing] = await this.db
      .select({ id: watchCommentLikes.id })
      .from(watchCommentLikes)
      .where(
        and(
          eq(watchCommentLikes.userId, user.id),
          eq(watchCommentLikes.commentId, commentId),
        ),
      )
      .limit(1);

    let isLiked = false;
    if (existing) {
      await this.db
        .delete(watchCommentLikes)
        .where(
          and(
            eq(watchCommentLikes.userId, user.id),
            eq(watchCommentLikes.commentId, commentId),
          ),
        );
      await this.db
        .update(watchComments)
        .set({
          likesCount: sql`GREATEST(0, ${watchComments.likesCount} - 1)`,
        })
        .where(eq(watchComments.id, commentId));
      isLiked = false;
    } else {
      await this.db.insert(watchCommentLikes).values({
        userId: user.id,
        commentId,
      });
      await this.db
        .update(watchComments)
        .set({
          likesCount: sql`${watchComments.likesCount} + 1`,
        })
        .where(eq(watchComments.id, commentId));
      isLiked = true;
    }

    return { isLiked };
  }
}
