ALTER TABLE "qb_topics" DROP CONSTRAINT "qb_topics_chapter_id_qb_chapters_id_fk";
--> statement-breakpoint
ALTER TABLE "ai_messages" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "ai_messages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ai_messages" ALTER COLUMN "thread_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "ai_threads" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "ai_threads" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "ai_threads" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_chapters" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_chapters" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_chapters" ALTER COLUMN "subject_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ALTER COLUMN "custom_exam_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_questions" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "custom_exam_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_submissions" ALTER COLUMN "evaluator_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ALTER COLUMN "submission_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exam_written_submissions" ALTER COLUMN "part_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_custom_exams" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_question_options" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_question_options" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_question_options" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_question_parts" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_question_parts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_question_parts" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_question_parts" ALTER COLUMN "marks" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "qb_question_sources" ALTER COLUMN "question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_question_sources" ALTER COLUMN "source_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_questions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_questions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_questions" ALTER COLUMN "subject_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_questions" ALTER COLUMN "chapter_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_questions" ALTER COLUMN "topic_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_questions" ALTER COLUMN "parent_question_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_sources" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_sources" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_subjects" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_subjects" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_subjects" ALTER COLUMN "target_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_targets" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_targets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_topics" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_topics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "qb_topics" ALTER COLUMN "chapter_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_topics" ALTER COLUMN "chapter_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_topics" ALTER COLUMN "parent_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD COLUMN "topic_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD COLUMN "question_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_sources" ADD COLUMN "question_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_subjects" ADD COLUMN "chapter_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_subjects" ADD COLUMN "question_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_targets" ADD COLUMN "subject_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_targets" ADD COLUMN "question_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_topics" ADD COLUMN "question_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_slug_unique" UNIQUE("slug");