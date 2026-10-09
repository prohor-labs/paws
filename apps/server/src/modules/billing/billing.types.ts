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
  id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount?: number | null;
  expiresAt?: Date | string | null;
  active: boolean;
}

export interface CouponInput {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  usageLimit?: number | null;
  expiresAt?: Date | string | null;
  active?: boolean;
}

export interface UpdateCouponInput {
  code?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  minSpend?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  expiresAt?: Date | string | null;
  active?: boolean;
}

export interface GetAllOrdersParams {
  status?: 'pending' | 'paid' | 'failed' | 'canceled';
  search?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'canceled';
