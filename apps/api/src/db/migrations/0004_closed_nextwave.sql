DO $$ BEGIN CREATE TYPE "public"."qb_difficulty" AS ENUM('easy', 'medium', 'hard'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."qb_question_type" AS ENUM('mcq', 'written'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."qb_source_type" AS ENUM('board', 'university', 'medical', 'engineering', 'textbook', 'model_test', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN CREATE TYPE "public"."qb_status" AS ENUM('draft', 'review', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_url" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_containers" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon_url" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_containers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_items" (
	"id" text PRIMARY KEY NOT NULL,
	"container_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"group" text,
	"icon_url" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_items_container_slug_unique" UNIQUE("container_id","slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_question_options" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_question_options_order_unique" UNIQUE("question_id","order_index")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_question_parts" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"part_text" text NOT NULL,
	"answer_text" text,
	"marks" integer,
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "qb_question_parts_order_unique" UNIQUE("question_id","order_index")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_question_sources" (
	"question_id" text NOT NULL,
	"source_id" text NOT NULL,
	CONSTRAINT "qb_question_sources_question_id_source_id_pk" PRIMARY KEY("question_id","source_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_question_topics" (
	"question_id" text NOT NULL,
	"topic_id" text NOT NULL,
	CONSTRAINT "qb_question_topics_question_id_topic_id_pk" PRIMARY KEY("question_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"q_type" "qb_question_type" DEFAULT 'mcq' NOT NULL,
	"question_text" text NOT NULL,
	"context_text" text,
	"explanation" text,
	"difficulty" "qb_difficulty" DEFAULT 'medium',
	"status" "qb_status" DEFAULT 'published' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"parent_question_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "qb_source_type" DEFAULT 'board' NOT NULL,
	"institution" text,
	"unit" text,
	"year" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qb_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qb_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_containers" ADD CONSTRAINT "qb_containers_category_id_qb_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."qb_categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_items" ADD CONSTRAINT "qb_items_container_id_qb_containers_id_fk" FOREIGN KEY ("container_id") REFERENCES "public"."qb_containers"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_question_options" ADD CONSTRAINT "qb_question_options_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_question_parts" ADD CONSTRAINT "qb_question_parts_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_question_sources" ADD CONSTRAINT "qb_question_sources_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_question_sources" ADD CONSTRAINT "qb_question_sources_source_id_qb_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."qb_sources"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_question_topics" ADD CONSTRAINT "qb_question_topics_question_id_qb_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."qb_questions"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_question_topics" ADD CONSTRAINT "qb_question_topics_topic_id_qb_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."qb_topics"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_item_id_qb_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."qb_items"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qb_questions" ADD CONSTRAINT "qb_questions_parent_question_id_qb_questions_id_fk" FOREIGN KEY ("parent_question_id") REFERENCES "public"."qb_questions"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_categories_order_idx" ON "qb_categories" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_containers_cat_idx" ON "qb_containers" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_containers_order_idx" ON "qb_containers" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_items_container_idx" ON "qb_items" USING btree ("container_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_items_order_idx" ON "qb_items" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_options_question_idx" ON "qb_question_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_parts_question_idx" ON "qb_question_parts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_sources_source_idx" ON "qb_question_sources" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_sources_question_idx" ON "qb_question_sources" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_topics_topic_idx" ON "qb_question_topics" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_question_topics_question_idx" ON "qb_question_topics" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_questions_item_idx" ON "qb_questions" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_questions_type_idx" ON "qb_questions" USING btree ("q_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_questions_status_idx" ON "qb_questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_questions_order_idx" ON "qb_questions" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_sources_year_idx" ON "qb_sources" USING btree ("year");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "qb_sources_type_idx" ON "qb_sources" USING btree ("type");