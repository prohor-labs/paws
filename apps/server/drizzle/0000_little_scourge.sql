-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."qb_exam_type" AS ENUM('mcq', 'written', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."qb_question_type" AS ENUM('mcq', 'written');--> statement-breakpoint
CREATE TYPE "public"."qb_source_group" AS ENUM('academic', 'admission', 'job', 'other');--> statement-breakpoint
CREATE TYPE "public"."qb_source_type" AS ENUM('board', 'university', 'medical', 'engineering', 'bcs', 'bank_job', 'model_test', 'other');--> statement-breakpoint
CREATE TYPE "public"."qb_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."qb_submission_status" AS ENUM('pending_evaluation', 'evaluated', 'auto_evaluated');--> statement-breakpoint
CREATE TYPE "public"."qb_target_group" AS ENUM('academic', 'admission', 'job');--> statement-breakpoint
CREATE TABLE "qb_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"container_item_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"topic_count" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_chapters_subject_slug_unique" UNIQUE("subject_id","slug")
);
--> statement-breakpoint
CREATE TABLE "qb_container_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"container_id" uuid NOT NULL,
	"subject_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_url" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"exam_sheet_count" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_container_items_container_slug_unique" UNIQUE("container_id","slug")
);
--> statement-breakpoint
CREATE TABLE "qb_containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_url" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_containers_target_slug_unique" UNIQUE("target_id","slug")
);
--> statement-breakpoint
CREATE TABLE "qb_custom_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"title" text NOT NULL,
	"exam_type" "qb_exam_type" DEFAULT 'mcq' NOT NULL,
	"question_count" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"negative_marks" text DEFAULT '0.25' NOT NULL,
	"total_marks" integer DEFAULT 0 NOT NULL,
	"config" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qb_question_parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"part_text" text NOT NULL,
	"answer_text" text,
	"marks" numeric,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_question_parts_order_unique" UNIQUE("question_id","order_index")
);
--> statement-breakpoint
CREATE TABLE "qb_exam_sheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"container_item_id" uuid,
	"chapter_id" uuid,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"exam_type" "qb_exam_type" DEFAULT 'mcq' NOT NULL,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"total_marks" numeric,
	"negative_marks" text DEFAULT '0.25',
	"order_index" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qb_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid,
	"q_type" "qb_question_type" DEFAULT 'mcq' NOT NULL,
	"question_text" text NOT NULL,
	"context_text" text,
	"explanation" text,
	"status" "qb_status" DEFAULT 'published' NOT NULL,
	"parent_question_id" uuid,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qb_custom_exam_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"custom_exam_id" uuid NOT NULL,
	"user_id" uuid,
	"status" "qb_submission_status" DEFAULT 'auto_evaluated' NOT NULL,
	"score" text DEFAULT '0' NOT NULL,
	"written_score" text DEFAULT '0' NOT NULL,
	"written_total_marks" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"wrong_count" integer DEFAULT 0 NOT NULL,
	"unanswered_count" integer DEFAULT 0 NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"answers" text DEFAULT '{}' NOT NULL,
	"evaluator_id" uuid,
	"evaluator_feedback" text,
	"evaluated_at" timestamp with time zone,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "account_provider_account_unique" UNIQUE("account_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE "qb_custom_exam_written_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"part_id" uuid,
	"page_number" integer DEFAULT 1 NOT NULL,
	"image_url" text NOT NULL,
	"annotated_image_url" text,
	"marks_awarded" text,
	"max_marks" integer,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qb_question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qb_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group" "qb_target_group" DEFAULT 'academic' NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"subject_count" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_targets_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "watch_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"channel_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_subscriptions_user_channel_unique" UNIQUE("user_id","channel_id")
);
--> statement-breakpoint
CREATE TABLE "qb_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "qb_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_group" "qb_source_group" DEFAULT 'academic' NOT NULL,
	"type" "qb_source_type" DEFAULT 'board' NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"institution" text,
	"unit" text,
	"year" integer,
	"question_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "qb_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"code" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"chapter_count" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_comment_likes_user_comment_unique" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "watch_comments" (
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
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"level" text,
	"track" text,
	"daily_reminder_enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "watch_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" text NOT NULL,
	"is_liked" boolean DEFAULT false NOT NULL,
	"is_saved" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_interactions_user_video_unique" UNIQUE("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "watch_progress" (
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
CREATE TABLE "watch_playlists" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"custom_cover" text NOT NULL,
	"category" text DEFAULT 'All' NOT NULL,
	"channel_name" text NOT NULL,
	"channel_handle" text,
	"video_ids" text[] DEFAULT '{""}' NOT NULL,
	"created_date" text DEFAULT 'Recently' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_playlists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "watch_videos" (
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
	"tags" text[] DEFAULT '{""}' NOT NULL,
	"custom_thumbnail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_videos_youtube_id_unique" UNIQUE("youtube_id")
);
--> statement-breakpoint
CREATE TABLE "watch_channels" (
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
CREATE TABLE "qb_question_chapters" (
	"question_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	CONSTRAINT "qb_question_chapters_pk" PRIMARY KEY("question_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "qb_question_sources" (
	"question_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	CONSTRAINT "qb_question_sources_question_id_source_id_pk" PRIMARY KEY("question_id","source_id")
);
--> statement-breakpoint
CREATE TABLE "qb_chapter_sources" (
	"chapter_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	CONSTRAINT "qb_chapter_sources_pk" PRIMARY KEY("chapter_id","source_id")
);
--> statement-breakpoint
CREATE TABLE "qb_exam_sheet_questions" (
	"exam_sheet_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_number" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "qb_exam_sheet_questions_pk" PRIMARY KEY("exam_sheet_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "qb_custom_exam_questions" (
	"custom_exam_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_number" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "qb_custom_exam_questions_custom_exam_id_question_id_pk" PRIMARY KEY("custom_exam_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD CONSTRAINT "qb_chapters_container_item_id_qb_container_items_id_fk" FOREIGN KEY ("container_item_id") REFERENCES "public"."qb_container_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD CONSTRAINT "qb_chapters_subject_id_qb_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."qb_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_container_items" ADD CONSTRAINT "qb_container_items_container_id_qb_containers_id_fk" FOREIGN KEY ("container_id") REFERENCES "public"."qb_containers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_container_items" ADD CONSTRAINT "qb_container_items_subject_id_qb_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."qb_subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_containers" ADD CONSTRAINT "qb_containers_target_id_qb_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."qb_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ADD CONSTRAINT "qb_custom_exams_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_parts" ADD CONSTRAINT "qb_question_parts_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_exam_sheets" ADD CONSTRAINT "qb_exam_sheets_container_item_id_qb_container_items_id_fk" FOREIGN KEY ("container_item_id") REFERENCES "public"."qb_container_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_topic_id_qb_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."qb_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ADD CONSTRAINT "qb_custom_exam_submissions_custom_exam_id_qb_custom_exams_id_fk" FOREIGN KEY ("custom_exam_id") REFERENCES "public"."qb_custom_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ADD CONSTRAINT "qb_custom_exam_submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_submissions_part_id_qb_question_parts_id" FOREIGN KEY ("part_id") REFERENCES "public"."qb_question_parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_submissions_question_id_qb_questions_id_" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_submissions_submission_id_qb_custom_exam" FOREIGN KEY ("submission_id") REFERENCES "public"."qb_custom_exam_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_options" ADD CONSTRAINT "qb_question_options_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_subscriptions" ADD CONSTRAINT "watch_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_subscriptions" ADD CONSTRAINT "watch_subscriptions_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."watch_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_subjects" ADD CONSTRAINT "qb_subjects_target_id_qb_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."qb_targets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comment_likes" ADD CONSTRAINT "watch_comment_likes_comment_id_watch_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."watch_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comment_likes" ADD CONSTRAINT "watch_comment_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_video_id_watch_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."watch_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_comments" ADD CONSTRAINT "watch_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_interactions" ADD CONSTRAINT "watch_interactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_interactions" ADD CONSTRAINT "watch_interactions_video_id_watch_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."watch_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_progress" ADD CONSTRAINT "watch_progress_video_id_watch_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."watch_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_videos" ADD CONSTRAINT "watch_videos_channel_handle_watch_channels_handle_fk" FOREIGN KEY ("channel_handle") REFERENCES "public"."watch_channels"("handle") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_chapters" ADD CONSTRAINT "qb_question_chapters_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_chapters" ADD CONSTRAINT "qb_question_chapters_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_sources" ADD CONSTRAINT "qb_question_sources_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_sources" ADD CONSTRAINT "qb_question_sources_source_id_qb_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."qb_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_chapter_sources" ADD CONSTRAINT "qb_chapter_sources_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_chapter_sources" ADD CONSTRAINT "qb_chapter_sources_source_id_qb_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."qb_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_exam_sheet_questions" ADD CONSTRAINT "qb_exam_sheet_questions_exam_sheet_id_qb_exam_sheets_id_fk" FOREIGN KEY ("exam_sheet_id") REFERENCES "public"."qb_exam_sheets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_exam_sheet_questions" ADD CONSTRAINT "qb_exam_sheet_questions_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ADD CONSTRAINT "qb_custom_exam_questions_custom_exam_id_qb_custom_exams_id_fk" FOREIGN KEY ("custom_exam_id") REFERENCES "public"."qb_custom_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ADD CONSTRAINT "qb_custom_exam_questions_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qb_chapters_container_order_idx" ON "qb_chapters" USING btree ("container_item_id" int4_ops,"order_index" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_chapters_subject_order_idx" ON "qb_chapters" USING btree ("subject_id" int4_ops,"order_index" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_container_items_container_order_idx" ON "qb_container_items" USING btree ("container_id" int4_ops,"order_index" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_container_items_subject_idx" ON "qb_container_items" USING btree ("subject_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_containers_target_order_idx" ON "qb_containers" USING btree ("target_id" int4_ops,"order_index" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exams_created_idx" ON "qb_custom_exams" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exams_type_idx" ON "qb_custom_exams" USING btree ("exam_type" enum_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exams_user_created_idx" ON "qb_custom_exams" USING btree ("user_id" timestamptz_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_question_parts_q_idx" ON "qb_question_parts" USING btree ("question_id" int4_ops,"order_index" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_exam_sheets_chapter_order_idx" ON "qb_exam_sheets" USING btree ("chapter_id" int4_ops,"order_index" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_exam_sheets_container_item_idx" ON "qb_exam_sheets" USING btree ("container_item_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_questions_order_idx" ON "qb_questions" USING btree ("order_index" int4_ops,"id" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_questions_status_order_idx" ON "qb_questions" USING btree ("status" int4_ops,"order_index" enum_ops,"id" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_questions_topic_idx" ON "qb_questions" USING btree ("topic_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_evaluator_idx" ON "qb_custom_exam_submissions" USING btree ("evaluator_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_exam_date_idx" ON "qb_custom_exam_submissions" USING btree ("custom_exam_id" uuid_ops,"submitted_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_status_idx" ON "qb_custom_exam_submissions" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_user_date_idx" ON "qb_custom_exam_submissions" USING btree ("user_id" timestamptz_ops,"submitted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_written_part_idx" ON "qb_custom_exam_written_submissions" USING btree ("part_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_written_q_idx" ON "qb_custom_exam_written_submissions" USING btree ("question_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_written_sub_idx" ON "qb_custom_exam_written_submissions" USING btree ("submission_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_question_options_q_idx" ON "qb_question_options" USING btree ("question_id" int4_ops,"order_index" int4_ops);--> statement-breakpoint
CREATE INDEX "watch_subscriptions_channel_idx" ON "watch_subscriptions" USING btree ("channel_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "watch_subscriptions_user_idx" ON "watch_subscriptions" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_topics_order_idx" ON "qb_topics" USING btree ("order_index" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_topics_parent_idx" ON "qb_topics" USING btree ("parent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_topics_slug_idx" ON "qb_topics" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_sources_group_idx" ON "qb_sources" USING btree ("source_group" enum_ops);--> statement-breakpoint
CREATE INDEX "qb_sources_type_idx" ON "qb_sources" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "qb_subjects_target_idx" ON "qb_subjects" USING btree ("target_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "watch_comment_likes_comment_idx" ON "watch_comment_likes" USING btree ("comment_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "watch_comments_parent_idx" ON "watch_comments" USING btree ("parent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "watch_comments_user_idx" ON "watch_comments" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "watch_comments_video_idx" ON "watch_comments" USING btree ("video_id" text_ops);--> statement-breakpoint
CREATE INDEX "watch_interactions_user_idx" ON "watch_interactions" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "watch_interactions_video_idx" ON "watch_interactions" USING btree ("video_id" text_ops);--> statement-breakpoint
CREATE INDEX "watch_progress_user_idx" ON "watch_progress" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "watch_progress_video_idx" ON "watch_progress" USING btree ("video_id" text_ops);--> statement-breakpoint
CREATE INDEX "watch_videos_category_idx" ON "watch_videos" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "watch_videos_channel_handle_idx" ON "watch_videos" USING btree ("channel_handle" text_ops);--> statement-breakpoint
CREATE INDEX "qb_question_chapters_ch_q_idx" ON "qb_question_chapters" USING btree ("chapter_id" uuid_ops,"question_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_question_chapters_chapter_idx" ON "qb_question_chapters" USING btree ("chapter_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_question_sources_q_idx" ON "qb_question_sources" USING btree ("question_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_question_sources_source_idx" ON "qb_question_sources" USING btree ("source_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_chapter_sources_source_idx" ON "qb_chapter_sources" USING btree ("source_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_exam_sheet_q_question_idx" ON "qb_exam_sheet_questions" USING btree ("question_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "qb_exam_sheet_q_sheet_idx" ON "qb_exam_sheet_questions" USING btree ("exam_sheet_id" int4_ops,"question_number" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_q_exam_idx" ON "qb_custom_exam_questions" USING btree ("custom_exam_id" int4_ops,"question_number" int4_ops);--> statement-breakpoint
CREATE INDEX "qb_custom_exam_q_question_idx" ON "qb_custom_exam_questions" USING btree ("question_id" uuid_ops);
*/