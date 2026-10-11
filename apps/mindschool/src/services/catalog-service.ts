import api from "./api";
import type { AdminAddon, AdminCoupon, AdminPlan, CatalogMeta, CouponRedemption, CouponStats, CursorPage } from "@/types/api";

export interface PlanInput {
  code: string;
  name: string;
  monthly_price: string;
  rank: number;
  features: string[];
  limits: Record<string, { limit: number | null; policy: string }>;
  reason: string;
}
export type PlanUpdate = Partial<Omit<PlanInput, "code" | "reason">> & { is_active?: boolean; reason: string };

export interface AddonInput {
  code: string;
  name: string;
  monthly_price: string;
  grants: string[];
  limit_grants: Record<string, number>;
  min_plan_rank: number | null;
  conflicts_with: string[];
  requires: string[];
  reason: string;
}
export type AddonUpdate = Partial<Omit<AddonInput, "code" | "reason">> & { is_active?: boolean; reason: string };

export interface CouponInput {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: string;
  max_uses_per_school: number;
  max_total_uses: number | null;
  min_period_months: number | null;
  applicable_plan_code: string | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  reason: string;
}
export type CouponUpdate = Partial<Omit<CouponInput, "code">> & { reason: string };

export interface CouponFilters {
  state?: string;
  q?: string;
}

const clean = (o: Record<string, string | number | undefined>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

export const catalogService = {
  plans: async (): Promise<AdminPlan[]> => (await api.get<{ data: AdminPlan[] }>("/admin/plans")).data.data,
  createPlan: async (body: PlanInput): Promise<AdminPlan> => (await api.post("/admin/plans", body)).data,
  updatePlan: async (id: string, body: PlanUpdate): Promise<AdminPlan> => (await api.patch(`/admin/plans/${id}`, body)).data,

  addons: async (): Promise<AdminAddon[]> => (await api.get<{ data: AdminAddon[] }>("/admin/addons")).data.data,
  createAddon: async (body: AddonInput): Promise<AdminAddon> => (await api.post("/admin/addons", body)).data,
  updateAddon: async (id: string, body: AddonUpdate): Promise<AdminAddon> => (await api.patch(`/admin/addons/${id}`, body)).data,

  /** Funcionalidades e quotas conhecidas (rótulos para o formulário de plano). */
  meta: async (): Promise<CatalogMeta> => (await api.get("/subscription/catalog")).data,

  coupons: async (f: CouponFilters, cursor?: string): Promise<CursorPage<AdminCoupon>> =>
    (await api.get("/admin/coupons", { params: clean({ ...f, limit: 50, cursor }) })).data,
  couponStats: async (): Promise<CouponStats> => (await api.get("/admin/coupons/stats")).data,
  createCoupon: async (body: CouponInput): Promise<AdminCoupon> => (await api.post("/admin/coupons", body)).data,
  updateCoupon: async (id: string, body: CouponUpdate): Promise<AdminCoupon> => (await api.patch(`/admin/coupons/${id}`, body)).data,
  redemptions: async (id: string, cursor?: string): Promise<CursorPage<CouponRedemption>> =>
    (await api.get(`/admin/coupons/${id}/redemptions`, { params: clean({ limit: 50, cursor }) })).data,
};
