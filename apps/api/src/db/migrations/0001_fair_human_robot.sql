CREATE TABLE "custom_exam_questions" (
	"custom_exam_id" text NOT NULL,
	"question_id" text NOT NULL,
	"question_number" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "custom_exam_questions_custom_exam_id_question_id_pk" PRIMARY KEY("custom_exam_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "custom_exam_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"custom_exam_id" text NOT NULL,
	"user_id" text,
	"score" text DEFAULT '0' NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"wrong_count" integer DEFAULT 0 NOT NULL,
	"unanswered_count" integer DEFAULT 0 NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"answers" text DEFAULT '{}' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_exams" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"question_count" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"negative_marks" text DEFAULT '0.25' NOT NULL,
	"total_marks" integer DEFAULT 0 NOT NULL,
	"config" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_exam_questions" ADD CONSTRAINT "custom_exam_questions_custom_exam_id_custom_exams_id_fk" FOREIGN KEY ("custom_exam_id") REFERENCES "public"."custom_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_exam_questions" ADD CONSTRAINT "custom_exam_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD CONSTRAINT "custom_exam_submissions_custom_exam_id_custom_exams_id_fk" FOREIGN KEY ("custom_exam_id") REFERENCES "public"."custom_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_exam_submissions" ADD CONSTRAINT "custom_exam_submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_exams" ADD CONSTRAINT "custom_exams_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_exam_questions_exam_idx" ON "custom_exam_questions" USING btree ("custom_exam_id","question_number");--> statement-breakpoint
CREATE INDEX "custom_exam_questions_question_idx" ON "custom_exam_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "custom_exam_submissions_exam_idx" ON "custom_exam_submissions" USING btree ("custom_exam_id");--> statement-breakpoint
CREATE INDEX "custom_exam_submissions_user_idx" ON "custom_exam_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "custom_exam_submissions_date_idx" ON "custom_exam_submissions" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "custom_exams_created_at_idx" ON "custom_exams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "custom_exams_user_id_idx" ON "custom_exams" USING btree ("user_id");