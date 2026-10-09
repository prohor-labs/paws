DROP INDEX "watch_videos_channel_idx";--> statement-breakpoint
CREATE INDEX "watch_videos_channel_idx" ON "watch_videos" USING btree ("channel_id","published_at" DESC NULLS LAST);--> statement-breakpoint
DROP INDEX "watch_comments_video_created_idx";--> statement-breakpoint
CREATE INDEX "watch_comments_video_created_idx" ON "watch_comments" USING btree ("video_id","created_at" DESC NULLS LAST);
