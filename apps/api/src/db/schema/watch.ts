import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const watchChannels = pgTable(
  "watch_channels",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    handle: text().notNull(),
    name: text().notNull(),
    avatar: text().notNull(),
    banner: text(),
    subscribers: integer().default(0).notNull(),
    videoCount: integer("video_count").default(0).notNull(),
    verified: boolean().default(false).notNull(),
    description: text().default("").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("watch_channels_handle_unique").on(table.handle),
    check(
      "watch_channels_counts_check",
      sql`${table.subscribers} >= 0 and ${table.videoCount} >= 0`,
    ),
  ],
);

export const watchVideos = pgTable(
  "watch_videos",
  {
    id: text().primaryKey().notNull(),
    youtubeId: text("youtube_id").notNull(),
    title: text().notNull(),
    description: text().default("").notNull(),
    channelId: uuid("channel_id").notNull(),
    category: text().default("All").notNull(),
    durationSeconds: integer("duration_seconds").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    tags: text()
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    customThumbnail: text("custom_thumbnail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("watch_videos_category_idx").using("btree", table.category.asc().nullsLast()),
    index("watch_videos_channel_idx").using(
      "btree",
      table.channelId.asc().nullsLast(),
      table.publishedAt.desc(),
    ),
    unique("watch_videos_youtube_id_unique").on(table.youtubeId),
    foreignKey({
      columns: [table.channelId],
      foreignColumns: [watchChannels.id],
      name: "watch_videos_channel_id_watch_channels_id_fk",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    check(
      "watch_videos_metrics_check",
      sql`${table.durationSeconds} >= 0 and ${table.viewsCount} >= 0 and ${table.likesCount} >= 0 and ${table.commentsCount} >= 0`,
    ),
  ],
);

export const watchPlaylists = pgTable(
  "watch_playlists",
  {
    id: text().primaryKey().notNull(),
    slug: text().notNull(),
    title: text().notNull(),
    description: text().default("").notNull(),
    customCover: text("custom_cover").notNull(),
    category: text().default("All").notNull(),
    channelId: uuid("channel_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("watch_playlists_slug_unique").on(table.slug),
    foreignKey({
      columns: [table.channelId],
      foreignColumns: [watchChannels.id],
      name: "watch_playlists_channel_id_watch_channels_id_fk",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const watchPlaylistVideos = pgTable(
  "watch_playlist_videos",
  {
    playlistId: text("playlist_id").notNull(),
    videoId: text("video_id").notNull(),
    position: integer().default(0).notNull(),
  },
  (table) => [
    index("watch_playlist_videos_video_idx").using("btree", table.videoId.asc().nullsLast()),
    uniqueIndex("watch_playlist_videos_playlist_position_unique").on(
      table.playlistId,
      table.position,
    ),
    primaryKey({ columns: [table.playlistId, table.videoId], name: "watch_playlist_videos_pk" }),
    foreignKey({
      columns: [table.playlistId],
      foreignColumns: [watchPlaylists.id],
      name: "watch_playlist_videos_playlist_id_watch_playlists_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.videoId],
      foreignColumns: [watchVideos.id],
      name: "watch_playlist_videos_video_id_watch_videos_id_fk",
    }).onDelete("cascade"),
    check("watch_playlist_videos_position_check", sql`${table.position} >= 0`),
  ],
);

export const watchComments = pgTable(
  "watch_comments",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    videoId: text("video_id").notNull(),
    userId: uuid("user_id").notNull(),
    parentId: uuid("parent_id"),
    content: text().notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("watch_comments_video_created_idx").using(
      "btree",
      table.videoId.asc().nullsLast(),
      table.createdAt.desc(),
    ),
    index("watch_comments_user_idx").using("btree", table.userId.asc().nullsLast()),
    index("watch_comments_parent_idx").using("btree", table.parentId.asc().nullsLast()),
    foreignKey({
      columns: [table.videoId],
      foreignColumns: [watchVideos.id],
      name: "watch_comments_video_id_watch_videos_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "watch_comments_parent_id_watch_comments_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "watch_comments_user_id_user_id_fk",
    }).onDelete("cascade"),
    check("watch_comments_likes_check", sql`${table.likesCount} >= 0`),
  ],
);

export const watchSubscriptions = pgTable(
  "watch_subscriptions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    channelId: uuid("channel_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("watch_subscriptions_channel_idx").using("btree", table.channelId.asc().nullsLast()),
    unique("watch_subscriptions_user_channel_unique").on(table.userId, table.channelId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "watch_subscriptions_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.channelId],
      foreignColumns: [watchChannels.id],
      name: "watch_subscriptions_channel_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const watchInteractions = pgTable(
  "watch_interactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    videoId: text("video_id").notNull(),
    isLiked: boolean("is_liked").default(false).notNull(),
    isSaved: boolean("is_saved").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("watch_interactions_video_idx").using("btree", table.videoId.asc().nullsLast()),
    unique("watch_interactions_user_video_unique").on(table.userId, table.videoId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "watch_interactions_user_id_user_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.videoId],
      foreignColumns: [watchVideos.id],
      name: "watch_interactions_video_id_watch_videos_id_fk",
    }).onDelete("cascade"),
  ],
);

export const watchProgress = pgTable(
  "watch_progress",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    videoId: text("video_id").notNull(),
    lastPositionSeconds: integer("last_position_seconds").default(0).notNull(),
    durationSeconds: integer("duration_seconds").default(0).notNull(),
    completed: boolean().default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("watch_progress_video_idx").using("btree", table.videoId.asc().nullsLast()),
    unique("watch_progress_user_video_unique").on(table.userId, table.videoId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "watch_progress_user_id_user_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.videoId],
      foreignColumns: [watchVideos.id],
      name: "watch_progress_video_id_watch_videos_id_fk",
    }).onDelete("cascade"),
    check(
      "watch_progress_position_check",
      sql`${table.lastPositionSeconds} >= 0 and ${table.durationSeconds} >= 0`,
    ),
  ],
);

export const watchCommentLikes = pgTable(
  "watch_comment_likes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    commentId: uuid("comment_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("watch_comment_likes_user_comment_unique").on(table.commentId, table.userId),
    foreignKey({
      columns: [table.commentId],
      foreignColumns: [watchComments.id],
      name: "watch_comment_likes_comment_id_watch_comments_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "watch_comment_likes_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);
