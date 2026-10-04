CREATE TABLE "qb_chapter_sources" (
	"chapter_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	CONSTRAINT "qb_chapter_sources_pk" PRIMARY KEY("chapter_id","source_id")
);
--> statement-breakpoint
ALTER TABLE "qb_chapter_sources" ADD CONSTRAINT "qb_chapter_sources_chapter_id_qb_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."qb_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qb_chapter_sources" ADD CONSTRAINT "qb_chapter_sources_source_id_qb_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."qb_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "qb_chapter_sources_source_idx" ON "qb_chapter_sources" USING btree ("source_id");