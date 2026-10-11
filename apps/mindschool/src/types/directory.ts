import type { SubscriptionStatus } from "./api";

export interface ActivationSummary {
  done: number;
  total: number;
  percent: number;
  status: "completa" | "em_curso" | "parada";
  next_step: { key: string; label: string } | null;
  days_inactive: number;
}

export interface AdminSchool {
  id: string;
  name: string;
  nif: string;
  med_code: string | null;
  subsystem: "geral" | "tecnico_profissional" | "formacao_professores";
  status: string;
  created_at: string;
  subscription: { status: SubscriptionStatus; plan: { code: string; name: string }; ends_at: string | null; days_left: number | null } | null;
  usage: { students: number; internal_users: number };
  activation: ActivationSummary;
  last_login_at: string | null;
  titular: { user_id: string; email: string; full_name: string; mfa_enabled: boolean; last_login_at: string | null } | null;
}

export interface SchoolStats {
  total: number;
  new_month: number;
  no_subscription: number;
  by_status: Record<SubscriptionStatus, number>;
  activation: { stalled: number; incomplete: number };
}

export interface AdminSchoolDetail {
  school: {
    id: string; name: string; nif: string; med_code: string | null; subsystem: string; status: string; phone: string | null; email: string | null;
    address: string | null; school_group_id: string | null; fiscal_series_prefix: string; created_at: string;
  };
  subscription: {
    status: SubscriptionStatus; plan: { code: string; name: string }; ends_at: string | null; days_left: number | null; trial_ends_at: string | null;
    period_start: string | null; period_end: string | null; cancel_at_period_end: boolean; pending_plan: { code: string; name: string } | null;
    credit_balance: string; addons: Array<{ code: string; name: string; status: string; ends_at: string | null }>;
  } | null;
  orders: Array<{ id: string; kind: string; status: string; plan: { code: string; name: string }; period_months: number; total_amount: string; currency: string; created_at: string; decided_at: string | null }>;
  usage: { students: number; teachers: number; sections: number; internal_users: number; family_users: number; roles: Record<string, number> };
  activation: ActivationSummary & { items: Array<{ key: string; label: string; hint: string; done: boolean }> };
  last_login_at: string | null;
  titulars: Array<{ user_id: string; email: string; full_name: string; mfa_enabled: boolean; last_login_at: string | null }>;
}

export interface AdminEntitlements {
  features: Array<{ key: string; state: string; entitled: boolean; source: string | null; reason: string }>;
  quotas: Array<{ key: string; unit: string; limit: number | null; used: number; remaining: number | null; policy: string; state: "OK" | "ALERT" | "LIMIT_REACHED"; alert_threshold: number }>;
  overrides: Array<{ key: string; value: unknown; ends_at: string; reason: string }>;
}

export interface AdminOverride {
  id: string;
  key: string;
  value: unknown;
  starts_at: string;
  ends_at: string;
  active: boolean;
  reason: string;
  ticket?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  status: "activo" | "suspenso" | "bloqueado";
  mfa_enabled: boolean;
  locked: boolean;
  invite_pending: boolean;
  last_login_at: string | null;
  created_at: string;
  memberships: Array<{ school: { id: string; name: string }; role: string; is_active: boolean }>;
}

export interface UserStats {
  total: number;
  blocked: number;
  locked: number;
  invite_pending: number;
  privileged_without_mfa: number;
  active_7d: number;
  new_30d: number;
}

export type UserAction = "block" | "unblock" | "mfa/reset" | "sessions/revoke" | "password-reset" | "invite/resend";
export type EmailActionResult = { user_id: string; sent: true } | { user_id: string; sent: false; reason: string };

export interface AdminImpersonation {
  id: string;
  reason: string;
  started_at: string;
  expires_at: string;
  revoked_at: string | null;
  active: boolean;
  mode: "leitura" | "escrita";
  admin: { id: string; email: string; full_name: string } | null;
  target: { id: string; email: string; full_name: string } | null;
  school: { id: string; name: string } | null;
}

export interface AdminAdmin {
  user_id: string;
  email: string;
  full_name: string;
  status: string;
  mfa_enabled: boolean;
  last_login_at: string | null;
  is_active: boolean;
  is_self: boolean;
  invite_pending: boolean;
  granted_at: string;
}

export interface SecurityOverview {
  period: { days: number; from: string; to: string };
  alerts: { unacknowledged: number; critical_unacknowledged: number; by_type: Array<{ type: string; severity: "info" | "warning" | "critical"; count: number }> };
  accounts: {
    blocked: number;
    temporarily_locked: number;
    with_failed_attempts: number;
    titulars_without_mfa: number;
    attention: Array<{ user_id: string; email: string; full_name: string; status: string; failed_attempts: number; locked_until: string | null }>;
  };
  impersonations: { started: number; with_write: number; active_now: number };
  sensitive_operations: Array<{ operation: string; count: number }>;
}

export interface PlatformAlert {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  details: unknown;
  created_at: string;
  acknowledged_at: string | null;
  school: { id: string; name: string | null } | null;
  user: { id: string; email: string | null; full_name: string | null } | null;
}

export interface AuditRow {
  id: string;
  occurred_at: string;
  organization_id: string | null;
  actor: { id: string; full_name: string } | null;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string;
  reason: string | null;
  ip: string | null;
}

export interface IntegrityResult {
  ok: boolean;
  checked: number;
  first_break: { id: string; seq: string; reason: string } | null;
  next_after_seq: string | null;
}

export interface QueueStat {
  queue: string;
  mode: string;
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
}

export interface FailedJob {
  id: string | undefined;
  name: string;
  attempts: number;
  reason: string | undefined;
  failed_at: string | null;
}

export interface DeadLetter {
  id: string;
  type: string;
  school_id: string | null;
  attempts: number;
  last_error: string | null;
  occurred_at: string;
}

export interface PlatformOverview {
  schools_by_subscription_status: Record<string, number>;
  mrr: string;
  arr: string;
  needs_attention: {
    pending_payment_reviews: number;
    fiscal_submissions_pending: number;
    fiscal_submissions_failed: number;
    dead_letter_events: number;
    failed_report_jobs_24h: number;
    past_due_or_grace_subscriptions: number;
  };
}

export interface StorageStats {
  driver: string;
  data: Array<{ domain: string; status: string; objects: number; bytes: number }>;
}

export interface EmailLogRow {
  id: string;
  template_code: string;
  recipient: string;
  subject: string;
  status: "pendente" | "enviado" | "falhou" | "ignorado";
  attempts: number;
  error: string | null;
  created_at: string;
  sent_at: string | null;
  school_id: string | null;
}

export interface EmailStats {
  window_days: number;
  sent: number;
  failed: number;
  pending: number;
  skipped: number;
  delivery_rate: number | null;
  top_templates: Array<{ template_code: string; total: number }>;
}

export interface EmailTemplate {
  code: string;
  category: string;
  audience: string;
  name: string;
  description: string;
  essential: boolean;
}

export interface UserSession {
  id: string;
  current: boolean;
  started_at: string;
  last_active_at: string;
  ip: string | null;
  user_agent: string | null;
}
