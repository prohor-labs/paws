import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../../common/database/drizzle.service.js';
import { subscriptions } from '../../common/database/schema/index.js';
import { getSecondsUntilDhakaMidnight } from '../../common/utils/date.js';

export const FREE_DAILY_EXPLANATION_LIMIT = 10;

export interface ExplanationAccessResult {
  allowed: boolean;
  isPro: boolean;
  remaining: number;
  limit: number;
  resetsInSeconds: number;
}

@Injectable()
export class ExplanationService {
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  async checkAndRecordView(userId: string): Promise<ExplanationAccessResult> {
    const secondsUntilReset = getSecondsUntilDhakaMidnight();

    const sub = await this.db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')),
    });

    const isPro = sub?.plan === 'pro' || sub?.plan === 'enterprise';
    if (isPro) {
      return {
        allowed: true,
        isPro: true,
        remaining: Number.POSITIVE_INFINITY,
        limit: Number.POSITIVE_INFINITY,
        resetsInSeconds: secondsUntilReset,
      };
    }

    return {
      allowed: true,
      isPro,
      remaining: Number.POSITIVE_INFINITY,
      limit: Number.POSITIVE_INFINITY,
      resetsInSeconds: secondsUntilReset,
    };
  }

  async getQuotaStatus(userId: string): Promise<ExplanationAccessResult> {
    const secondsUntilReset = getSecondsUntilDhakaMidnight();

    const sub = await this.db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')),
    });

    const isPro = sub?.plan === 'pro' || sub?.plan === 'enterprise';
    if (isPro) {
      return {
        allowed: true,
        isPro: true,
        remaining: Number.POSITIVE_INFINITY,
        limit: Number.POSITIVE_INFINITY,
        resetsInSeconds: secondsUntilReset,
      };
    }

    return {
      allowed: true,
      isPro,
      remaining: Number.POSITIVE_INFINITY,
      limit: Number.POSITIVE_INFINITY,
      resetsInSeconds: secondsUntilReset,
    };
  }
}
