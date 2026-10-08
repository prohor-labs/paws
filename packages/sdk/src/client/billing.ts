import type {
  BillingConfigResponse,
  BillingStatusResponse,
  CheckoutInput,
  CheckoutResponse,
  CreateCouponInput,
  CreateCouponResponse,
  CreateOrderInput,
  CreateOrderResponse,
  DeleteCouponResponse,
  GetAllCouponsInput,
  GetAllCouponsResponse,
  GetAllOrdersInput,
  GetAllOrdersResponse,
  GetOrderResponse,
  PayOrderInput,
  PayOrderResponse,
  RevealExplanationResponse,
  UpdateCouponInput,
  UpdateCouponResponse,
  UpdateOrderStatusInput,
  UpdateOrderStatusResponse,
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

  async getAllOrders(query?: GetAllOrdersInput): Promise<GetAllOrdersResponse> {
    const res = await this.rpcAny.billing.orders.$get({
      query: {
        status: query?.status,
        search: query?.search,
        page: query?.page?.toString(),
        limit: query?.limit?.toString(),
        offset: query?.offset?.toString(),
      },
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch orders");
    }
    return res.json();
  }

  async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput,
  ): Promise<UpdateOrderStatusResponse> {
    const res = await this.rpcAny.billing.order[":id"].status.$patch({
      param: { id: orderId },
      json: input,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to update order status");
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

  async getAllCoupons(query?: GetAllCouponsInput): Promise<GetAllCouponsResponse> {
    const res = await this.rpcAny.billing.coupons.$get({
      query: {
        search: query?.search,
        page: query?.page?.toString(),
        limit: query?.limit?.toString(),
      },
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch coupons");
    }
    return res.json();
  }

  async createCoupon(input: CreateCouponInput): Promise<CreateCouponResponse> {
    const res = await this.rpcAny.billing.coupons.$post({
      json: input,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to create coupon");
    }
    return res.json();
  }

  async updateCoupon(
    couponId: string,
    input: UpdateCouponInput,
  ): Promise<UpdateCouponResponse> {
    const res = await this.rpcAny.billing.coupon[":id"].$patch({
      param: { id: couponId },
      json: input,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to update coupon");
    }
    return res.json();
  }

  async deleteCoupon(couponId: string): Promise<DeleteCouponResponse> {
    const res = await this.rpcAny.billing.coupon[":id"].$delete({
      param: { id: couponId },
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to delete coupon");
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
