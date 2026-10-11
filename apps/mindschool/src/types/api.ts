/** Tipos das respostas da API MindSchool usados pelo painel (fonte: OpenAPI em /api/docs-json; ver docs/PLANO_PAINEL_ADMIN.md). */

export interface CursorPage<T> {
  data: T[];
  page: { limit: number; has_more: boolean; next_cursor: string | null };
}

export interface ApiMe {
  id: string;
  email: string;
  full_name: string;
  mfa_enabled: boolean;
  mfa_enrollment_required?: boolean;
  memberships: Array<{ school_id: string; school_name: string; roles: string[]; permissions?: string[] }>;
}

export type SubscriptionStatus = "trial" | "active" | "past_due" | "grace" | "suspended" | "cancelled" | "expired";
export type OrderStatus = "pending_payment" | "payment_proof_submitted" | "under_review" | "approved" | "rejected" | "proof_replacement_required" | "cancelled";
export type OrderKind = "new" | "upgrade" | "downgrade" | "renewal" | "addon";

export interface SchoolRef {
  id: string;
  name: string;
  nif: string;
}

export interface AdminOrder {
  id: string;
  school: SchoolRef;
  kind: OrderKind;
  plan: { code: string; name: string };
  addon_codes: string[];
  period_months: number;
  total_amount: string;
  discount_amount: string;
  coupon_code: string | null;
  currency: string;
  status: OrderStatus;
  created_at: string;
  decided_at: string | null;
  waiting_hours: number | null;
  has_proof: boolean;
  proof_uploaded_at: string | null;
  reviewer: { id: string; full_name: string | null } | null;
}

export interface OrderDetail {
  id: string;
  school: SchoolRef;
  kind: OrderKind;
  plan: { code: string; name: string };
  addon_codes: string[];
  period_months: number;
  total_amount: string;
  discount_amount: string;
  coupon_id: string | null;
  currency: string;
  status: OrderStatus;
  created_at: string;
  reviewer_id: string | null;
  review_started_at: string | null;
  period_start: string | null;
  period_end: string | null;
  proofs: Array<{ id: string; file_name: string; mime_type: string; size_bytes: number; sha256: string; is_current: boolean; uploaded_at: string }>;
  reviews: Array<{ id: string; decision: string; confirmed_amount: string | null; reference: string | null; reason: string; reviewer: string; reviewed_at: string }>;
}

export interface TimelineItem {
  at: string;
  type: string;
  actor: string | null;
  detail: Record<string, unknown>;
}

export interface AdminSubscription {
  id: string;
  school: SchoolRef;
  plan: { code: string; name: string; monthly_price: string };
  pending_plan: { code: string; name: string } | null;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  period_start: string | null;
  period_end: string | null;
  days_left: number | null;
  cancel_at_period_end: boolean;
  credit_balance: string;
  active_addons: number;
}

export interface SubscriptionStats {
  subscriptions: { by_status: Record<SubscriptionStatus, number>; total: number };
  plans: Array<{ code: string; name: string; is_active: boolean; schools_paying: number; schools_total: number; mrr: string }>;
  mrr: string;
  arr: string;
  currency: string;
  orders: { by_status: Record<OrderStatus, number>; waiting: number; stale_24h: number; approved_month: number; rejected_month: number; replacement_month: number };
  revenue: { month: string; previous_month: string; currency: string };
  expiring_7d: number;
  trials_ending_7d: number;
  coupons: { redemptions_month: number; discount_month: string };
}

export interface QuotaSpec {
  limit: number | null;
  policy: string;
  unit: string;
}

export interface AdminPlan {
  id: string;
  code: string;
  name: string;
  monthly_price: string;
  currency: string;
  rank: number;
  features: string[];
  limits: Record<string, QuotaSpec>;
  catalog_version: number;
  is_active: boolean;
  created_at: string;
  subscriptions: number;
}

export interface AdminAddon {
  id: string;
  code: string;
  name: string;
  monthly_price: string;
  currency: string;
  grants: string[];
  limit_grants: Record<string, number>;
  min_plan_rank: number | null;
  conflicts_with: string[];
  requires: string[];
  catalog_version: number;
  is_active: boolean;
  active_subscriptions: number;
}

export interface CatalogMeta {
  features: Array<{ key: string; message: string }>;
  quotas: Array<{ key: string; unit: string; label: string }>;
}

export type CouponState = "active" | "inactive" | "expired" | "scheduled" | "exhausted";

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_value: string;
  max_uses_per_school: number;
  max_total_uses: number | null;
  min_period_months: number | null;
  applicable_plan: { code: string; name: string } | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  uses_count: number;
  state: CouponState;
  created_at: string;
}

export interface CouponStats {
  total: number;
  by_state: Record<CouponState, number>;
  expiring_7d: number;
  redemptions_month: number;
  discount_month: string;
  redemptions_total: number;
  discount_total: string;
  currency: string;
}

export interface CouponRedemption {
  id: string;
  school: { id: string; name: string | null };
  order_id: string;
  discount_amount: string;
  redeemed_at: string;
}

export interface Analytics {
  generated_at: string;
  currency: string;
  kpis: {
    mrr: string;
    arr: string;
    revenue_total: string;
    schools_total: number;
    schools_paying: number;
    schools_trial: number;
    schools_suspended: number;
    orders_waiting: number;
    trial_conversion_rate: number | null;
    trial_conversion_cohort: number;
  };
  series: {
    months: string[];
    revenue: Array<{ month: string; amount: string }>;
    new_schools: Array<{ month: string; n: number }>;
    schools_by_status: Record<string, number>;
    mrr_by_plan: Array<{ code: string; name: string; schools: number; mrr: string }>;
  };
  attention: {
    stale_orders: number;
    trials_ending: Array<{ school: { id: string; name: string }; ends_at: string | null; days_left: number | null }>;
    past_due: Array<{ school: { id: string; name: string }; status: string; plan: string; period_end: string | null; days_overdue: number | null; monthly_amount: string }>;
    dead_letter_events: number;
    failed_report_jobs_24h: number;
    fiscal_submissions_pending: number;
    fiscal_submissions_failed: number;
    security_alerts_open: number;
    impersonations_active: number;
  };
  recent_activity: Array<{ id: string; at: string; action: string; entity_type: string; reason: string | null; actor: string; school: string | null }>;
}
