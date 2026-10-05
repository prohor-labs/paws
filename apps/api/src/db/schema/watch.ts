import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const watchChannels = pgTable(
  "watch_channels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    handle: text("handle").notNull().unique(),
    name: text("name").notNull(),
    avatar: text("avatar").notNull(),
    banner: text("banner"),
    subscribers: text("subscribers").default("0 subscribers").notNull(),
    videoCount: text("video_count").default("0 videos").notNull(),
    verified: boolean("verified").default(false).notNull(),
    description: text("description").default("").notNull(),
    joinedDate: text("joined_date").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("watch_channels_handle_idx").on(table.handle)],
);

export const watchVideos = pgTable(
  "watch_videos",
  {
    id: text("id").primaryKey(), // Using youtubeId or custom slug/id
    youtubeId: text("youtube_id").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    channelHandle: text("channel_handle")
      .notNull()
      .references(() => watchChannels.handle, { onDelete: "cascade" }),
    category: text("category").default("All").notNull(),
    duration: text("duration").default("0:00").notNull(),
    durationSeconds: integer("duration_seconds").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    publishedAt: text("published_at").default("Just now").notNull(),
    tags: text("tags").array().default([]).notNull(),
    customThumbnail: text("custom_thumbnail"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("watch_videos_youtube_id_idx").on(table.youtubeId),
    index("watch_videos_channel_handle_idx").on(table.channelHandle),
    index("watch_videos_category_idx").on(table.category),
  ],
);

export const watchPlaylists = pgTable(
  "watch_playlists",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    customCover: text("custom_cover").notNull(),
    category: text("category").default("All").notNull(),
    channelName: text("channel_name").notNull(),
    channelHandle: text("channel_handle"),
    videoIds: text("video_ids").array().default([]).notNull(),
    createdDate: text("created_date").default("Recently").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("watch_playlists_slug_idx").on(table.slug)],
);

export const watchProgress = pgTable(
  "watch_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => watchVideos.id, { onDelete: "cascade" }),
    lastPositionSeconds: integer("last_position_seconds").default(0).notNull(),
    durationSeconds: integer("duration_seconds").default(0).notNull(),
    completed: boolean("completed").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("watch_progress_user_video_unique").on(table.userId, table.videoId),
    index("watch_progress_user_idx").on(table.userId),
    index("watch_progress_video_idx").on(table.videoId),
  ],
);

export const watchInteractions = pgTable(
  "watch_interactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => watchVideos.id, { onDelete: "cascade" }),
    isLiked: boolean("is_liked").default(false).notNull(),
    isSaved: boolean("is_saved").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("watch_interactions_user_video_unique").on(table.userId, table.videoId),
    index("watch_interactions_user_idx").on(table.userId),
    index("watch_interactions_video_idx").on(table.videoId),
  ],
);

export const watchComments = pgTable(
  "watch_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    videoId: text("video_id")
      .notNull()
      .references(() => watchVideos.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    content: text("content").notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("watch_comments_video_idx").on(table.videoId),
    index("watch_comments_user_idx").on(table.userId),
    index("watch_comments_parent_idx").on(table.parentId),
  ],
);

export const watchCommentLikes = pgTable(
  "watch_comment_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => watchComments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("watch_comment_likes_user_comment_unique").on(table.userId, table.commentId),
    index("watch_comment_likes_comment_idx").on(table.commentId),
  ],
);

// Relations
export const watchChannelsRelations = relations(watchChannels, ({ many }) => ({
  videos: many(watchVideos),
}));

export const watchVideosRelations = relations(watchVideos, ({ one, many }) => ({
  channel: one(watchChannels, {
    fields: [watchVideos.channelHandle],
    references: [watchChannels.handle],
  }),
  progressList: many(watchProgress),
  interactions: many(watchInteractions),
  comments: many(watchComments),
}));

export const watchProgressRelations = relations(watchProgress, ({ one }) => ({
  user: one(user, {
    fields: [watchProgress.userId],
    references: [user.id],
  }),
  video: one(watchVideos, {
    fields: [watchProgress.videoId],
    references: [watchVideos.id],
  }),
}));

export const watchInteractionsRelations = relations(watchInteractions, ({ one }) => ({
  user: one(user, {
    fields: [watchInteractions.userId],
    references: [user.id],
  }),
  video: one(watchVideos, {
    fields: [watchInteractions.videoId],
    references: [watchVideos.id],
  }),
}));

export const watchCommentsRelations = relations(watchComments, ({ one, many }) => ({
  user: one(user, {
    fields: [watchComments.userId],
    references: [user.id],
  }),
  video: one(watchVideos, {
    fields: [watchComments.videoId],
    references: [watchVideos.id],
  }),
  parent: one(watchComments, {
    fields: [watchComments.parentId],
    references: [watchComments.id],
    relationName: "commentReplies",
  }),
  replies: many(watchComments, {
    relationName: "commentReplies",
  }),
  likes: many(watchCommentLikes),
}));
