DROP TABLE IF EXISTS "qb_custom_exam_written_submissions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_custom_exam_submissions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_custom_exam_questions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_custom_exams" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_question_sources" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_question_topics" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_question_parts" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_question_options" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_questions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_topics" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_items" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_containers" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_categories" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "qb_sources" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "qb_container_category" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "qb_difficulty" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "qb_source_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "qb_question_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "qb_status" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "qb_exam_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "qb_submission_status" CASCADE;--> statement-breakpoint
CREATE TYPE "qb_question_type" AS ENUM('mcq', 'written');--> statement-breakpoint
CREATE TYPE "qb_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "qb_source_type" AS ENUM('board', 'university', 'medical', 'engineering', 'bcs', 'bank_job', 'model_test', 'other');--> statement-breakpoint
CREATE TYPE "qb_exam_type" AS ENUM('mcq', 'written', 'mixed');--> statement-breakpoint
CREATE TYPE "qb_submission_status" AS ENUM('pending_evaluation', 'evaluated', 'auto_evaluated');--> statement-breakpoint
CREATE TABLE "qb_targets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_targets_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE TABLE "qb_subjects" (
	"id" text PRIMARY KEY NOT NULL,
	"target_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_subjects_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE TABLE "qb_chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_chapters_subject_slug_unique" UNIQUE("subject_id","slug")
);--> statement-breakpoint
CREATE TABLE "qb_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"chapter_id" text NOT NULL,
	"parent_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint
CREATE TABLE "qb_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"topic_id" text,
	"q_type" "qb_question_type" DEFAULT 'mcq' NOT NULL,
	"question_text" text NOT NULL,
	"context_text" text,
	"explanation" text,
	"status" "qb_status" DEFAULT 'published' NOT NULL,
	"parent_question_id" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "qb_question_options" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);--> statement-breakpoint
CREATE TABLE "qb_question_parts" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"part_text" text NOT NULL,
	"answer_text" text,
	"marks" integer,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_question_parts_order_unique" UNIQUE("question_id","order_index")
);--> statement-breakpoint
CREATE TABLE "qb_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "qb_source_type" DEFAULT 'board' NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"institution" text,
	"unit" text,
	"year" integer,
	CONSTRAINT "qb_sources_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE TABLE "qb_question_sources" (
	"question_id" text NOT NULL,
	"source_id" text NOT NULL,
	CONSTRAINT "qb_question_sources_question_id_source_id_pk" PRIMARY KEY("question_id","source_id")
);--> statement-breakpoint
CREATE TABLE "qb_custom_exams" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"exam_type" "qb_exam_type" DEFAULT 'mcq' NOT NULL,
	"question_count" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"negative_marks" text DEFAULT '0.25' NOT NULL,
	"total_marks" integer DEFAULT 0 NOT NULL,
	"config" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "qb_custom_exam_questions" (
	"custom_exam_id" text NOT NULL,
	"question_id" text NOT NULL,
	"question_number" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "qb_custom_exam_questions_custom_exam_id_question_id_pk" PRIMARY KEY("custom_exam_id","question_id")
);--> statement-breakpoint
CREATE TABLE "qb_custom_exam_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"custom_exam_id" text NOT NULL,
	"user_id" text,
	"status" "qb_submission_status" DEFAULT 'auto_evaluated' NOT NULL,
	"score" text DEFAULT '0' NOT NULL,
	"written_score" text DEFAULT '0' NOT NULL,
	"written_total_marks" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"wrong_count" integer DEFAULT 0 NOT NULL,
	"unanswered_count" integer DEFAULT 0 NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"answers" text DEFAULT '{}' NOT NULL,
	"evaluator_id" text,
	"evaluator_feedback" text,
	"evaluated_at" timestamp with time zone,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "qb_custom_exam_written_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"question_id" text NOT NULL,
	"part_id" text,
	"page_number" integer DEFAULT 1 NOT NULL,
	"image_url" text NOT NULL,
	"annotated_image_url" text,
	"marks_awarded" text,
	"max_marks" integer,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "qb_subjects" ADD CONSTRAINT "qb_subjects_target_id_qb_targets_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."qb_targets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD CONSTRAINT "qb_chapters_subject_id_qb_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."qb_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_subject_id_qb_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."qb_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_topic_id_qb_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."qb_topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_options" ADD CONSTRAINT "qb_question_options_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_parts" ADD CONSTRAINT "qb_question_parts_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_sources" ADD CONSTRAINT "qb_question_sources_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_sources" ADD CONSTRAINT "qb_question_sources_source_id_qb_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."qb_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ADD CONSTRAINT "qb_custom_exams_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ADD CONSTRAINT "qb_custom_exam_questions_custom_exam_id_qb_custom_exams_id_fk" FOREIGN KEY ("custom_exam_id") REFERENCES "public"."qb_custom_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ADD CONSTRAINT "qb_custom_exam_questions_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ADD CONSTRAINT "qb_custom_exam_submissions_custom_exam_id_qb_custom_exams_id_fk" FOREIGN KEY ("custom_exam_id") REFERENCES "public"."qb_custom_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ADD CONSTRAINT "qb_custom_exam_submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_submissions_submission_id_qb_custom_exam_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."qb_custom_exam_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_submissions_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ADD CONSTRAINT "qb_custom_exam_written_submissions_part_id_qb_question_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."qb_question_parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qb_questions_subject_idx" ON "qb_questions" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "qb_questions_chapter_idx" ON "qb_questions" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "qb_questions_topic_idx" ON "qb_questions" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "qb_question_sources_source_idx" ON "qb_question_sources" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "qb_custom_exams_user_created_idx" ON "qb_custom_exams" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "qb_custom_exams_created_idx" ON "qb_custom_exams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "qb_custom_exams_type_idx" ON "qb_custom_exams" USING btree ("exam_type");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_q_exam_idx" ON "qb_custom_exam_questions" USING btree ("custom_exam_id","question_number");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_q_question_idx" ON "qb_custom_exam_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_user_date_idx" ON "qb_custom_exam_submissions" USING btree ("user_id","submitted_at");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_exam_date_idx" ON "qb_custom_exam_submissions" USING btree ("custom_exam_id","submitted_at");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_status_idx" ON "qb_custom_exam_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_subs_evaluator_idx" ON "qb_custom_exam_submissions" USING btree ("evaluator_id");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_written_sub_idx" ON "qb_custom_exam_written_submissions" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_written_q_idx" ON "qb_custom_exam_written_submissions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "qb_custom_exam_written_part_idx" ON "qb_custom_exam_written_submissions" USING btree ("part_id");
