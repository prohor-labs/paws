DO $$ BEGIN
  CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'failed', 'canceled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "billing_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "package_id" text NOT NULL,
  "package_duration" text NOT NULL,
  "package_price" integer NOT NULL,
  "package_months" integer NOT NULL,
  "addon_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "addons_total" integer DEFAULT 0 NOT NULL,
  "coupon_code" text,
  "discount_amount" integer DEFAULT 0 NOT NULL,
  "total_payable" integer NOT NULL,
  "status" "order_status" DEFAULT 'pending' NOT NULL,
  "payment_method" text,
  "sender_number" text,
  "transaction_id" text,
  "paid_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "billing_orders_user_idx" ON "billing_orders" ("user_id");
CREATE INDEX IF NOT EXISTS "billing_orders_status_idx" ON "billing_orders" ("status");
