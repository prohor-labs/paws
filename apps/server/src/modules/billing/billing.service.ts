import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { ApiError } from '../../common/errors/api-error.js';
import { dayjs, DHAKA_TIMEZONE } from '../../common/utils/date.js';
import { DrizzleService } from '../../common/database/drizzle.service.js';
import { env } from '../../common/env.js';
import {
  billingOrders,
  coupons,
  creditTransactions,
  qbQuestionOptions,
  qbQuestions,
  subscriptions,
  userBatchAccess,
  userCredits,
} from '../../common/database/schema/index.js';
import { cleanAndFormatMathText } from '../../common/utils/math.js';
import type {
  AddonConfig,
  CouponConfig,
  CouponInput,
  GetAllOrdersParams,
  PackageConfig,
  UpdateCouponInput,
} from './billing.types.js';

const BACKEND_PACKAGES: PackageConfig[] = [
  {
    id: '1-month',
    duration: '১ মাস',
    price: 49,
    originalPrice: 99,
    months: 1,
  },
  {
    id: '3-months',
    duration: '৩ মাস',
    price: 129,
    originalPrice: 199,
    months: 3,
  },
  {
    id: '6-months',
    duration: '৬ মাস',
    price: 239,
    originalPrice: 349,
    months: 6,
  },
  {
    id: '9-months',
    duration: '৯ মাস',
    subtitle: 'অ্যাডমিশন শেষ পর্যন্ত',
    price: 329,
    originalPrice: 499,
    months: 9,
    isPopular: true,
  },
];

const BACKEND_ADDONS: AddonConfig[] = [
  {
    id: 'addon-ai-1000',
    name: 'অতিরিক্ত ১,০০০ AI ক্রেডিট',
    description: 'মেয়াদহীন AI ডাউট ও স্টেপ-বাই-স্টেপ সমাধান ক্রেডিট',
    price: 49,
    aiCredits: 1000,
  },
];

const BACKEND_COUPONS: CouponConfig[] = [
  {
    code: 'PAWS20',
    type: 'percentage',
    value: 20,
    active: true,
  },
  {
    code: 'CHORCHA20',
    type: 'percentage',
    value: 20,
    active: true,
  },
  {
    code: 'SPECIAL50',
    type: 'fixed',
    value: 50,
    minSpend: 100,
    active: true,
  },
];

@Injectable()
export class BillingService {
  constructor(private readonly drizzle: DrizzleService) {}

  private get db() {
    return this.drizzle.db;
  }

  getPackages(): PackageConfig[] {
    return BACKEND_PACKAGES;
  }

  getAddons(): AddonConfig[] {
    return BACKEND_ADDONS;
  }

