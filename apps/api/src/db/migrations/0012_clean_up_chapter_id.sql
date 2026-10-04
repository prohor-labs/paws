ALTER TABLE "qb_topics" DROP CONSTRAINT "qb_topics_chapter_slug_unique";--> statement-breakpoint
ALTER TABLE "qb_topics" DROP CONSTRAINT "qb_topics_chapter_id_qb_chapters_id_fk";
--> statement-breakpoint
ALTER TABLE "qb_question_chapters" DROP CONSTRAINT "qb_question_chapters_question_id_chapter_id_pk";--> statement-breakpoint
ALTER TABLE "qb_question_chapters" ADD CONSTRAINT "qb_question_chapters_pk" PRIMARY KEY("question_id","chapter_id");--> statement-breakpoint
ALTER TABLE "qb_topics" DROP COLUMN "chapter_id";