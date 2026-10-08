import type {
  BillingConfigResponse,
  BillingStatusResponse,
  CheckoutInput,
  CheckoutResponse,
  CreateOrderInput,
  CreateOrderResponse,
  GetOrderResponse,
  PayOrderInput,
  PayOrderResponse,
  RevealExplanationResponse,
  ValidateCouponInput,
  ValidateCouponResponse,
} from "../types/billing";
import { ApiError } from "./errors";
import type { HcApp, RpcClient } from "./rpc";

export class BillingClient<TAppType extends HcApp = HcApp> {
  private readonly rpcAny: any;

  constructor(rpc: RpcClient<TAppType>) {
    this.rpcAny = rpc;
  }

  async getConfig(): Promise<BillingConfigResponse> {
    const res = await this.rpcAny.billing.config.$get();
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch billing configuration");
    }
    return res.json();
  }

  async validateCoupon(input: ValidateCouponInput): Promise<ValidateCouponResponse> {
    const res = await this.rpcAny.billing["validate-coupon"].$post({
      json: input,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to validate coupon");
    }
    return res.json();
  }

  async getStatus(): Promise<BillingStatusResponse> {
    const res = await this.rpcAny.billing.status.$get();
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch billing status");
    }
    return res.json();
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
    const res = await this.rpcAny.billing.order.$post({
      json: input,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to create order");
    }
    return res.json();
  }

  async getOrder(orderId: string): Promise<GetOrderResponse> {
    const res = await this.rpcAny.billing.order[":id"].$get({
      param: { id: orderId },
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch order");
    }
    return res.json();
  }

  async payOrder(orderId: string, input: PayOrderInput): Promise<PayOrderResponse> {
    const res = await this.rpcAny.billing.order[":id"].pay.$post({
      param: { id: orderId },
      json: input,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to pay order");
    }
    return res.json();
  }

  async checkout(input: CheckoutInput): Promise<CheckoutResponse> {
    const res = await this.rpcAny.billing.checkout.$post({
      json: input,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Checkout failed");
    }
    return res.json();
  }

  async revealExplanation(questionId: string): Promise<RevealExplanationResponse> {
    const res = await this.rpcAny.billing["reveal-explanation"][":questionId"].$post({
      param: { questionId },
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to reveal explanation");
    }
    return res.json();
  }
}
