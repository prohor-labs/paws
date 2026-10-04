CREATE TABLE "custom_exam_written_submissions" (
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
);
--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD COLUMN "status" text DEFAULT 'auto_evaluated' NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD COLUMN "written_score" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD COLUMN "written_total_marks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD COLUMN "evaluator_id" text;--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD COLUMN "evaluator_feedback" text;--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD COLUMN "evaluated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "custom_exams" ADD COLUMN "exam_type" text DEFAULT 'mcq' NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_exam_written_submissions" ADD CONSTRAINT "custom_exam_written_submissions_submission_id_custom_exam_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."custom_exam_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_exam_written_submissions" ADD CONSTRAINT "custom_exam_written_submissions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_exam_written_submissions" ADD CONSTRAINT "custom_exam_written_submissions_part_id_question_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."question_parts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_exam_written_sub_idx" ON "custom_exam_written_submissions" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "custom_exam_written_q_idx" ON "custom_exam_written_submissions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "custom_exam_submissions_status_idx" ON "custom_exam_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "custom_exams_type_idx" ON "custom_exams" USING btree ("exam_type");