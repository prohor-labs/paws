CREATE INDEX "qb_chapters_subject_order_idx" ON "qb_chapters" USING btree ("subject_id","order_index");--> statement-breakpoint
CREATE INDEX "qb_topics_parent_idx" ON "qb_topics" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "qb_topics_slug_idx" ON "qb_topics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "qb_topics_order_idx" ON "qb_topics" USING btree ("order_index");--> statement-breakpoint
ALTER TABLE "qb_topics" ADD CONSTRAINT "qb_topics_slug_unique" UNIQUE("slug");