"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCursorList } from "@workspace/hooks";
import { accountService, emailService, operationsService, securityService, type AuditFilters } from "@/services/ops-service";
import type { AuditRow } from "@/types/directory";

const refresh = (qc: ReturnType<typeof useQueryClient>, keys: string[]) => keys.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));

// ---- Segurança ----------------------------------------------------------------------------------------------

export function useSecurityOverview(days: number) {
  return useQuery({ queryKey: ["security-overview", days], queryFn: () => securityService.overview(days), staleTime: 30_000, retry: false });
}
export function useAlerts(f: { severity?: string; onlyOpen?: boolean }) {
  return useQuery({ queryKey: ["alerts", f], queryFn: () => securityService.alerts(f), staleTime: 15_000, retry: false });
}
export function useAcknowledge() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => securityService.acknowledge(id), onSuccess: () => refresh(qc, ["alerts", "security-overview", "analytics"]) });
}
export function useAudit(filters: AuditFilters) {
  return useCursorList<AuditRow>({ queryKey: ["audit", filters], fetchPage: (cursor) => securityService.audit(filters, cursor) });
}

// ---- Operações ----------------------------------------------------------------------------------------------

export function usePlatformOverview() {
  return useQuery({ queryKey: ["platform-overview"], queryFn: operationsService.overview, staleTime: 30_000, refetchInterval: 60_000, retry: false });
}
export function useQueues() {
  return useQuery({ queryKey: ["queues"], queryFn: operationsService.queues, staleTime: 15_000, refetchInterval: 30_000, retry: false });
}
export function useFailedJobs(queue: string | undefined) {
  return useQuery({ queryKey: ["failed-jobs", queue], queryFn: () => operationsService.failedJobs(queue!), enabled: Boolean(queue), staleTime: 10_000, retry: false });
}
export function useOutbox() {
  return {
    stats: useQuery({ queryKey: ["outbox"], queryFn: operationsService.outbox, staleTime: 15_000, refetchInterval: 30_000, retry: false }),
    dead: useQuery({ queryKey: ["dead-letters"], queryFn: operationsService.deadLetters, staleTime: 15_000, retry: false }),
  };
}
export function useStorage() {
  return useQuery({ queryKey: ["storage"], queryFn: operationsService.storage, staleTime: 60_000, retry: false });
}
export function useOpsActions() {
  const qc = useQueryClient();
  const all = ["queues", "failed-jobs", "outbox", "dead-letters", "storage", "platform-overview", "analytics"];
  return {
    retryJob: useMutation({ mutationFn: (v: { queue: string; jobId: string }) => operationsService.retryJob(v.queue, v.jobId), onSuccess: () => refresh(qc, all) }),
    requeue: useMutation({ mutationFn: (id: string) => operationsService.requeue(id), onSuccess: () => refresh(qc, all) }),
    purge: useMutation({ mutationFn: operationsService.purgeStorage, onSuccess: () => refresh(qc, all) }),
    backfill: useMutation({ mutationFn: operationsService.backfillStorage, onSuccess: () => refresh(qc, all) }),
  };
}

// ---- Comunicação --------------------------------------------------------------------------------------------

export function useEmailStats() {
  return useQuery({ queryKey: ["email-stats"], queryFn: emailService.stats, staleTime: 30_000, retry: false });
}
export function useEmailLog(f: { status?: string; template?: string; q?: string }) {
  return useQuery({ queryKey: ["email-log", f], queryFn: () => emailService.log(f), staleTime: 15_000, retry: false });
}
export function useEmailTemplates() {
  return useQuery({ queryKey: ["email-templates"], queryFn: emailService.templates, staleTime: 5 * 60_000, retry: false });
}
export function useEmailActions() {
  const qc = useQueryClient();
  return {
    test: useMutation({ mutationFn: (v: { code: string; to: string }) => emailService.test(v.code, v.to), onSuccess: () => refresh(qc, ["email-log", "email-stats"]) }),
    run: useMutation({ mutationFn: emailService.runAutomation, onSuccess: () => refresh(qc, ["email-log", "email-stats"]) }),
  };
}

// ---- Conta ----------------------------------------------------------------------------------------------------

export function useSessions() {
  return useQuery({ queryKey: ["sessions"], queryFn: accountService.sessions, staleTime: 15_000, retry: false });
}
export function useAccountActions() {
  const qc = useQueryClient();
  const keys = ["sessions", "me"];
  return {
    revoke: useMutation({ mutationFn: (id: string) => accountService.revokeSession(id), onSuccess: () => refresh(qc, keys) }),
    logoutAll: useMutation({ mutationFn: accountService.logoutAll }),
    enroll: useMutation({ mutationFn: accountService.mfaEnroll }),
    verify: useMutation({ mutationFn: (code: string) => accountService.mfaVerify(code), onSuccess: () => refresh(qc, keys.concat("me-mfa")) }),
    disable: useMutation({ mutationFn: (v: { password: string; code: string }) => accountService.mfaDisable(v.password, v.code), onSuccess: () => refresh(qc, keys) }),
    recovery: useMutation({ mutationFn: (code: string) => accountService.recoveryCodes(code) }),
  };
}
