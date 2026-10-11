"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCursorList } from "@workspace/hooks";
import { catalogService, type AddonInput, type AddonUpdate, type CouponFilters, type CouponInput, type CouponUpdate, type PlanInput, type PlanUpdate } from "@/services/catalog-service";
import type { AdminCoupon, CouponRedemption } from "@/types/api";

export const catalogKeys = { plans: ["plans"] as const, addons: ["addons"] as const, meta: ["catalog-meta"] as const, couponStats: ["coupon-stats"] as const };

export function usePlans() {
  return useQuery({ queryKey: catalogKeys.plans, queryFn: catalogService.plans, staleTime: 30_000, retry: false });
}
export function useAddons() {
  return useQuery({ queryKey: catalogKeys.addons, queryFn: catalogService.addons, staleTime: 30_000, retry: false });
}
export function useCatalogMeta() {
  return useQuery({ queryKey: catalogKeys.meta, queryFn: catalogService.meta, staleTime: 5 * 60_000, retry: false });
}

export function useCatalogActions() {
  const qc = useQueryClient();
  const refresh = () => {
    for (const key of ["plans", "addons", "catalog-meta", "subscription-stats", "analytics"]) void qc.invalidateQueries({ queryKey: [key] });
  };
  return {
    createPlan: useMutation({ mutationFn: (b: PlanInput) => catalogService.createPlan(b), onSuccess: refresh }),
    updatePlan: useMutation({ mutationFn: (v: { id: string; body: PlanUpdate }) => catalogService.updatePlan(v.id, v.body), onSuccess: refresh }),
    createAddon: useMutation({ mutationFn: (b: AddonInput) => catalogService.createAddon(b), onSuccess: refresh }),
    updateAddon: useMutation({ mutationFn: (v: { id: string; body: AddonUpdate }) => catalogService.updateAddon(v.id, v.body), onSuccess: refresh }),
  };
}

export function useCoupons(filters: CouponFilters) {
  return useCursorList<AdminCoupon>({ queryKey: ["coupons", filters], fetchPage: (cursor) => catalogService.coupons(filters, cursor) });
}
export function useCouponStats() {
  return useQuery({ queryKey: catalogKeys.couponStats, queryFn: catalogService.couponStats, staleTime: 30_000, retry: false });
}
export function useCouponRedemptions(id: string | undefined) {
  return useCursorList<CouponRedemption>({ queryKey: ["coupon-redemptions", id], fetchPage: (cursor) => catalogService.redemptions(id!, cursor), enabled: Boolean(id), pageSize: 8 });
}
export function useCouponActions() {
  const qc = useQueryClient();
  const refresh = () => {
    for (const key of ["coupons", "coupon-stats", "coupon-redemptions", "subscription-stats"]) void qc.invalidateQueries({ queryKey: [key] });
  };
  return {
    create: useMutation({ mutationFn: (b: CouponInput) => catalogService.createCoupon(b), onSuccess: refresh }),
    update: useMutation({ mutationFn: (v: { id: string; body: CouponUpdate }) => catalogService.updateCoupon(v.id, v.body), onSuccess: refresh }),
  };
}
