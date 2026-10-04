CREATE TABLE "qb_question_chapters" (
	"question_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	CONSTRAINT "qb_question_chapters_question_id_chapter_id_pk" PRIMARY KEY("question_id","chapter_id")
);
--> statement-breakpoint
ALTER TABLE "qb_topics" DROP CONSTRAINT "qb_topics_slug_unique";--> statement-breakpoint
ALTER TABLE "qb_questions" DROP CONSTRAINT "qb_questions_subject_id_qb_subjects_id_fk";
--> statement-breakpoint
ALTER TABLE "qb_questions" DROP CONSTRAINT "qb_questions_chapter_id_qb_chapters_id_fk";
--> statement-breakpoint
DROP INDEX "qb_questions_subject_idx";--> statement-breakpoint
DROP INDEX "qb_questions_chapter_idx";--> statement-breakpoint
ALTER TABLE "qb_chapters" ADD COLUMN "topic_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_topics" ADD COLUMN "chapter_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "qb_question_chapters" ADD CONSTRAINT "qb_question_chapters_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_question_chapters" ADD CONSTRAINT "qb_question_chapters_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qb_question_chapters_chapter_idx" ON "qb_question_chapters" USING btree ("chapter_id");--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_questions" DROP COLUMN "subject_id";--> statement-breakpoint
ALTER TABLE "qb_questions" DROP COLUMN "chapter_id";--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_chapter_slug_unique" UNIQUE("chapter_id","slug");