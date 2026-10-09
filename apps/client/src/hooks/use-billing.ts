import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, billingKeys } from "@/lib/api";
import type {
  CheckoutInput,
  CreateCouponInput,
  CreateOrderInput,
  GetAllCouponsInput,
  GetAllOrdersInput,
  PayOrderInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from "@/lib/api/types";

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
const TEN_SECONDS = 10 * 1000;

export function useBillingConfig() {
  return useQuery({
    queryKey: billingKeys.config(),
    queryFn: () => api.billing.getConfig(),
    staleTime: FIVE_MINUTES,
  });
}

export function useBillingStatus() {
  return useQuery({
    queryKey: billingKeys.status(),
    queryFn: () => api.billing.getStatus(),
    staleTime: ONE_MINUTE,
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (input: ValidateCouponInput) => api.billing.validateCoupon(input),
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.billing.createOrder(input),
  });
}

export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: billingKeys.order(orderId),
    queryFn: () => api.billing.getOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: PayOrderInput }) =>
      api.billing.payOrder(orderId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.status() });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) => api.billing.checkout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useAllOrders(params?: GetAllOrdersInput) {
  return useQuery({
    queryKey: billingKeys.adminOrders(params),
    queryFn: () => api.billing.getAllOrders(params),
    staleTime: TEN_SECONDS,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: "pending" | "paid" | "failed" | "canceled";
    }) => api.billing.updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...billingKeys.all, "admin-orders"] });
      queryClient.invalidateQueries({ queryKey: [...billingKeys.all, "order"] });
      queryClient.invalidateQueries({ queryKey: billingKeys.status() });
    },
  });
}

export function useRevealExplanation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => api.billing.revealExplanation(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.status() });
    },
  });
}

export function useAllCoupons(params?: GetAllCouponsInput) {
  return useQuery({
    queryKey: billingKeys.adminCoupons(params),
    queryFn: () => api.billing.getAllCoupons(params),
    staleTime: TEN_SECONDS,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCouponInput) => api.billing.createCoupon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...billingKeys.all, "admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: billingKeys.config() });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ couponId, input }: { couponId: string; input: UpdateCouponInput }) =>
      api.billing.updateCoupon(couponId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...billingKeys.all, "admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: billingKeys.config() });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => api.billing.deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...billingKeys.all, "admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: billingKeys.config() });
    },
  });
}
