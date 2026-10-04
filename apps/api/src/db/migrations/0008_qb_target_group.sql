CREATE TYPE "public"."qb_target_group" AS ENUM('academic', 'admission', 'job');--> statement-breakpoint
ALTER TABLE "qb_targets" ADD COLUMN "group" "qb_target_group" DEFAULT 'academic' NOT NULL;