  async validateCoupon(code: string, amount: number) {
    const normalized = code.trim().toUpperCase();
    const dbCoupon = await this.db.query.coupons.findFirst({
      where: eq(coupons.code, normalized),
    });

    const coupon = dbCoupon || BACKEND_COUPONS.find((c) => c.code === normalized && c.active);

    if (!coupon || !coupon.active) {
      return {
        valid: false,
        message: 'অবৈধ বা নিষ্ক্রিয় কুপন কোড!',
        discount: 0,
      };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return {
        valid: false,
        message: 'এই কুপনটির মেয়াদ উত্তীর্ণ হয়ে গেছে।',
        discount: 0,
      };
    }

    if (coupon.usageLimit != null && (coupon.usageCount ?? 0) >= coupon.usageLimit) {
      return {
        valid: false,
        message: 'এই কুপন ব্যবহারের সীমা পূর্ণ হয়ে গেছে।',
        discount: 0,
      };
    }

    if (coupon.minSpend && amount < coupon.minSpend) {
      return {
        valid: false,
        message: `এই কুপনটি ন্যূনতম ৳${coupon.minSpend} টাকার অর্ডারে প্রযোজ্য।`,
        discount: 0,
      };
    }

    let discount =
      coupon.type === 'percentage'
        ? Math.round((amount * coupon.value) / 100)
        : Math.min(amount, coupon.value);

    if (coupon.maxDiscount != null && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    return {
      valid: true,
      code: coupon.code,
      discount,
      message: `${coupon.code} কুপন সফলভাবে প্রয়োগ করা হয়েছে!`,
    };
  }

  async getAllCoupons(params?: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(Math.max(1, params?.limit || 10), 100);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (params?.search && params.search.trim()) {
      const query = `%${params.search.trim().toUpperCase()}%`;
      conditions.push(sql`${coupons.code} ILIKE ${query}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [couponList, [countResult]] = await Promise.all([
      this.db.query.coupons.findMany({
        where: whereClause,
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        limit,
        offset,
      }),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(coupons)
        .where(whereClause),
    ]);

    const total = countResult?.count ?? couponList.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      coupons: couponList,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async createCoupon(input: CouponInput) {
    const code = input.code.trim().toUpperCase();
    const existing = await this.db.query.coupons.findFirst({
      where: eq(coupons.code, code),
    });

    if (existing) {
      throw new ApiError(409, 'ALREADY_EXISTS', 'এই কোডের একটি কুপন ইতিমধ্যে বিদ্যমান রয়েছে।');
    }

    const [created] = await this.db
      .insert(coupons)
      .values({
        code,
        type: input.type,
        value: input.value,
        minSpend: input.minSpend || 0,
        maxDiscount: input.maxDiscount || null,
        usageLimit: input.usageLimit || null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        active: input.active !== undefined ? input.active : true,
      })
      .returning();

    return created;
  }

  async updateCoupon(id: string, input: UpdateCouponInput) {
    const coupon = await this.db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!coupon) {
      throw new ApiError(404, 'NOT_FOUND', 'কুপনটি পাওয়া যায়নি।');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.code !== undefined) updateData.code = input.code.trim().toUpperCase();
    if (input.type !== undefined) updateData.type = input.type;
    if (input.value !== undefined) updateData.value = input.value;
    if (input.minSpend !== undefined) updateData.minSpend = input.minSpend;
    if (input.maxDiscount !== undefined) updateData.maxDiscount = input.maxDiscount;
    if (input.usageLimit !== undefined) updateData.usageLimit = input.usageLimit;
    if (input.expiresAt !== undefined) {
      updateData.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    }
    if (input.active !== undefined) updateData.active = input.active;

    const [updated] = await this.db
      .update(coupons)
      .set(updateData)
      .where(eq(coupons.id, id))
      .returning();

    return updated;
  }

  async deleteCoupon(id: string) {
    const coupon = await this.db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!coupon) {
      throw new ApiError(404, 'NOT_FOUND', 'কুপনটি পাওয়া যায়নি।');
    }

    await this.db.delete(coupons).where(eq(coupons.id, id));
    return { success: true };
  }

  async getUserSubscription(userId: string) {
    const sub = await this.db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')),
    });

    if (!sub) {
      return {
        plan: 'free' as const,
        status: 'active' as const,
        isPro: false,
        currentPeriodEnd: null,
      };
    }

    const isExpired = dayjs().isAfter(dayjs(sub.currentPeriodEnd));
    const isPro = (sub.plan === 'pro' || sub.plan === 'enterprise') && !isExpired;

    return {
      plan: sub.plan,
      status: isExpired ? ('past_due' as const) : sub.status,
      isPro,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
    };
  }

  async getQuestionExplanation(questionId: string, userId?: string): Promise<{ explanation: string | null; aiGenerated?: boolean }> {
    const question = await this.db.query.qbQuestions.findFirst({
      where: eq(qbQuestions.id, questionId),
      columns: {
        id: true,
        questionText: true,
        explanation: true,
      },
    });

    if (!question) {
      return { explanation: null };
    }

    const currentExp = question.explanation?.trim();
    const isTagOnly = !currentExp || (currentExp.startsWith('[') && currentExp.endsWith(']'));

    if (!isTagOnly && currentExp) {
      return { explanation: cleanAndFormatMathText(currentExp), aiGenerated: false };
    }

    if (!userId) {
      return { explanation: currentExp ? cleanAndFormatMathText(currentExp) : null, aiGenerated: false };
    }

    const userCreditsBalance = await this.getUserCredits(userId);
    if (userCreditsBalance < 1) {
      throw new ApiError(400, 'INSUFFICIENT_AI_CREDITS', 'আপনার অ্যাকাউন্টে পর্যাপ্ত AI ক্রেডিট নেই।');
    }

    try {
      const options = await this.db
        .select()
        .from(qbQuestionOptions)
        .where(eq(qbQuestionOptions.questionId, questionId))
        .orderBy(qbQuestionOptions.orderIndex);

      const optionLabels = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
      const formattedOptions = options
        .map((opt, idx) => `${optionLabels[idx] || idx + 1}) ${opt.optionText}`)
        .join('\n');
      const correctOpt = options.find((opt) => opt.isCorrect);
      const correctText = correctOpt ? correctOpt.optionText : 'দেওয়া নেই';

      const prompt = `তুমি একজন আন্তরিক ও অত্যন্ত অভিজ্ঞ মেন্টর। ছাত্রছাত্রীদের সাথে একজন বন্ধুসুলভ শিক্ষকের মতো সহজ ও স্বাভাবিক ভাষায় কথা বলো। অতিরিক্ত গুরুগম্ভীর বা সেকেলে কঠিন বাংলা পরিহার করে আধুনিক শিক্ষার্থীদের বোঝার উপযোগী স্বাভাবিক ও সাবলীল ভাষায় (যেমন: "অপশন", "কনফিউশন", "টপিক" ইত্যাদি প্রচলিত শব্দ ব্যবহার করতে পারো) নিচের বহুনির্বাচনী (MCQ) প্রশ্নের একটি চমৎকার মেন্টরিং সমাধান ও ব্যাখ্যা তৈরি করো।

প্রশ্ন: ${question.questionText}
বিকল্পসমূহ:
${formattedOptions}

সঠিক উত্তর: ${correctText}

নির্দেশনা ও উত্তরের গঠন:
- কোনো শিরোনাম (Header, Title, Subtitle, # বা ## বা ১/২ নম্বর হেডিং) ব্যবহার করবে না। সম্পূর্ণ উত্তরটি পরিষ্কার ৩টি আলাদা স্বাভাবিক প্যারাগ্রাফে লিখবে।
- কোনো ড্যাশ বা হাইফেন (যেমন: -, —, –) এবং কোনো বুলেট পয়েন্ট বা তালিকা চিহ্ন ব্যবহার করবে না। প্রতিটি বাক্য সাধারণ বিরামচিহ্ন (দাঁড়ি, কমা) দিয়ে স্বাভাবিক গদ্যের মতো সাবলীলভাবে লিখবে।
- প্রতিটি প্যারার মাঝে অবশ্যই দুটি নতুন লাইন (Double Line Break / ফাঁকা লাইন) রাখবে, যাতে প্রতিটি প্যারা আলাদা ব্লকে রেন্ডার হয়। প্রতিটি প্যারা হবে ৩ থেকে ৪ বাক্যের পরিমিত দৈর্ঘ্যের।

১ম প্যারা (সঠিক উত্তরের বিশ্লেষণ): একজন মেন্টরের মতো উষ্ণ ও স্নেহশীল টোনে কথা শুরু করো (যেমন: "দেখো, এখানে প্রশ্নে বলেছে..."), এবং সঠিক উত্তরটি কেন সঠিক তা মূল বৈজ্ঞানিক বা ব্যাকরণগত যুক্তি দিয়ে ধাপে ধাপে বুঝিয়ে দাও।

২য় প্যারা (বাকি অপশন ও কমন ট্র্যাপ): এবার বাকি অপশনগুলোর দিকে তাকাও (যেমন: "এবার বাকি অপশনগুলোর দিকে তাকালে দেখতে পাবে..."), স্পষ্ট করে প্রতিটি অপশনের নাম উল্লেখ করে বলে দাও কেন সেগুলো এই প্রশ্নের জন্য ভুল। বিশেষ করে শিক্ষার্থীরা পরীক্ষার হলে কোথায় কনফিউজড হয়ে ভুল অপশনটি দাগিয়ে ফেলে (কমন ট্র্যাপ বা ফাঁদ) সেটি ধরিয়ে দাও।

৩য় প্যারা (শর্টকাট ট্রিকস ও মনে রাখার হ্যাক): পরীক্ষার হলে দ্রুত মনে রাখার কোনো শর্টকাট টেকনিক, নেমোনিক বা জরুরি টিপস শেয়ার করো যাতে ভবিষ্যতে এই ধরনের প্রশ্ন আসলে এক নজরেই সঠিক উত্তর ধরতে পারে।

ফরম্যাটিং:
- গুরুত্বপূর্ণ কীওয়ার্ড বা মূল উত্তরের অংশ বোঝাতে Markdown বোল্ড (**শব্দ**) ব্যবহার করবে, কোনো ড্যাশ বা তালিকা ছাড়া।
- কোনো গাণিতিক বা বৈজ্ঞানিক সূত্র, মান, প্রতীক বা সমীকরণ থাকলে অবশ্যই স্ট্যান্ডার্ড LaTeX সিনট্যাক্সে সিঙ্গেল ডলার ($...$) বা ডাবল ডলার ($$...$$) এর ভেতরে লিখো। এককের ক্ষেত্রে $3 \\times 10^8\\text{ m/s}$ এভাবে \\text{} ব্যবহার করবে যাতে সমীকরণ ও এককগুলো সুন্দরভাবে রেন্ডার হয়।`;

      let generated: string | undefined;

      if (env.groqApiKey) {
        const groqModels = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
        for (const gModel of groqModels) {
          try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${env.groqApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: gModel,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_completion_tokens: 1024,
              }),
            });

            if (groqRes.ok) {
              const groqData = (await groqRes.json()) as {
                choices?: Array<{ message?: { content?: string } }>;
              };
              const text = groqData.choices?.[0]?.message?.content?.trim();
              if (text) {
                generated = text;
                break;
              }
            }
          } catch {
            continue;
          }
        }
      }

      if (generated) {
        await this.consumeAiCredits(userId, 1, 'Question Explanation AI Generation', { questionId });

        const fullExplanation = currentExp && isTagOnly ? `${generated}\n\n${currentExp}` : generated;

        return { explanation: cleanAndFormatMathText(fullExplanation), aiGenerated: true };
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
    }

    return { explanation: currentExp ? cleanAndFormatMathText(currentExp) : null, aiGenerated: false };
  }

  async getUserCredits(userId: string) {
    const credits = await this.db.query.userCredits.findFirst({
      where: eq(userCredits.userId, userId),
    });
    return credits?.aiCredits ?? 0;
  }

  async grantSubscription(
    userId: string,
    plan: 'pro' | 'enterprise',
    durationMonths: number,
    gatewaySubId?: string,
  ) {
    const startDate = dayjs().tz(DHAKA_TIMEZONE).toDate();
    const endDate = dayjs().tz(DHAKA_TIMEZONE).add(durationMonths, 'month').toDate();

    return await this.db.transaction(async (tx) => {
      const [sub] = await tx
        .insert(subscriptions)
        .values({
          userId,
          plan,
          status: 'active',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          gatewaySubscriptionId: gatewaySubId,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            plan,
            status: 'active',
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
        type: 'subscription_grant',
        amount: 500,
        balanceAfter: updatedCredits.balance,
        reason: `Monthly Pro Plan AI Credits Allotment (${durationMonths} month)`,
      });

      return sub;
    });
  }

  async grantAiCredits(userId: string, amount: number, reason: string) {
    return await this.db.transaction(async (tx) => {
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
        type: 'addon_topup',
        amount,
        balanceAfter: updated.balance,
        reason,
      });

      return updated.balance;
    });
  }

  async grantBatchAccess(userId: string, batchId: string, durationMonths?: number) {
    const expiresAt = durationMonths
      ? dayjs().tz(DHAKA_TIMEZONE).add(durationMonths, 'month').toDate()
      : null;

    const [access] = await this.db
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

  async consumeAiCredits(
    userId: string,
    cost: number,
    reason: string,
    metadata?: Record<string, unknown>,
  ) {
    return await this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(userCredits)
        .set({
          aiCredits: sql`${userCredits.aiCredits} - ${cost}`,
          updatedAt: new Date(),
        })
        .where(sql`${userCredits.userId} = ${userId} AND ${userCredits.aiCredits} >= ${cost}`)
        .returning({ balance: userCredits.aiCredits });

      if (!updated) {
        throw new ApiError(400, 'INSUFFICIENT_AI_CREDITS', 'Insufficient AI credits');
      }

      await tx.insert(creditTransactions).values({
        userId,
        type: 'ai_usage',
        amount: -cost,
        balanceAfter: updated.balance,
        reason,
        metadata,
      });

      return updated.balance;
    });
  }

  async createOrder(
    userId: string,
    packageId: string,
    addonIds: string[] = [],
    couponCode?: string,
  ) {
    const backendPackages = this.getPackages();
    const pkg = backendPackages.find((p) => p.id === packageId);
    if (!pkg) {
      throw new ApiError(400, 'INVALID_PACKAGE', 'অপ্রচলিত প্যাকেজ নির্বাচন করা হয়েছে।');
    }

    const backendAddons = this.getAddons();
    const validAddons = backendAddons.filter((a) => addonIds.includes(a.id));
    const addonsTotal = validAddons.reduce((sum, a) => sum + a.price, 0);

    const baseTotal = pkg.price + addonsTotal;
    let discountAmount = 0;
    let appliedCode: string | undefined;

    if (couponCode && couponCode.trim()) {
      const couponResult = await this.validateCoupon(couponCode, baseTotal);
      if (couponResult.valid) {
        discountAmount = couponResult.discount;
        appliedCode = couponResult.code;
      }
    }

    const totalPayable = Math.max(0, baseTotal - discountAmount);

    const [order] = await this.db
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
        status: 'pending',
      })
      .returning();

    return order;
  }

  async getOrderById(orderId: string) {
    const order = await this.db.query.billingOrders.findFirst({
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
    const populatedAddons = backendAddons.filter((a) => (order.addonIds || []).includes(a.id));

    return {
      ...order,
      addons: populatedAddons,
    };
  }

  async confirmOrderPayment(
    orderId: string,
    paymentMethod: string,
    senderNumber: string,
    transactionId?: string,
  ) {
    const order = await this.db.query.billingOrders.findFirst({
      where: eq(billingOrders.id, orderId),
    });

    if (!order) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', 'অর্ডারটি পাওয়া যায়নি।');
    }

    if (order.status === 'paid') {
      return { order, alreadyPaid: true };
    }

    return await this.db.transaction(async (tx) => {
      const [updatedOrder] = await tx
        .update(billingOrders)
        .set({
          status: 'paid',
          paymentMethod,
          senderNumber,
          transactionId: transactionId || `TXN-${Date.now()}`,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(billingOrders.id, orderId))
        .returning();

      await this.grantSubscription(order.userId, 'pro', order.packageMonths, `order-${order.id}`);

      const backendAddons = this.getAddons();
      const validAddons = backendAddons.filter((a) => (order.addonIds || []).includes(a.id));

      for (const addon of validAddons) {
        if (addon.aiCredits) {
          await this.grantAiCredits(
            order.userId,
            addon.aiCredits,
            `Purchased addon ${addon.name} (Order: ${order.id})`,
          );
        } else if (addon.batchId) {
          await this.grantBatchAccess(order.userId, addon.batchId, order.packageMonths);
        }
      }

      return { order: updatedOrder, alreadyPaid: false };
    });
  }

  async getAllOrders(params?: GetAllOrdersParams) {
    const { status, search } = params || {};
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(Math.max(1, params?.limit || 10), 100);
    const offset = params?.offset !== undefined ? params.offset : (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(eq(billingOrders.status, status));
    }

    if (search && search.trim()) {
      const query = `%${search.trim()}%`;
      conditions.push(
        sql`(${billingOrders.senderNumber} ILIKE ${query} OR ${billingOrders.transactionId} ILIKE ${query} OR ${billingOrders.couponCode} ILIKE ${query} OR ${billingOrders.id}::text ILIKE ${query})`,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [orders, [countResult]] = await Promise.all([
      this.db.query.billingOrders.findMany({
        where: whereClause,
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
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        limit,
        offset,
      }),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(billingOrders)
        .where(whereClause),
    ]);

    const backendAddons = this.getAddons();
    const enriched = orders.map((order) => {
      const populatedAddons = backendAddons.filter((a) => (order.addonIds || []).includes(a.id));
      return {
        ...order,
        addons: populatedAddons,
      };
    });

    const total = countResult?.count ?? enriched.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders: enriched,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'paid' | 'failed' | 'canceled',
  ) {
    const order = await this.db.query.billingOrders.findFirst({
      where: eq(billingOrders.id, orderId),
    });

    if (!order) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', 'অর্ডারটি পাওয়া যায়নি।');
    }

    if (status === 'paid' && order.status !== 'paid') {
      return this.confirmOrderPayment(
        orderId,
        order.paymentMethod || 'admin_manual',
        order.senderNumber || 'ADMIN',
        order.transactionId || `ADMIN-APPROVE-${Date.now()}`,
      );
    }

    const [updated] = await this.db
      .update(billingOrders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(billingOrders.id, orderId))
      .returning();

    return { order: updated, alreadyPaid: order.status === 'paid' };
  }
}
