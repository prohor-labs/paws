CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
ALTER TABLE "qb_topics" ADD COLUMN "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "qb_topics" ADD COLUMN "parent_topic_id" uuid;--> statement-breakpoint
UPDATE "qb_topics" SET "chapter_id" = "parent_id" WHERE "parent_id" IN (SELECT "id" FROM "qb_chapters");--> statement-breakpoint
UPDATE "qb_topics" SET "parent_topic_id" = "parent_id" WHERE "parent_id" IN (SELECT "id" FROM "qb_topics");--> statement-breakpoint
WITH RECURSIVE walk AS (
	SELECT "id", "chapter_id" FROM "qb_topics" WHERE "chapter_id" IS NOT NULL
	UNION ALL
	SELECT c."id", w."chapter_id" FROM "qb_topics" c JOIN walk w ON c."parent_topic_id" = w."id"
)
UPDATE "qb_topics" t SET "chapter_id" = w."chapter_id" FROM walk w WHERE t."id" = w."id" AND t."chapter_id" IS NULL;--> statement-breakpoint
ALTER TABLE "qb_topics" ALTER COLUMN "chapter_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_topics" DROP COLUMN "parent_id";--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "qb_chapters"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_parent_topic_id_qb_topics_id_fk" FOREIGN KEY ("parent_topic_id") REFERENCES "qb_topics"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "qb_topics" DROP CONSTRAINT "qb_topics_slug_unique";--> statement-breakpoint
DROP INDEX "qb_topics_order_idx";--> statement-breakpoint
DROP INDEX "qb_topics_slug_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "qb_topics_chapter_slug_unique" ON "qb_topics" USING btree ("chapter_id","slug");--> statement-breakpoint
CREATE INDEX "qb_topics_chapter_order_idx" ON "qb_topics" USING btree ("chapter_id","order_index");--> statement-breakpoint
CREATE INDEX "qb_topics_parent_topic_idx" ON "qb_topics" USING btree ("parent_topic_id");--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_question_count_check" CHECK ("question_count" >= 0);--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_order_check" CHECK ("order_index" >= 0);--> statement-breakpoint
ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_parent_question_id_qb_questions_id_fk" FOREIGN KEY ("parent_question_id") REFERENCES "qb_questions"("id") ON DELETE cascade;--> statement-breakpoint
DROP INDEX "qb_questions_order_idx";--> statement-breakpoint
CREATE INDEX "qb_questions_parent_question_idx" ON "qb_questions" USING btree ("parent_question_id");--> statement-breakpoint
CREATE INDEX "qb_questions_text_trgm_idx" ON "qb_questions" USING gin ("question_text" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_order_check" CHECK ("order_index" >= 0);--> statement-breakpoint
ALTER TABLE "qb_question_options" DROP CONSTRAINT "qb_question_options_question_id_qb_questions_id_fk";--> statement-breakpoint
ALTER TABLE "qb_question_options" ADD CONSTRAINT "qb_question_options_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "qb_questions"("id") ON DELETE cascade;--> statement-breakpoint
DROP INDEX "qb_question_options_q_idx";--> statement-breakpoint
ALTER TABLE "qb_question_options" ADD CONSTRAINT "qb_question_options_question_order_unique" UNIQUE ("question_id","order_index");--> statement-breakpoint
ALTER TABLE "qb_question_options" ADD CONSTRAINT "qb_question_options_order_check" CHECK ("order_index" >= 0);--> statement-breakpoint
DROP INDEX "qb_question_parts_q_idx";--> statement-breakpoint
ALTER TABLE "qb_question_parts" ALTER COLUMN "marks" SET DATA TYPE numeric(6, 2);--> statement-breakpoint
ALTER TABLE "qb_question_parts" ADD CONSTRAINT "qb_question_parts_marks_check" CHECK ("marks" IS NULL OR "marks" >= 0);--> statement-breakpoint
ALTER TABLE "qb_question_parts" ADD CONSTRAINT "qb_question_parts_order_check" CHECK ("order_index" >= 0);--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ALTER COLUMN "total_marks" SET DATA TYPE numeric(8, 2);--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ALTER COLUMN "negative_marks" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ALTER COLUMN "negative_marks" SET DATA TYPE numeric(6, 2) USING "negative_marks"::numeric(6, 2);--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ALTER COLUMN "negative_marks" SET DEFAULT 0.25;--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_container_slug_unique" UNIQUE ("container_item_id","slug");--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_chapter_slug_unique" UNIQUE ("chapter_id","slug");--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_scope_check" CHECK ("container_item_id" IS NOT NULL OR "chapter_id" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_duration_check" CHECK ("duration_minutes" > 0);--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_marks_check" CHECK (("total_marks" IS NULL OR "total_marks" >= 0) AND ("negative_marks" IS NULL OR "negative_marks" >= 0));--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_question_count_check" CHECK ("question_count" >= 0);--> statement-breakpoint
DROP INDEX "qb_exam_sheet_q_sheet_idx";--> statement-breakpoint
ALTER TABLE "qb_exam_sheet_questions" ADD CONSTRAINT "qb_exam_sheet_q_sheet_number_unique" UNIQUE ("exam_sheet_id","question_number");--> statement-breakpoint
ALTER TABLE "qb_exam_sheet_questions" ADD CONSTRAINT "qb_exam_sheet_q_number_check" CHECK ("question_number" > 0);--> statement-breakpoint
DROP INDEX "qb_question_chapters_chapter_idx";--> statement-breakpoint
DROP INDEX "qb_question_sources_q_idx";--> statement-breakpoint
DROP INDEX "qb_custom_exam_q_exam_idx";--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ADD CONSTRAINT "qb_custom_exam_q_exam_number_unique" UNIQUE ("custom_exam_id","question_number");--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ADD CONSTRAINT "qb_custom_exam_q_number_check" CHECK ("question_number" > 0);--> statement-breakpoint
DROP INDEX "qb_custom_exams_type_idx";--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ALTER COLUMN "negative_marks" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ALTER COLUMN "negative_marks" SET DATA TYPE numeric(6, 2) USING "negative_marks"::numeric(6, 2);--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ALTER COLUMN "negative_marks" SET DEFAULT 0.25;--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ALTER COLUMN "config" SET DATA TYPE jsonb USING "config"::jsonb;--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ADD CONSTRAINT "qb_custom_exams_duration_check" CHECK ("duration_minutes" > 0);--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ADD CONSTRAINT "qb_custom_exams_question_count_check" CHECK ("question_count" > 0);--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ADD CONSTRAINT "qb_custom_exams_marks_check" CHECK ("negative_marks" >= 0 AND "total_marks" >= 0);--> statement-breakpoint
DROP INDEX "qb_custom_exam_subs_status_idx";--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_status_idx" ON "qb_custom_exam_submissions" USING btree ("status") WHERE "status" = 'pending_evaluation';--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "score" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "score" SET DATA TYPE numeric(6, 2) USING "score"::numeric(6, 2);--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "score" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "written_score" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "written_score" SET DATA TYPE numeric(6, 2) USING "written_score"::numeric(6, 2);--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "written_score" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "answers" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "answers" SET DATA TYPE jsonb USING "answers"::jsonb;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "answers" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ADD CONSTRAINT "qb_custom_exam_submissions_evaluator_id_user_id_fk" FOREIGN KEY ("evaluator_id") REFERENCES "user"("id") ON DELETE set null;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ADD CONSTRAINT "qb_custom_exam_subs_marks_check" CHECK ("score" >= 0 AND "written_score" >= 0 AND "written_total_marks" >= 0);--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ADD CONSTRAINT "qb_custom_exam_subs_counts_check" CHECK ("correct_count" >= 0 AND "wrong_count" >= 0 AND "unanswered_count" >= 0 AND "time_spent_seconds" >= 0);--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ALTER COLUMN "marks_awarded" SET DATA TYPE numeric(6, 2) USING "marks_awarded"::numeric(6, 2);--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_marks_check" CHECK (("marks_awarded" IS NULL OR "marks_awarded" >= 0) AND ("max_marks" IS NULL OR "max_marks" >= 0));--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_page_check" CHECK ("page_number" > 0);--> statement-breakpoint
DROP INDEX "qb_sources_group_idx";--> statement-breakpoint
DROP INDEX "qb_sources_type_idx";--> statement-breakpoint
ALTER TABLE "qb_sources" ADD CONSTRAINT "qb_sources_question_count_check" CHECK ("question_count" >= 0);--> statement-breakpoint
ALTER TABLE "qb_targets" ADD CONSTRAINT "qb_targets_counts_check" CHECK ("subject_count" >= 0 AND "question_count" >= 0);--> statement-breakpoint
ALTER TABLE "qb_subjects" ADD CONSTRAINT "qb_subjects_counts_check" CHECK ("chapter_count" >= 0 AND "question_count" >= 0);--> statement-breakpoint
ALTER TABLE "qb_containers" ADD CONSTRAINT "qb_containers_counts_check" CHECK ("item_count" >= 0 AND "question_count" >= 0);--> statement-breakpoint
ALTER TABLE "qb_container_items" ADD CONSTRAINT "qb_container_items_counts_check" CHECK ("exam_sheet_count" >= 0 AND "question_count" >= 0);--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD CONSTRAINT "qb_chapters_counts_check" CHECK ("topic_count" >= 0 AND "question_count" >= 0);--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD CONSTRAINT "qb_chapters_order_check" CHECK ("order_index" >= 0);--> statement-breakpoint
ALTER TABLE "watch_channels" ALTER COLUMN "subscribers" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "watch_channels" ALTER COLUMN "subscribers" SET DATA TYPE integer USING COALESCE(NULLIF(regexp_replace("subscribers", '\D', '', 'g'), ''), '0')::integer;--> statement-breakpoint
ALTER TABLE "watch_channels" ALTER COLUMN "subscribers" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "watch_channels" ALTER COLUMN "video_count" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "watch_channels" ALTER COLUMN "video_count" SET DATA TYPE integer USING COALESCE(NULLIF(regexp_replace("video_count", '\D', '', 'g'), ''), '0')::integer;--> statement-breakpoint
ALTER TABLE "watch_channels" ALTER COLUMN "video_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "watch_channels" ADD COLUMN "joined_at" timestamp with time zone;--> statement-breakpoint
UPDATE "watch_channels" SET "joined_at" = CASE
	WHEN "joined_date" ~ '^Joined\s+[A-Za-z]+\s+[0-9]{4}$'
	THEN to_date(regexp_replace("joined_date", '^Joined\s+', ''), 'Mon YYYY')::timestamp with time zone
	ELSE NULL
END
WHERE "joined_date" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_channels" DROP COLUMN "joined_date";--> statement-breakpoint
ALTER TABLE "watch_channels" ADD CONSTRAINT "watch_channels_counts_check" CHECK ("subscribers" >= 0 AND "video_count" >= 0);--> statement-breakpoint
ALTER TABLE "watch_videos" ADD COLUMN "channel_id" uuid;--> statement-breakpoint
UPDATE "watch_videos" v SET "channel_id" = c."id" FROM "watch_channels" c WHERE c."handle" = v."channel_handle";--> statement-breakpoint
ALTER TABLE "watch_videos" ALTER COLUMN "channel_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_videos" ADD COLUMN "published_at_ts" timestamp with time zone;--> statement-breakpoint
UPDATE "watch_videos" SET "published_at_ts" = "created_at" - (
	COALESCE(NULLIF(regexp_replace("published_at", '\D', '', 'g'), ''), '0')::integer *
	CASE
		WHEN "published_at" ILIKE '%hour%' THEN interval '1 hour'
		WHEN "published_at" ILIKE '%day%' THEN interval '1 day'
		WHEN "published_at" ILIKE '%week%' THEN interval '1 week'
		WHEN "published_at" ILIKE '%month%' THEN interval '1 month'
		WHEN "published_at" ILIKE '%year%' THEN interval '1 year'
		ELSE interval '0'
	END
);--> statement-breakpoint
ALTER TABLE "watch_videos" ALTER COLUMN "published_at_ts" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "watch_videos" DROP COLUMN "published_at";--> statement-breakpoint
ALTER TABLE "watch_videos" RENAME COLUMN "published_at_ts" TO "published_at";--> statement-breakpoint
ALTER TABLE "watch_videos" DROP COLUMN "channel_handle";--> statement-breakpoint
ALTER TABLE "watch_videos" DROP COLUMN "duration";--> statement-breakpoint
CREATE INDEX "watch_videos_channel_idx" ON "watch_videos" USING btree ("channel_id","published_at" DESC);--> statement-breakpoint
ALTER TABLE "watch_videos" ADD CONSTRAINT "watch_videos_channel_id_watch_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "watch_channels"("id") ON UPDATE cascade ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "watch_videos" ADD CONSTRAINT "watch_videos_metrics_check" CHECK ("duration_seconds" >= 0 AND "views_count" >= 0 AND "likes_count" >= 0 AND "comments_count" >= 0);--> statement-breakpoint
ALTER TABLE "watch_playlists" ADD COLUMN "channel_id" uuid;--> statement-breakpoint
UPDATE "watch_playlists" p SET "channel_id" = c."id" FROM "watch_channels" c WHERE c."handle" = p."channel_handle";--> statement-breakpoint
CREATE TABLE "watch_playlist_videos" (
	"playlist_id" text NOT NULL,
	"video_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "watch_playlist_videos_pk" PRIMARY KEY("playlist_id","video_id")
);--> statement-breakpoint
INSERT INTO "watch_playlist_videos" ("playlist_id", "video_id", "position")
SELECT p."id", v."video_id", (v."ord" - 1)::integer
FROM "watch_playlists" p
CROSS JOIN LATERAL unnest(p."video_ids") WITH ORDINALITY AS v("video_id", "ord")
WHERE v."video_id" <> ''
ON CONFLICT DO NOTHING;--> statement-breakpoint
CREATE INDEX "watch_playlist_videos_video_idx" ON "watch_playlist_videos" USING btree ("video_id");--> statement-breakpoint
CREATE UNIQUE INDEX "watch_playlist_videos_playlist_position_unique" ON "watch_playlist_videos" USING btree ("playlist_id","position");--> statement-breakpoint
ALTER TABLE "watch_playlist_videos" ADD CONSTRAINT "watch_playlist_videos_playlist_id_watch_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "watch_playlists"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "watch_playlist_videos" ADD CONSTRAINT "watch_playlist_videos_video_id_watch_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "watch_videos"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "watch_playlist_videos" ADD CONSTRAINT "watch_playlist_videos_position_check" CHECK ("position" >= 0);--> statement-breakpoint
ALTER TABLE "watch_playlists" DROP COLUMN "channel_handle";--> statement-breakpoint
ALTER TABLE "watch_playlists" DROP COLUMN "channel_name";--> statement-breakpoint
ALTER TABLE "watch_playlists" DROP COLUMN "video_ids";--> statement-breakpoint
ALTER TABLE "watch_playlists" DROP COLUMN "created_date";--> statement-breakpoint
ALTER TABLE "watch_playlists" ADD CONSTRAINT "watch_playlists_channel_id_watch_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "watch_channels"("id") ON UPDATE cascade ON DELETE set null;--> statement-breakpoint
DROP INDEX "watch_comments_video_idx";--> statement-breakpoint
CREATE INDEX "watch_comments_video_created_idx" ON "watch_comments" USING btree ("video_id","created_at" DESC);--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_parent_id_watch_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "watch_comments"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_likes_check" CHECK ("likes_count" >= 0);--> statement-breakpoint
DROP INDEX "watch_subscriptions_user_idx";--> statement-breakpoint
DROP INDEX "watch_interactions_user_idx";--> statement-breakpoint
DROP INDEX "watch_progress_user_idx";--> statement-breakpoint
DROP INDEX "watch_comment_likes_comment_idx";--> statement-breakpoint
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_position_check" CHECK ("last_position_seconds" >= 0 AND "duration_seconds" >= 0);
