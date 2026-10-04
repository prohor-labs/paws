DROP INDEX IF EXISTS "ai_threads_user_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "ai_threads_updated_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_threads_user_updated_idx" ON "ai_threads" USING btree ("user_id","updated_at" desc);--> statement-breakpoint
DROP INDEX IF EXISTS "ai_messages_thread_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "ai_messages_created_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_messages_thread_created_idx" ON "ai_messages" USING btree ("thread_id","created_at");--> statement-breakpoint
DROP INDEX IF EXISTS "account_provider_account_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "account_provider_account_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_account_unique" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_expires_at_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
DROP INDEX IF EXISTS "qb_containers_cat_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_containers_cat_order_idx" ON "qb_containers" USING btree ("category_id","order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_containers_order_idx" ON "qb_containers" USING btree ("order_index");--> statement-breakpoint
DROP INDEX IF EXISTS "qb_items_container_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_items_order_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_items_container_order_idx" ON "qb_items" USING btree ("container_id","order_index");--> statement-breakpoint
DROP INDEX IF EXISTS "qb_questions_item_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_questions_status_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_questions_order_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_questions_item_status_order_idx" ON "qb_questions" USING btree ("item_id","status","order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_questions_parent_idx" ON "qb_questions" USING btree ("parent_question_id");--> statement-breakpoint
DROP INDEX IF EXISTS "qb_question_options_question_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_question_parts_question_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_question_sources_question_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_sources_source_idx" ON "qb_question_sources" USING btree ("source_id");--> statement-breakpoint
DROP INDEX IF EXISTS "qb_topics_item_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_topics_order_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_topics_item_order_idx" ON "qb_topics" USING btree ("item_id","order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_topics_parent_order_idx" ON "qb_topics" USING btree ("parent_id","order_index");--> statement-breakpoint
DROP INDEX IF EXISTS "qb_question_topics_question_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_topics_topic_idx" ON "qb_question_topics" USING btree ("topic_id");--> statement-breakpoint
DROP INDEX IF EXISTS "qb_custom_exams_user_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_custom_exams_user_created_idx" ON "qb_custom_exams" USING btree ("user_id","created_at" desc);--> statement-breakpoint
DROP INDEX IF EXISTS "qb_custom_exam_subs_user_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_custom_exam_subs_exam_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "qb_custom_exam_subs_date_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_custom_exam_subs_user_date_idx" ON "qb_custom_exam_submissions" USING btree ("user_id","submitted_at" desc);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_custom_exam_subs_exam_date_idx" ON "qb_custom_exam_submissions" USING btree ("custom_exam_id","submitted_at" desc);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_custom_exam_subs_evaluator_idx" ON "qb_custom_exam_submissions" USING btree ("evaluator_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_custom_exam_written_part_idx" ON "qb_custom_exam_written_submissions" USING btree ("part_id");
