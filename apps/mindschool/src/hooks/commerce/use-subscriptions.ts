"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCursorList } from "@workspace/hooks";
import { subscriptionService, type OrderFilters, type ReviewInput, type SubscriptionFilters } from "@/services/subscription-service";
import type { AdminOrder, AdminSubscription } from "@/types/api";

export const orderKeys = {
  list: (f: OrderFilters) => ["orders", f] as const,
  detail: (id: string) => ["order", id] as const,
  timeline: (id: string) => ["order-timeline", id] as const,
  stats: ["subscription-stats"] as const,
};

export function useOrders(filters: OrderFilters) {
  return useCursorList<AdminOrder>({ queryKey: orderKeys.list(filters), fetchPage: (cursor) => subscriptionService.orders(filters, cursor) });
}

export function useSubscriptionsList(filters: SubscriptionFilters) {
  return useCursorList<AdminSubscription>({ queryKey: ["subscriptions", filters], fetchPage: (cursor) => subscriptionService.subscriptions(filters, cursor) });
}

export function useSubscriptionStats() {
  return useQuery({ queryKey: orderKeys.stats, queryFn: subscriptionService.stats, staleTime: 30_000, retry: false });
}

export function useOrder(id: string | undefined) {
  return useQuery({ queryKey: orderKeys.detail(id ?? ""), queryFn: () => subscriptionService.order(id!), enabled: Boolean(id), staleTime: 0, retry: false });
}

export function useOrderTimeline(id: string | undefined) {
  return useQuery({ queryKey: orderKeys.timeline(id ?? ""), queryFn: () => subscriptionService.timeline(id!), enabled: Boolean(id), staleTime: 0, retry: false });
}

/** Qualquer mudança numa ordem refresca as listas, o detalhe, a linha do tempo, os indicadores e o dashboard. */
function useInvalidateCommerce() {
  const qc = useQueryClient();
  return () => {
    for (const key of ["orders", "order", "order-timeline", "subscriptions", "subscription-stats", "analytics"]) void qc.invalidateQueries({ queryKey: [key] });
  };
}

export function useOrderActions() {
  const invalidate = useInvalidateCommerce();
  const opts = { onSuccess: invalidate };
  return {
    start: useMutation({ mutationFn: (id: string) => subscriptionService.startReview(id), ...opts }),
    release: useMutation({ mutationFn: (id: string) => subscriptionService.releaseReview(id), ...opts }),
    review: useMutation({ mutationFn: (v: { id: string; body: ReviewInput }) => subscriptionService.review(v.id, v.body), ...opts }),
    sweep: useMutation({ mutationFn: subscriptionService.sweep, ...opts }),
    suspend: useMutation({ mutationFn: (v: { schoolId: string; reason: string }) => subscriptionService.suspend(v.schoolId, v.reason), ...opts }),
    reactivate: useMutation({ mutationFn: (v: { schoolId: string; reason: string }) => subscriptionService.reactivate(v.schoolId, v.reason), ...opts }),
  };
}
