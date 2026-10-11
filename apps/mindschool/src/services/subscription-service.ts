import api from "./api";
import type { AdminOrder, AdminSubscription, CursorPage, OrderDetail, SubscriptionStats, TimelineItem } from "@/types/api";

export interface OrderFilters {
  status?: string;
  kind?: string;
  plan?: string;
  q?: string;
  from?: string;
  to?: string;
  has_coupon?: string;
  waiting_over_hours?: string;
  open?: string;
}

export interface SubscriptionFilters {
  status?: string;
  plan?: string;
  q?: string;
  expiring_in_days?: string;
}

const clean = (o: Record<string, string | number | undefined>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

export interface ReviewInput {
  decision: "approved" | "rejected" | "replacement_required";
  reason: string;
  confirmed_amount?: string;
  reference?: string;
}

export const subscriptionService = {
  orders: async (f: OrderFilters, cursor?: string): Promise<CursorPage<AdminOrder>> =>
    (await api.get("/admin/subscription-orders", { params: clean({ ...f, limit: 50, cursor }) })).data,
  order: async (id: string): Promise<OrderDetail> => (await api.get(`/admin/subscription-orders/${id}`)).data,
  timeline: async (id: string): Promise<TimelineItem[]> => (await api.get<{ data: TimelineItem[] }>(`/admin/subscription-orders/${id}/timeline`)).data.data,
  startReview: async (id: string): Promise<OrderDetail> => (await api.post(`/admin/subscription-orders/${id}/start-review`)).data,
  releaseReview: async (id: string): Promise<OrderDetail> => (await api.post(`/admin/subscription-orders/${id}/release-review`)).data,
  review: async (id: string, body: ReviewInput): Promise<OrderDetail> => (await api.post(`/admin/subscription-orders/${id}/review`, body)).data,

  /** O comprovativo só se obtém com sessão: descarrega o ficheiro como blob (nunca há URL público). */
  proof: async (id: string): Promise<{ blob: Blob; fileName: string }> => {
    const res = await api.get<Blob>(`/admin/subscription-orders/${id}/proof`, { responseType: "blob" });
    const disposition = String(res.headers["content-disposition"] ?? "");
    const fileName = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? "comprovativo";
    return { blob: res.data, fileName };
  },

  subscriptions: async (f: SubscriptionFilters, cursor?: string): Promise<CursorPage<AdminSubscription>> =>
    (await api.get("/admin/subscriptions", { params: clean({ ...f, limit: 50, cursor }) })).data,
  stats: async (): Promise<SubscriptionStats> => (await api.get("/admin/subscriptions/stats")).data,

  /** Ciclo de vida das subscrições (trials terminados, vencimentos, downgrades): idempotente, como o «Verificar expirações» do MindGest. */
  sweep: async (): Promise<{ trials_expired: number; moved: number; downgrades_applied: number; addons_expired: number; cancelled: number }> =>
    (await api.post("/admin/subscriptions/lifecycle-sweep")).data,
  suspend: async (schoolId: string, reason: string) => (await api.post(`/admin/schools/${schoolId}/subscription/suspend`, { reason })).data,
  reactivate: async (schoolId: string, reason: string) => (await api.post(`/admin/schools/${schoolId}/subscription/reactivate`, { reason })).data,
};
