import { api } from "./api";
import {
  Coupon,
  CouponCreateInput,
  CouponStats,
  CouponFilterParams,
  CouponListResponse,
} from "@/types/coupon";

export const couponService = {
  getCoupons: async (params?: CouponFilterParams) => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.search && typeof params.search === "string" && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      if (typeof params.isActive === "boolean") {
        cleanParams.isActive = params.isActive;
      }
      if (params.discountType && (params.discountType as any) !== "ALL") {
        cleanParams.discountType = params.discountType;
      }
      if (params.page) {
        cleanParams.page = Number(params.page);
      }
      if (params.limit) {
        cleanParams.limit = Number(params.limit);
      }
    }
    return api.get<CouponListResponse>("/coupons", { params: cleanParams });
  },

  getStats: async () => {
    return api.get<CouponStats>("/coupons/stats");
  },

  getCoupon: async (id: string) => {
    return api.get<Coupon>(`/coupons/${id}`);
  },

  createCoupon: async (data: CouponCreateInput) => {
    return api.post<Coupon>("/coupons", data);
  },

  updateCoupon: async (id: string, data: Partial<CouponCreateInput>) => {
    return api.put<Coupon>(`/coupons/${id}`, data);
  },

  toggleStatus: async (id: string) => {
    return api.patch<Coupon>(`/coupons/${id}/toggle-status`);
  },

  deleteCoupon: async (id: string) => {
    return api.delete(`/coupons/${id}`);
  },
};
