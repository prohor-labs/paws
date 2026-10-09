import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiError } from '../../common/errors/api-error.js';
import { Authenticated, Roles } from '../../core/auth/decorators/roles.decorator.js';
import { zodPipe } from '../../core/pipes/zod-validation.pipe.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../../core/auth/auth.types.js';
import {
  type CheckoutDto,
  type CreateCouponDto,
  type CreateOrderDto,
  checkoutSchema,
  createCouponSchema,
  createOrderSchema,
  GetAllCouponsQueryDto,
  GetAllOrdersQueryDto,
  type PayOrderDto,
  payOrderSchema,
  type UpdateCouponDto,
  type UpdateOrderStatusDto,
  updateCouponSchema,
  updateOrderStatusSchema,
  type ValidateCouponDto,
  validateCouponSchema,
} from './billing.dto.js';
import { BillingService } from './billing.service.js';
import { ExplanationService } from './explanation.service.js';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly explanations: ExplanationService,
  ) {}

  @Get('config')
  getConfig() {
    return {
      packages: this.billing.getPackages(),
      addons: this.billing.getAddons(),
    };
  }

  @Post('validate-coupon')
  validateCoupon(@Body(zodPipe(validateCouponSchema)) body: ValidateCouponDto) {
    return this.billing.validateCoupon(body.code, body.amount);
  }

  @Authenticated()
  @Get('status')
  async getStatus(@CurrentUser() user: AuthUser | null) {
    if (!user) {
      throw ApiError.unauthorized();
    }

    const [subscription, credits, explanationQuota] = await Promise.all([
      this.billing.getUserSubscription(user.id),
      this.billing.getUserCredits(user.id),
      this.explanations.getQuotaStatus(user.id),
    ]);

    return {
      subscription,
      credits: { aiCredits: credits },
      explanationQuota,
      packages: this.billing.getPackages(),
      addons: this.billing.getAddons(),
    };
  }

  @Authenticated()
  @Post('order')
  async createOrder(
    @CurrentUser() user: AuthUser | null,
    @Body(zodPipe(createOrderSchema)) body: CreateOrderDto,
  ) {
    if (!user) {
      throw ApiError.unauthorized();
    }

    const order = await this.billing.createOrder(
      user.id,
      body.packageId,
      body.addonIds ?? [],
      body.couponCode,
    );

    return { success: true, orderId: order.id, order };
  }

  @Get('orders')
  @Authenticated()
  @Roles('mentor', 'admin')
  async getAllOrders(@Query() query: GetAllOrdersQueryDto) {
    return this.billing.getAllOrders(query);
  }

  @Get(['orders/:id', 'order/:id'])
  async getOrder(@Param('id') orderId: string) {
    const order = await this.billing.getOrderById(orderId);

    if (!order) {
      throw new ApiError(404, 'ORDER_NOT_FOUND', 'অর্ডারটি পাওয়া যায়নি।');
    }

    return { order };
  }

  @Post(['orders/:id/pay', 'order/:id/pay'])
  async payOrder(@Param('id') orderId: string, @Body(zodPipe(payOrderSchema)) body: PayOrderDto) {
    const result = await this.billing.confirmOrderPayment(
      orderId,
      body.paymentMethod,
      body.senderNumber,
      body.transactionId,
    );

    return {
      success: true,
      message: 'পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে ও সাবস্ক্রিপশন চালু হয়েছে!',
      order: result.order,
      alreadyPaid: result.alreadyPaid,
    };
  }

  @Patch(['orders/:id/status', 'order/:id/status'])
  @Authenticated()
  @Roles('admin')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body(zodPipe(updateOrderStatusSchema)) body: UpdateOrderStatusDto,
  ) {
    const result = await this.billing.updateOrderStatus(orderId, body.status);
    return {
      success: true,
      message: 'অর্ডারের স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে!',
      order: result.order,
      alreadyPaid: result.alreadyPaid,
    };
  }

  @Authenticated()
  @Post('checkout')
  async checkout(
    @CurrentUser() user: AuthUser | null,
    @Body(zodPipe(checkoutSchema)) body: CheckoutDto,
  ) {
    if (!user) {
      throw ApiError.unauthorized();
    }

    const packages = this.billing.getPackages();
    const pkg = packages.find((candidate) => candidate.id === body.packageId);
    if (!pkg) {
      throw new ApiError(400, 'INVALID_PACKAGE', 'অপ্রচলিত প্যাকেজ নির্বাচন করা হয়েছে।');
    }

    const addons = this.billing.getAddons();
    const addonIds = body.addonIds ?? [];
    const validAddons = addons.filter((addon) => addonIds.includes(addon.id));

    let totalAmount = pkg.price + validAddons.reduce((sum, addon) => sum + addon.price, 0);

    if (body.couponCode) {
      const couponResult = await this.billing.validateCoupon(body.couponCode, totalAmount);
      if (couponResult.valid) {
        totalAmount = Math.max(0, totalAmount - couponResult.discount);
      }
    }

    const subscription = await this.billing.grantSubscription(
      user.id,
      'pro',
      pkg.months,
      `manual-${body.paymentMethod}-${Date.now()}`,
    );

    for (const addon of validAddons) {
      if (addon.aiCredits) {
        await this.billing.grantAiCredits(user.id, addon.aiCredits, `Purchased ${addon.name}`);
      } else if (addon.batchId) {
        await this.billing.grantBatchAccess(user.id, addon.batchId, pkg.months);
      }
    }

    return {
      success: true,
      message: 'প্রিমিয়াম সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে!',
      subscription,
      details: {
        packageId: pkg.id,
        durationMonths: pkg.months,
        totalAmount,
        paymentMethod: body.paymentMethod,
        senderNumber: body.senderNumber,
        couponCode: body.couponCode,
      },
    };
  }

  @Authenticated()
  @Post('reveal-explanation/:questionId')
  async revealExplanation(
    @CurrentUser() user: AuthUser | null,
    @Param('questionId') questionId: string,
  ) {
    if (!user) {
      throw ApiError.unauthorized();
    }

    const check = await this.explanations.checkAndRecordView(user.id);

    if (!check.allowed) {
      throw new ApiError(
        403,
        'DAILY_LIMIT_REACHED',
        'দৈনিক ফ্রি ৫টি ব্যাখ্যার সীমা শেষ হয়েছে। আনলিমিটেড দেখতে প্রো-তে আপগ্রেড করো।',
        {
          details: {
            isPro: false,
            limit: check.limit,
            remaining: 0,
            resetsInSeconds: check.resetsInSeconds,
          },
        },
      );
    }

    const explanation = await this.billing.getQuestionExplanation(questionId);

    return {
      success: true,
      questionId,
      explanation,
      isPro: check.isPro,
      remaining: check.remaining,
      limit: check.limit,
      resetsInSeconds: check.resetsInSeconds,
    };
  }

  @Get('coupons')
  @Authenticated()
  @Roles('mentor', 'admin')
  async getAllCoupons(@Query() query: GetAllCouponsQueryDto) {
    return this.billing.getAllCoupons(query);
  }

  @Post('coupons')
  @Authenticated()
  @Roles('admin')
  async createCoupon(@Body(zodPipe(createCouponSchema)) body: CreateCouponDto) {
    const coupon = await this.billing.createCoupon(body);
    return { success: true, message: 'কুপন সফলভাবে তৈরি করা হয়েছে!', coupon };
  }

  @Patch(['coupons/:id', 'coupon/:id'])
  @Authenticated()
  @Roles('admin')
  async updateCoupon(
    @Param('id') couponId: string,
    @Body(zodPipe(updateCouponSchema)) body: UpdateCouponDto,
  ) {
    const coupon = await this.billing.updateCoupon(couponId, body);
    return { success: true, message: 'কুপন সফলভাবে আপডেট করা হয়েছে!', coupon };
  }

  @Delete(['coupons/:id', 'coupon/:id'])
  @Authenticated()
  @Roles('admin')
  async deleteCoupon(@Param('id') couponId: string) {
    await this.billing.deleteCoupon(couponId);
    return { success: true, message: 'কুপনটি সফলভাবে মুছে ফেলা হয়েছে!' };
  }
}
