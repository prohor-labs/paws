import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable(
  "user",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    role: text().$type<"student" | "mentor" | "admin">().default("student").notNull(),
    level: text(),
    educationalStandard: text("educational_standard"),
    track: text(),
    dailyReminderEnabled: boolean("daily_reminder_enabled").default(true).notNull(),
  },
  (table) => [
    unique("user_email_unique").on(table.email),
    uniqueIndex("user_email_lower_idx").on(sql`lower(${table.email})`),
    check("user_role_check", sql`${table.role} in ('student', 'mentor', 'admin')`),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("account_userId_idx").using("btree", table.userId.asc().nullsLast()),
    unique("account_provider_account_unique").on(table.accountId, table.providerId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const session = pgTable(
  "session",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    index("session_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast()),
    index("session_userId_idx").using("btree", table.userId.asc().nullsLast()),
    unique("session_token_unique").on(table.token),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("verification_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast()),
    index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast()),
  ],
);
