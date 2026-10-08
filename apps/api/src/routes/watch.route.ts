import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { Hono } from "hono";

import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
import { db } from "../db";
import {
  watchChannels,
  watchCommentLikes,
  watchComments,
  watchInteractions,
  watchPlaylists,
  watchProgress,
  watchSubscriptions,
  watchVideos,
} from "../db/schema";
import { ApiError } from "../lib/errors";
import { formatDuration } from "../lib/format";
import type { AuthContextVariables } from "../middleware/auth.middleware";

export const watchRoute = new Hono<{ Variables: AuthContextVariables }>()
  .get(
    "/feed",
    zValidator(
      "query",
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        cursor: z.coerce.number().int().min(0).default(0),
        limit: z.coerce.number().int().min(1).max(50).default(20),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      const { category, search, cursor, limit } = c.req.valid("query");

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

      if (category && category !== "All") {
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

      const [totalCountResult] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(watchVideos)
        .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
        .where(whereClause);

      const total = totalCountResult?.count ?? 0;

      const videosQuery = db
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

      const videoRows = await videosQuery;

      const channelIds = Array.from(
        new Set(videoRows.map((v) => v.channel.id).filter(Boolean) as string[]),
      );
      const subCountsMap: Record<string, number> = {};
      if (channelIds.length > 0) {
        const subCounts = await db
          .select({
            channelId: watchSubscriptions.channelId,
            count: sql<number>`cast(count(*) as integer)`,
          })
          .from(watchSubscriptions)
          .where(inArray(watchSubscriptions.channelId, channelIds))
          .groupBy(watchSubscriptions.channelId);

        for (const sc of subCounts) {
          subCountsMap[sc.channelId] = sc.count;
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
        const videoIds = paginatedVideos.map((v) => v.id);

        const progressRows = await db
          .select({
            videoId: watchProgress.videoId,
            lastPositionSeconds: watchProgress.lastPositionSeconds,
            durationSeconds: watchProgress.durationSeconds,
            completed: watchProgress.completed,
          })
          .from(watchProgress)
          .where(and(eq(watchProgress.userId, user.id), inArray(watchProgress.videoId, videoIds)));

        for (const p of progressRows) {
          userProgressMap[p.videoId] = {
            lastPositionSeconds: p.lastPositionSeconds,
            durationSeconds: p.durationSeconds,
            completed: p.completed,
          };
        }

        const interactionRows = await db
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

        for (const inter of interactionRows) {
          userInteractionsMap[inter.videoId] = {
            isLiked: inter.isLiked,
            isSaved: inter.isSaved,
          };
        }
      }

      const playlists =
        cursor === 0
          ? await db
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

      return c.json({
        videos: paginatedVideos.map((v) => ({
          ...v,
          duration: formatDuration(v.durationSeconds),
          channel: {
            ...v.channel,
            subscribersCount: (v.channel.id && subCountsMap[v.channel.id]) ?? 0,
          },
          userProgress: userProgressMap[v.id] ?? null,
          userInteraction: userInteractionsMap[v.id] ?? null,
        })),
        playlists,
        nextCursor,
        total,
      });
    },
  )

  .get("/videos/:id", async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");

    const [video] = await db
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
      throw ApiError.notFound("Video not found");
    }

    const [subsCountRes] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(watchSubscriptions)
      .where(eq(watchSubscriptions.channelId, video.channel.id));

    const subscribersCount = subsCountRes?.count ?? 0;

    let isSubscribed = false;
    let userProgress = null;
    let userInteraction = null;

    if (user) {
      const [subResult, progressResult, interactionResult] = await Promise.all([
        db
          .select({
            id: watchSubscriptions.id,
          })
          .from(watchSubscriptions)
          .where(
            and(
              eq(watchSubscriptions.userId, user.id),
              eq(watchSubscriptions.channelId, video.channel.id),
            ),
          )
          .limit(1),
        db
          .select({
            lastPositionSeconds: watchProgress.lastPositionSeconds,
            durationSeconds: watchProgress.durationSeconds,
            completed: watchProgress.completed,
          })
          .from(watchProgress)
          .where(and(eq(watchProgress.userId, user.id), eq(watchProgress.videoId, id)))
          .limit(1),
        db
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

      const p = progressResult[0];
      if (p) {
        userProgress = {
          lastPositionSeconds: p.lastPositionSeconds,
          durationSeconds: p.durationSeconds,
          completed: p.completed,
        };
      }

      const inter = interactionResult[0];
      if (inter) {
        userInteraction = {
          isLiked: inter.isLiked,
          isSaved: inter.isSaved,
        };
      }
    }

    return c.json({
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
    });
  })

  .get("/channels/:handle", async (c) => {
    const handleParam = c.req.param("handle");
    const normalizedHandle = handleParam.startsWith("@") ? handleParam : `@${handleParam}`;
    const user = c.get("user");

    const [channel] = await db
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
      throw ApiError.notFound("Channel not found");
    }

    const [subsCountRes] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(watchSubscriptions)
      .where(eq(watchSubscriptions.channelId, channel.id));

    const subscribersCount = subsCountRes?.count ?? 0;
    let isSubscribed = false;

    if (user) {
      const [subRow] = await db
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

    const videos = await db
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

    const playlists = await db
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

    return c.json({
      channel: {
        ...channel,
        videoCount: videos.length,
        subscribersCount,
        isSubscribed,
      },
      videos: videos.map((v) => ({ ...v, duration: formatDuration(v.durationSeconds) })),
      playlists,
    });
  })

  .post("/channels/:handle/subscribe", async (c) => {
    const user = c.get("user");
    if (!user) throw ApiError.unauthorized();

    const handleParam = c.req.param("handle");
    const normalizedHandle = handleParam.startsWith("@") ? handleParam : `@${handleParam}`;

    const [channel] = await db
      .select({ id: watchChannels.id })
      .from(watchChannels)
      .where(eq(watchChannels.handle, normalizedHandle))
      .limit(1);

    if (!channel) {
      throw ApiError.notFound("Channel not found");
    }

    const [existing] = await db
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
      await db
        .delete(watchSubscriptions)
        .where(
          and(
            eq(watchSubscriptions.userId, user.id),
            eq(watchSubscriptions.channelId, channel.id),
          ),
        );
      isSubscribed = false;
    } else {
      await db.insert(watchSubscriptions).values({
        userId: user.id,
        channelId: channel.id,
      });
      isSubscribed = true;
    }

    const [subsCountRes] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(watchSubscriptions)
      .where(eq(watchSubscriptions.channelId, channel.id));

    return c.json({
      isSubscribed,
      subscribersCount: subsCountRes?.count ?? 0,
    });
  })

  .get("/playlists/:slugOrId", async (c) => {
    const slugOrId = c.req.param("slugOrId");

    const [playlist] = await db
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
      throw ApiError.notFound("Playlist not found");
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

    type PlaylistVideo = Awaited<ReturnType<ReturnType<typeof db.select<typeof videoSelect>>["from"]>>[number];

    let videos: PlaylistVideo[] = [];
    if (playlist.videoIds && playlist.videoIds.length > 0) {
      videos = await db
        .select(videoSelect)
        .from(watchVideos)
        .innerJoin(watchChannels, eq(watchVideos.channelId, watchChannels.id))
        .where(inArray(watchVideos.id, playlist.videoIds));
    }

    return c.json({
      playlist,
      videos: videos.map((v) => ({ ...v, duration: formatDuration(v.durationSeconds) })),
    });
  })

  .post("/videos/:id/view", async (c) => {
    const id = c.req.param("id");

    await db
      .update(watchVideos)
      .set({
        viewsCount: sql`${watchVideos.viewsCount} + 1`,
      })
      .where(eq(watchVideos.id, id));

    return c.json({ success: true });
  })

  .post(
    "/videos/:id/progress",
    zValidator(
      "json",
      z.object({
        lastPositionSeconds: z.number().int().nonnegative(),
        durationSeconds: z.number().int().nonnegative(),
        completed: z.boolean().optional(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) throw ApiError.unauthorized();

      const videoId = c.req.param("id");
      const { lastPositionSeconds, durationSeconds, completed } = c.req.valid("json");

      await db
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

      return c.json({ success: true });
    },
  )

  .post(
    "/videos/:id/interact",
    zValidator(
      "json",
      z.object({
        isLiked: z.boolean().optional(),
        isSaved: z.boolean().optional(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) throw ApiError.unauthorized();

      const videoId = c.req.param("id");
      const { isLiked, isSaved } = c.req.valid("json");

      const [existing] = await db
        .select({
          isLiked: watchInteractions.isLiked,
          isSaved: watchInteractions.isSaved,
        })
        .from(watchInteractions)
        .where(
          and(eq(watchInteractions.userId, user.id), eq(watchInteractions.videoId, videoId)),
        )
        .limit(1);

      const nextLiked = isLiked !== undefined ? isLiked : (existing?.isLiked ?? false);
      const nextSaved = isSaved !== undefined ? isSaved : (existing?.isSaved ?? false);

      await db
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
        await db
          .update(watchVideos)
          .set({
            likesCount: isLiked
              ? sql`${watchVideos.likesCount} + 1`
              : sql`GREATEST(0, ${watchVideos.likesCount} - 1)`,
          })
          .where(eq(watchVideos.id, videoId));
      }

      return c.json({
        isLiked: nextLiked,
        isSaved: nextSaved,
      });
    },
  )

  .get("/library/saved", async (c) => {
    const user = c.get("user");
    if (!user) throw ApiError.unauthorized();

    const savedRows = await db
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

    return c.json({
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
          type: "video" as const,
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
    });
  })

  .get("/videos/:id/comments", async (c) => {
    const videoId = c.req.param("id");
    const user = c.get("user");

    const comments = await db.query.watchComments.findMany({
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

    return c.json({
      comments: comments.map((comment) => ({
        id: comment.id,
        videoId: comment.videoId,
        content: comment.content,
        likesCount: comment.likesCount,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        author: {
          id: comment.user?.id,
          name: comment.user?.name ?? "Student",
          avatar: comment.user?.image ?? "",
        },
        isLikedByUser: user ? comment.likes.some((l) => l.userId === user.id) : false,
      })),
    });
  })

  .post(
    "/videos/:id/comments",
    zValidator(
      "json",
      z.object({
        content: z.string().min(1).max(2000),
        parentId: z.string().uuid().optional(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) throw ApiError.unauthorized();

      const videoId = c.req.param("id");
      const { content, parentId } = c.req.valid("json");

      const [newComment] = await db
        .insert(watchComments)
        .values({
          videoId,
          userId: user.id,
          content,
          parentId: parentId ?? null,
        })
        .returning();

      await db
        .update(watchVideos)
        .set({
          commentsCount: sql`${watchVideos.commentsCount} + 1`,
        })
        .where(eq(watchVideos.id, videoId));

      return c.json({
        comment: {
          ...newComment,
          author: {
            id: user.id,
            name: user.name,
            avatar: user.image,
          },
          isLikedByUser: false,
        },
      });
    },
  )

  .post("/comments/:commentId/like", async (c) => {
    const user = c.get("user");
    if (!user) throw ApiError.unauthorized();

    const commentId = c.req.param("commentId");

    const [existing] = await db
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
      await db
        .delete(watchCommentLikes)
        .where(
          and(
            eq(watchCommentLikes.userId, user.id),
            eq(watchCommentLikes.commentId, commentId),
          ),
        );
      await db
        .update(watchComments)
        .set({
          likesCount: sql`GREATEST(0, ${watchComments.likesCount} - 1)`,
        })
        .where(eq(watchComments.id, commentId));
      isLiked = false;
    } else {
      await db.insert(watchCommentLikes).values({
        userId: user.id,
        commentId: commentId,
      });
      await db
        .update(watchComments)
        .set({
          likesCount: sql`${watchComments.likesCount} + 1`,
        })
        .where(eq(watchComments.id, commentId));
      isLiked = true;
    }

    return c.json({ isLiked });
  });
