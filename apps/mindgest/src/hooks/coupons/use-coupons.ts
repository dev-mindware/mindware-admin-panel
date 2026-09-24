import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService } from "@/services/coupon-service";
import {
  CouponCreateInput,
  CouponFilterParams,
  CouponListResponse,
  CouponStats,
} from "@/types/coupon";

export function useAdminCoupons(params?: CouponFilterParams) {
  const { data, ...query } = useQuery<CouponListResponse>({
    queryKey: ["coupons", params],
    queryFn: async () => {
      const response = await couponService.getCoupons(params);
      return response.data;
    },
  });

  return {
    ...query,
    coupons: data?.data || [],
    meta: data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
  };
}

export function useCouponStats() {
  return useQuery<CouponStats>({
    queryKey: ["coupon-stats"],
    queryFn: async () => {
      const response = await couponService.getStats();
      return response.data;
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CouponCreateInput) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CouponCreateInput>;
    }) => couponService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
    },
  });
}

export function useToggleCouponStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] });
    },
  });
}
