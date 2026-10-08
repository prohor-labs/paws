import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  billingOrders,
  creditTransactions,
  subscriptions,
  userBatchAccess,
  userCredits,
} from "../db/schema";
import { dayjs, DHAKA_TIMEZONE } from "../lib/date-utils";

export interface PackageConfig {
  id: string;
  duration: string;
  subtitle?: string;
  price: number;
  originalPrice: number;
  months: number;
  isPopular?: boolean;
}

export interface AddonConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  aiCredits?: number;
  batchId?: string;
}

export interface CouponConfig {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minSpend?: number;
  active: boolean;
}

const BACKEND_PACKAGES: PackageConfig[] = [
  {
    id: "1-month",
    duration: "১ মাস",
    price: 249,
    originalPrice: 299,
    months: 1,
  },
  {
    id: "3-months",
    duration: "৩ মাস",
    price: 499,
    originalPrice: 599,
    months: 3,
  },
  {
    id: "6-months",
    duration: "৬ মাস",
    price: 799,
    originalPrice: 959,
    months: 6,
  },
  {
    id: "9-months",
    duration: "৯ মাস",
    subtitle: "অ্যাডমিশন শেষ পর্যন্ত",
    price: 949,
    originalPrice: 1139,
    months: 9,
    isPopular: true,
  },
];

const BACKEND_ADDONS: AddonConfig[] = [
  {
    id: "addon-ai-1000",
    name: "অতিরিক্ত ১,০০০ AI ক্রেডিট",
    description: "মেয়াদহীন AI ডাউট ও স্টেপ-বাই-স্টেপ সমাধান ক্রেডিট",
    price: 199,
    aiCredits: 1000,
  },
];

const BACKEND_COUPONS: CouponConfig[] = [
  {
    code: "PAWS20",
    type: "percentage",
    value: 20,
    active: true,
  },
  {
    code: "CHORCHA20",
    type: "percentage",
    value: 20,
    active: true,
  },
  {
    code: "SPECIAL50",
    type: "fixed",
    value: 50,
    minSpend: 200,
    active: true,
  },
];

export class BillingService {
  static getPackages(): PackageConfig[] {
    return BACKEND_PACKAGES;
  }

  static getAddons(): AddonConfig[] {
    return BACKEND_ADDONS;
  }

  static validateCoupon(code: string, amount: number) {
    const normalized = code.trim().toUpperCase();
    const coupon = BACKEND_COUPONS.find(
      (c) => c.code === normalized && c.active,
    );

    if (!coupon) {
      return {
        valid: false,
        message: "অবৈধ কুপন কোড! দয়া করে সঠিক কোড দিন।",
        discount: 0,
      };
    }

    if (coupon.minSpend && amount < coupon.minSpend) {
      return {
        valid: false,
        message: `এই কুপনটি ন্যূনতম ${coupon.minSpend} টাকার অর্ডারে প্রযোজ্য।`,
        discount: 0,
      };
    }

    const discount =
      coupon.type === "percentage"
        ? Math.round((amount * coupon.value) / 100)
        : Math.min(amount, coupon.value);

    return {
      valid: true,
      code: coupon.code,
      discount,
      message: `${coupon.code} কুপন সফলভাবে প্রয়োগ করা হয়েছে!`,
    };
  }

