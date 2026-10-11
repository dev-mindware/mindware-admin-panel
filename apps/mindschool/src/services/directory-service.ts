import api from "./api";
import type { CursorPage } from "@/types/api";
import type {
  AdminAdmin, AdminEntitlements, AdminImpersonation, AdminOverride, AdminSchool, AdminSchoolDetail, AdminUser, EmailActionResult, SchoolStats, UserAction, UserStats,
} from "@/types/directory";

const clean = (o: Record<string, string | number | undefined>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

export interface SchoolFilters {
  q?: string;
  status?: string;
}
export interface UserFilters {
  q?: string;
  status?: string;
  school_id?: string;
}

export interface OnboardInput {
  name: string;
  nif: string;
  subsystem: AdminSchool["subsystem"];
  fiscalSeriesPrefix: string;
  medCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  trialDays?: number;
  titularName: string;
  titularEmail: string;
}

export interface OnboardResult {
  school: { id: string; name: string };
  titular: { user_id: string; email: string; full_name: string; is_new_user: boolean; invite: { sent: true } | { sent: false; reason: string } | null };
}

export const directoryService = {
  schools: async (f: SchoolFilters, cursor?: string): Promise<CursorPage<AdminSchool>> => (await api.get("/admin/schools", { params: clean({ ...f, limit: 50, cursor }) })).data,
  schoolStats: async (): Promise<SchoolStats> => (await api.get("/admin/schools/stats")).data,
  school: async (id: string): Promise<AdminSchoolDetail> => (await api.get(`/admin/schools/${id}`)).data,
  onboard: async (v: OnboardInput): Promise<OnboardResult> =>
    (await api.post("/admin/schools/onboard", {
      name: v.name, nif: v.nif, subsystem: v.subsystem, fiscal_series_prefix: v.fiscalSeriesPrefix,
      ...(v.medCode ? { med_code: v.medCode } : {}), ...(v.phone ? { phone: v.phone } : {}), ...(v.email ? { email: v.email } : {}), ...(v.address ? { address: v.address } : {}),
      ...(v.trialDays ? { trial_days: v.trialDays } : {}), titular: { email: v.titularEmail, full_name: v.titularName },
    })).data,
  entitlements: async (id: string): Promise<AdminEntitlements> => (await api.get(`/admin/schools/${id}/entitlements`)).data,
  overrides: async (id: string): Promise<AdminOverride[]> => (await api.get<{ data: AdminOverride[] }>(`/admin/schools/${id}/entitlement-overrides`)).data.data,
  createOverride: async (id: string, v: { key: string; value: boolean | number | null; endsAt: string; reason: string; ticket?: string }) =>
    (await api.post(`/admin/schools/${id}/entitlement-overrides`, { key: v.key, value: v.value, ends_at: v.endsAt, reason: v.reason, ...(v.ticket ? { ticket: v.ticket } : {}) })).data,

  users: async (f: UserFilters, cursor?: string): Promise<CursorPage<AdminUser>> => (await api.get("/admin/users", { params: clean({ ...f, limit: 50, cursor }) })).data,
  userStats: async (): Promise<UserStats> => (await api.get("/admin/users/stats")).data,
  /** Acções de suporte: exigem motivo (≥ 10 caracteres) e reautenticação (a janela abre sozinha). */
  userAction: async (id: string, action: UserAction, reason: string, ticket?: string): Promise<EmailActionResult | Record<string, unknown>> =>
    (await api.post(`/admin/users/${id}/${action}`, { reason, ...(ticket ? { ticket } : {}) })).data,

  impersonations: async (): Promise<AdminImpersonation[]> => (await api.get<{ data: AdminImpersonation[] }>("/admin/impersonations")).data.data,
  /** O token nunca chega ao painel: a API devolve um código de uso único que o frontend da escola troca pelo token. */
  startImpersonation: async (v: { targetUserId: string; schoolId: string; reason: string; durationMinutes: number; mode: "leitura" | "escrita" }) =>
    (await api.post<{ impersonation_id: string; school_id: string; handoff: { code: string; expires_in: number }; expires_at: string }>("/admin/impersonations", {
      target_user_id: v.targetUserId, school_id: v.schoolId, reason: v.reason, duration_minutes: v.durationMinutes, mode: v.mode, delivery: "code",
    })).data,
  revokeImpersonation: async (id: string) => (await api.delete(`/admin/impersonations/${id}`)).data,

  admins: async (): Promise<AdminAdmin[]> => (await api.get<{ data: AdminAdmin[] }>("/admin/admins")).data.data,
  inviteAdmin: async (v: { email: string; fullName: string; reason: string }): Promise<{ user_id: string; email: string; invite: { sent: boolean; reason?: string } }> =>
    (await api.post("/admin/admins", { email: v.email, full_name: v.fullName, reason: v.reason })).data,
  revokeAdmin: async (userId: string, reason: string) => (await api.delete(`/admin/admins/${userId}`, { data: { reason } })).data,
};
