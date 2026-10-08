import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { dailyExplanationUsage, subscriptions } from "../db/schema";
import { getDhakaDateString, getSecondsUntilDhakaMidnight } from "../lib/date-utils";

export const FREE_DAILY_EXPLANATION_LIMIT = 10;

export interface ExplanationAccessResult {
  allowed: boolean;
  isPro: boolean;
  remaining: number;
  limit: number;
  resetsInSeconds: number;
}

export class ExplanationService {
  static async checkAndRecordView(userId: string): Promise<ExplanationAccessResult> {
    const dhakaDate = getDhakaDateString();
    const secondsUntilReset = getSecondsUntilDhakaMidnight();

    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
      ),
    });

    const isPro = sub?.plan === "pro" || sub?.plan === "enterprise";
    if (isPro) {
      return {
        allowed: true,
        isPro: true,
        remaining: Infinity,
        limit: Infinity,
        resetsInSeconds: secondsUntilReset,
      };
    }

    return await db.transaction(async (tx) => {
      const [record] = await tx
        .insert(dailyExplanationUsage)
        .values({
          userId,
          date: dhakaDate,
          viewCount: 1,
        })
        .onConflictDoUpdate({
          target: [dailyExplanationUsage.userId, dailyExplanationUsage.date],
          set: {
            viewCount: sql`${dailyExplanationUsage.viewCount} + 1`,
            updatedAt: new Date(),
          },
        })
        .returning({ viewCount: dailyExplanationUsage.viewCount });

      const currentCount = record.viewCount;

      if (currentCount > FREE_DAILY_EXPLANATION_LIMIT) {
        return {
          allowed: false,
          isPro: false,
          remaining: 0,
          limit: FREE_DAILY_EXPLANATION_LIMIT,
          resetsInSeconds: secondsUntilReset,
        };
      }

      return {
        allowed: true,
        isPro: false,
        remaining: Math.max(0, FREE_DAILY_EXPLANATION_LIMIT - currentCount),
        limit: FREE_DAILY_EXPLANATION_LIMIT,
        resetsInSeconds: secondsUntilReset,
      };
    });
  }

  static async getQuotaStatus(userId: string): Promise<ExplanationAccessResult> {
    const dhakaDate = getDhakaDateString();
    const secondsUntilReset = getSecondsUntilDhakaMidnight();

    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
      ),
    });

    const isPro = sub?.plan === "pro" || sub?.plan === "enterprise";
    if (isPro) {
      return {
        allowed: true,
        isPro: true,
        remaining: Infinity,
        limit: Infinity,
        resetsInSeconds: secondsUntilReset,
      };
    }

    const usage = await db.query.dailyExplanationUsage.findFirst({
      where: and(
        eq(dailyExplanationUsage.userId, userId),
        eq(dailyExplanationUsage.date, dhakaDate),
      ),
    });

    const currentCount = usage?.viewCount ?? 0;
    const remaining = Math.max(0, FREE_DAILY_EXPLANATION_LIMIT - currentCount);

    return {
      allowed: remaining > 0,
      isPro: false,
      remaining,
      limit: FREE_DAILY_EXPLANATION_LIMIT,
      resetsInSeconds: secondsUntilReset,
    };
  }
}
