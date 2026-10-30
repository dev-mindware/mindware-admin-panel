"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/hooks/use-activities";
import { notificationsService } from "@/services/notifications-service";
import type { NotificationPreferences } from "@/types/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread-count"] as const,
  list: ["notifications", "list"] as const,
  preferences: ["notifications", "preferences"] as const,
};

/** O sino consulta a contagem por polling (sem SSE), só com o separador visível. */
const POLL_MS = 60_000;

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationsService.unreadCount,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  });
}

export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: () => notificationsService.list({ limit: 20 }),
    enabled,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: notificationsService.getPreferences,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Partial<Omit<NotificationPreferences, "emailAvailable">>,
    ) => notificationsService.updatePreferences(payload),
    onSuccess: (data) => {
      qc.setQueryData(notificationKeys.preferences, data);
      toast.success("Preferências guardadas");
    },
    onError: (err) => toast.error(errorMessage(err, "Não foi possível guardar")),
  });
}
