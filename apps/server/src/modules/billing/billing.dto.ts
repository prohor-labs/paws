import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { z } from 'zod';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

const ORDER_STATUSES = ['pending', 'paid', 'failed', 'canceled'] as const;

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  amount: z.number().nonnegative(),
});

export const createOrderSchema = z.object({
  packageId: z.string(),
  addonIds: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

export const payOrderSchema = z.object({
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'card']),
  senderNumber: z.string().min(11, 'Mobile number must be at least 11 digits').max(14),
  transactionId: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const checkoutSchema = z.object({
  packageId: z.string(),
  addonIds: z.array(z.string()).optional(),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'card']),
  senderNumber: z.string().min(11, 'Mobile number must be at least 11 digits').max(14),
  couponCode: z.string().optional(),
});

export const createCouponSchema = z.object({
  code: z.string().min(2),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  minSpend: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().positive().optional(),
  expiresAt: z.string().optional(),
  active: z.boolean().optional(),
});

export const updateCouponSchema = z.object({
  code: z.string().min(2).optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
  value: z.number().positive().optional(),
  minSpend: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export type ValidateCouponDto = z.infer<typeof validateCouponSchema>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type PayOrderDto = z.infer<typeof payOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type CheckoutDto = z.infer<typeof checkoutSchema>;
export type CreateCouponDto = z.infer<typeof createCouponSchema>;
export type UpdateCouponDto = z.infer<typeof updateCouponSchema>;

export class GetAllOrdersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: 'pending' | 'paid' | 'failed' | 'canceled';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class GetAllCouponsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
