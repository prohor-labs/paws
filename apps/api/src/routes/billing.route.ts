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
  requireAuth,
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
      const result = BillingService.validateCoupon(code, amount);
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
        const couponResult = BillingService.validateCoupon(couponCode, totalAmount);
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
  });