  static async getUserSubscription(userId: string) {
    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
      ),
    });

    if (!sub) {
      return {
        plan: "free" as const,
        status: "active" as const,
        isPro: false,
        currentPeriodEnd: null,
      };
    }

    const isExpired = dayjs().isAfter(dayjs(sub.currentPeriodEnd));
    const isPro = (sub.plan === "pro" || sub.plan === "enterprise") && !isExpired;

    return {
      plan: sub.plan,
      status: isExpired ? ("past_due" as const) : sub.status,
      isPro,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }

  static async getUserCredits(userId: string) {
    const credits = await db.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    });
    return credits?.aiCredits ?? 0;
  }

  static async grantSubscription(
    userId: string,
    plan: "pro" | "enterprise",
    durationMonths: number,
    gatewaySubId?: string,
  ) {
    const startDate = dayjs().tz(DHAKA_TIMEZONE).toDate();
    const endDate = dayjs().tz(DHAKA_TIMEZONE).add(durationMonths, "month").toDate();

    return await db.transaction(async (tx) => {
      const [sub] = await tx
        .insert(subscriptions)
        .values({
          userId,
          plan,
          status: "active",
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          gatewaySubscriptionId: gatewaySubId,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            plan,
            status: "active",
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
            gatewaySubscriptionId: gatewaySubId,
            updatedAt: new Date(),
          },
        })
        .returning();

      const [updatedCredits] = await tx
        .insert(userCredits)
        .values({ userId, aiCredits: 500 })
        .onConflictDoUpdate({
          target: userCredits.userId,
          set: {
            aiCredits: sql`${userCredits.aiCredits} + 500`,
            updatedAt: new Date(),
          },
        })
        .returning({ balance: userCredits.aiCredits });

      await tx.insert(creditTransactions).values({
        userId,
        type: "subscription_grant",
        amount: 500,
        balanceAfter: updatedCredits.balance,
        reason: `Monthly Pro Plan AI Credits Allotment (${durationMonths} month)`,
      });

      return sub;
    });
  }

  static async grantAiCredits(userId: string, amount: number, reason: string) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .insert(userCredits)
        .values({ userId, aiCredits: amount })
        .onConflictDoUpdate({
          target: userCredits.userId,
          set: {
            aiCredits: sql`${userCredits.aiCredits} + ${amount}`,
            updatedAt: new Date(),
          },
        })
        .returning({ balance: userCredits.aiCredits });

      await tx.insert(creditTransactions).values({
        userId,
        type: "addon_topup",
        amount,
        balanceAfter: updated.balance,
        reason,
      });

      return updated.balance;
    });
  }

  static async grantBatchAccess(userId: string, batchId: string, durationMonths?: number) {
    const expiresAt = durationMonths
      ? dayjs().tz(DHAKA_TIMEZONE).add(durationMonths, "month").toDate()
      : null;

    const [access] = await db
      .insert(userBatchAccess)
      .values({
        userId,
        batchId,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [userBatchAccess.userId, userBatchAccess.batchId],
        set: {
          expiresAt,
        },
      })
      .returning();

    return access;
  }

  static async consumeAiCredits(
    userId: string,
    cost: number,
    reason: string,
    metadata?: Record<string, unknown>,
  ) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(userCredits)
        .set({
          aiCredits: sql`${userCredits.aiCredits} - ${cost}`,
          updatedAt: new Date(),
        })
        .where(
          sql`${userCredits.userId} = ${userId} AND ${userCredits.aiCredits} >= ${cost}`,
        )
        .returning({ balance: userCredits.aiCredits });

      if (!updated) {
        throw new Error("INSUFFICIENT_AI_CREDITS");
      }

      await tx.insert(creditTransactions).values({
        userId,
        type: "ai_usage",
        amount: -cost,
        balanceAfter: updated.balance,
        reason,
        metadata,
      });

      return updated.balance;
    });
  }

  static async createOrder(
    userId: string,
    packageId: string,
    addonIds: string[] = [],
    couponCode?: string,
  ) {
    const backendPackages = this.getPackages();
    const pkg = backendPackages.find((p) => p.id === packageId);
    if (!pkg) {
      throw new Error("INVALID_PACKAGE");
    }

    const backendAddons = this.getAddons();
    const validAddons = backendAddons.filter((a) => addonIds.includes(a.id));
    const addonsTotal = validAddons.reduce((sum, a) => sum + a.price, 0);

    let baseTotal = pkg.price + addonsTotal;
    let discountAmount = 0;
    let appliedCode: string | undefined = undefined;

    if (couponCode && couponCode.trim()) {
      const couponResult = this.validateCoupon(couponCode, baseTotal);
      if (couponResult.valid) {
        discountAmount = couponResult.discount;
        appliedCode = couponResult.code;
      }
    }

    const totalPayable = Math.max(0, baseTotal - discountAmount);

    const [order] = await db
      .insert(billingOrders)
      .values({
        userId,
        packageId: pkg.id,
        packageDuration: pkg.duration,
        packagePrice: pkg.price,
        packageMonths: pkg.months,
        addonIds: validAddons.map((a) => a.id),
        addonsTotal,
        couponCode: appliedCode,
        discountAmount,
        totalPayable,
        status: "pending",
      })
      .returning();

    return order;
  }

  static async getOrderById(orderId: string) {
    const order = await db.query.billingOrders.findFirst({
      where: eq(billingOrders.id, orderId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    const backendAddons = this.getAddons();
    const populatedAddons = backendAddons.filter((a) =>
      (order.addonIds || []).includes(a.id),
    );

    return {
      ...order,
      addons: populatedAddons,
    };
  }

  static async confirmOrderPayment(
    orderId: string,
    paymentMethod: string,
    senderNumber: string,
    transactionId?: string,
  ) {
    const order = await db.query.billingOrders.findFirst({
      where: eq(billingOrders.id, orderId),
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (order.status === "paid") {
      return { order, alreadyPaid: true };
    }

    return await db.transaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(billingOrders)
        .set({
          status: "paid",
          paymentMethod,
          senderNumber,
          transactionId: transactionId || `TXN-${Date.now()}`,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(billingOrders.id, orderId))
        .returning();

      await BillingService.grantSubscription(
        order.userId,
        "pro",
        order.packageMonths,
        `order-${order.id}`,
      );

      const backendAddons = BillingService.getAddons();
      const validAddons = backendAddons.filter((a) =>
        (order.addonIds || []).includes(a.id),
      );

      for (const addon of validAddons) {
        if (addon.aiCredits) {
          await BillingService.grantAiCredits(
            order.userId,
            addon.aiCredits,
            `Purchased addon ${addon.name} (Order: ${order.id})`,
          );
        } else if (addon.batchId) {
          await BillingService.grantBatchAccess(
            order.userId,
            addon.batchId,
            order.packageMonths,
          );
        }
      }

      return { order: updatedOrder, alreadyPaid: false };
    });
  }
}
