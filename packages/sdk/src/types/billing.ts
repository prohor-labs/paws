export type PlanType = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

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

export interface UserSubscription {
  plan: PlanType;
  status: SubscriptionStatus;
  isPro: boolean;
  currentPeriodStart?: string | Date | null;
  currentPeriodEnd?: string | Date | null;
}

export interface UserCredits {
  aiCredits: number;
}

export interface ExplanationQuotaStatus {
  allowed: boolean;
  isPro: boolean;
  remaining: number;
  limit: number;
  resetsInSeconds: number;
}

export interface BillingConfigResponse {
  packages: PackageConfig[];
  addons: AddonConfig[];
}

export interface BillingStatusResponse {
  subscription: UserSubscription;
  credits: UserCredits;
  explanationQuota: ExplanationQuotaStatus;
  packages: PackageConfig[];
  addons: AddonConfig[];
}

export interface ValidateCouponInput {
  code: string;
  amount: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  code?: string;
  discount: number;
  message: string;
}

export interface CheckoutInput {
  packageId: string;
  addonIds?: string[];
  paymentMethod: "bkash" | "nagad" | "rocket" | "card";
  senderNumber: string;
  couponCode?: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  subscription: unknown;
  details: {
    packageId: string;
    durationMonths: number;
    totalAmount: number;
    paymentMethod: string;
    senderNumber: string;
    couponCode?: string;
  };
}

export interface CreateOrderInput {
  packageId: string;
  addonIds?: string[];
  couponCode?: string;
}

export interface BillingOrderUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface BillingOrder {
  id: string;
  userId: string;
  packageId: string;
  packageDuration: string;
  packagePrice: number;
  packageMonths: number;
  addonIds: string[];
  addonsTotal: number;
  couponCode: string | null;
  discountAmount: number;
  totalPayable: number;
  status: "pending" | "paid" | "failed" | "canceled";
  paymentMethod: string | null;
  senderNumber: string | null;
  transactionId: string | null;
  paidAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: BillingOrderUser;
  addons?: AddonConfig[];
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  order: BillingOrder;
}

export interface GetOrderResponse {
  order: BillingOrder;
}

export interface PayOrderInput {
  paymentMethod: "bkash" | "nagad" | "rocket" | "card";
  senderNumber: string;
  transactionId?: string;
}

export interface PayOrderResponse {
  success: boolean;
  message: string;
  order: BillingOrder;
  alreadyPaid?: boolean;
}

export interface RevealExplanationResponse {
  success: boolean;
  questionId: string;
  explanation: string | null;
  isPro: boolean;
  remaining: number;
  limit: number;
  resetsInSeconds: number;
}

