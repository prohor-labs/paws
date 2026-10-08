import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CheckoutInput,
  CreateCouponInput,
  CreateOrderInput,
  GetAllCouponsInput,
  GetAllOrdersInput,
  PayOrderInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from "@paws/sdk";
import { api } from "@/lib/sdk/client";

export function useBillingConfig() {
  return useQuery({
    queryKey: ["billing", "config"],
    queryFn: async () => {
      return api.billing.getConfig();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBillingStatus() {
  return useQuery({
    queryKey: ["billing", "status"],
    queryFn: async () => {
      return api.billing.getStatus();
    },
    staleTime: 60 * 1000,
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (input: ValidateCouponInput) => {
      return api.billing.validateCoupon(input);
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      return api.billing.createOrder(input);
    },
  });
}

export function useOrderDetails(orderId: string) {
  return useQuery({
    queryKey: ["billing", "order", orderId],
    queryFn: async () => {
      return api.billing.getOrder(orderId);
    },
    enabled: !!orderId,
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      input,
    }: {
      orderId: string;
      input: PayOrderInput;
    }) => {
      return api.billing.payOrder(orderId, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["billing", "order", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      return api.billing.checkout(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

export function useAllOrders(params?: GetAllOrdersInput) {
  return useQuery({
    queryKey: ["billing", "admin-orders", params],
    queryFn: async () => {
      return api.billing.getAllOrders(params);
    },
    staleTime: 10 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: "pending" | "paid" | "failed" | "canceled";
    }) => {
      return api.billing.updateOrderStatus(orderId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "order"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
    },
  });
}

export function useRevealExplanation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questionId: string) => {
      return api.billing.revealExplanation(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
    },
  });
}

export function useAllCoupons(params?: GetAllCouponsInput) {
  return useQuery({
    queryKey: ["billing", "admin-coupons", params],
    queryFn: async () => {
      return api.billing.getAllCoupons(params);
    },
    staleTime: 10 * 1000,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCouponInput) => {
      return api.billing.createCoupon(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "config"] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      couponId,
      input,
    }: {
      couponId: string;
      input: UpdateCouponInput;
    }) => {
      return api.billing.updateCoupon(couponId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "config"] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (couponId: string) => {
      return api.billing.deleteCoupon(couponId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "admin-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["billing", "config"] });
    },
  });
}


