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
  watchVideos,
} from "../db/schema";
import { ApiError } from "../lib/errors";
import type { AuthContextVariables } from "../middleware/auth.middleware";

export const watchRoute = new Hono<{ Variables: AuthContextVariables }>()
  // 1. Get/Sync Videos & Feed
  .get("/feed", async (c) => {
    const user = c.get("user");
    const category = c.req.query("category");

    let videosQuery = db
      .select({
        id: watchVideos.id,
        youtubeId: watchVideos.youtubeId,
        title: watchVideos.title,
        description: watchVideos.description,
        category: watchVideos.category,
        duration: watchVideos.duration,
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
      })
      .from(watchVideos)
      .innerJoin(watchChannels, eq(watchVideos.channelHandle, watchChannels.handle));

    if (category && category !== "All") {
      videosQuery = videosQuery.where(eq(watchVideos.category, category)) as any;
    }

    const videos = await videosQuery;

    // Fetch user progress if logged in
    const userProgressMap: Record<
      string,
      { lastPositionSeconds: number; durationSeconds: number; completed: boolean }
    > = {};
    const userInteractionsMap: Record<string, { isLiked: boolean; isSaved: boolean }> = {};

    if (user) {
      const progressRows = await db
        .select()
        .from(watchProgress)
        .where(eq(watchProgress.userId, user.id as any));

      for (const p of progressRows) {
        userProgressMap[p.videoId] = {
          lastPositionSeconds: p.lastPositionSeconds,
          durationSeconds: p.durationSeconds,
          completed: p.completed,
        };
      }

      const interactionRows = await db
        .select()
        .from(watchInteractions)
        .where(eq(watchInteractions.userId, user.id as any));

      for (const inter of interactionRows) {
        userInteractionsMap[inter.videoId] = {
          isLiked: inter.isLiked,
          isSaved: inter.isSaved,
        };
      }
    }

    const playlists = await db.select().from(watchPlaylists);

    return c.json({
      videos: videos.map((v) => ({
        ...v,
        userProgress: userProgressMap[v.id] ?? null,
        userInteraction: userInteractionsMap[v.id] ?? null,
      })),
      playlists,
    });
  })

  // 2. Get Single Video with Progress & Interactions
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
        duration: watchVideos.duration,
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
      })
      .from(watchVideos)
      .innerJoin(watchChannels, eq(watchVideos.channelHandle, watchChannels.handle))
      .where(eq(watchVideos.id, id))
      .limit(1);

    if (!video) {
      throw ApiError.notFound("Video not found");
    }

    let userProgress = null;
    let userInteraction = null;

    if (user) {
      const [p] = await db
        .select()
        .from(watchProgress)
        .where(and(eq(watchProgress.userId, user.id as any), eq(watchProgress.videoId, id)))
        .limit(1);
      if (p) {
        userProgress = {
          lastPositionSeconds: p.lastPositionSeconds,
          durationSeconds: p.durationSeconds,
          completed: p.completed,
        };
      }

      const [inter] = await db
        .select()
        .from(watchInteractions)
        .where(and(eq(watchInteractions.userId, user.id as any), eq(watchInteractions.videoId, id)))
        .limit(1);
      if (inter) {
        userInteraction = {
          isLiked: inter.isLiked,
          isSaved: inter.isSaved,
        };
      }
    }

    return c.json({
      video,
      userProgress,
      userInteraction,
    });
  })

  // 2b. Get Channel Details with its Videos and Playlists
  .get("/channels/:handle", async (c) => {
    const handleParam = c.req.param("handle");
    const normalizedHandle = handleParam.startsWith("@") ? handleParam : `@${handleParam}`;

    const [channel] = await db
      .select()
      .from(watchChannels)
      .where(eq(watchChannels.handle, normalizedHandle))
      .limit(1);

    if (!channel) {
      throw ApiError.notFound("Channel not found");
    }

    const videos = await db
      .select({
        id: watchVideos.id,
        youtubeId: watchVideos.youtubeId,
        title: watchVideos.title,
        description: watchVideos.description,
        category: watchVideos.category,
        duration: watchVideos.duration,
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
      })
      .from(watchVideos)
      .innerJoin(watchChannels, eq(watchVideos.channelHandle, watchChannels.handle))
      .where(eq(watchVideos.channelHandle, normalizedHandle));

    const playlists = await db
      .select()
      .from(watchPlaylists)
      .where(eq(watchPlaylists.channelHandle, normalizedHandle));

    return c.json({
      channel,
      videos,
      playlists,
    });
  })

  // 2c. Get Playlist Details with its Videos
  .get("/playlists/:slugOrId", async (c) => {
    const slugOrId = c.req.param("slugOrId");

    const [playlist] = await db
      .select()
      .from(watchPlaylists)
      .where(or(eq(watchPlaylists.slug, slugOrId), eq(watchPlaylists.id, slugOrId)))
      .limit(1);

    if (!playlist) {
      throw ApiError.notFound("Playlist not found");
    }

    let videos: any[] = [];
    if (playlist.videoIds && playlist.videoIds.length > 0) {
      videos = await db
        .select({
          id: watchVideos.id,
          youtubeId: watchVideos.youtubeId,
          title: watchVideos.title,
          description: watchVideos.description,
          category: watchVideos.category,
          duration: watchVideos.duration,
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
        })
        .from(watchVideos)
        .innerJoin(watchChannels, eq(watchVideos.channelHandle, watchChannels.handle))
        .where(inArray(watchVideos.id, playlist.videoIds));
    }

    return c.json({
      playlist,
      videos,
    });
  })

  // 3. Register View (Increment count)
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

  // 4. Update Playback Progress (Where left last time)
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
          userId: user.id as any,
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

  // 5. Toggle Like & Save
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

      // Check current interaction
      const [existing] = await db
        .select()
        .from(watchInteractions)
        .where(
          and(eq(watchInteractions.userId, user.id as any), eq(watchInteractions.videoId, videoId)),
        )
        .limit(1);

      const nextLiked = isLiked !== undefined ? isLiked : (existing?.isLiked ?? false);
      const nextSaved = isSaved !== undefined ? isSaved : (existing?.isSaved ?? false);

      await db
        .insert(watchInteractions)
        .values({
          userId: user.id as any,
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

      // Adjust video like count if changed
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

  // 6. Get Saved / Watch Later List
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
        duration: watchVideos.duration,
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
      .innerJoin(watchChannels, eq(watchVideos.channelHandle, watchChannels.handle))
      .where(and(eq(watchInteractions.userId, user.id as any), eq(watchInteractions.isSaved, true)))
      .orderBy(desc(watchInteractions.updatedAt));

    return c.json({
      items: savedRows.map((row) => ({
        video: {
          id: row.id,
          youtubeId: row.youtubeId,
          title: row.title,
          description: row.description,
          category: row.category,
          duration: row.duration,
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

  // 7. Get Comments for Video
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
        isLikedByUser: user ? comment.likes.some((l) => l.userId === (user.id as any)) : false,
      })),
    });
  })

  // 8. Post Comment
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
          userId: user.id as any,
          content,
          parentId: parentId as any,
        })
        .returning();

      // Increment video comments count
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

  // 9. Like/Unlike Comment
  .post("/comments/:commentId/like", async (c) => {
    const user = c.get("user");
    if (!user) throw ApiError.unauthorized();

    const commentId = c.req.param("commentId");

    const [existing] = await db
      .select()
      .from(watchCommentLikes)
      .where(
        and(
          eq(watchCommentLikes.userId, user.id as any),
          eq(watchCommentLikes.commentId, commentId as any),
        ),
      )
      .limit(1);

    let isLiked = false;
    if (existing) {
      await db
        .delete(watchCommentLikes)
        .where(
          and(
            eq(watchCommentLikes.userId, user.id as any),
            eq(watchCommentLikes.commentId, commentId as any),
          ),
        );
      await db
        .update(watchComments)
        .set({
          likesCount: sql`GREATEST(0, ${watchComments.likesCount} - 1)`,
        })
        .where(eq(watchComments.id, commentId as any));
      isLiked = false;
    } else {
      await db.insert(watchCommentLikes).values({
        userId: user.id as any,
        commentId: commentId as any,
      });
      await db
        .update(watchComments)
        .set({
          likesCount: sql`${watchComments.likesCount} + 1`,
        })
        .where(eq(watchComments.id, commentId as any));
      isLiked = true;
    }

    return c.json({ isLiked });
  });
