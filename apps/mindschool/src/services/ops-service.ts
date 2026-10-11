import api from "./api";
import type {
  AuditRow, DeadLetter, EmailLogRow, EmailStats, EmailTemplate, FailedJob, IntegrityResult, PlatformAlert, PlatformOverview, QueueStat, SecurityOverview, StorageStats, UserSession,
} from "@/types/directory";
import type { CursorPage } from "@/types/api";

const clean = (o: Record<string, string | number | undefined>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

export interface AuditFilters {
  schoolId?: string;
  actorEmail?: string;
  action?: string;
  module?: string;
  from?: string;
  to?: string;
  text?: string;
}

export const securityService = {
  overview: async (days: number): Promise<SecurityOverview> => (await api.get("/admin/security/overview", { params: { days } })).data,
  alerts: async (f: { severity?: string; onlyOpen?: boolean; schoolId?: string }): Promise<PlatformAlert[]> =>
    (await api.get<{ data: PlatformAlert[] }>("/admin/security-alerts", { params: clean({ severity: f.severity, unacknowledged: f.onlyOpen ? "true" : undefined, school_id: f.schoolId }) })).data.data,
  acknowledge: async (id: string) => (await api.post(`/admin/security-alerts/${id}/acknowledge`, {})).data,
  audit: async (f: AuditFilters, cursor?: string): Promise<CursorPage<AuditRow>> =>
    (await api.get("/admin/audit/events", { params: clean({ organization_id: f.schoolId, actor_email: f.actorEmail, action: f.action, module: f.module, from: f.from, to: f.to, text: f.text, limit: 25, cursor }) })).data,
  integrity: async (schoolId: string, afterSeq?: string): Promise<IntegrityResult> =>
    (await api.get("/admin/audit/integrity", { params: clean({ school_id: schoolId, after_seq: afterSeq, limit: 5000 }) })).data,
};

export const operationsService = {
  overview: async (): Promise<PlatformOverview> => (await api.get("/admin/overview")).data,
  queues: async (): Promise<{ mode: string; data: QueueStat[] }> => (await api.get("/admin/queues")).data,
  failedJobs: async (queue: string): Promise<FailedJob[]> => (await api.get<{ data: FailedJob[] }>(`/admin/queues/${queue}/failed`)).data.data,
  retryJob: async (queue: string, jobId: string) => (await api.post(`/admin/queues/${queue}/failed/${jobId}/retry`)).data,
  outbox: async (): Promise<{ pending: number; dead_letter: number; processed: number }> => (await api.get("/admin/outbox")).data,
  deadLetters: async (): Promise<DeadLetter[]> => (await api.get<{ data: DeadLetter[] }>("/admin/outbox/dead-letter")).data.data,
  requeue: async (id: string) => (await api.post(`/admin/outbox/dead-letter/${id}/requeue`)).data,
  storage: async (): Promise<StorageStats> => (await api.get("/admin/storage")).data,
  purgeStorage: async (): Promise<{ expired: number; orphans: number; failed: number }> => (await api.post("/admin/storage/purge")).data,
  backfillStorage: async (): Promise<{ payment_proofs: number; report_jobs: number; failed: number }> => (await api.post("/admin/storage/backfill")).data,
};

export const emailService = {
  stats: async (): Promise<EmailStats> => (await api.get("/admin/emails/stats")).data,
  log: async (f: { status?: string; template?: string; q?: string }): Promise<EmailLogRow[]> =>
    (await api.get<{ data: EmailLogRow[] }>("/admin/emails/log", { params: clean({ ...f, limit: 100 }) })).data.data,
  templates: async (): Promise<{ configured: boolean; categories: Record<string, string>; data: EmailTemplate[] }> => (await api.get("/admin/emails/templates")).data,
  preview: async (code: string): Promise<{ subject: string; html: string; text: string }> => (await api.get(`/admin/emails/templates/${code}/preview`)).data,
  test: async (code: string, to: string): Promise<{ outcome: string }> => (await api.post("/admin/emails/test", { code, to })).data,
  runAutomation: async () => (await api.post("/admin/emails/automation/run")).data,
};

export const accountService = {
  sessions: async (): Promise<UserSession[]> => (await api.get<{ data: UserSession[] }>("/auth/sessions")).data.data,
  revokeSession: async (id: string) => (await api.delete(`/auth/sessions/${id}`)).data,
  logoutAll: async () => (await api.post("/auth/logout-all", {})).data,
  mfaEnroll: async (): Promise<{ secret: string; otpauth_url: string }> => (await api.post("/auth/mfa/enroll", {})).data,
  mfaVerify: async (code: string): Promise<{ recovery_codes?: string[] }> => (await api.post("/auth/mfa/verify", { code })).data,
  mfaDisable: async (password: string, code: string) => (await api.post("/auth/mfa/disable", { password, code })).data,
  recoveryCodes: async (code: string): Promise<{ recovery_codes: string[] }> => (await api.post("/auth/mfa/recovery-codes", { code })).data,
};
