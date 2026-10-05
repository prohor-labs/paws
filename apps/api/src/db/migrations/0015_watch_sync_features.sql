CREATE TABLE IF NOT EXISTS "watch_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"handle" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text NOT NULL,
	"banner" text,
	"subscribers" text DEFAULT '0 subscribers' NOT NULL,
	"video_count" text DEFAULT '0 videos' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"joined_date" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_channels_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_videos" (
	"id" text PRIMARY KEY NOT NULL,
	"youtube_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"channel_handle" text NOT NULL,
	"category" text DEFAULT 'All' NOT NULL,
	"duration" text DEFAULT '0:00' NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"comments_count" integer DEFAULT 0 NOT NULL,
	"published_at" text DEFAULT 'Just now' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"custom_thumbnail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_videos_youtube_id_unique" UNIQUE("youtube_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_playlists" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"custom_cover" text NOT NULL,
	"category" text DEFAULT 'All' NOT NULL,
	"channel_name" text NOT NULL,
	"channel_handle" text,
	"video_ids" text[] DEFAULT '{}' NOT NULL,
	"created_date" text DEFAULT 'Recently' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_playlists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" text NOT NULL,
	"last_position_seconds" integer DEFAULT 0 NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_progress_user_video_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" text NOT NULL,
	"is_liked" boolean DEFAULT false NOT NULL,
	"is_saved" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_interactions_user_video_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_comment_likes_user_comment_unique" UNIQUE("user_id","comment_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_videos" ADD CONSTRAINT "watch_videos_channel_handle_watch_channels_handle_fk" FOREIGN KEY ("channel_handle") REFERENCES "watch_channels"("handle") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_video_id_watch_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "watch_videos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_interactions" ADD CONSTRAINT "watch_interactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_interactions" ADD CONSTRAINT "watch_interactions_video_id_watch_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "watch_videos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_video_id_watch_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "watch_videos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_comment_likes" ADD CONSTRAINT "watch_comment_likes_comment_id_watch_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "watch_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_comment_likes" ADD CONSTRAINT "watch_comment_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_channels_handle_idx" ON "watch_channels" USING btree ("handle");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_videos_youtube_id_idx" ON "watch_videos" USING btree ("youtube_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_videos_channel_handle_idx" ON "watch_videos" USING btree ("channel_handle");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_videos_category_idx" ON "watch_videos" USING btree ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_playlists_slug_idx" ON "watch_playlists" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_progress_user_idx" ON "watch_progress" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_progress_video_idx" ON "watch_progress" USING btree ("video_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_interactions_user_idx" ON "watch_interactions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_interactions_video_idx" ON "watch_interactions" USING btree ("video_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_comments_video_idx" ON "watch_comments" USING btree ("video_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_comments_user_idx" ON "watch_comments" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_comments_parent_idx" ON "watch_comments" USING btree ("parent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watch_comment_likes_comment_idx" ON "watch_comment_likes" USING btree ("comment_id");
