import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { qbQuestions } from "../db/schema";
import { cleanAndFormatMathText } from "../lib/math";
import {
  type AuthContextVariables,
  attachSession,
  requireAdmin,
  requireAuth,
  requireMentorOrAdmin,
} from "../middleware/auth.middleware";
import { BillingService } from "../services/billing.service";
import { ExplanationService } from "../services/explanation.service";

export const billingRoute = new Hono<{ Variables: AuthContextVariables }>()
  .use(attachSession)

  .get("/config", async (c) => {
    return c.json({
      packages: BillingService.getPackages(),
      addons: BillingService.getAddons(),
    });
  })

  .post(
    "/validate-coupon",
    zValidator(
      "json",
      z.object({
        code: z.string().min(1),
        amount: z.number().nonnegative(),
      }),
    ),
    async (c) => {
      const { code, amount } = c.req.valid("json");
      const result = await BillingService.validateCoupon(code, amount);
      return c.json(result);
    },
  )

  .get("/status", requireAuth, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const [sub, credits, quota] = await Promise.all([
      BillingService.getUserSubscription(user.id),
      BillingService.getUserCredits(user.id),
      ExplanationService.getQuotaStatus(user.id),
    ]);

    return c.json({
      subscription: sub,
      credits: {
        aiCredits: credits,
      },
      explanationQuota: quota,
      packages: BillingService.getPackages(),
      addons: BillingService.getAddons(),
    });
  })

  .post(
    "/order",
    requireAuth,
    zValidator(
      "json",
      z.object({
        packageId: z.string(),
        addonIds: z.array(z.string()).optional(),
        couponCode: z.string().optional(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { packageId, addonIds = [], couponCode } = c.req.valid("json");

      try {
        const order = await BillingService.createOrder(
          user.id,
          packageId,
          addonIds,
          couponCode,
        );

        return c.json({
          success: true,
          orderId: order.id,
          order,
        });
      } catch (err: any) {
        if (err.message === "INVALID_PACKAGE") {
          return c.json(
            { error: "INVALID_PACKAGE", message: "অপ্রচলিত প্যাকেজ নির্বাচন করা হয়েছে।" },
            400,
          );
        }
        return c.json({ error: "ORDER_CREATION_FAILED", message: "অর্ডার তৈরি ব্যর্থ হয়েছে।" }, 500);
      }
    },
  )

  .get("/order/:id", async (c) => {
    const orderId = c.req.param("id");
    const order = await BillingService.getOrderById(orderId);

    if (!order) {
      return c.json({ error: "ORDER_NOT_FOUND", message: "অর্ডারটি পাওয়া যায়নি।" }, 404);
    }

    return c.json({
      order,
    });
  })

  .post(
    "/order/:id/pay",
    zValidator(
      "json",
      z.object({
        paymentMethod: z.enum(["bkash", "nagad", "rocket", "card"]),
        senderNumber: z
          .string()
          .min(11, "Mobile number must be at least 11 digits")
          .max(14),
        transactionId: z.string().optional(),
      }),
    ),
    async (c) => {
      const orderId = c.req.param("id");
      const { paymentMethod, senderNumber, transactionId } = c.req.valid("json");

      try {
        const result = await BillingService.confirmOrderPayment(
          orderId,
          paymentMethod,
          senderNumber,
          transactionId,
        );

        return c.json({
          success: true,
          message: "পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে ও সাবস্ক্রিপশন চালু হয়েছে!",
          order: result.order,
          alreadyPaid: result.alreadyPaid,
        });
      } catch (err: any) {
        if (err.message === "ORDER_NOT_FOUND") {
          return c.json({ error: "ORDER_NOT_FOUND", message: "অর্ডারটি পাওয়া যায়নি।" }, 404);
        }
        return c.json({ error: "PAYMENT_FAILED", message: "পেমেন্ট সম্পন্ন হতে সমস্যা হয়েছে।" }, 500);
      }
    },
  )
  .get(
    "/orders",
    requireAuth,
    requireMentorOrAdmin,
    zValidator(
      "query",
      z.object({
        status: z.enum(["pending", "paid", "failed", "canceled"]).optional(),
        search: z.string().optional(),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        offset: z.coerce.number().min(0).optional(),
      }),
    ),
    async (c) => {
      const query = c.req.valid("query");
      const result = await BillingService.getAllOrders(query);
      return c.json(result);
    },
  )

  .patch(
    "/order/:id/status",
    requireAuth,
    requireAdmin,
    zValidator(
      "json",
      z.object({
        status: z.enum(["pending", "paid", "failed", "canceled"]),
      }),
    ),
    async (c) => {
      const orderId = c.req.param("id");
      const { status } = c.req.valid("json");

      try {
        const result = await BillingService.updateOrderStatus(orderId, status);
        return c.json({
          success: true,
          message: "অর্ডারের স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে!",
          order: result.order,
          alreadyPaid: result.alreadyPaid,
        });
      } catch (err: any) {
        if (err.message === "ORDER_NOT_FOUND") {
          return c.json({ error: "ORDER_NOT_FOUND", message: "অর্ডারটি পাওয়া যায়নি।" }, 404);
        }
        return c.json({ error: "UPDATE_FAILED", message: "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।" }, 500);
      }
    },
  )

  .post(
    "/checkout",
    requireAuth,
    zValidator(
      "json",
      z.object({
        packageId: z.string(),
        addonIds: z.array(z.string()).optional(),
        paymentMethod: z.enum(["bkash", "nagad", "rocket", "card"]),
        senderNumber: z
          .string()
          .min(11, "Mobile number must be at least 11 digits")
          .max(14),
        couponCode: z.string().optional(),
      }),
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { packageId, addonIds = [], paymentMethod, senderNumber, couponCode } =
        c.req.valid("json");

      const backendPackages = BillingService.getPackages();
      const pkg = backendPackages.find((p) => p.id === packageId);
      if (!pkg) {
        return c.json({ error: "INVALID_PACKAGE", message: "অপ্রচলিত প্যাকেজ নির্বাচন করা হয়েছে।" }, 400);
      }

      const backendAddons = BillingService.getAddons();
      const validAddons = backendAddons.filter((a) => addonIds.includes(a.id));

      let totalAmount = pkg.price + validAddons.reduce((sum, a) => sum + a.price, 0);

      if (couponCode) {
        const couponResult = await BillingService.validateCoupon(couponCode, totalAmount);
        if (couponResult.valid) {
          totalAmount = Math.max(0, totalAmount - couponResult.discount);
        }
      }

      const sub = await BillingService.grantSubscription(
        user.id,
        "pro",
        pkg.months,
        `manual-${paymentMethod}-${Date.now()}`,
      );

      for (const addon of validAddons) {
        if (addon.aiCredits) {
          await BillingService.grantAiCredits(
            user.id,
            addon.aiCredits,
            `Purchased ${addon.name}`,
          );
        } else if (addon.batchId) {
          await BillingService.grantBatchAccess(
            user.id,
            addon.batchId,
            pkg.months,
          );
        }
      }

      return c.json({
        success: true,
        message: "প্রিমিয়াম সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে!",
        subscription: sub,
        details: {
          packageId: pkg.id,
          durationMonths: pkg.months,
          totalAmount,
          paymentMethod,
          senderNumber,
          couponCode,
        },
      });
    },
  )

  .post("/reveal-explanation/:questionId", requireAuth, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const questionId = c.req.param("questionId");
    const check = await ExplanationService.checkAndRecordView(user.id);

    if (!check.allowed) {
      return c.json(
        {
          error: "DAILY_LIMIT_REACHED",
          message:
            "দৈনিক ফ্রি ৫টি ব্যাখ্যার সীমা শেষ হয়েছে। আনলিমিটেড দেখতে প্রো-তে আপগ্রেড করো।",
          isPro: false,
          limit: check.limit,
          remaining: 0,
          resetsInSeconds: check.resetsInSeconds,
        },
        403,
      );
    }

    const question = await db.query.qbQuestions.findFirst({
      where: eq(qbQuestions.id, questionId),
      columns: {
        id: true,
        explanation: true,
      },
    });

    const cleanedExplanation = question?.explanation
      ? cleanAndFormatMathText(question.explanation)
      : null;

    return c.json({
      success: true,
      questionId,
      explanation: cleanedExplanation,
      isPro: check.isPro,
      remaining: check.remaining,
      limit: check.limit,
      resetsInSeconds: check.resetsInSeconds,
    });
  })

  .get(
    "/coupons",
    requireAuth,
    requireMentorOrAdmin,
    zValidator(
      "query",
      z.object({
        search: z.string().optional(),
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
      }),
    ),
    async (c) => {
      const query = c.req.valid("query");
      const result = await BillingService.getAllCoupons(query);
      return c.json(result);
    },
  )

  .post(
    "/coupons",
    requireAuth,
    requireAdmin,
    zValidator(
      "json",
      z.object({
        code: z.string().min(2),
        type: z.enum(["percentage", "fixed"]),
        value: z.number().positive(),
        minSpend: z.number().nonnegative().optional(),
        maxDiscount: z.number().positive().optional(),
        usageLimit: z.number().positive().optional(),
        expiresAt: z.string().optional(),
        active: z.boolean().optional(),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      try {
        const coupon = await BillingService.createCoupon(body);
        return c.json({
          success: true,
          message: "কুপন সফলভাবে তৈরি করা হয়েছে!",
          coupon,
        });
      } catch (err: any) {
        if (err.message === "COUPON_ALREADY_EXISTS") {
          return c.json(
            { error: "ALREADY_EXISTS", message: "এই কোডের একটি কুপন ইতিমধ্যে বিদ্যমান রয়েছে।" },
            409,
          );
        }
        return c.json({ error: "CREATE_FAILED", message: "কুপন তৈরি ব্যর্থ হয়েছে।" }, 500);
      }
    },
  )

  .patch(
    "/coupon/:id",
    requireAuth,
    requireAdmin,
    zValidator(
      "json",
      z.object({
        code: z.string().min(2).optional(),
        type: z.enum(["percentage", "fixed"]).optional(),
        value: z.number().positive().optional(),
        minSpend: z.number().nonnegative().optional(),
        maxDiscount: z.number().positive().nullable().optional(),
        usageLimit: z.number().positive().nullable().optional(),
        expiresAt: z.string().nullable().optional(),
        active: z.boolean().optional(),
      }),
    ),
    async (c) => {
      const couponId = c.req.param("id");
      const body = c.req.valid("json");

      try {
        const coupon = await BillingService.updateCoupon(couponId, body);
        return c.json({
          success: true,
          message: "কুপন সফলভাবে আপডেট করা হয়েছে!",
          coupon,
        });
      } catch (err: any) {
        if (err.message === "COUPON_NOT_FOUND") {
          return c.json({ error: "NOT_FOUND", message: "কুপনটি পাওয়া যায়নি।" }, 404);
        }
        return c.json({ error: "UPDATE_FAILED", message: "কুপন আপডেট ব্যর্থ হয়েছে।" }, 500);
      }
    },
  )

  .delete("/coupon/:id", requireAuth, requireAdmin, async (c) => {
    const couponId = c.req.param("id");
    try {
      await BillingService.deleteCoupon(couponId);
      return c.json({
        success: true,
        message: "কুপনটি সফলভাবে মুছে ফেলা হয়েছে!",
      });
    } catch (err: any) {
      if (err.message === "COUPON_NOT_FOUND") {
        return c.json({ error: "NOT_FOUND", message: "কুপনটি পাওয়া যায়নি।" }, 404);
      }
      return c.json({ error: "DELETE_FAILED", message: "কুপন ডিলিট ব্যর্থ হয়েছে।" }, 500);
    }
  });
