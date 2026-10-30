"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { activitiesService } from "@/services/activities-service";
import type {
  ActivityList,
  ActivityListParams,
  ActivityPayload,
  MoveActivityPayload,
  UpdateActivityPayload,
} from "@/types/activity";

export const activityKeys = {
  all: ["activities"] as const,
  list: (params?: ActivityListParams) => ["activities", "list", params ?? {}] as const,
  detail: (id: string) => ["activities", "detail", id] as const,
  events: (id: string) => ["activities", "events", id] as const,
};

export function errorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e?.response?.status === 409) {
    return "A actividade foi alterada por outra pessoa. Os dados foram recarregados.";
  }
  return e?.response?.data?.message || fallback;
}

const invalidate = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: activityKeys.all });

export function useActivities(params?: ActivityListParams, enabled = true) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => activitiesService.list(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useActivity(id: string | null) {
  return useQuery({
    queryKey: activityKeys.detail(id ?? ""),
    queryFn: () => activitiesService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useActivityEvents(id: string | null) {
  return useQuery({
    queryKey: activityKeys.events(id ?? ""),
    queryFn: () => activitiesService.events(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActivityPayload) => activitiesService.create(payload),
    onSuccess: () => {
      toast.success("Actividade criada");
      return invalidate(qc);
    },
    onError: (err) => toast.error(errorMessage(err, "Não foi possível criar a actividade")),
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateActivityPayload & { id: string }) =>
      activitiesService.update(id, payload),
    onSuccess: () => {
      toast.success("Actividade actualizada");
      return invalidate(qc);
    },
    onError: (err) => {
      toast.error(errorMessage(err, "Não foi possível actualizar a actividade"));
      return invalidate(qc);
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.remove(id),
    onSuccess: () => {
      toast.success("Actividade removida");
      return invalidate(qc);
    },
    onError: (err) => toast.error(errorMessage(err, "Não foi possível remover a actividade")),
  });
}

export function useAddComment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => activitiesService.comment(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: activityKeys.detail(id) }),
    onError: (err) => toast.error(errorMessage(err, "Não foi possível comentar")),
  });
}

/**
 * Mover no kanban com actualização optimista: a cache é alterada de imediato,
 * revertida se o servidor recusar e sempre revalidada no fim.
 */
export function useMoveActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: MoveActivityPayload & { id: string }) =>
      activitiesService.move(id, payload),
    onMutate: async ({ id, status, position }) => {
      await qc.cancelQueries({ queryKey: activityKeys.all });
      const snapshots = qc.getQueriesData<ActivityList>({ queryKey: ["activities", "list"] });
      for (const [key, list] of snapshots) {
        if (!list) continue;
        qc.setQueryData<ActivityList>(key, {
          ...list,
          data: list.data.map((a) =>
            a.id === id ? { ...a, status, position: position ?? a.position } : a,
          ),
        });
      }
      return { snapshots };
    },
    onError: (err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, list]) => qc.setQueryData(key, list));
      toast.error(errorMessage(err, "Não foi possível mover a actividade"));
    },
    onSettled: () => invalidate(qc),
  });
}
