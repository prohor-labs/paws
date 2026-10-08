import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const planTypeEnum = pgEnum("plan_type", ["free", "pro", "enterprise"]);
export const subStatusEnum = pgEnum("sub_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "subscription_grant",
  "addon_topup",
  "ai_usage",
  "refund",
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    plan: planTypeEnum().default("free").notNull(),
    status: subStatusEnum().default("active").notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true })
      .defaultNow()
      .notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true })
      .notNull(),
    gatewayCustomerId: text("gateway_customer_id"),
    gatewaySubscriptionId: text("gateway_subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("sub_user_idx").on(table.userId),
    index("sub_status_idx").on(table.status),
  ],
);

export const userCredits = pgTable("user_credits", {
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .primaryKey()
    .notNull(),
  aiCredits: integer("ai_credits").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const userBatchAccess = pgTable(
  "user_batch_access",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    batchId: text("batch_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("batch_access_user_idx").on(table.userId),
    uniqueIndex("user_batch_idx").on(table.userId, table.batchId),
  ],
);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    type: transactionTypeEnum().notNull(),
    amount: integer().notNull(),
    balanceAfter: integer("balance_after").notNull(),
    reason: text().notNull(),
    metadata: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("credit_tx_user_idx").on(table.userId)],
);

export const dailyExplanationUsage = pgTable(
  "daily_explanation_usage",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    date: text().notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("user_daily_explanation_idx").on(table.userId, table.date),
  ],
);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "canceled",
]);

export const billingOrders = pgTable(
  "billing_orders",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    packageId: text("package_id").notNull(),
    packageDuration: text("package_duration").notNull(),
    packagePrice: integer("package_price").notNull(),
    packageMonths: integer("package_months").notNull(),
    addonIds: jsonb("addon_ids").$type<string[]>().default([]).notNull(),
    addonsTotal: integer("addons_total").default(0).notNull(),
    couponCode: text("coupon_code"),
    discountAmount: integer("discount_amount").default(0).notNull(),
    totalPayable: integer("total_payable").notNull(),
    status: orderStatusEnum().default("pending").notNull(),
    paymentMethod: text("payment_method"),
    senderNumber: text("sender_number"),
    transactionId: text("transaction_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("billing_orders_user_idx").on(table.userId),
    index("billing_orders_status_idx").on(table.status),
  ],
);

export const coupons = pgTable(
  "coupons",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    code: text().notNull().unique(),
    type: text().$type<"percentage" | "fixed">().notNull(),
    value: integer().notNull(),
    minSpend: integer("min_spend").default(0).notNull(),
    maxDiscount: integer("max_discount"),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").default(0).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    active: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("coupons_code_idx").on(table.code),
    index("coupons_active_idx").on(table.active),
  ],
);

