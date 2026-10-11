"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCursorList } from "@workspace/hooks";
import { directoryService, type OnboardInput, type SchoolFilters, type UserFilters } from "@/services/directory-service";
import type { AdminSchool, AdminUser, UserAction } from "@/types/directory";

const invalidate = (qc: ReturnType<typeof useQueryClient>, keys: string[]) => keys.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));

export function useSchools(filters: SchoolFilters) {
  return useCursorList<AdminSchool>({ queryKey: ["schools", filters], fetchPage: (cursor) => directoryService.schools(filters, cursor) });
}
export function useSchoolStats() {
  return useQuery({ queryKey: ["school-stats"], queryFn: directoryService.schoolStats, staleTime: 60_000, retry: false });
}
export function useSchool(id: string) {
  return useQuery({ queryKey: ["school", id], queryFn: () => directoryService.school(id), staleTime: 30_000, retry: false });
}
export function useOnboard() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (v: OnboardInput) => directoryService.onboard(v), onSuccess: () => invalidate(qc, ["schools", "school-stats", "analytics", "subscriptions", "subscription-stats"]) });
}
export function useEntitlements(schoolId: string) {
  return {
    entitlements: useQuery({ queryKey: ["school-ent", schoolId], queryFn: () => directoryService.entitlements(schoolId), staleTime: 30_000 }),
    overrides: useQuery({ queryKey: ["school-ovr", schoolId], queryFn: () => directoryService.overrides(schoolId), staleTime: 30_000 }),
  };
}
export function useCreateOverride(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Parameters<typeof directoryService.createOverride>[1]) => directoryService.createOverride(schoolId, v),
    onSuccess: () => invalidate(qc, ["school-ent", "school-ovr"]),
  });
}

export function useUsers(filters: UserFilters) {
  return useCursorList<AdminUser>({ queryKey: ["users", filters], fetchPage: (cursor) => directoryService.users(filters, cursor) });
}
export function useUserStats() {
  return useQuery({ queryKey: ["user-stats"], queryFn: directoryService.userStats, staleTime: 60_000, retry: false });
}
export function useUserAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; action: UserAction; reason: string; ticket?: string }) => directoryService.userAction(v.id, v.action, v.reason, v.ticket),
    onSuccess: () => invalidate(qc, ["users", "user-stats", "security-overview"]),
  });
}

export function useImpersonations() {
  return useQuery({ queryKey: ["impersonations"], queryFn: directoryService.impersonations, staleTime: 15_000, retry: false });
}
export function useImpersonationActions() {
  const qc = useQueryClient();
  const refresh = () => invalidate(qc, ["impersonations", "security-overview", "analytics"]);
  return {
    start: useMutation({ mutationFn: directoryService.startImpersonation, onSuccess: refresh }),
    revoke: useMutation({ mutationFn: (id: string) => directoryService.revokeImpersonation(id), onSuccess: refresh }),
  };
}

export function useAdmins() {
  return useQuery({ queryKey: ["admins"], queryFn: directoryService.admins, staleTime: 30_000, retry: false });
}
export function useAdminActions() {
  const qc = useQueryClient();
  const refresh = () => invalidate(qc, ["admins", "user-stats"]);
  return {
    invite: useMutation({ mutationFn: directoryService.inviteAdmin, onSuccess: refresh }),
    revoke: useMutation({ mutationFn: (v: { userId: string; reason: string }) => directoryService.revokeAdmin(v.userId, v.reason), onSuccess: refresh }),
  };
}
