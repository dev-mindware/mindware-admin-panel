"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

const PAGE_SIZE = 10;
/** Com a lista aberta, actualiza-se a cada 30 s (o contador do sino continua a 60 s). */
const LIST_POLL_MS = 30_000;

/** Lista paginada com scroll infinito (sino e página «Ver todas»). */
export function useInfiniteNotifications(opts: { unread?: boolean; enabled?: boolean } = {}) {
  const { unread, enabled = true } = opts;
  const query = useInfiniteQuery({
    queryKey: [...notificationKeys.list, { unread: !!unread }] as const,
    queryFn: ({ pageParam }) =>
      notificationsService.list({ page: pageParam, limit: PAGE_SIZE, unread: unread || undefined }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.hasNextPage ? last.meta.page + 1 : undefined),
    enabled,
    refetchInterval: enabled ? LIST_POLL_MS : false,
    refetchIntervalInBackground: false,
  });
  return {
    ...query,
    notifications: query.data?.pages.flatMap((p) => p.data) ?? [],
  };
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
